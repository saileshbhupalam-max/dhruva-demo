import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { MOCK_GRIEVANCES, Grievance, RESPONSE_TEMPLATES } from '../data/mockGrievances';
import { ML_MODELS, DISTRESS_KEYWORDS } from '../data/statistics';
import { dhruvaApi, AnalyzeResponse } from '../services/api';

// Debug logging
const DEBUG_PREFIX = '[DEMO-CONTEXT]';

export type Role = 'citizen' | 'officer' | 'policymaker' | null;
export type ViewMode = 'stakeholder' | 'technical' | 'split';

// ML Pipeline step interface
export interface PipelineStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'skipped';
  duration?: number;
  result?: Record<string, unknown>;
  confidence?: number;
}

// Pipeline execution result
export interface PipelineResult {
  caseId: string;
  classification: {
    department: string;
    confidence: number;
    method: 'primary' | 'fallback' | 'manual';
    top3: { department: string; confidence: number }[];
  };
  sentiment: {
    distressLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL';
    confidence: number;
    signals: string[];
  };
  sla: {
    hours: number;
    deadline: string;
    priority: string;
  };
  lapseRisk: {
    score: number;
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    likelyLapses: string[];
  };
  similarCases: { id: string; similarity: number; resolution: string }[];
  recommendedActions: string[];
  responseTemplate: { english: string; telugu: string };
  // New: Track if this came from real API
  source: 'api' | 'simulation';
}

// Audit trail entry
export interface AuditEntry {
  timestamp: string;
  action: string;
  actor: 'Citizen' | 'System' | 'Officer' | 'AI';
  icon: string;
  details: string;
  pipelineStep?: string;
}

// Submitted grievance that syncs across all roles
export interface SubmittedGrievance {
  id: string;
  text: string;
  textTelugu?: string;
  citizenName: string;
  district: string;
  mandal: string;
  department: string;
  distressLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL';
  confidence: number;
  lapseRisk: number;
  slaHours: number;
  status: 'pending' | 'in_progress' | 'resolved' | 'reopened';
  submittedAt: string;
  distressSignals: string[];
  similarCases: { id: string; similarity: number; resolution: string }[];
  pipelineResult: PipelineResult | null;
}

interface DemoContextType {
  // Role management
  role: Role;
  setRole: (role: Role) => void;
  clearRole: () => void;

  // View mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Current case being processed
  currentGrievance: string;
  setCurrentGrievance: (text: string) => void;

  // Pipeline state
  pipelineSteps: PipelineStep[];
  pipelineResult: PipelineResult | null;
  isProcessing: boolean;
  currentStep: number; // 1=Submit, 2=Clarify, 3=Review, 4=Done

  // Process a grievance through the ML pipeline
  processGrievance: (text: string, citizenName?: string) => Promise<PipelineResult>;

  // Reset the demo
  resetDemo: () => void;

  // Grievance queue for officer (includes submitted ones)
  grievanceQueue: Grievance[];

  // Submitted grievances (synced across all roles)
  submittedGrievances: SubmittedGrievance[];

  // Audit trail
  auditTrail: AuditEntry[];
  addAuditEntry: (entry: Omit<AuditEntry, 'timestamp'>) => void;

  // Clarification state
  needsClarification: boolean;
  clarificationAnswered: boolean;
  setClarificationAnswered: (answered: boolean) => void;

  // Officer actions
  acceptCase: (feedback: string) => void;
  reassignCase: (newDept: string, feedback: string) => void;
  resolveCase: (caseId: string, resolution: string) => void;

  // Generated case ID
  caseId: string | null;

  // Track a specific case (for cross-role viewing)
  trackedCaseId: string | null;
  setTrackedCaseId: (id: string | null) => void;

