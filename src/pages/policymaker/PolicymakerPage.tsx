import React, { useState } from 'react';
import { useDemo } from '../../contexts/DemoContext';
import {
  DISTRICT_DATA, DEPARTMENT_DATA, LAPSE_CATEGORIES,
  HEADLINE_STATS, OFFICER_PERFORMANCE, ANANTHAPUR_CRISIS
} from '../../data/statistics';
import {
  TrendingUp, TrendingDown, MapPin, AlertTriangle, Users, Building2,
  BarChart3, Calendar, Download, MessageSquare, Lightbulb, ChevronRight,
  Search, AlertCircle
} from 'lucide-react';

// Convert district data to array format for display
const districtArray = Object.entries(DISTRICT_DATA).map(([name, data]) => ({
  name,
  ...data,
  resolved: Math.floor(Math.random() * 3000 + 2000),
  pending: Math.floor(Math.random() * 500 + 100),
  total: Math.floor(Math.random() * 3500 + 2100),
}));

// Convert department data to array format
const departmentArray = Object.entries(DEPARTMENT_DATA).map(([name, data]) => ({
  name,
  ...data,
  slaCompliance: Math.round(100 - data.dissatisfaction),
}));

// Pattern recommendations based on real data
const patterns = [
  {
    id: 1,
    type: 'CLUSTER',
    title: 'Water Supply Issues - Ward 7, Guntur',
    count: 523,
    period: '3 months',
    insight: '87% are "irregular supply" - timing conflicts with work hours',
    recommendation: 'Adjust supply to 6AM-8AM or 6PM-8PM',
    impact: '60% reduction projected',
    status: 'pending',
  },
  {
    id: 2,
    type: 'TREND',
    title: `Critical: Ananthapur District - ${ANANTHAPUR_CRISIS.citizenSatisfaction.toFixed(1)}% satisfaction`,
    count: ANANTHAPUR_CRISIS.pendingGrievances,
    period: 'Ongoing',
    insight: `Only ${ANANTHAPUR_CRISIS.staffAvailable}/${ANANTHAPUR_CRISIS.staffAppointed} staff appointed, ${ANANTHAPUR_CRISIS.pendingMemos} pending memos`,
    recommendation: 'Immediate staff deployment and capacity building',
    impact: 'Address systemic understaffing issue',
    status: 'critical',
  },
  {
    id: 3,
    type: 'LAPSE',
    title: `Revenue Department - ${DEPARTMENT_DATA['Revenue (CCLA)'].reopenRate.toFixed(1)}% reopen rate`,
    count: DEPARTMENT_DATA['Revenue (CCLA)'].grievances,
    period: 'This quarter',
    insight: `Highest dissatisfaction (${DEPARTMENT_DATA['Revenue (CCLA)'].dissatisfaction.toFixed(1)}%) - Land survey issues common`,
    recommendation: 'Training program for land survey procedures + dedicated helpdesk',
    impact: 'Reduce reopens by 30-40%',
    status: 'in_progress',
  },
  {
    id: 4,
    type: 'LAPSE',
    title: `Officer Lapse Pattern: "No Direct Contact" (${LAPSE_CATEGORIES.procedural[0].percentage}%)`,
    count: Math.round(HEADLINE_STATS.feedbackCallsAnalyzed * 0.42),
    period: 'From feedback analysis',
    insight: 'Most common lapse: GRA did not speak directly with citizen',
    recommendation: 'Mandatory call logging before case closure',
    impact: 'Improve citizen satisfaction by 15-20%',
    status: 'pending',
  },
];

