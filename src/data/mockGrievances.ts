/**
 * Realistic mock grievances based on actual AP PGRS patterns
 */

export interface Grievance {
  id: string;
  text: string;
  textTelugu?: string;
  department: string;
  distressLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL';
  confidence: number;
  lapseRisk: number;
  slaHours: number;
  status: 'pending' | 'in_progress' | 'resolved' | 'reopened';
  citizenName: string;
  district: string;
  mandal: string;
  submittedAt: string;
  distressSignals?: string[];
  similarCases?: { id: string; similarity: number; resolution: string }[];
}

export const MOCK_GRIEVANCES: Grievance[] = [
  {
    id: 'PGRS-2025-ANT-001',
    text: 'My pension has not been received for 6 months, children have nothing to eat',
    textTelugu: 'pension 6 నెలలు రాలేదు, పిల్లలకు తినడానికి ఏమీ లేదు',
    department: 'Social Welfare',
    distressLevel: 'CRITICAL',
    confidence: 0.845,
    lapseRisk: 0.72,
    slaHours: 24,
    status: 'pending',
    citizenName: 'Lakshmi Devi',
    district: 'Ananthapur',
    mandal: 'Kadiri',
    submittedAt: '2025-11-26T08:30:00',
    distressSignals: ['ఆకలి (starvation)', 'నెలలుగా (months)'],
    similarCases: [
      { id: 'PGRS-2025-ANT-089', similarity: 0.87, resolution: 'PFMS portal update - Bank account mismatch fixed' },
      { id: 'PGRS-2025-GTR-234', similarity: 0.82, resolution: 'Aadhaar seeding correction at UIDAI' },
    ],
  },
  {
    id: 'PGRS-2025-GTR-002',
    text: 'Land survey dispute - neighbor has encroached on my property by 10 feet',
    textTelugu: 'భూమి సర్వే వివాదం - పొరుగువారు నా ఆస్తిపై 10 అడుగులు ఆక్రమించారు',
    department: 'Survey & Land Records',
    distressLevel: 'HIGH',
    confidence: 0.78,
    lapseRisk: 0.58,
    slaHours: 72,
    status: 'pending',
    citizenName: 'Ramaiah Naidu',
    district: 'Guntur',
    mandal: 'Pedakakani',
    submittedAt: '2025-11-26T07:15:00',
    similarCases: [
      { id: 'PGRS-2025-GTR-156', similarity: 0.79, resolution: 'Joint survey with both parties - boundary stones placed' },
    ],
  },
  {
    id: 'PGRS-2025-VSP-003',
    text: 'No water supply for 2 weeks in our ward',
    textTelugu: 'మా వార్డులో 2 వారాలుగా నీటి సరఫరా లేదు',
    department: 'Municipal Administration',
    distressLevel: 'HIGH',
    confidence: 0.92,
    lapseRisk: 0.35,
    slaHours: 72,
    status: 'in_progress',
    citizenName: 'Suresh Kumar',
    district: 'Visakhapatnam',
    mandal: 'Gajuwaka',
    submittedAt: '2025-11-25T14:20:00',
    distressSignals: ['2 వారాలుగా (2 weeks)'],
  },
  {
    id: 'PGRS-2025-KKD-004',
    text: 'Ration card not updated after adding new family member',
    textTelugu: 'కొత్త కుటుంబ సభ్యుడిని జోడించిన తర్వాత రేషన్ కార్డు అప్‌డేట్ కాలేదు',
    department: 'Civil Supplies',
    distressLevel: 'MEDIUM',
    confidence: 0.88,
    lapseRisk: 0.22,
    slaHours: 168,
    status: 'pending',
    citizenName: 'Padma Rani',
    district: 'Kakinada',
    mandal: 'Pithapuram',
    submittedAt: '2025-11-26T09:45:00',
  },
  {
    id: 'PGRS-2025-WGD-005',
    text: 'Police not registering FIR for theft in my house',
    textTelugu: 'నా ఇంట్లో దొంగతనానికి పోలీసులు FIR నమోదు చేయడం లేదు',
    department: 'Police',
    distressLevel: 'HIGH',
    confidence: 0.91,
    lapseRisk: 0.48,
    slaHours: 72,
    status: 'pending',
    citizenName: 'Venkat Rao',
    district: 'West Godavari',
    mandal: 'Bhimavaram',
    submittedAt: '2025-11-26T06:30:00',
  },
  {
    id: 'PGRS-2025-NLR-006',
    text: 'Teacher absent for 2 months in government school',
    textTelugu: 'ప్రభుత్వ పాఠశాలలో ఉపాధ్యాయుడు 2 నెలలుగా గైర్హాజరు',
    department: 'Education',
    distressLevel: 'MEDIUM',
    confidence: 0.86,
    lapseRisk: 0.31,
    slaHours: 168,
    status: 'pending',
    citizenName: 'Srinivas Reddy',
    district: 'Nellore',
    mandal: 'Kavali',
    submittedAt: '2025-11-25T16:00:00',
  },
  {
    id: 'PGRS-2025-KRS-007',
    text: 'Street light not working for 3 months - safety concern for women',
    textTelugu: 'వీధి లైట్లు 3 నెలలుగా పని చేయడం లేదు - మహిళల భద్రత సమస్య',
    department: 'Municipal Administration',
    distressLevel: 'HIGH',
    confidence: 0.89,
    lapseRisk: 0.42,
    slaHours: 72,
    status: 'pending',
    citizenName: 'Anitha Kumari',
    district: 'Krishna',
    mandal: 'Vijayawada Urban',
    submittedAt: '2025-11-26T10:15:00',
    distressSignals: ['భద్రత (safety)', '3 నెలలుగా (3 months)'],
  },
  {
    id: 'PGRS-2025-PKM-008',
    text: 'House site allocation pending for 5 years',
    textTelugu: 'ఇంటి స్థలం కేటాయింపు 5 సంవత్సరాలుగా పెండింగ్‌లో ఉంది',
    department: 'Housing',
    distressLevel: 'MEDIUM',
    confidence: 0.82,
    lapseRisk: 0.55,
    slaHours: 168,
    status: 'pending',
    citizenName: 'Raju Yadav',
    district: 'Prakasam',
    mandal: 'Ongole',
    submittedAt: '2025-11-25T11:30:00',
  },
];

