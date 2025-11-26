import React from 'react';
import { useDemo } from '../contexts/DemoContext';
import { useTheme } from '../contexts/ThemeContext';
import { User, Shield, BarChart3, Moon, Sun, ChevronRight, AlertCircle, TrendingUp, Users, Zap, Wifi, WifiOff, Server } from 'lucide-react';
import { HEADLINE_STATS, QUOTABLE_STATS, ML_MODELS } from '../data/statistics';

const ROLE_CARDS = [
  {
    id: 'citizen' as const,
    icon: User,
    title: 'Citizen',
    telugu: 'పౌరుడు',
    subtitle: 'Submit & Track Grievances',
    description: 'File complaints in Telugu or English. Track status with case ID. Get empathy-driven responses.',
    color: 'from-blue-500 to-blue-700',
    hoverColor: 'hover:from-blue-600 hover:to-blue-800',
    features: ['Bilingual support', 'Voice & text input', 'Real-time tracking'],
  },
  {
    id: 'officer' as const,
    icon: Shield,
    title: 'Officer',
    telugu: 'అధికారి',
    subtitle: 'Review & Resolve Cases',
    description: 'Smart prioritized queue. AI-suggested resolutions. Lapse risk alerts.',
    color: 'from-green-500 to-green-700',
    hoverColor: 'hover:from-green-600 hover:to-green-800',
    features: ['Priority queue', 'Similar case matching', 'One-click templates'],
  },
  {
    id: 'policymaker' as const,
    icon: BarChart3,
    title: 'Policymaker',
    telugu: 'విధాన నిర్ణేత',
    subtitle: 'Analyze & Improve',
    description: 'District comparisons. Pattern detection. AI-driven policy recommendations.',
    color: 'from-purple-500 to-purple-700',
    hoverColor: 'hover:from-purple-600 hover:to-purple-800',
    features: ['District analytics', 'Pattern detection', 'AI insights'],
  },
];

const QUICK_STATS = [
  { value: `${HEADLINE_STATS.dissatisfaction2018}%`, label: 'Dissatisfaction in 2018', icon: AlertCircle, color: 'text-red-500' },
  { value: `${(HEADLINE_STATS.feedbackCallsAnalyzed / 1000).toFixed(0)}K`, label: 'Feedback Calls Analyzed', icon: Users, color: 'text-blue-500' },
  { value: `${HEADLINE_STATS.varianceBestWorst}%`, label: 'District Variance', icon: TrendingUp, color: 'text-purple-500' },
];

export default function LandingPage() {
  const { setRole, backendAvailable, backendError } = useDemo();
  const { theme, toggleTheme } = useTheme();

  const handleRoleSelect = (roleId: 'citizen' | 'officer' | 'policymaker') => {
    setRole(roleId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Backend Status Indicator - floating */}
      <div className="fixed top-4 left-4 z-50">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg ${
          backendAvailable
            ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
            : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
        }`}>
          {backendAvailable ? (
            <>
              <Server className="w-4 h-4" />
              <span className="text-xs font-medium">Real ML</span>
              <Wifi className="w-3 h-3" />
            </>
          ) : (
            <>
              <Server className="w-4 h-4" />
              <span className="text-xs font-medium">Simulation</span>
              <WifiOff className="w-3 h-3" />
            </>
          )}
        </div>
        {backendError && !backendAvailable && (
          <div className="mt-1 text-[10px] text-yellow-600 dark:text-yellow-400 max-w-[150px] truncate">
            Backend starting...
          </div>
        )}
      </div>

      {/* Theme toggle - floating */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all z-50"
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
      </button>

      {/* Hero section */}
      <div className="pt-16 pb-12 px-4 text-center">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 mb-6 shadow-2xl transform hover:scale-105 transition-transform">
          <span className="text-white font-bold text-5xl font-telugu">ధ్</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-3">
          DHRUVA
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-2 font-telugu px-4">
          ధ్రువ - ధృవతారం వలె స్థిరమైన, నమ్మదగిన
        </p>
        <p className="text-sm sm:text-base md:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto px-4">
          AI-Powered Grievance Redressal for Andhra Pradesh
        </p>

        {/* Tagline */}
        <div className="mt-6 inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full mx-4">
          <span className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm text-center">
            A Source of Truth for Government • A Companion for Citizens • A North Star for Policy
          </span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="max-w-4xl mx-auto px-4 mb-8 sm:mb-12">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {QUICK_STATS.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-2 sm:p-4 text-center shadow-sm hover:shadow-md transition-shadow">
              <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 ${stat.color}`} />
              <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 leading-tight">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Role selection */}
      <div className="max-w-6xl mx-auto px-4 pb-8 sm:pb-12">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Select Your Role
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">
          Experience Dhruva from different perspectives
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {ROLE_CARDS.map((card) => (
            <button
              key={card.id}
              onClick={() => handleRoleSelect(card.id)}
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-left"
            >
              {/* Gradient header */}
              <div className={`h-32 bg-gradient-to-br ${card.color} p-6 transition-all duration-300`}>
                <card.icon className="w-12 h-12 text-white/90 mb-2" />
                <h3 className="text-2xl font-bold text-white">{card.title}</h3>
                <p className="text-white/80 font-telugu">{card.telugu}</p>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {card.subtitle}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {card.description}
                </p>

                {/* Features */}
                <div className="space-y-2 mb-4">
                  {card.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${card.color}`} />
                      {feature}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:gap-3 transition-all">
                  Enter as {card.title}
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ML Models Status */}
      <div className="max-w-4xl mx-auto px-4 pb-8 sm:pb-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">ML Models Active</h3>
            <span className="ml-auto px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] sm:text-xs rounded-full">
              All Healthy
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            {Object.values(ML_MODELS).map((model, i) => (
              <div key={i} className="text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  {model.accuracy}%
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 leading-tight">
                  {model.name.replace('Classifier', '').replace('Predictor', '')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quotable stats */}
      <div className="bg-gray-900 py-6 overflow-hidden">
        <div className="flex gap-12 animate-marquee">
          {[...QUOTABLE_STATS, ...QUOTABLE_STATS].map((stat, i) => (
            <div key={i} className="flex-shrink-0 flex items-center gap-3 whitespace-nowrap">
              <span className="text-2xl font-bold text-blue-400">{stat.stat}</span>
              <span className="text-gray-400 text-sm">{stat.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>Dhruva AI - Government Hackathon 2025</p>
        <p className="mt-1">Antifragile AI for Governance</p>
      </div>
    </div>
  );
}
