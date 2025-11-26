import { ReactNode, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useRole, ViewMode } from '../contexts/RoleContext'
import { useTheme } from '../contexts/ThemeContext'
import {
  User, Briefcase, LineChart, Home, Sun, Moon, Monitor,
  Layers, SplitSquareVertical, Eye, Code, Settings, ChevronDown
} from 'lucide-react'

interface DemoLayoutProps {
  children: ReactNode
}

const roleConfig = {
  citizen: {
    title: 'Citizen View',
    titleTe: 'పౌరుడు',
    icon: User,
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600'
  },
  officer: {
    title: 'Officer View',
    titleTe: 'అధికారి',
    icon: Briefcase,
    color: 'green',
    gradient: 'from-green-500 to-green-600'
  },
  policymaker: {
    title: 'Policymaker View',
    titleTe: 'విధాన నిర్ణేత',
    icon: LineChart,
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600'
  }
}

export default function DemoLayout({ children }: DemoLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { role, setRole, viewMode, setViewMode, backendUrl } = useRole()
  const { theme, setTheme } = useTheme()
  const [showRoleMenu, setShowRoleMenu] = useState(false)
  const [showViewMenu, setShowViewMenu] = useState(false)

  const currentRole = role || 'citizen'
  const config = roleConfig[currentRole]
  const Icon = config.icon

  const handleRoleSwitch = (newRole: 'citizen' | 'officer' | 'policymaker') => {
    setRole(newRole)
    navigate(`/${newRole}`)
    setShowRoleMenu(false)
  }

  const viewModes: { id: ViewMode; label: string; icon: typeof Eye; description: string }[] = [
    { id: 'stakeholder', label: 'Stakeholder View', icon: Eye, description: 'What users see' },
    { id: 'backend', label: 'Backend View', icon: Code, description: 'ML Pipeline' },
    { id: 'split', label: 'Split View', icon: SplitSquareVertical, description: 'Both side by side' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Header Bar */}
      <header className={`bg-gradient-to-r ${config.gradient} text-white shadow-lg sticky top-0 z-50`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo & Home */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold">ధ్</span>
                </div>
                <span className="font-semibold hidden sm:block">Dhruva AI</span>
              </button>

              {/* Role Indicator & Switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{config.title}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showRoleMenu ? 'rotate-180' : ''}`} />
                </button>

                {showRoleMenu && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 px-2">Switch Role</p>
                    </div>
                    {Object.entries(roleConfig).map(([id, cfg]) => {
                      const RoleIcon = cfg.icon
                      return (
                        <button
                          key={id}
                          onClick={() => handleRoleSwitch(id as 'citizen' | 'officer' | 'policymaker')}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            id === currentRole ? 'bg-gray-100 dark:bg-gray-700' : ''
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cfg.gradient} flex items-center justify-center`}>
                            <RoleIcon className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-900 dark:text-white">{cfg.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-telugu">{cfg.titleTe}</p>
                          </div>
                          {id === currentRole && (
                            <div className="ml-auto w-2 h-2 bg-green-500 rounded-full" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* View Mode & Controls */}
            <div className="flex items-center gap-2">
              {/* View Mode Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowViewMenu(!showViewMenu)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Layers className="w-4 h-4" />
                  <span className="hidden sm:block text-sm">
                    {viewModes.find(v => v.id === viewMode)?.label}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showViewMenu ? 'rotate-180' : ''}`} />
                </button>

                {showViewMenu && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 px-2">View Mode</p>
                    </div>
                    {viewModes.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => { setViewMode(mode.id); setShowViewMenu(false) }}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          mode.id === viewMode ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                        }`}
                      >
                        <mode.icon className={`w-5 h-5 ${mode.id === viewMode ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />
                        <div className="text-left">
                          <p className={`font-medium ${mode.id === viewMode ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                            {mode.label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{mode.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-1.5 rounded ${theme === 'light' ? 'bg-white/20' : ''}`}
                  title="Light"
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-1.5 rounded ${theme === 'dark' ? 'bg-white/20' : ''}`}
                  title="Dark"
                >
                  <Moon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* View Mode Indicator Bar */}
      <div className={`text-center py-1 text-xs font-medium ${
        viewMode === 'stakeholder' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' :
        viewMode === 'backend' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200' :
        'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200'
      }`}>
        {viewMode === 'stakeholder' && '👁️ Stakeholder View - What users see in the app'}
        {viewMode === 'backend' && '⚙️ Backend View - ML Pipeline & Processing'}
        {viewMode === 'split' && '📊 Split View - Stakeholder (left) | Backend (right)'}
      </div>

      {/* Main Content Area */}
      <main className="flex-1">
        {viewMode === 'stakeholder' && (
          <div className="h-full">
            {children}
          </div>
        )}

        {viewMode === 'backend' && (
          <div className="h-[calc(100vh-120px)]">
            <iframe
              src={backendUrl}
              className="w-full h-full border-0"
              title="Backend ML Pipeline"
            />
          </div>
        )}

        {viewMode === 'split' && (
          <div className="flex h-[calc(100vh-120px)]">
            {/* Stakeholder View */}
            <div className="w-1/2 border-r border-gray-300 dark:border-gray-700 overflow-auto">
              <div className="sticky top-0 bg-blue-600 text-white text-xs py-1 px-3 font-medium z-10">
                👁️ STAKEHOLDER VIEW - What {config.title} sees
              </div>
              {children}
            </div>

            {/* Backend View */}
            <div className="w-1/2 overflow-auto">
              <div className="sticky top-0 bg-orange-600 text-white text-xs py-1 px-3 font-medium z-10">
                ⚙️ BACKEND - ML Pipeline Processing
              </div>
              <iframe
                src={backendUrl}
                className="w-full h-full border-0"
                title="Backend ML Pipeline"
              />
            </div>
          </div>
        )}
      </main>

      {/* Click outside to close menus */}
      {(showRoleMenu || showViewMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setShowRoleMenu(false); setShowViewMenu(false) }}
        />
      )}
    </div>
  )
}