// Example grievances for citizen form
export const EXAMPLE_GRIEVANCES = [
  {
    text: 'My pension has not been received for 6 months',
    telugu: 'నా పెన్షన్ 6 నెలలు రాలేదు',
    department: 'Social Welfare',
    expectedDistress: 'HIGH',
  },
  {
    text: 'Road in our area has many potholes causing accidents',
    telugu: 'మా ప్రాంతంలో రోడ్డులో చాలా గుంతలు ఉన్నాయి, ప్రమాదాలు జరుగుతున్నాయి',
    department: 'Roads & Buildings',
    expectedDistress: 'MEDIUM',
  },
  {
    text: 'Ration shop not giving rice for BPL card holders',
    telugu: 'రేషన్ దుకాణం BPL కార్డు హోల్డర్లకు బియ్యం ఇవ్వడం లేదు',
    department: 'Civil Supplies',
    expectedDistress: 'HIGH',
  },
  {
    text: 'School lo teacher ledu 2 months ga',
    telugu: 'స్కూల్ లో టీచర్ లేదు 2 months గా',
    department: 'Education',
    expectedDistress: 'MEDIUM',
  },
  {
    text: 'Theft in my house, police not registering FIR',
    telugu: 'నా ఇంట్లో దొంగతనం, పోలీసులు FIR నమోదు చేయడం లేదు',
    department: 'Police',
    expectedDistress: 'HIGH',
  },
  {
    text: 'I am thinking of ending my life because of land dispute',
    telugu: 'భూమి వివాదం వల్ల నేను ఆత్మహత్య చేసుకోవాలని అనుకుంటున్నాను',
    department: 'Revenue',
    expectedDistress: 'CRITICAL',
  },
];

