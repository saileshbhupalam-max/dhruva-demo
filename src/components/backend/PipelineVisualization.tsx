import React from 'react';
import { useDemo, PipelineStep } from '../../contexts/DemoContext';
import { CheckCircle, Circle, Loader2, SkipForward, Clock, Brain, AlertTriangle, FileSearch, Bell, MessageSquare, ListChecks } from 'lucide-react';

const STEP_ICONS: Record<string, React.ReactNode> = {
  duplicate: <FileSearch className="w-4 h-4" />,
  classify: <Brain className="w-4 h-4" />,
  sentiment: <AlertTriangle className="w-4 h-4" />,
  sla: <Clock className="w-4 h-4" />,
  lapse: <AlertTriangle className="w-4 h-4" />,
  similar: <FileSearch className="w-4 h-4" />,
  alerts: <Bell className="w-4 h-4" />,
  template: <MessageSquare className="w-4 h-4" />,
  actions: <ListChecks className="w-4 h-4" />,
};

const STEP_DESCRIPTIONS: Record<string, string> = {
  duplicate: 'Checking for existing cases from this citizen (cosine similarity > 0.85)',
  classify: 'Running Telugu Classifier V3 (84.5% accuracy) with fallback option',
  sentiment: 'Detecting distress signals using bilingual keyword matching',
  sla: 'Calculating SLA based on distress level (24h-336h)',
  lapse: 'Predicting risk of improper redressal (80.8% accuracy)',
  similar: 'Finding resolved cases with similar text (threshold: 0.70)',
  alerts: 'Checking for area-based patterns (5+ complaints)',
  template: 'Selecting empathy-adjusted response template',
  actions: 'Generating recommended actions for officer',
};

function StepStatusIcon({ status }: { status: PipelineStep['status'] }) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'processing':
      return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    case 'skipped':
      return <SkipForward className="w-5 h-5 text-gray-400" />;
    default:
      return <Circle className="w-5 h-5 text-gray-300" />;
  }
}

function formatResult(step: PipelineStep): string {
  if (!step.result) return '';

  switch (step.id) {
    case 'duplicate':
      return step.result.isDuplicate ? 'Duplicate found!' : 'No duplicates';
    case 'classify':
      return `${(step.result as Record<string, unknown>).department} (${((step.result as Record<string, unknown>).confidence as number * 100).toFixed(1)}%)`;
    case 'sentiment':
      return `${(step.result as Record<string, unknown>).level} distress`;
    case 'sla':
      return `${(step.result as Record<string, unknown>).hours}h deadline`;
    case 'lapse':
      return `${(step.result as Record<string, unknown>).level} risk (${((step.result as Record<string, unknown>).score as number * 100).toFixed(0)}%)`;
    case 'similar':
      return `${(step.result as Record<string, unknown>).matches} matches found`;
    case 'alerts':
      return `${((step.result as Record<string, unknown>).alerts as unknown[]).length} alerts`;
    case 'template':
      return `${(step.result as Record<string, unknown>).templateType} template`;
    case 'actions':
      return `${((step.result as Record<string, unknown>).actions as unknown[]).length} actions`;
    default:
      return JSON.stringify(step.result);
  }
}

