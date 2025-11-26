import React, { useState, useEffect } from 'react';
import { useDemo } from '../../contexts/DemoContext';
import { Grievance, ALL_DEPARTMENTS } from '../../data/mockGrievances';
import {
  AlertTriangle, Clock, CheckCircle, User, MapPin,
  FileText, ChevronRight, Zap, X,
  AlertCircle, Send, RefreshCw, Star, ArrowRight, Search
} from 'lucide-react';

const distressColors = {
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-300',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300',
  NORMAL: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-300',
};

const distressIcons = {
  CRITICAL: AlertTriangle,
  HIGH: AlertCircle,
  MEDIUM: Clock,
  NORMAL: CheckCircle,
};

export default function OfficerPage() {
  const { grievanceQueue, resolveCase, trackedCaseId, pipelineResult } = useDemo();
  const [selectedCase, setSelectedCase] = useState<Grievance | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [reassignDept, setReassignDept] = useState('');
  const [reassignSearch, setReassignSearch] = useState('');
  const [reassignNote, setReassignNote] = useState('');
  const [reassignSuccess, setReassignSuccess] = useState<string | null>(null);

  // Get top-3 departments for the selected case (simulated based on confidence)
  const getTop3Departments = (caseItem: Grievance) => {
    // If we have pipeline result for this case, use its top3
    if (pipelineResult && pipelineResult.caseId === caseItem.id) {
      return pipelineResult.classification.top3;
    }
    // Otherwise simulate based on the department
    const mainDept = caseItem.department;
    const confidence = caseItem.confidence;
    // Generate 2 alternative departments
    const alternatives = ALL_DEPARTMENTS.filter(d => d !== mainDept).slice(0, 2);
    return [
      { department: mainDept, confidence },
      { department: alternatives[0], confidence: confidence - 0.15 - Math.random() * 0.1 },
      { department: alternatives[1], confidence: confidence - 0.25 - Math.random() * 0.1 },
    ];
  };

  // Filter departments for reassignment search
  const filteredDepartments = ALL_DEPARTMENTS.filter(d =>
    d.toLowerCase().includes(reassignSearch.toLowerCase())
  );

  // Use grievanceQueue from context directly (includes submitted grievances)
  // Sort by distress level (CRITICAL first) then by SLA
  const sortedGrievances = [...grievanceQueue].sort((a, b) => {
    const distressOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, NORMAL: 3 };
    const aOrder = distressOrder[a.distressLevel];
    const bOrder = distressOrder[b.distressLevel];
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.slaHours - b.slaHours;
  });

  const stats = {
    critical: sortedGrievances.filter(g => g.distressLevel === 'CRITICAL').length,
    pending: sortedGrievances.filter(g => g.status === 'pending').length,
    inProgress: sortedGrievances.filter(g => g.status === 'in_progress').length,
    resolved: sortedGrievances.filter(g => g.status === 'resolved').length,
  };

  // Auto-select tracked case when switching to Officer view
  useEffect(() => {
    if (trackedCaseId && !selectedCase) {
      const trackedCase = sortedGrievances.find(g => g.id === trackedCaseId);
      if (trackedCase) {
        setSelectedCase(trackedCase);
      }
    }
  }, [trackedCaseId, sortedGrievances, selectedCase]);

  const handleResolve = () => {
    if (!selectedCase) return;
    resolveCase(selectedCase.id, resolutionNote);
    setShowResolveModal(false);
    setResolutionNote('');
    setSelectedCase(null);
  };

  const handleReassign = (newDept: string, fromQuickAssign = false) => {
    if (!selectedCase) return;
    // In a real app, this would update the backend
    console.log(`Reassigning ${selectedCase.id} to ${newDept}: ${reassignNote}`);
    setShowReassignModal(false);
    setReassignDept('');
    setReassignSearch('');
    setReassignNote('');
    // Show success message inline
    setReassignSuccess(newDept);
    // Auto-hide after 3 seconds
    setTimeout(() => setReassignSuccess(null), 3000);
  };

  // Check if a case is the tracked demo case
  const isTrackedCase = (id: string) => id === trackedCaseId;

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.critical}</p>
              <p className="text-xs sm:text-sm text-gray-500">Critical</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
              <p className="text-xs sm:text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</p>
              <p className="text-xs sm:text-sm text-gray-500">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.resolved}</p>
              <p className="text-xs sm:text-sm text-gray-500">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tracked Case Notification */}
      {trackedCaseId && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            <Star className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200 text-sm sm:text-base">
                Tracking: {trackedCaseId}
              </p>
              <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">
                Highlighted in queue
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const trackedCase = sortedGrievances.find(g => g.id === trackedCaseId);
              if (trackedCase) setSelectedCase(trackedCase);
            }}
            className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            View Case
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Queue List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                Smart Prioritized Queue
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">Sorted by distress level + SLA deadline</p>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[350px] sm:max-h-[450px] lg:max-h-[600px] overflow-y-auto">
              {sortedGrievances.map((g) => {
                const DistressIcon = distressIcons[g.distressLevel];
                const isTracked = isTrackedCase(g.id);
                const isResolved = g.status === 'resolved';
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedCase(g)}
                    className={`w-full p-3 sm:p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors relative ${
                      selectedCase?.id === g.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    } ${isTracked ? 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-l-yellow-500' : ''}
                    ${isResolved ? 'opacity-60' : ''}`}
                  >
                    {isTracked && (
                      <div className="absolute top-2 right-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      </div>
                    )}
                    <div className="flex items-start gap-2 sm:gap-4">
                      <div className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold border ${distressColors[g.distressLevel]}`}>
                        <DistressIcon className="w-3 h-3 inline mr-0.5 sm:mr-1" />
                        <span className="hidden sm:inline">{g.distressLevel}</span>
                        <span className="sm:hidden">{g.distressLevel.substring(0, 4)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate flex items-center gap-1 sm:gap-2">
                            <span className="truncate">{g.department}</span>
                            {isResolved && (
                              <span className="text-[10px] sm:text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                                Done
                              </span>
                            )}
                            {isTracked && (
                              <span className="text-[10px] sm:text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                                Yours
                              </span>
                            )}
                          </p>
                          <span className="text-[10px] sm:text-xs text-gray-500 flex-shrink-0">
                            {new Date(g.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate font-telugu mb-1 sm:mb-2">
                          {g.textTelugu || g.text}
                        </p>
                        <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs">
                          <span className="text-gray-500">
                            <Clock className="w-3 h-3 inline mr-0.5" />
                            {g.slaHours}h
                          </span>
                          <span className="text-gray-500 hidden sm:inline">
                            Conf: {(g.confidence * 100).toFixed(0)}%
                          </span>
                          {g.lapseRisk > 0.5 && (
                            <span className="text-red-600 dark:text-red-400">
                              <AlertTriangle className="w-3 h-3 inline mr-0.5" />
                              Risk
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Case Detail Panel */}
        <div>
          {selectedCase ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-3 sm:p-4 lg:sticky lg:top-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold border inline-flex items-center gap-1 ${distressColors[selectedCase.distressLevel]}`}>
                    {selectedCase.distressLevel}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                    {selectedCase.id}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedCase.department}</p>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Citizen Info */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900 dark:text-white">{selectedCase.citizenName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">{selectedCase.mandal}, {selectedCase.district}</span>
                </div>
              </div>

              {/* Issue Description */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue:</p>
                <p className="text-gray-900 dark:text-white font-telugu">{selectedCase.textTelugu || selectedCase.text}</p>
                {selectedCase.textTelugu && (
                  <p className="text-sm text-gray-500 mt-1">{selectedCase.text}</p>
                )}
              </div>

              {/* AI Analysis */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-gray-500">Confidence</p>
                  <p className="font-bold text-blue-600 dark:text-blue-400">{(selectedCase.confidence * 100).toFixed(0)}%</p>
                </div>
                <div className={`text-center p-2 rounded-lg ${
                  selectedCase.lapseRisk > 0.6 ? 'bg-red-50 dark:bg-red-900/20' :
                  selectedCase.lapseRisk > 0.3 ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                  'bg-green-50 dark:bg-green-900/20'
                }`}>
                  <p className="text-xs text-gray-500">Lapse Risk</p>
                  <p className="font-bold">{(selectedCase.lapseRisk * 100).toFixed(0)}%</p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-xs text-gray-500">SLA</p>
                  <p className="font-bold">{selectedCase.slaHours}h</p>
                </div>
              </div>

              {/* Distress Signals */}
              {selectedCase.distressSignals && selectedCase.distressSignals.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <AlertTriangle className="w-4 h-4 inline mr-1 text-red-500" />
                    Distress Signals:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCase.distressSignals.map((signal, idx) => (
                      <span key={idx} className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs rounded-full font-telugu">
                        {signal}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reassign Success Message */}
              {reassignSuccess && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Case reassigned to {reassignSuccess}
                  </p>
                </div>
              )}

              {/* Similar Cases */}
              {selectedCase.similarCases && selectedCase.similarCases.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Similar Resolved Cases:
                  </p>
                  <div className="space-y-2">
                    {selectedCase.similarCases.map((sc, idx) => (
                      <div key={idx} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-gray-500">{sc.id}</span>
                          <span className="text-xs text-green-600 dark:text-green-400">{(sc.similarity * 100).toFixed(0)}% match</span>
                        </div>
                        <p className="text-sm text-gray-800 dark:text-gray-200">{sc.resolution}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lapse Risk Warning */}
              {selectedCase.lapseRisk > 0.5 && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    High Lapse Risk Warning
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    Based on historical patterns, ensure direct contact with citizen and proper documentation.
                  </p>
                </div>
              )}

              {/* Top 3 Department Predictions */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-500" />
                  AI Department Classification
                </p>
                <div className="space-y-2">
                  {getTop3Departments(selectedCase).map((dept, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-2 rounded-lg ${
                        idx === 0
                          ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
                          : 'bg-gray-50 dark:bg-gray-700/50'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          idx === 0 ? 'text-purple-800 dark:text-purple-200' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {dept.department}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                idx === 0 ? 'bg-purple-600' : 'bg-gray-400 dark:bg-gray-500'
                              }`}
                              style={{ width: `${Math.max(0, dept.confidence * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-10">
                            {(dept.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      {idx > 0 && (
                        <button
                          onClick={() => handleReassign(dept.department)}
                          className="text-xs bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg transition-colors"
                        >
                          Assign
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowReassignModal(true)}
                  className="mt-2 w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Reassign to Other Department
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowResolveModal(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Resolved
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">Select a case to view details</p>
              <p className="text-xs text-gray-400">Click on any case from the queue</p>
            </div>
          )}
        </div>
      </div>

      {/* Resolve Modal */}
      {showResolveModal && selectedCase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Resolve Case {selectedCase.id}
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Resolution Note
              </label>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe how the issue was resolved..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowResolveModal(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-2.5 px-4 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" />
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reassign Modal */}
      {showReassignModal && selectedCase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Reassign Case
              </h3>
              <button
                onClick={() => {
                  setShowReassignModal(false);
                  setReassignSearch('');
                  setReassignDept('');
                  setReassignNote('');
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Reassigning <span className="font-mono font-medium">{selectedCase.id}</span> from{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">{selectedCase.department}</span>
            </p>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={reassignSearch}
                onChange={(e) => setReassignSearch(e.target.value)}
                placeholder="Search departments..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Department List */}
            <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-xl mb-4">
              {filteredDepartments.length > 0 ? (
                filteredDepartments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setReassignDept(dept)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b last:border-b-0 border-gray-100 dark:border-gray-700 ${
                      reassignDept === dept
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300'
                    } ${dept === selectedCase.department ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={dept === selectedCase.department}
                  >
                    <span className="flex items-center justify-between">
                      {dept}
                      {dept === selectedCase.department && (
                        <span className="text-xs text-gray-400">(current)</span>
                      )}
                      {reassignDept === dept && (
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      )}
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4 text-sm">No departments found</p>
              )}
            </div>

            {/* Note Input */}
            {reassignDept && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Reassignment (optional)
                </label>
                <input
                  type="text"
                  value={reassignNote}
                  onChange={(e) => setReassignNote(e.target.value)}
                  placeholder="e.g., Survey issue, not revenue"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReassignModal(false);
                  setReassignSearch('');
                  setReassignDept('');
                  setReassignNote('');
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-2.5 px-4 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => reassignDept && handleReassign(reassignDept)}
                disabled={!reassignDept}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                Reassign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
