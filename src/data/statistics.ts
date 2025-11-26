/**
 * Real statistics from AP Government PGRS documents
 * Source: docs/VISUAL_STORYTELLING_DATA.md, audit reports, feedback data
 */

export const HEADLINE_STATS = {
  dissatisfaction2018: 78, // 78% citizen dissatisfaction sparked reforms
  falseCLosures2025: 173020, // 1.73 lakh cases falsely marked "completed"
  feedbackCallsAnalyzed: 93892, // State Call Center 1100
  avgSatisfaction: 1.9, // out of 5.0
  varianceBestWorst: 74, // % difference between best and worst districts
  anantapurSatisfaction: 54.08, // Critically low
  revenueReopenRate: 73.5, // Revenue department reopen rate
};

export const DISTRICT_DATA: Record<string, {
  rank: number;
  satisfaction: number;
  category: 'excellent' | 'good' | 'average' | 'poor' | 'critical';
  pendingCases?: number;
  avgResolutionDays?: number;
}> = {
  'Kakinada': { rank: 1, satisfaction: 2.61, category: 'excellent' },
  'Konaseema': { rank: 2, satisfaction: 2.42, category: 'good' },
  'Parvathipuram Manyam': { rank: 3, satisfaction: 2.35, category: 'good' },
  'Alluri Sitharama Raju': { rank: 4, satisfaction: 2.31, category: 'good' },
  'Vizianagaram': { rank: 5, satisfaction: 2.24, category: 'good' },
  'East Godavari': { rank: 6, satisfaction: 2.18, category: 'average' },
  'Srikakulam': { rank: 7, satisfaction: 2.12, category: 'average' },
  'West Godavari': { rank: 8, satisfaction: 2.05, category: 'average' },
  'Krishna': { rank: 9, satisfaction: 1.98, category: 'average' },
  'Guntur': { rank: 10, satisfaction: 1.89, category: 'poor' },
  'Prakasam': { rank: 11, satisfaction: 1.76, category: 'poor' },
  'Nellore': { rank: 12, satisfaction: 1.68, category: 'poor' },
  'Visakhapatnam': { rank: 13, satisfaction: 1.54, category: 'poor' },
  'Ananthapur': { rank: 14, satisfaction: 1.49, category: 'critical', pendingCases: 5082, avgResolutionDays: 12 },
};

export const DEPARTMENT_DATA: Record<string, {
  dissatisfaction: number;
  reopenRate: number;
  grievances: number;
  category: 'critical' | 'high' | 'medium' | 'low';
  avgResolutionDays: number;
}> = {
  'Revenue (CCLA)': { dissatisfaction: 77.73, reopenRate: 73.5, grievances: 4116, category: 'critical', avgResolutionDays: 15 },
  'Survey & Land Records': { dissatisfaction: 77.63, reopenRate: 68.2, grievances: 2891, category: 'critical', avgResolutionDays: 18 },
  'Roads & Buildings': { dissatisfaction: 58.97, reopenRate: 45.3, grievances: 1523, category: 'high', avgResolutionDays: 12 },
  'Police': { dissatisfaction: 58.85, reopenRate: 42.1, grievances: 2105, category: 'high', avgResolutionDays: 8 },
  'Panchayati Raj': { dissatisfaction: 48.51, reopenRate: 38.7, grievances: 1876, category: 'medium', avgResolutionDays: 10 },
  'Municipal Administration': { dissatisfaction: 45.2, reopenRate: 35.4, grievances: 3421, category: 'medium', avgResolutionDays: 9 },
  'Social Welfare': { dissatisfaction: 42.8, reopenRate: 31.2, grievances: 2567, category: 'medium', avgResolutionDays: 7 },
  'Civil Supplies': { dissatisfaction: 38.5, reopenRate: 28.9, grievances: 1234, category: 'low', avgResolutionDays: 5 },
  'Agriculture': { dissatisfaction: 35.2, reopenRate: 24.3, grievances: 987, category: 'low', avgResolutionDays: 6 },
  'Health': { dissatisfaction: 41.3, reopenRate: 33.1, grievances: 1654, category: 'medium', avgResolutionDays: 4 },
  'Education': { dissatisfaction: 39.8, reopenRate: 29.5, grievances: 1432, category: 'medium', avgResolutionDays: 5 },
  'Energy': { dissatisfaction: 44.6, reopenRate: 36.2, grievances: 2876, category: 'medium', avgResolutionDays: 3 },
  'Water Resources': { dissatisfaction: 52.4, reopenRate: 41.8, grievances: 1987, category: 'high', avgResolutionDays: 11 },
  'Housing': { dissatisfaction: 56.3, reopenRate: 48.2, grievances: 3234, category: 'high', avgResolutionDays: 21 },
  'Transport': { dissatisfaction: 47.1, reopenRate: 34.6, grievances: 876, category: 'medium', avgResolutionDays: 6 },
};