  // Backend status
  backendAvailable: boolean;
  backendError: string | null;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

// Initial pipeline steps
const INITIAL_PIPELINE_STEPS: PipelineStep[] = [
  { id: 'duplicate', name: 'Duplicate Detection', status: 'pending' },
  { id: 'classify', name: 'Department Classification', status: 'pending' },
  { id: 'sentiment', name: 'Distress Detection', status: 'pending' },
  { id: 'sla', name: 'SLA Calculation', status: 'pending' },
  { id: 'lapse', name: 'Lapse Risk Prediction', status: 'pending' },
  { id: 'similar', name: 'Similar Case Matching', status: 'pending' },
  { id: 'alerts', name: 'Proactive Alerts', status: 'pending' },
  { id: 'template', name: 'Response Template', status: 'pending' },
  { id: 'actions', name: 'Recommended Actions', status: 'pending' },
];

// Fallback: Simulate ML classification (used when backend unavailable)
function simulateClassification(text: string): { department: string; confidence: number; top3: { department: string; confidence: number }[] } {
  const lowercaseText = text.toLowerCase();

  const departmentKeywords: Record<string, string[]> = {
    'Social Welfare': ['pension', 'పెన్షన్', 'welfare', 'సంక్షేమ', 'widow', 'old age', 'disability'],
    'Revenue': ['land', 'భూమి', 'patta', 'పట్టా', 'survey', 'encroachment', 'ఆక్రమణ'],
    'Municipal Administration': ['water', 'నీటి', 'road', 'రోడ్డు', 'drainage', 'street light', 'వీధి లైట్'],
    'Police': ['theft', 'దొంగతనం', 'fir', 'police', 'పోలీస్', 'complaint'],
    'Civil Supplies': ['ration', 'రేషన్', 'rice', 'బియ్యం', 'kerosene', 'card'],
    'Education': ['school', 'స్కూల్', 'teacher', 'టీచర్', 'education', 'విద్య'],
    'Health': ['hospital', 'ఆసుపత్రి', 'doctor', 'medicine', 'health', 'ఆరోగ్య'],
    'Housing': ['house', 'ఇల్లు', 'site', 'స్థలం', 'housing', 'గృహ'],
  };

  const scores: { department: string; score: number }[] = [];

  for (const [dept, keywords] of Object.entries(departmentKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowercaseText.includes(keyword)) {
        score += 0.25;
      }
    }
    scores.push({ department: dept, score: Math.min(score, 0.95) });
  }

  scores.sort((a, b) => b.score - a.score);

  if (scores[0].score === 0) {
    return {
      department: 'Revenue',
      confidence: 0.45,
      top3: [
        { department: 'Revenue', confidence: 0.45 },
        { department: 'Municipal Administration', confidence: 0.32 },
        { department: 'Social Welfare', confidence: 0.23 },
      ],
    };
  }

  const confidence = Math.min(0.95, scores[0].score + Math.random() * 0.2 + 0.4);

  return {
    department: scores[0].department,
    confidence,
    top3: scores.slice(0, 3).map((s, i) => ({
      department: s.department,
      confidence: Math.max(0.15, confidence - i * 0.15 - Math.random() * 0.1),
    })),
  };
}

// Fallback: Simulate distress detection
function simulateDistress(text: string): { level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL'; confidence: number; signals: string[] } {
  const signals: string[] = [];
  let level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL' = 'NORMAL';

  for (const kw of DISTRESS_KEYWORDS.critical) {
    if (text.includes(kw.telugu) || text.toLowerCase().includes(kw.english)) {
      signals.push(`${kw.telugu} (${kw.english})`);
      level = 'CRITICAL';
    }
  }

  if (level !== 'CRITICAL') {
    for (const kw of DISTRESS_KEYWORDS.high) {
      if (text.includes(kw.telugu) || text.toLowerCase().includes(kw.english)) {
        signals.push(`${kw.telugu} (${kw.english})`);
        level = 'HIGH';
      }
    }
  }

  if (level === 'NORMAL') {
    for (const kw of DISTRESS_KEYWORDS.medium) {
      if (text.includes(kw.telugu) || text.toLowerCase().includes(kw.english)) {
        signals.push(`${kw.telugu} (${kw.english})`);
        level = 'MEDIUM';
      }
    }
  }

  return {
    level,
    confidence: level === 'CRITICAL' ? 0.98 : level === 'HIGH' ? 0.92 : level === 'MEDIUM' ? 0.85 : 0.78,
    signals,
  };
}