// Smart clarifying questions - rule-based, detects ambiguity between departments
export interface ClarifyingQuestion {
  question: string;
  telugu: string;
  options: { label: string; telugu: string; targetDept: string; boost: number }[];
}

// Generate smart questions based on detected ambiguity
export function getSmartClarificationQuestions(
  text: string,
  top3: { department: string; confidence: number }[]
): ClarifyingQuestion[] {
  const questions: ClarifyingQuestion[] = [];
  const lowercaseText = text.toLowerCase();

  // If top 2 departments are close in confidence, ask to clarify
  if (top3.length >= 2 && top3[0].confidence - top3[1].confidence < 0.15) {
    const dept1 = top3[0].department;
    const dept2 = top3[1].department;

    // Revenue vs Survey ambiguity
    if ((dept1.includes('Revenue') || dept2.includes('Revenue')) &&
        (dept1.includes('Survey') || dept2.includes('Survey'))) {
      questions.push({
        question: 'Is this about land ownership (patta) or boundary survey?',
        telugu: 'ఇది భూమి యాజమాన్యం (పట్టా) లేదా సరిహద్దు సర్వే గురించా?',
        options: [
          { label: 'Land ownership/patta issue', telugu: 'భూమి యాజమాన్యం/పట్టా సమస్య', targetDept: 'Revenue (CCLA)', boost: 0.2 },
          { label: 'Boundary/survey dispute', telugu: 'సరిహద్దు/సర్వే వివాదం', targetDept: 'Survey & Land Records', boost: 0.2 },
        ],
      });
    }

    // Municipal vs Panchayat ambiguity
    if ((dept1.includes('Municipal') || dept2.includes('Municipal')) &&
        (dept1.includes('Panchayat') || dept2.includes('Panchayat'))) {
      questions.push({
        question: 'Is this in an urban area (town/city) or rural village?',
        telugu: 'ఇది పట్టణ ప్రాంతం (టౌన్/సిటీ) లేదా గ్రామీణ గ్రామంలో ఉందా?',
        options: [
          { label: 'Urban/Town/City', telugu: 'పట్టణం/టౌన్/సిటీ', targetDept: 'Municipal Administration', boost: 0.2 },
          { label: 'Rural/Village', telugu: 'గ్రామీణ/గ్రామం', targetDept: 'Panchayati Raj', boost: 0.2 },
        ],
      });
    }

    // Social Welfare vs Civil Supplies
    if ((dept1.includes('Social') || dept2.includes('Social')) &&
        (dept1.includes('Civil') || dept2.includes('Civil'))) {
      questions.push({
        question: 'Is this about pension/scheme benefits or ration/food supplies?',
        telugu: 'ఇది పెన్షన్/పథకం ప్రయోజనాలు లేదా రేషన్/ఆహార సరఫరాల గురించా?',
        options: [
          { label: 'Pension/Scheme benefits', telugu: 'పెన్షన్/పథకం ప్రయోజనాలు', targetDept: 'Social Welfare', boost: 0.2 },
          { label: 'Ration/Food supplies', telugu: 'రేషన్/ఆహార సరఫరాలు', targetDept: 'Civil Supplies', boost: 0.2 },
        ],
      });
    }
  }

  // Keyword-based questions for specific ambiguous terms
  if (lowercaseText.includes('money') || lowercaseText.includes('payment') || lowercaseText.includes('డబ్బు')) {
    if (!questions.some(q => q.question.includes('pension'))) {
      questions.push({
        question: 'What type of payment is this about?',
        telugu: 'ఇది ఏ రకమైన చెల్లింపు గురించి?',
        options: [
          { label: 'Pension/Welfare scheme', telugu: 'పెన్షన్/సంక్షేమ పథకం', targetDept: 'Social Welfare', boost: 0.15 },
          { label: 'Government contract/salary', telugu: 'ప్రభుత్వ కాంట్రాక్ట్/జీతం', targetDept: 'Finance', boost: 0.15 },
          { label: 'Land compensation', telugu: 'భూమి పరిహారం', targetDept: 'Revenue (CCLA)', boost: 0.15 },
        ],
      });
    }
  }

  if (lowercaseText.includes('certificate') || lowercaseText.includes('సర్టిఫికేట్')) {
    questions.push({
      question: 'What type of certificate do you need?',
      telugu: 'మీకు ఏ రకమైన సర్టిఫికేట్ కావాలి?',
      options: [
        { label: 'Caste/Income certificate', telugu: 'కులం/ఆదాయ సర్టిఫికేట్', targetDept: 'Revenue (CCLA)', boost: 0.2 },
        { label: 'Birth/Death certificate', telugu: 'జనన/మరణ సర్టిఫికేట్', targetDept: 'Municipal Administration', boost: 0.2 },
        { label: 'Land/Property certificate', telugu: 'భూమి/ఆస్తి సర్టిఫికేట్', targetDept: 'Survey & Land Records', boost: 0.2 },
      ],
    });
  }

  // Limit to 2 questions max
  return questions.slice(0, 2);
}