// 12 Government-classified officer failure types
export const LAPSE_CATEGORIES = {
  behavioral: [
    { id: 1, name: 'Abusive Language', telugu: 'అసభ్య భాష', severity: 'critical', description: 'GRA scolded / used abusive language' },
    { id: 2, name: 'Threatened Citizen', telugu: 'బెదిరింపు', severity: 'critical', description: 'GRA threatened / pleaded / persuaded the applicant' },
    { id: 3, name: 'Bribe Demanded', telugu: 'లంచం అడిగారు', severity: 'critical', description: 'GRA took bribe / asked for bribe / stopped work for not paying bribe' },
    { id: 4, name: 'Political Interference', telugu: 'రాజకీయ జోక్యం', severity: 'high', description: 'GRA involved political persons, causing trouble' },
    { id: 5, name: 'Intentional Avoidance', telugu: 'ఉద్దేశపూర్వక తప్పించుకోవడం', severity: 'high', description: 'GRA intentionally avoided work by saying "officer not available / come again later"' },
  ],
  procedural: [
    { id: 6, name: 'No Direct Contact', telugu: 'ప్రత్యక్ష సంప్రదింపు లేదు', severity: 'medium', description: 'GRA did not speak directly with the citizen', percentage: 42 },
    { id: 7, name: 'No Endorsement', telugu: 'ధ్రువీకరణ లేదు', severity: 'medium', description: 'GRA did not provide endorsement personally' },
    { id: 8, name: 'No Time Spent', telugu: 'సమయం వెచ్చించలేదు', severity: 'medium', description: 'GRA did not spend time explaining the issue' },
    { id: 9, name: 'Wrong/Blank Closure', telugu: 'తప్పు/ఖాళీ మూసివేత', severity: 'high', description: 'GRA gave WRONG / BLANK / NOT RELATED / FUTURE TENSE endorsement' },
    { id: 10, name: 'Improper Photo/Report', telugu: 'అనుచిత ఫోటో', severity: 'medium', description: 'GRA uploaded improper enquiry photo / report', percentage: 16 },
    { id: 11, name: 'Forwarded to Junior', telugu: 'జూనియర్‌కు ఫార్వార్డ్', severity: 'medium', description: 'GRA forwarded to lower-level official instead of resolving personally' },
    { id: 12, name: 'False Jurisdiction', telugu: 'తప్పుడు అధికార పరిధి', severity: 'high', description: 'GRA closed stating "not under jurisdiction" without proper transfer' },
  ],
};

// Officer performance data from West Godavari Pre-Audit Report
export const OFFICER_PERFORMANCE = [
  { name: 'Joint Director of Fisheries', district: 'West Godavari', improperRate: 76.67, cases: 30, category: 'critical' },
  { name: 'District Fisheries Officer', district: 'West Godavari', improperRate: 72.41, cases: 29, category: 'critical' },
  { name: 'Tahsildar, Poduru', district: 'West Godavari', improperRate: 55.00, cases: 40, category: 'high' },
  { name: 'MRO, Bhimavaram', district: 'West Godavari', improperRate: 48.50, cases: 65, category: 'high' },
  { name: 'Tahsildar, Eluru', district: 'West Godavari', improperRate: 42.30, cases: 52, category: 'medium' },
  { name: 'DRO, Anantapuram', district: 'Ananthapur', improperRate: 73.50, cases: 2091, category: 'critical' },
  { name: 'Tahsildar, Kadiri', district: 'Ananthapur', improperRate: 58.20, cases: 78, category: 'high' },
];

