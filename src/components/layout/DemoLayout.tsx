import React, { useState } from 'react';
import { useDemo, ViewMode } from '../../contexts/DemoContext';
import { PipelineVisualization } from '../backend/PipelineVisualization';
import KnowledgeGraph from '../backend/KnowledgeGraph';
import SystemArchitecture from '../backend/SystemArchitecture';
import {
  User,
  Shield,
  BarChart3,
  ArrowLeft,
  Monitor,
  SplitSquareHorizontal,
  Moon,
  Sun,
  RotateCcw,
  GitBranch,
  Network,
  Workflow,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

type BackendView = 'architecture' | 'pipeline' | 'graph';

interface DemoLayoutProps {
  children: React.ReactNode;
}

const ROLE_CONFIG = {
  citizen: {
    icon: User,
    label: 'Citizen',
    telugu: 'పౌరుడు',
    color: 'bg-blue-600',
    description: 'Submit & track grievances'
  },
  officer: {
    icon: Shield,
    label: 'Officer',
    telugu: 'అధికారి',
    color: 'bg-green-600',
    description: 'Review & resolve cases'
  },
  policymaker: {
    icon: BarChart3,
    label: 'Policymaker',
    telugu: 'విధాన నిర్ణేత',
    color: 'bg-purple-600',
    description: 'Analyze patterns & insights'
  },
};

// Simplified: only stakeholder (full) and split (side-by-side with backend)
const VIEW_MODE_CONFIG: Record<'stakeholder' | 'split', { icon: typeof Monitor; label: string; description: string }> = {
  stakeholder: {
    icon: Monitor,
    label: 'App Only',
    description: 'What users see',
  },
  split: {
    icon: SplitSquareHorizontal,
    label: 'With Backend',
    description: 'App + Technical view',
  },
};

export function DemoLayout({ children }: DemoLayoutProps) {
  const { role, setRole, clearRole, viewMode, setViewMode, resetDemo, caseId, currentStep } = useDemo();
  const { theme, toggleTheme } = useTheme();
  const [backendView, setBackendView] = useState<BackendView>('architecture');

  const currentRoleConfig = role ? ROLE_CONFIG[role] : null;

  // Render the selected backend visualization
  const renderBackendView = () => {
    switch (backendView) {
      case 'architecture':
        return <SystemArchitecture />;
      case 'pipeline':
        return <PipelineVisualization />;
      case 'graph':
        return <KnowledgeGraph />;
      default:
        return <SystemArchitecture />;
    }
  };

  // Progress steps
  const progressSteps = [
    { id: 1, label: 'Submit', active: currentStep >= 1 },
    { id: 2, label: 'Clarify', active: currentStep >= 1 && currentStep < 2 },
    { id: 3, label: 'Review', active: currentStep >= 2 && currentStep < 4 },
    { id: 4, label: 'Done', active: currentStep >= 4 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side: Logo + Back button */}
            <div className="flex items-center gap-4">
              {role ? (
                <button
                  onClick={clearRole}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm font-medium hidden sm:inline">Back to Roles</span>
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                    <span className="text-white font-bold text-lg font-telugu">ధ్</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">DHRUVA</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered Grievance System</p>
                  </div>
                </div>
              )}

              {/* Current role badge */}
              {currentRoleConfig && (
                <div className={`${currentRoleConfig.color} text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-2`}>
                  <currentRoleConfig.icon className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-medium">{currentRoleConfig.label}</span>
                  <span className="text-xs sm:text-sm opacity-75 font-telugu hidden sm:inline">({currentRoleConfig.telugu})</span>
                </div>
              )}

              {/* Case ID if active */}
              {caseId && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Case:</span>
                  <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">{caseId}</span>
                </div>
              )}
            </div>

            {/* Center: Progress stepper (only when role selected) */}
            {role && (
              <div className="hidden lg:flex items-center gap-2">
                {progressSteps.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      step.active && currentStep === step.id
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : step.active && currentStep > step.id
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {step.label}
                    </div>
                    {index < progressSteps.length - 1 && (
                      <div className={`w-4 h-0.5 ${
                        currentStep > step.id ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Right side: View mode + Theme + Reset */}
            <div className="flex items-center gap-2">
              {/* Simplified view mode toggle: App Only vs With Backend */}
              {role && (
                <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  {(['stakeholder', 'split'] as const).map((mode) => {
                    const config = VIEW_MODE_CONFIG[mode];
                    return (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          viewMode === mode || (viewMode === 'technical' && mode === 'split')
                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                        title={config.description}
                      >
                        <config.icon className="w-4 h-4" />
                        <span className="hidden xl:inline">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Reset button */}
              {role && (
                <button
                  onClick={resetDemo}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Reset Demo"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              )}

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Role switcher dropdown (when role selected) */}
              {role && (
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Switch Role</span>
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    {(Object.keys(ROLE_CONFIG) as (keyof typeof ROLE_CONFIG)[]).map((r) => {
                      const config = ROLE_CONFIG[r];
                      return (
                        <button
                          key={r}
                          onClick={() => {
                            resetDemo();
                            setRole(r);
                          }}
                          className={`w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${
                            role === r ? 'bg-gray-50 dark:bg-gray-700' : ''
                          }`}
                        >
                          <config.icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">{config.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content - simplified to stakeholder-only or split view */}
      {/* On mobile (< md), always show stakeholder view regardless of viewMode */}
      <main className="flex-1 flex overflow-hidden">
        {/* Mobile view - always stakeholder only */}
        <div className="md:hidden flex-1 overflow-auto">
          <div className="p-4">
            {children}
          </div>
        </div>

        {/* Desktop view - respects viewMode */}
        <div className="hidden md:flex flex-1">
          {(viewMode === 'split' || viewMode === 'technical') ? (
            <>
              {/* Stakeholder view (left) */}
              <div className="w-1/2 overflow-auto border-r border-gray-200 dark:border-gray-700">
                <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 text-sm text-blue-700 dark:text-blue-300 font-medium border-b border-blue-100 dark:border-blue-900/30 flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  What stakeholders see
                </div>
                <div className="p-4">
                  {children}
                </div>
              </div>
              {/* Technical view (right) - with 3 visualization tabs */}
              <div className="w-1/2 overflow-hidden flex flex-col bg-gray-900">
                <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
                  <span className="text-sm text-gray-300 font-medium">
                    Backend Visualization
                  </span>
                  <div className="flex items-center bg-gray-700 rounded-lg p-0.5">
                    <button
                      onClick={() => setBackendView('architecture')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        backendView === 'architecture'
                          ? 'bg-gray-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Workflow className="w-3.5 h-3.5" />
                      Architecture
                    </button>
                    <button
                      onClick={() => setBackendView('pipeline')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        backendView === 'pipeline'
                          ? 'bg-gray-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      Steps
                    </button>
                    <button
                      onClick={() => setBackendView('graph')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        backendView === 'graph'
                          ? 'bg-gray-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Network className="w-3.5 h-3.5" />
                      Graph
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden p-3">
                  {renderBackendView()}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-auto">
              <div className="max-w-6xl mx-auto p-4 lg:p-6">
                {children}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-2 px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1 text-xs text-gray-500 dark:text-gray-400">
          <span className="text-center sm:text-left">Dhruva AI Demo</span>
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hidden sm:inline">Models: 4 active</span>
            <span className="text-green-500">Healthy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default DemoLayout;