// Legacy format for backward compatibility
export const CLARIFYING_QUESTIONS: Record<string, { question: string; telugu: string; targetDept: string; boost: number }[]> = {
  'Social Welfare': [
    { question: 'Is this about pension/financial assistance?', telugu: 'ఇది పెన్షన్/ఆర్థిక సహాయం గురించా?', targetDept: 'Social Welfare', boost: 0.15 },
    { question: 'Is this related to a specific welfare scheme?', telugu: 'ఇది నిర్దిష్ట సంక్షేమ పథకానికి సంబంధించినదా?', targetDept: 'Social Welfare', boost: 0.12 },
  ],
  'Revenue': [
    { question: 'Does this involve land records or patta?', telugu: 'ఇది భూమి రికార్డులు లేదా పట్టాకు సంబంధించినదా?', targetDept: 'Revenue', boost: 0.15 },
    { question: 'Is there an encroachment or boundary issue?', telugu: 'ఆక్రమణ లేదా సరిహద్దు సమస్య ఉందా?', targetDept: 'Survey & Land Records', boost: 0.12 },
  ],
  'Municipal Administration': [
    { question: 'Is this about water supply or drainage?', telugu: 'ఇది నీటి సరఫరా లేదా డ్రైనేజీకి సంబంధించినదా?', targetDept: 'Municipal Administration', boost: 0.15 },
    { question: 'Is this about roads or street lights?', telugu: 'ఇది రోడ్లు లేదా వీధి లైట్లకు సంబంధించినదా?', targetDept: 'Municipal Administration', boost: 0.12 },
  ],
  'default': [
    { question: 'Could you describe the specific problem?', telugu: 'నిర్దిష్ట సమస్యను వివరించగలరా?', targetDept: '', boost: 0.10 },
    { question: 'How long has this issue been pending?', telugu: 'ఈ సమస్య ఎంత కాలంగా పెండింగ్‌లో ఉంది?', targetDept: '', boost: 0.08 },
  ],
};

// Response templates by distress level
export const RESPONSE_TEMPLATES = {
  CRITICAL: {
    english: "We understand this is an extremely urgent situation. Your case #{caseId} has been marked CRITICAL and will receive immediate attention. A senior officer will contact you within 24 hours. Please stay strong - help is on the way.",
    telugu: "ఇది అత్యంత అత్యవసర పరిస్థితి అని మాకు అర్థమైంది. మీ కేసు #{caseId} క్రిటికల్‌గా గుర్తించబడింది మరియు వెంటనే దృష్టి పెట్టబడుతుంది. సీనియర్ అధికారి 24 గంటల్లో మీకు ఫోన్ చేస్తారు.",
  },
  HIGH: {
    english: "Your grievance #{caseId} has been registered with HIGH priority. We take your concern seriously and will resolve it within 3 days. You will receive updates via WhatsApp.",
    telugu: "మీ ఫిర్యాదు #{caseId} అధిక ప్రాధాన్యతతో నమోదు చేయబడింది. మేము మీ ఆందోళనను తీవ్రంగా తీసుకుంటాము మరియు 3 రోజుల్లో పరిష్కరిస్తాము.",
  },
  MEDIUM: {
    english: "Your grievance #{caseId} has been successfully registered. Our team will review and respond within 7 days. Track status anytime using your case ID.",
    telugu: "మీ ఫిర్యాదు #{caseId} విజయవంతంగా నమోదు చేయబడింది. మా బృందం 7 రోజుల్లో సమీక్షించి స్పందిస్తుంది.",
  },
  NORMAL: {
    english: "Your grievance #{caseId} has been registered. Expected resolution time is 14 days. You can track the status using your case ID.",
    telugu: "మీ ఫిర్యాదు #{caseId} నమోదు చేయబడింది. ఊహించిన పరిష్కార సమయం 14 రోజులు.",
  },
};