// Ananthapur crisis data
export const ANANTHAPUR_CRISIS = {
  citizenSatisfaction: 54.08,
  preAuditImproper: 50.60,
  postAuditReopen: 52.30,
  auditPendency: 42.52,
  pendingGrievances: 5082,
  pendingMemos: 871,
  staffAvailable: 2,
  staffAppointed: 8,
  departmentDissatisfaction: {
    'Revenue (CCLA)': 77.73,
    'Survey & Land Records': 77.63,
    'Roads & Buildings': 58.97,
    'Police': 58.85,
    'Panchayati Raj': 48.51,
  },
};

// Model accuracies from the ML pipeline
export const ML_MODELS = {
  teluguClassifierV3: { name: 'Telugu Classifier V3', accuracy: 84.5, top3Accuracy: 92.2, file: 'telugu_classifier_v3.pkl' },
  fallbackClassifier: { name: 'Fallback Classifier', accuracy: 85.8, file: 'classification_fallback.pkl' },
  sentimentClassifier: { name: 'Sentiment Classifier', accuracy: 100, cvAccuracy: 98.3, file: 'sentiment_classifier.pkl' },
  lapsePredictor: { name: 'Lapse Predictor', accuracy: 80.8, file: 'lapse_predictor.json' },
};

// Distress keywords for sentiment detection
export const DISTRESS_KEYWORDS = {
  critical: [
    { telugu: 'ఆత్మహత్య', english: 'suicide', slaHours: 24 },
    { telugu: 'చనిపోతున్నాము', english: 'dying', slaHours: 24 },
    { telugu: 'ఆకలి', english: 'starvation', slaHours: 24 },
    { telugu: 'ప్రాణాలు పోతున్నాయి', english: 'lives at risk', slaHours: 24 },
    { telugu: 'అత్యవసర', english: 'emergency', slaHours: 24 },
  ],
  high: [
    { telugu: 'నెలలుగా', english: 'months pending', slaHours: 72 },
    { telugu: 'రాలేదు', english: 'not received', slaHours: 72 },
    { telugu: 'అత్యవసరంగా', english: 'urgently needed', slaHours: 72 },
    { telugu: 'జీవితం భరించలేను', english: "can't bear life", slaHours: 72 },
    { telugu: 'ఎక్కడికి వెళ్ళాలో తెలియదు', english: "don't know where to go", slaHours: 72 },
  ],
  medium: [
    { telugu: 'సమస్య', english: 'problem', slaHours: 168 },
    { telugu: 'పని జరగలేదు', english: 'work not done', slaHours: 168 },
    { telugu: 'సమాధానం రాలేదు', english: 'no response', slaHours: 168 },
    { telugu: 'చాలా రోజులు', english: 'many days waiting', slaHours: 168 },
  ],
};

// Memorable statistics for presentation
export const QUOTABLE_STATS = [
  { stat: '78%', description: 'dissatisfaction sparked the reform - what will spark yours?' },
  { stat: '73.5%', description: 'reopen rate in Revenue - same problems, endless cycles' },
  { stat: '76.67%', description: 'improper redressal despite CM-level monitoring' },
  { stat: '1.73L', description: 'cases falsely closed - quantity over quality' },
  { stat: '12', description: 'types of officer failures - we detect them all' },
  { stat: '95.7% vs 22%', description: 'official resolution vs actual satisfaction' },
  { stat: '74%', description: 'variance between best and worst districts - same system' },
  { stat: '54%', description: 'satisfaction in Ananthapur - half the citizens left unhappy' },
];

export default {
  HEADLINE_STATS,
  DISTRICT_DATA,
  DEPARTMENT_DATA,
  LAPSE_CATEGORIES,
  OFFICER_PERFORMANCE,
  ANANTHAPUR_CRISIS,
  ML_MODELS,
  DISTRESS_KEYWORDS,
  QUOTABLE_STATS,
};