export default function PolicymakerPage() {
  const { auditTrail, addAuditEntry } = useDemo();
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [askDhruvaQuery, setAskDhruvaQuery] = useState('');
  const [askDhruvaResponse, setAskDhruvaResponse] = useState<string | null>(null);

  const handleAskDhruva = (query: string) => {
    const q = query.toLowerCase();

    // Simulate AI responses based on query
    let response = '';
    if (q.includes('reopen') || q.includes('reopening')) {
      response = `Top 3 mandals by reopen rate:\n\n1. Poduru, West Godavari - 55% (land survey issues)\n2. Kadiri, Ananthapur - 52% (pension disbursement)\n3. Kakinada Rural - 42% (water supply)\n\nRoot cause: Lack of proper field verification before closure.\nRecommendation: Mandatory site visit for land-related cases.`;
    } else if (q.includes('satisfaction') || q.includes('worst')) {
      response = `Districts by satisfaction (lowest to highest):\n\n1. Ananthapur - ${ANANTHAPUR_CRISIS.citizenSatisfaction.toFixed(1)}% (CRITICAL)\n2. Nellore - 1.68/5.0\n3. Prakasam - 1.76/5.0\n\nAnanthapur requires immediate intervention:\n- Only 2/8 staff positions filled\n- 5,082 pending grievances\n- 871 pending memos`;
    } else if (q.includes('department') || q.includes('category')) {
      response = `Top complaint departments:\n\n1. Revenue (CCLA) - 77.7% dissatisfaction\n2. Survey & Land Records - 77.6%\n3. Roads & Buildings - 59.0%\n4. Police - 58.9%\n\nCommon theme: Land-related issues dominate grievances.`;
    } else if (q.includes('lapse') || q.includes('officer')) {
      response = `Top officer lapses detected:\n\n1. No Direct Contact - 42% of all lapses\n2. No Site Visit - 16%\n3. Wrong/Blank Closure - 12%\n\nOfficers with highest improper rate:\n- Joint Director of Fisheries, WG: 76.7%\n- District Fisheries Officer, WG: 72.4%`;
    } else {
      response = `Based on analysis of ${HEADLINE_STATS.feedbackCallsAnalyzed.toLocaleString()} feedback calls:\n\n- State average satisfaction: ${HEADLINE_STATS.avgSatisfaction}/5.0\n- ${HEADLINE_STATS.varianceBestWorst}% variance between best and worst districts\n- ${(HEADLINE_STATS.falseCLosures2025 / 1000).toFixed(1)}K cases falsely marked "completed"\n\nAsk about specific districts, departments, or trends for detailed insights.`;
    }

    setAskDhruvaResponse(response);
    addAuditEntry({
      action: 'AI_QUERY',
      actor: 'System',
      icon: '🤖',
      details: `Policymaker asked: "${query}"`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <p className="text-xs sm:text-sm text-gray-500">Feedback</p>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {(HEADLINE_STATS.feedbackCallsAnalyzed / 1000).toFixed(0)}K
          </p>
          <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">State Call Center 1100</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <p className="text-xs sm:text-sm text-gray-500">Satisfaction</p>
            <BarChart3 className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {HEADLINE_STATS.avgSatisfaction}/5
          </p>
          <p className="text-[10px] sm:text-xs text-red-500">Below target</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <p className="text-xs sm:text-sm text-gray-500">Variance</p>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {HEADLINE_STATS.varianceBestWorst}%
          </p>
          <p className="text-[10px] sm:text-xs text-red-500">Best vs Worst</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <p className="text-xs sm:text-sm text-gray-500">False Close</p>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {(HEADLINE_STATS.falseCLosures2025 / 1000).toFixed(0)}K
          </p>
          <p className="text-[10px] sm:text-xs text-red-500">Not resolved</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* District Performance */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              <span className="hidden sm:inline">District Performance (Ranked)</span>
              <span className="sm:hidden">Districts</span>
            </h2>
            <button className="text-xs sm:text-sm text-blue-600 hover:underline flex items-center gap-1">
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
          <div className="overflow-x-auto max-h-[300px] sm:max-h-[400px]">
            <table className="w-full min-w-[320px]">
              <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                <tr>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">#</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">District</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Score</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase hidden sm:table-cell">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {Object.entries(DISTRICT_DATA)
                  .sort((a, b) => a[1].rank - b[1].rank)
                  .map(([name, data]) => (
                    <tr
                      key={name}
                      onClick={() => setSelectedDistrict(name)}
                      className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        selectedDistrict === name ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-500">#{data.rank}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{name}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">
                        <span className={`text-xs sm:text-sm font-bold ${
                          data.satisfaction >= 2.3 ? 'text-green-600' :
                          data.satisfaction >= 1.8 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {data.satisfaction.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-center hidden sm:table-cell">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
                          data.category === 'excellent' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          data.category === 'good' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          data.category === 'average' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          data.category === 'poor' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {data.category}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              <span className="hidden sm:inline">Department Dissatisfaction</span>
              <span className="sm:hidden">Departments</span>
            </h2>
          </div>
          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
            {Object.entries(DEPARTMENT_DATA)
              .sort((a, b) => b[1].dissatisfaction - a[1].dissatisfaction)
              .slice(0, 8)
              .map(([name, data]) => (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate">{name}</span>
                    <span className={`text-xs sm:text-sm font-semibold flex-shrink-0 ${
                      data.dissatisfaction >= 60 ? 'text-red-600' :
                      data.dissatisfaction >= 45 ? 'text-orange-600' : 'text-yellow-600'
                    }`}>
                      {data.dissatisfaction.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                    <div
                      className={`h-1.5 sm:h-2 rounded-full transition-all ${
                        data.dissatisfaction >= 60 ? 'bg-red-500' :
                        data.dissatisfaction >= 45 ? 'bg-orange-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${data.dissatisfaction}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Pattern Detection & Policy Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            <span className="hidden sm:inline">AI-Detected Patterns & Recommendations</span>
            <span className="sm:hidden">AI Patterns</span>
          </h2>
          <span className="px-2 sm:px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-[10px] sm:text-xs font-semibold rounded-full">
            {patterns.length} Active
          </span>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {patterns.map((p) => (
            <div key={p.id} className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  p.type === 'CLUSTER' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  p.type === 'TREND' ? 'bg-orange-100 dark:bg-orange-900/30' :
                  'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {p.type === 'CLUSTER' && <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />}
                  {p.type === 'TREND' && <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />}
                  {p.type === 'LAPSE' && <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start sm:items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{p.title}</h3>
                    <span className={`px-2 py-0.5 text-[10px] sm:text-xs rounded-full ${
                      p.status === 'critical'
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                        : p.status === 'pending'
                        ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {p.status === 'critical' ? 'Critical' : p.status === 'pending' ? 'Pending' : 'In Progress'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <strong>{p.count.toLocaleString()}</strong> cases • {p.insight}
                  </p>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 sm:p-3">
                    <p className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                      Recommendation:
                    </p>
                    <p className="text-xs sm:text-sm text-green-700 dark:text-green-300">{p.recommendation}</p>
                    <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 mt-1">
                      Impact: {p.impact}
                    </p>
                  </div>
                  {/* Mobile action buttons */}
                  <div className="flex gap-2 mt-3 sm:hidden">
                    <button className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors">
                      Approve
                    </button>
                    <button className="flex-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg transition-colors">
                      Details
                    </button>
                  </div>
                </div>
                {/* Desktop action buttons */}
                <div className="hidden sm:flex flex-col gap-2 flex-shrink-0">
                  <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                    Approve
                  </button>
                  <button className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Natural Language Query */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-2xl shadow-lg p-4 sm:p-6 text-white">
        <h2 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          Ask Dhruva
        </h2>
        <p className="text-purple-100 mb-3 sm:mb-4 text-xs sm:text-base">Ask questions in natural language</p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input
            type="text"
            value={askDhruvaQuery}
            onChange={(e) => setAskDhruvaQuery(e.target.value)}
            placeholder="e.g., Which mandals have highest reopen rate?"
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-white/10 border border-white/20 placeholder-purple-200 text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-white/30"
            onKeyDown={(e) => e.key === 'Enter' && handleAskDhruva(askDhruvaQuery)}
          />
          <button
            onClick={() => handleAskDhruva(askDhruvaQuery)}
            className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-white text-purple-700 font-semibold rounded-xl hover:bg-purple-50 transition-colors text-sm sm:text-base"
          >
            Ask
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            'Lowest satisfaction?',
            'Top lapses?',
            'Dept categories?',
          ].map((suggestion, i) => (
            <button
              key={i}
              onClick={() => {
                setAskDhruvaQuery(suggestion);
                handleAskDhruva(suggestion);
              }}
              className="px-2 sm:px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-xs sm:text-sm transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Response */}
        {askDhruvaResponse && (
          <div className="mt-4 bg-white/10 rounded-xl p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-purple-100 whitespace-pre-line">
              {askDhruvaResponse}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