// Keyword-based Q&A for "Ask Dhruva" - no LLM calls needed
export interface AskDhruvaResponse {
  answer: string;
  answerTelugu?: string;
  confidence: number;
  sources: string[];
  relatedQuestions?: string[];
}

interface QAPattern {
  keywords: string[];
  teluguKeywords?: string[];
  answer: string;
  answerTelugu: string;
  sources: string[];
  relatedQuestions: string[];
}

const QA_PATTERNS: QAPattern[] = [
  // Satisfaction & Performance
  {
    keywords: ['satisfaction', 'satisfied', 'dissatisfied', 'happy', 'unhappy'],
    teluguKeywords: ['సంతృప్తి', 'అసంతృప్తి'],
    answer: 'The average citizen satisfaction across AP is 1.9 out of 5.0. The best performing district is Kakinada (2.61/5) and the worst is Ananthapur (1.49/5) - a variance of 74%. Revenue department has the highest dissatisfaction at 77.73%.',
    answerTelugu: 'AP అంతటా సగటు పౌర సంతృప్తి 5.0లో 1.9. ఉత్తమ పనితీరు కాకినాడ (2.61/5), అత్యంత తక్కువ అనంతపురం (1.49/5) - 74% వ్యత్యాసం.',
    sources: ['State Call Center 1100 Feedback Data', 'PGRS Audit Report 2025'],
    relatedQuestions: ['Which district performs best?', 'What is the reopen rate?'],
  },
  {
    keywords: ['best', 'top', 'performing', 'kakinada', 'good'],
    answer: 'Kakinada district ranks #1 with 2.61/5 satisfaction score. Top 5 districts: 1. Kakinada (2.61), 2. Konaseema (2.42), 3. Parvathipuram Manyam (2.35), 4. Alluri Sitharama Raju (2.31), 5. Vizianagaram (2.24).',
    answerTelugu: 'కాకినాడ జిల్లా 2.61/5 సంతృప్తి స్కోర్‌తో #1 ర్యాంక్. టాప్ 5: 1. కాకినాడ, 2. కోనసీమ, 3. పార్వతీపురం మన్యం, 4. అల్లూరి సీతారామరాజు, 5. విజయనగరం.',
    sources: ['State Call Center 1100 Data Analysis'],
    relatedQuestions: ['Which district is worst?', 'Why is Kakinada best?'],
  },
  {
    keywords: ['worst', 'bottom', 'anantapur', 'ananthapur', 'poor', 'bad'],
    teluguKeywords: ['అనంతపురం', 'చెడ్డ'],
    answer: 'Ananthapur district is in crisis with only 54.08% satisfaction (worst in AP). Issues: 5,082 pending grievances, only 2 staff appointed vs 8 required, 50.60% pre-audit improper rate, and 871 pending memos. Revenue department dissatisfaction is 77.73%.',
    answerTelugu: 'అనంతపురం జిల్లా 54.08% సంతృప్తితో సంక్షోభంలో ఉంది. 5,082 పెండింగ్ ఫిర్యాదులు, 8 మందికి బదులు 2 మంది సిబ్బంది మాత్రమే.',
    sources: ['Ananthapur Pre-Audit Report', 'PGRS Crisis Analysis'],
    relatedQuestions: ['How to improve Ananthapur?', 'What is being done?'],
  },
  // Lapse & Issues
  {
    keywords: ['lapse', 'failure', 'officer', 'problem', 'issue', 'wrong'],
    teluguKeywords: ['లాప్స్', 'వైఫల్యం', 'సమస్య'],
    answer: 'We track 12 types of officer failures: BEHAVIORAL (5): Abusive language, Threatened citizen, Bribe demanded, Political interference, Intentional avoidance. PROCEDURAL (7): No direct contact (42%), No endorsement, No time spent, Wrong/blank closure, Improper photo/report (16%), Forwarded to junior, False jurisdiction.',
    answerTelugu: '12 రకాల అధికారి వైఫల్యాలు గుర్తించబడ్డాయి: ప్రవర్తనాపరమైన (5) మరియు విధానపరమైన (7). అత్యధికంగా "ప్రత్యక్ష సంప్రదింపు లేదు" 42%.',
    sources: ['Government Lapse Classification', 'Audit Reports'],
    relatedQuestions: ['What is most common lapse?', 'How are lapses detected?'],
  },
  {
    keywords: ['reopen', 'reopened', 'false', 'closure', 'closed'],
    teluguKeywords: ['తిరిగి', 'మూసివేత'],
    answer: 'Revenue department has 73.5% reopen rate - meaning 3 out of 4 cases marked "resolved" are reopened by dissatisfied citizens. In 2025, 1.73 lakh cases were falsely marked as "completed" without actual resolution.',
    answerTelugu: 'రెవెన్యూ విభాగంలో 73.5% తిరిగి తెరవడం - పరిష్కరించబడిన 4 కేసులలో 3 అసంతృప్త పౌరులచే తిరిగి తెరవబడతాయి.',
    sources: ['Reopen Rate Analysis', 'False Closure Audit 2025'],
    relatedQuestions: ['Why are cases reopened?', 'How to prevent false closures?'],
  },
  // Department specific
  {
    keywords: ['revenue', 'land', 'patta', 'survey'],
    teluguKeywords: ['రెవెన్యూ', 'భూమి', 'పట్టా', 'సర్వే'],
    answer: 'Revenue (CCLA) has 77.73% dissatisfaction - highest among all departments. Survey & Land Records follows at 77.63%. Common issues: Land ownership disputes, Patta mutations, Encroachment complaints, Survey errors. Average resolution time: 15-18 days.',
    answerTelugu: 'రెవెన్యూ (CCLA) 77.73% అసంతృప్తితో అత్యధికం. సర్వే & భూ రికార్డులు 77.63%. సగటు పరిష్కార సమయం: 15-18 రోజులు.',
    sources: ['Department Performance Data', 'PGRS Analytics'],
    relatedQuestions: ['How to improve Revenue dept?', 'What causes land disputes?'],
  },
  {
    keywords: ['pension', 'welfare', 'scheme', 'benefit', 'money'],
    teluguKeywords: ['పెన్షన్', 'సంక్షేమ', 'పథకం', 'డబ్బు'],
    answer: 'Social Welfare handles pension delays, scheme benefits, and financial assistance. Current dissatisfaction: 42.8%. Most common issues: PFMS portal sync failures, Bank account mismatches, Aadhaar seeding problems. Average resolution: 7 days.',
    answerTelugu: 'సామాజిక సంక్షేమం పెన్షన్ జాప్యాలు, పథకం ప్రయోజనాలు నిర్వహిస్తుంది. ప్రస్తుత అసంతృప్తి: 42.8%. సగటు పరిష్కారం: 7 రోజులు.',
    sources: ['Social Welfare Department Data'],
    relatedQuestions: ['Why is pension delayed?', 'How to check scheme status?'],
  },
  // Statistics
  {
    keywords: ['statistic', 'number', 'data', 'how many', 'total', 'count'],
    teluguKeywords: ['సంఖ్య', 'డేటా', 'ఎన్ని'],
    answer: 'Key Statistics: 93,892 feedback calls analyzed, 78% dissatisfaction sparked reforms in 2018, 1.73 lakh false closures in 2025, 74% variance between best/worst districts, 12 types of officer lapses tracked, 4 ML models active (84.5% classification accuracy).',
    answerTelugu: 'ముఖ్య గణాంకాలు: 93,892 ఫీడ్‌బ్యాక్ కాల్‌లు విశ్లేషించబడ్డాయి, 78% అసంతృప్తి 2018లో సంస్కరణలకు దారితీసింది.',
    sources: ['PGRS Analytics Dashboard', 'State Call Center Data'],
    relatedQuestions: ['How is data collected?', 'What is ML accuracy?'],
  },
  // ML & AI
  {
    keywords: ['ml', 'ai', 'machine learning', 'model', 'accuracy', 'classification'],
    answer: '4 ML Models Active: 1. Telugu Classifier V3 (84.5% accuracy, 92.2% top-3), 2. Fallback Classifier (85.8%), 3. Sentiment/Distress Classifier (100% accuracy, 98.3% CV), 4. Lapse Predictor (80.8%). All models run locally - no external API calls.',
    answerTelugu: '4 ML మోడల్స్ యాక్టివ్: తెలుగు క్లాసిఫైయర్ (84.5%), సెంటిమెంట్ క్లాసిఫైయర్ (100%), లాప్స్ ప్రిడిక్టర్ (80.8%).',
    sources: ['ML Pipeline Documentation'],
    relatedQuestions: ['How does classification work?', 'What is distress detection?'],
  },
];