export function PipelineVisualization() {
  const { pipelineSteps, pipelineResult, isProcessing, currentGrievance } = useDemo();

  const completedSteps = pipelineSteps.filter(s => s.status === 'completed').length;
  const totalTime = pipelineSteps.reduce((acc, s) => acc + (s.duration || 0), 0);

  return (
    <div className="bg-gray-900 text-white h-full overflow-auto p-4">
      {/* Header */}
      <div className="mb-4 border-b border-gray-700 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold">ML Pipeline</h2>
          {isProcessing && (
            <span className="ml-auto flex items-center gap-1 text-sm text-blue-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>{completedSteps}/9 steps</span>
          <span>|</span>
          <span>{totalTime.toFixed(2)}s total</span>
        </div>
      </div>

      {/* Input text */}
      {currentGrievance && (
        <div className="mb-4 bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">INPUT TEXT</div>
          <div className="text-sm text-gray-200 font-telugu">
            "{currentGrievance}"
          </div>
        </div>
      )}

      {/* Pipeline steps */}
      <div className="space-y-2">
        {pipelineSteps.map((step, index) => (
          <div
            key={step.id}
            className={`rounded-lg p-3 transition-all duration-300 ${
              step.status === 'processing'
                ? 'bg-blue-900/50 border border-blue-500'
                : step.status === 'completed'
                ? 'bg-gray-800'
                : 'bg-gray-800/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <StepStatusIcon status={step.status} />
              </div>
              <div className="flex-shrink-0 w-6 h-6 rounded bg-gray-700 flex items-center justify-center text-gray-300">
                {STEP_ICONS[step.id]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {index + 1}. {step.name}
                  </span>
                  {step.duration !== undefined && (
                    <span className="text-xs text-gray-500">
                      {step.duration.toFixed(2)}s
                    </span>
                  )}
                </div>
                {step.status === 'processing' && (
                  <div className="text-xs text-blue-400 mt-1">
                    {STEP_DESCRIPTIONS[step.id]}
                  </div>
                )}
                {step.status === 'completed' && step.result && (
                  <div className="text-xs text-green-400 mt-1">
                    {formatResult(step)}
                  </div>
                )}
              </div>
              {step.confidence !== undefined && (
                <div className="flex-shrink-0">
                  <div className={`text-xs px-2 py-1 rounded ${
                    step.confidence > 0.8 ? 'bg-green-900 text-green-300' :
                    step.confidence > 0.6 ? 'bg-yellow-900 text-yellow-300' :
                    'bg-red-900 text-red-300'
                  }`}>
                    {(step.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Final result summary */}
      {pipelineResult && !isProcessing && (
        <div className="mt-4 bg-gray-800 rounded-lg p-4 border border-green-500/30">
          <h3 className="text-sm font-bold text-green-400 mb-3">PIPELINE OUTPUT</h3>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-700/50 rounded p-2">
              <div className="text-xs text-gray-400">Classification</div>
              <div className="font-medium">{pipelineResult.classification.department}</div>
              <div className="text-xs text-gray-400">
                {(pipelineResult.classification.confidence * 100).toFixed(1)}% ({pipelineResult.classification.method})
              </div>
            </div>

            <div className={`rounded p-2 ${
              pipelineResult.sentiment.distressLevel === 'CRITICAL' ? 'bg-red-900/50' :
              pipelineResult.sentiment.distressLevel === 'HIGH' ? 'bg-orange-900/50' :
              pipelineResult.sentiment.distressLevel === 'MEDIUM' ? 'bg-yellow-900/50' :
              'bg-green-900/50'
            }`}>
              <div className="text-xs text-gray-400">Distress Level</div>
              <div className="font-medium">{pipelineResult.sentiment.distressLevel}</div>
              <div className="text-xs text-gray-400">
                SLA: {pipelineResult.sla.hours}h
              </div>
            </div>

            <div className={`rounded p-2 ${
              pipelineResult.lapseRisk.level === 'HIGH' ? 'bg-red-900/50' :
              pipelineResult.lapseRisk.level === 'MEDIUM' ? 'bg-yellow-900/50' :
              'bg-green-900/50'
            }`}>
              <div className="text-xs text-gray-400">Lapse Risk</div>
              <div className="font-medium">{pipelineResult.lapseRisk.level}</div>
              <div className="text-xs text-gray-400">
                {(pipelineResult.lapseRisk.score * 100).toFixed(0)}% risk
              </div>
            </div>

            <div className="bg-gray-700/50 rounded p-2">
              <div className="text-xs text-gray-400">Similar Cases</div>
              <div className="font-medium">{pipelineResult.similarCases.length} found</div>
              {pipelineResult.similarCases[0] && (
                <div className="text-xs text-gray-400">
                  Best: {(pipelineResult.similarCases[0].similarity * 100).toFixed(0)}% match
                </div>
              )}
            </div>
          </div>

          {pipelineResult.recommendedActions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="text-xs text-gray-400 mb-2">RECOMMENDED ACTIONS</div>
              <div className="flex flex-wrap gap-2">
                {pipelineResult.recommendedActions.map((action, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-blue-900/50 text-blue-300 rounded">
                    {action}
                  </span>
                ))}
              </div>
            </div>
          )}

          {pipelineResult.sentiment.signals.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="text-xs text-gray-400 mb-2">DETECTED SIGNALS</div>
              <div className="flex flex-wrap gap-2">
                {pipelineResult.sentiment.signals.map((signal, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-red-900/50 text-red-300 rounded font-telugu">
                    {signal}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!currentGrievance && !isProcessing && (
        <div className="text-center py-8 text-gray-500">
          <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Submit a grievance to see the ML pipeline in action</p>
        </div>
      )}
    </div>
  );
}

export default PipelineVisualization;