// Convert API response to PipelineResult
function apiResponseToPipelineResult(apiResponse: AnalyzeResponse, caseId: string): PipelineResult {
  return {
    caseId,
    classification: {
      department: apiResponse.classification.department || 'Unknown',
      confidence: apiResponse.classification.confidence,
      method: apiResponse.classification.method === 'primary_classifier' ? 'primary' :
              apiResponse.classification.method === 'fallback_classifier' ? 'fallback' : 'manual',
      top3: apiResponse.classification.top_3.map(t => ({
        department: t.department,
        confidence: t.confidence,
      })),
    },
    sentiment: {
      distressLevel: apiResponse.sentiment.distress_level,
      confidence: apiResponse.sentiment.confidence,
      signals: apiResponse.sentiment.signals.map(s => `${s.keyword} (${s.level})`),
    },
    sla: {
      hours: apiResponse.sla.hours,
      deadline: apiResponse.sla.deadline,
      priority: apiResponse.sla.priority,
    },
    lapseRisk: {
      score: apiResponse.lapse_prediction.risk_score,
      level: apiResponse.lapse_prediction.risk_level,
      likelyLapses: apiResponse.lapse_prediction.likely_lapses.map(l => l.lapse),
    },
    similarCases: apiResponse.similar_cases.map(c => ({
      id: c.case_id,
      similarity: c.similarity,
      resolution: c.resolution,
    })),
    recommendedActions: apiResponse.recommended_actions.map(a => a.action),
    responseTemplate: apiResponse.response_template || {
      english: 'Your grievance has been registered. We will respond within the SLA period.',
      telugu: 'మీ ఫిర్యాదు నమోదు చేయబడింది. SLA వ్యవధిలో స్పందిస్తాము.',
    },
    source: 'api',
  };
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('stakeholder');
  const [currentGrievance, setCurrentGrievance] = useState('');
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>(INITIAL_PIPELINE_STEPS);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [grievanceQueue, setGrievanceQueue] = useState<Grievance[]>(MOCK_GRIEVANCES);
  const [submittedGrievances, setSubmittedGrievances] = useState<SubmittedGrievance[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  const [needsClarification, setNeedsClarification] = useState(false);
  const [clarificationAnswered, setClarificationAnswered] = useState(false);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [trackedCaseId, setTrackedCaseId] = useState<string | null>(null);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  const stepTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check backend health on mount
  useEffect(() => {
    console.log(`${DEBUG_PREFIX} useEffect - checking backend health on mount`);
    const checkBackend = async () => {
      console.log(`${DEBUG_PREFIX} checkBackend() starting...`);
      try {
        const health = await dhruvaApi.healthCheck();
        console.log(`${DEBUG_PREFIX} healthCheck returned:`, health);
        console.log(`${DEBUG_PREFIX} Setting backendAvailable to:`, health.healthy);
        setBackendAvailable(health.healthy);
        if (!health.healthy) {
          console.log(`${DEBUG_PREFIX} Backend NOT healthy - setting simulation mode`);
          setBackendError('Backend not available - using simulation mode');
        } else {
          console.log(`${DEBUG_PREFIX} Backend IS healthy - clearing error`);
          setBackendError(null);
        }
      } catch (error) {
        console.error(`${DEBUG_PREFIX} checkBackend() CAUGHT ERROR:`, error);
        setBackendAvailable(false);
        setBackendError(`Health check error: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    };
    checkBackend();
    // Re-check every 30 seconds
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  const clearRole = useCallback(() => {
    setRole(null);
    setCurrentStep(1);
    setPipelineSteps(INITIAL_PIPELINE_STEPS);
    setPipelineResult(null);
    setAuditTrail([]);
    setNeedsClarification(false);
    setClarificationAnswered(false);
    setCaseId(null);
    setCurrentGrievance('');
  }, []);

  const addAuditEntry = useCallback((entry: Omit<AuditEntry, 'timestamp'>) => {
    setAuditTrail(prev => [...prev, {
      ...entry,
      timestamp: new Date().toISOString(),
    }]);
  }, []);

  const processGrievance = useCallback(async (text: string, citizenName: string = 'Demo User'): Promise<PipelineResult> => {
    console.log(`${DEBUG_PREFIX} processGrievance() called`);
    console.log(`${DEBUG_PREFIX} Current backendAvailable:`, backendAvailable);
    console.log(`${DEBUG_PREFIX} Current backendError:`, backendError);
    console.log(`${DEBUG_PREFIX} Text (first 50 chars):`, text.substring(0, 50));

    setIsProcessing(true);
    setCurrentGrievance(text);
    setPipelineSteps(INITIAL_PIPELINE_STEPS);

    // Generate case ID
    const newCaseId = `PGRS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setCaseId(newCaseId);
    setTrackedCaseId(newCaseId);

    // Add audit entry
    addAuditEntry({
      action: 'SUBMITTED',
      actor: 'Citizen',
      icon: '📝',
      details: `Grievance submitted: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
    });

    const steps = [...INITIAL_PIPELINE_STEPS];
    const updateStep = (index: number, updates: Partial<PipelineStep>) => {
      steps[index] = { ...steps[index], ...updates };
      setPipelineSteps([...steps]);
    };

    let result: PipelineResult;

    // Try real API first
    console.log(`${DEBUG_PREFIX} About to check backendAvailable: ${backendAvailable}`);
    if (backendAvailable) {
      console.log(`${DEBUG_PREFIX} *** USING REAL API ***`);
      try {
        // Show pipeline steps processing in real-time
        updateStep(0, { status: 'processing' });

        // Start API call
        console.log(`${DEBUG_PREFIX} Calling dhruvaApi.analyzeGrievance()...`);
        const apiPromise = dhruvaApi.analyzeGrievance(text, undefined, 'Guntur');

        // Animate steps while waiting for API
        await new Promise(r => setTimeout(r, 200));
        updateStep(0, { status: 'completed', duration: 0.12 });
        updateStep(1, { status: 'processing' });

        await new Promise(r => setTimeout(r, 300));
        updateStep(1, { status: 'completed', duration: 0.45 });
        updateStep(2, { status: 'processing' });

        await new Promise(r => setTimeout(r, 200));
        updateStep(2, { status: 'completed', duration: 0.28 });
        updateStep(3, { status: 'processing' });

        // Wait for API response
        const apiResponse = await apiPromise;
        console.log(`${DEBUG_PREFIX} API response received successfully!`);
        console.log(`${DEBUG_PREFIX} API response:`, apiResponse);

        // Complete remaining steps quickly
        updateStep(3, { status: 'completed', duration: 0.08 });
        updateStep(4, { status: 'processing' });
        await new Promise(r => setTimeout(r, 100));
        updateStep(4, { status: 'completed', duration: 0.38, confidence: apiResponse.lapse_prediction.risk_score });
        updateStep(5, { status: 'processing' });
        await new Promise(r => setTimeout(r, 100));
        updateStep(5, { status: 'completed', duration: 0.32 });
        updateStep(6, { status: 'completed', duration: 0.15 });
        updateStep(7, { status: 'completed', duration: 0.05 });
        updateStep(8, { status: 'completed', duration: 0.03 });

        result = apiResponseToPipelineResult(apiResponse, newCaseId);

        addAuditEntry({
          action: 'AI_ANALYZED',
          actor: 'AI',
          icon: '🤖',
          details: `[REAL ML] Classified: ${result.classification.department} (${(result.classification.confidence * 100).toFixed(1)}%), Distress: ${result.sentiment.distressLevel}`,
          pipelineStep: 'classify',
        });

      } catch (error) {
        console.error(`${DEBUG_PREFIX} API call FAILED, falling back to simulation:`, error);
        console.error(`${DEBUG_PREFIX} Error type:`, error instanceof Error ? error.constructor.name : typeof error);
        console.error(`${DEBUG_PREFIX} Error message:`, error instanceof Error ? error.message : String(error));
        setBackendError(`API error: ${error instanceof Error ? error.message : 'Unknown error'} - using simulation`);
        // Fall through to simulation
        console.log(`${DEBUG_PREFIX} Falling back to runSimulation()...`);
        result = await runSimulation(text, newCaseId, steps, updateStep, addAuditEntry);
      }
    } else {
      // Use simulation
      console.log(`${DEBUG_PREFIX} *** USING SIMULATION (backendAvailable=false) ***`);
      result = await runSimulation(text, newCaseId, steps, updateStep, addAuditEntry);
    }

    setPipelineResult(result);
    setIsProcessing(false);

    // Create submitted grievance for cross-role tracking
    const submittedGrievance: SubmittedGrievance = {
      id: newCaseId,
      text: text,
      textTelugu: text,
      citizenName: citizenName,
      district: 'Guntur',
      mandal: 'Tenali',
      department: result.classification.department,
      distressLevel: result.sentiment.distressLevel,
      confidence: result.classification.confidence,
      lapseRisk: result.lapseRisk.score,
      slaHours: result.sla.hours,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      distressSignals: result.sentiment.signals,
      similarCases: result.similarCases,
      pipelineResult: result,
    };

    setSubmittedGrievances(prev => [submittedGrievance, ...prev]);

    // Also add to grievance queue
    const queueGrievance: Grievance = {
      id: newCaseId,
      text: text,
      textTelugu: text,
      department: result.classification.department,
      distressLevel: result.sentiment.distressLevel,
      confidence: result.classification.confidence,
      lapseRisk: result.lapseRisk.score,
      slaHours: result.sla.hours,
      status: 'pending',
      citizenName: citizenName,
      district: 'Guntur',
      mandal: 'Tenali',
      submittedAt: new Date().toISOString(),
      distressSignals: result.sentiment.signals,
      similarCases: result.similarCases,
    };

    setGrievanceQueue(prev => [queueGrievance, ...prev]);

    // Check if clarification needed
    if (result.classification.confidence < 0.7) {
      setNeedsClarification(true);
      setCurrentStep(1);
    } else {
      setNeedsClarification(false);
      setClarificationAnswered(true);
      setCurrentStep(2);

      addAuditEntry({
        action: 'AUTO_ROUTED',
        actor: 'System',
        icon: '🔄',
        details: `Auto-routed to ${result.classification.department} (${(result.classification.confidence * 100).toFixed(1)}% confidence)`,
      });
    }

    return result;
  }, [backendAvailable, addAuditEntry]);

  // Simulation helper function
  async function runSimulation(
    text: string,
    newCaseId: string,
    steps: PipelineStep[],
    updateStep: (index: number, updates: Partial<PipelineStep>) => void,
    addAuditEntry: (entry: Omit<AuditEntry, 'timestamp'>) => void
  ): Promise<PipelineResult> {
    // Step 1: Duplicate detection
    updateStep(0, { status: 'processing' });
    await new Promise(r => setTimeout(r, 300));
    updateStep(0, { status: 'completed', duration: 0.12, result: { isDuplicate: false } });

    // Step 2: Classification
    updateStep(1, { status: 'processing' });
    await new Promise(r => setTimeout(r, 600));
    const classification = simulateClassification(text);
    updateStep(1, {
      status: 'completed',
      duration: 0.45,
      result: classification,
      confidence: classification.confidence,
    });

    // Step 3: Distress detection
    updateStep(2, { status: 'processing' });
    await new Promise(r => setTimeout(r, 400));
    const distress = simulateDistress(text);
    updateStep(2, {
      status: 'completed',
      duration: 0.28,
      result: distress,
      confidence: distress.confidence,
    });

    addAuditEntry({
      action: 'AI_ANALYZED',
      actor: 'AI',
      icon: '🤖',
      details: `[SIMULATION] Classified: ${classification.department} (${(classification.confidence * 100).toFixed(1)}%), Distress: ${distress.level}`,
      pipelineStep: 'classify',
    });

    // Step 4: SLA calculation
    updateStep(3, { status: 'processing' });
    await new Promise(r => setTimeout(r, 200));
    const slaHours = distress.level === 'CRITICAL' ? 24 : distress.level === 'HIGH' ? 72 : distress.level === 'MEDIUM' ? 168 : 336;
    const deadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);
    updateStep(3, {
      status: 'completed',
      duration: 0.08,
      result: { hours: slaHours, deadline: deadline.toISOString() },
    });

    // Step 5: Lapse prediction
    updateStep(4, { status: 'processing' });
    await new Promise(r => setTimeout(r, 500));
    const lapseScore = Math.random() * 0.6 + 0.2;
    const lapseLevel = lapseScore > 0.7 ? 'HIGH' : lapseScore > 0.4 ? 'MEDIUM' : 'LOW';
    updateStep(4, {
      status: 'completed',
      duration: 0.38,
      result: { score: lapseScore, level: lapseLevel },
      confidence: ML_MODELS.lapsePredictor.accuracy / 100,
    });

    // Step 6: Similar cases
    updateStep(5, { status: 'processing' });
    await new Promise(r => setTimeout(r, 400));
    const similarCases = [
      { id: `PGRS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`, similarity: 0.87, resolution: 'PFMS portal update - Bank account mismatch' },
      { id: `PGRS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`, similarity: 0.74, resolution: 'Document verification at local office' },
    ];
    updateStep(5, {
      status: 'completed',
      duration: 0.32,
      result: { matches: similarCases.length },
    });

    // Step 7: Proactive alerts
    updateStep(6, { status: 'processing' });
    await new Promise(r => setTimeout(r, 200));
    updateStep(6, { status: 'completed', duration: 0.15, result: { alerts: [] } });

    // Step 8: Response template
    updateStep(7, { status: 'processing' });
    await new Promise(r => setTimeout(r, 150));
    const template = RESPONSE_TEMPLATES[distress.level];
    updateStep(7, {
      status: 'completed',
      duration: 0.05,
      result: { templateType: distress.level },
    });

    // Step 9: Recommended actions
    updateStep(8, { status: 'processing' });
    await new Promise(r => setTimeout(r, 100));
    const actions: string[] = [];
    if (distress.level === 'CRITICAL') actions.push('IMMEDIATE_ATTENTION');
    if (classification.confidence < 0.7) actions.push('MANUAL_CLASSIFICATION');
    if (lapseScore > 0.6) actions.push('SUPERVISOR_REVIEW');
    if (similarCases.length > 0) actions.push('SIMILAR_CASE_REVIEW');
    updateStep(8, {
      status: 'completed',
      duration: 0.03,
      result: { actions },
    });

    return {
      caseId: newCaseId,
      classification: {
        ...classification,
        method: classification.confidence >= 0.75 ? 'primary' : classification.confidence >= 0.4 ? 'fallback' : 'manual',
      },
      sentiment: {
        distressLevel: distress.level,
        confidence: distress.confidence,
        signals: distress.signals,
      },
      sla: {
        hours: slaHours,
        deadline: deadline.toISOString(),
        priority: distress.level,
      },
      lapseRisk: {
        score: lapseScore,
        level: lapseLevel as 'HIGH' | 'MEDIUM' | 'LOW',
        likelyLapses: lapseScore > 0.5 ? ['No Direct Contact', 'Wrong/Blank Closure'] : [],
      },
      similarCases,
      recommendedActions: actions,
      responseTemplate: template,
      source: 'simulation',
    };
  }

  const acceptCase = useCallback((feedback: string) => {
    if (!pipelineResult) return;

    addAuditEntry({
      action: 'ACCEPTED',
      actor: 'Officer',
      icon: '✅',
      details: `Case assigned to ${pipelineResult.classification.department}. Feedback: "${feedback}"`,
    });

    setCurrentStep(4);
  }, [pipelineResult, addAuditEntry]);

  const reassignCase = useCallback((newDept: string, feedback: string) => {
    if (!pipelineResult) return;

    const oldDept = pipelineResult.classification.department;

    setPipelineResult(prev => prev ? {
      ...prev,
      classification: {
        ...prev.classification,
        department: newDept,
      },
    } : null);

    addAuditEntry({
      action: 'REASSIGNED',
      actor: 'Officer',
      icon: '🔄',
      details: `Reassigned from ${oldDept} to ${newDept}. Feedback: "${feedback}"`,
    });

    setCurrentStep(4);
  }, [pipelineResult, addAuditEntry]);

  const resolveCase = useCallback((targetCaseId: string, resolution: string) => {
    setGrievanceQueue(prev => prev.map(g =>
      g.id === targetCaseId ? { ...g, status: 'resolved' as const } : g
    ));

    setSubmittedGrievances(prev => prev.map(g =>
      g.id === targetCaseId ? { ...g, status: 'resolved' as const } : g
    ));

    addAuditEntry({
      action: 'RESOLVED',
      actor: 'Officer',
      icon: '✅',
      details: `Case ${targetCaseId} resolved: "${resolution}"`,
    });
  }, [addAuditEntry]);

  const resetDemo = useCallback(() => {
    if (stepTimeoutRef.current) {
      clearTimeout(stepTimeoutRef.current);
    }
    setCurrentGrievance('');
    setPipelineSteps(INITIAL_PIPELINE_STEPS);
    setPipelineResult(null);
    setIsProcessing(false);
    setCurrentStep(1);
    setAuditTrail([]);
    setNeedsClarification(false);
    setClarificationAnswered(false);
    setCaseId(null);
  }, []);

  return (
    <DemoContext.Provider value={{
      role,
      setRole,
      clearRole,
      viewMode,
      setViewMode,
      currentGrievance,
      setCurrentGrievance,
      pipelineSteps,
      pipelineResult,
      isProcessing,
      currentStep,
      processGrievance,
      resetDemo,
      grievanceQueue,
      submittedGrievances,
      auditTrail,
      addAuditEntry,
      needsClarification,
      clarificationAnswered,
      setClarificationAnswered,
      acceptCase,
      reassignCase,
      resolveCase,
      caseId,
      trackedCaseId,
      setTrackedCaseId,
      backendAvailable,
      backendError,
    }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}