export function askDhruva(question: string): AskDhruvaResponse {
  const lowercaseQ = question.toLowerCase();

  // Find best matching pattern
  let bestMatch: QAPattern | null = null;
  let bestScore = 0;

  for (const pattern of QA_PATTERNS) {
    let score = 0;

    // Check English keywords
    for (const kw of pattern.keywords) {
      if (lowercaseQ.includes(kw.toLowerCase())) {
        score += 1;
      }
    }

    // Check Telugu keywords
    if (pattern.teluguKeywords) {
      for (const kw of pattern.teluguKeywords) {
        if (question.includes(kw)) {
          score += 1.5; // Telugu match gets higher weight
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = pattern;
    }
  }

  if (bestMatch && bestScore >= 1) {
    return {
      answer: bestMatch.answer,
      answerTelugu: bestMatch.answerTelugu,
      confidence: Math.min(0.95, 0.6 + bestScore * 0.1),
      sources: bestMatch.sources,
      relatedQuestions: bestMatch.relatedQuestions,
    };
  }

  // Default response
  return {
    answer: "I can help you with information about grievance statistics, department performance, officer lapses, district rankings, and ML model accuracy. Try asking about satisfaction scores, reopen rates, or specific departments like Revenue or Social Welfare.",
    answerTelugu: "ఫిర్యాదు గణాంకాలు, విభాగ పనితీరు, అధికారి లాప్స్‌లు, జిల్లా ర్యాంకింగ్‌ల గురించి నేను సహాయం చేయగలను.",
    confidence: 0.3,
    sources: ['General Knowledge Base'],
    relatedQuestions: ['What is average satisfaction?', 'Which department has most issues?', 'Tell me about Ananthapur'],
  };
}

// List of all departments for officer reassignment
export const ALL_DEPARTMENTS = [
  'Revenue (CCLA)',
  'Survey & Land Records',
  'Roads & Buildings',
  'Police',
  'Panchayati Raj',
  'Municipal Administration',
  'Social Welfare',
  'Civil Supplies',
  'Agriculture',
  'Health',
  'Education',
  'Energy',
  'Water Resources',
  'Housing',
  'Transport',
  'Finance',
  'Women & Child Welfare',
  'Tribal Welfare',
  'BC Welfare',
  'Fisheries',
];

export default {
  MOCK_GRIEVANCES,
  EXAMPLE_GRIEVANCES,
  CLARIFYING_QUESTIONS,
  RESPONSE_TEMPLATES,
  getSmartClarificationQuestions,
  askDhruva,
  ALL_DEPARTMENTS,
};
