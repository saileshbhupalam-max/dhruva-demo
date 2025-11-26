import React, { useState } from 'react';
import { useDemo } from '../../contexts/DemoContext';
import { EXAMPLE_GRIEVANCES, getSmartClarificationQuestions, CLARIFYING_QUESTIONS } from '../../data/mockGrievances';
import {
  Send, CheckCircle, Loader2,
  HelpCircle, ArrowRight, Eye
} from 'lucide-react';

export default function CitizenPage() {
  const {
    processGrievance,
    pipelineResult,
    isProcessing,
    caseId,
    needsClarification,
    clarificationAnswered,
    setClarificationAnswered,
    addAuditEntry,
    resetDemo,
    setRole,
    trackedCaseId,
  } = useDemo();

  const [grievanceText, setGrievanceText] = useState('');

  const handleSubmit = async () => {
    if (grievanceText.trim().length < 10) return;
    await processGrievance(grievanceText);
  };

  const handleExampleClick = (example: typeof EXAMPLE_GRIEVANCES[0]) => {
    setGrievanceText(example.text);
  };

  const handleClarificationAnswer = (question: string, targetDept: string, boost: number) => {
    setClarificationAnswered(true);
    addAuditEntry({
      action: 'CLARIFIED',
      actor: 'Citizen',
      icon: '💬',
      details: `Answered: "${question}" - Routed to ${targetDept}`,
    });
  };

  const handleSkipClarification = () => {
    setClarificationAnswered(true);
    addAuditEntry({
      action: 'SKIPPED_CLARIFICATION',
      actor: 'Citizen',
      icon: '⏭️',
      details: 'Citizen skipped clarification, proceeding with AI classification',
    });
  };

  // Phase 1: Submission form
  if (!pipelineResult) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Submit Your Grievance
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-telugu px-2">
            మీ ఫిర్యాదును సమర్పించండి - తెలుగు లేదా ఆంగ్లంలో టైప్ చేయండి
          </p>
        </div>

        {/* Main form card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6">
          <textarea
            value={grievanceText}
            onChange={(e) => setGrievanceText(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-telugu"
            placeholder="Describe your problem here... / మీ సమస్యను ఇక్కడ వివరించండి..."
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-3">
            <span className="text-xs sm:text-sm text-gray-500">
              {grievanceText.length} characters {grievanceText.length < 10 && grievanceText.length > 0 && '(min 10)'}
            </span>
            <button
              onClick={handleSubmit}
              disabled={grievanceText.trim().length < 10 || isProcessing}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-colors"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Grievance
                </>
              )}
            </button>
          </div>
        </div>

        {/* Example grievances */}
        <div>
          <h3 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Try an example:
          </h3>
          <div className="grid gap-2 sm:gap-3">
            {EXAMPLE_GRIEVANCES.slice(0, 4).map((example, i) => (
              <button
                key={i}
                onClick={() => handleExampleClick(example)}
                className="text-left p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium mb-1">
                      {example.text}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-telugu">
                      {example.telugu}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded text-[10px] sm:text-xs font-medium flex-shrink-0 ${
                    example.expectedDistress === 'CRITICAL' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    example.expectedDistress === 'HIGH' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {example.expectedDistress}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                  <span>Expected: {example.department}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Phase 2: Clarification needed
  if (needsClarification && !clarificationAnswered) {
    const dept = pipelineResult.classification.department;
    const top3 = pipelineResult.classification.top3;

    // Try smart questions first, fallback to legacy format
    const smartQuestions = getSmartClarificationQuestions(grievanceText, top3);
    const legacyQuestions = CLARIFYING_QUESTIONS[dept] || CLARIFYING_QUESTIONS['default'];

    return (
      <div className="space-y-6">
        {/* Success banner */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-semibold text-green-800 dark:text-green-200">
                Grievance Submitted
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Case ID: <span className="font-mono font-bold">{caseId}</span>
              </p>
            </div>
          </div>
        </div>

        {/* AI Classification result */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Department</p>
              <p className="font-bold text-gray-900 dark:text-white">{pipelineResult.classification.department}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">{(pipelineResult.classification.confidence * 100).toFixed(0)}% confident</p>
            </div>
            <div className={`text-center p-4 rounded-lg ${
              pipelineResult.sentiment.distressLevel === 'CRITICAL' ? 'bg-red-50 dark:bg-red-900/20' :
              pipelineResult.sentiment.distressLevel === 'HIGH' ? 'bg-orange-50 dark:bg-orange-900/20' :
              'bg-yellow-50 dark:bg-yellow-900/20'
            }`}>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Distress</p>
              <p className="font-bold text-gray-900 dark:text-white">{pipelineResult.sentiment.distressLevel}</p>
            </div>
            <div className={`text-center p-4 rounded-lg ${
              pipelineResult.lapseRisk.level === 'HIGH' ? 'bg-red-50 dark:bg-red-900/20' :
              pipelineResult.lapseRisk.level === 'MEDIUM' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
              'bg-green-50 dark:bg-green-900/20'
            }`}>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Lapse Risk</p>
              <p className="font-bold text-gray-900 dark:text-white">{pipelineResult.lapseRisk.level}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">SLA</p>
              <p className="font-bold text-gray-900 dark:text-white">{pipelineResult.sla.hours}h</p>
            </div>
          </div>

          {/* Clarification section */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div className="flex items-start gap-3 mb-4">
              <HelpCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-amber-800 dark:text-amber-200">
                  Help us understand better
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  AI confidence is {(pipelineResult.classification.confidence * 100).toFixed(0)}%.
                  {smartQuestions.length > 0
                    ? ' We detected some ambiguity - please help us route accurately.'
                    : ' Answering a question helps improve routing accuracy.'}
                </p>
              </div>
            </div>

            {/* Smart questions with options */}
            {smartQuestions.length > 0 ? (
              <div className="space-y-4">
                {smartQuestions.map((sq, i) => (
                  <div key={i} className="space-y-2">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {sq.question}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-telugu mb-2">
                      {sq.telugu}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {sq.options.map((opt, j) => (
                        <button
                          key={j}
                          onClick={() => handleClarificationAnswer(opt.label, opt.targetDept, opt.boost)}
                          className="text-left p-3 bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-700 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors"
                        >
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {opt.label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-telugu">
                            {opt.telugu}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {legacyQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleClarificationAnswer(q.question, q.targetDept || dept, q.boost)}
                    className="w-full text-left p-3 bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-700 hover:border-amber-500 transition-colors"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">
                      {q.question}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-telugu">
                      {q.telugu}
                    </p>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleSkipClarification}
              className="mt-4 w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white py-2"
            >
              Skip - proceed with current classification
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Phase 3: Submission complete
  return (
    <div className="space-y-6">
      {/* Success card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Grievance Submitted Successfully!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 font-telugu mb-4">
          మీ ఫిర్యాదు విజయవంతంగా నమోదు చేయబడింది
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Case ID</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
            {caseId}
          </p>
        </div>

        {/* Classification details */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-left">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Assigned to</p>
            <p className="font-bold text-gray-900 dark:text-white">{pipelineResult.classification.department}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Expected Response</p>
            <p className="font-bold text-gray-900 dark:text-white">{pipelineResult.sla.hours} hours</p>
          </div>
        </div>

        {/* Response message */}
        <div className={`rounded-xl p-4 mb-6 text-left ${
          pipelineResult.sentiment.distressLevel === 'CRITICAL' ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500' :
          pipelineResult.sentiment.distressLevel === 'HIGH' ? 'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500' :
          'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500'
        }`}>
          <p className="text-gray-800 dark:text-gray-200 mb-2">
            {pipelineResult.responseTemplate.english.replace('{caseId}', caseId || '')}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-telugu">
            {pipelineResult.responseTemplate.telugu.replace('{caseId}', caseId || '')}
          </p>
        </div>

        {/* Next steps */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6 text-left">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3">What happens next:</h3>
          <div className="space-y-2">
            {[
              'AI has analyzed and classified your grievance',
              'Assigned to ' + pipelineResult.classification.department,
              'Officer will review within ' + pipelineResult.sla.hours + ' hours',
              'You will receive updates via WhatsApp',
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                {step}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {/* Track in Officer View - prominent for demo */}
          {trackedCaseId && (
            <button
              onClick={() => setRole('officer')}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 sm:px-6 rounded-xl transition-colors text-sm sm:text-base"
            >
              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              Track This Case in Officer View
            </button>
          )}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={resetDemo}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 sm:px-6 rounded-xl transition-colors text-sm sm:text-base"
            >
              Submit Another
            </button>
            <button
              onClick={() => setRole('policymaker')}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 sm:px-6 rounded-xl transition-colors text-sm sm:text-base"
            >
              View Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Similar cases hint */}
      {pipelineResult.similarCases.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            Similar cases resolved recently:
          </h3>
          <div className="space-y-2">
            {pipelineResult.similarCases.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{c.resolution}</p>
                  <p className="text-xs text-gray-500">Case {c.id}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                  {(c.similarity * 100).toFixed(0)}% match
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
