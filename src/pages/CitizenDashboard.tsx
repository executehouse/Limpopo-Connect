/**
 * Citizen Dashboard
 * 
 * Main dashboard for citizens with community features and quick actions
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../lib/AuthProvider'
import { 
  MessageCircle, 
  Users, 
  AlertTriangle, 
  Calendar, 
  MapPin, 

  Bell,
  Plus
} from 'lucide-react'

interface QuickStat {
  label: string
  value: string | number
  change?: string
  icon: React.ReactNode
  color: string
}

interface RecentActivity {
  id: string
  type: 'message' | 'connection' | 'event' | 'report'
  title: string
  description: string
  timestamp: string
  href?: string
}

export default function CitizenDashboard() {
  const { profile } = useAuthContext()
  const [stats, setStats] = useState<QuickStat[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Mock data - replace with actual API calls
      setStats([
        {
          label: 'My Connections',
          value: 24,
          change: '+3 this week',
          icon: <Users className="h-5 w-5" />,
          color: 'bg-blue-500'
        },
        {
          label: 'Chat Rooms',
          value: 8,
          change: '+2 new',
          icon: <MessageCircle className="h-5 w-5" />,
          color: 'bg-green-500'
        },
        {
          label: 'My Reports',
          value: 5,
          change: '2 resolved',
          icon: <AlertTriangle className="h-5 w-5" />,
          color: 'bg-yellow-500'
        },
        {
          label: 'Events Attending',
          value: 3,
          change: 'Next: Tomorrow',
          icon: <Calendar className="h-5 w-5" />,
          color: 'bg-purple-500'
        }
      ])

      setRecentActivity([
        {
          id: '1',
          type: 'message',
          title: 'New message in Polokwane Community',
          description: 'John shared an update about the local market',
          timestamp: '2 hours ago',
          href: '/chat-demo'
        },
        {
          id: '2',
          type: 'connection',
          title: 'New connection request',
          description: 'Sarah from Tzaneen wants to connect',
          timestamp: '4 hours ago',
          href: '/connections'
        },
        {
          id: '3',
          type: 'event',
          title: 'Community Meeting Tomorrow',
          description: 'Monthly community meeting at the town hall',
          timestamp: '1 day ago',
          href: '/events'
        }
      ])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      name: 'Create Report',
      description: 'Report an issue in your community',
      href: '/reports/new',
      icon: AlertTriangle,
      color: 'bg-red-500 hover:bg-red-600'
    },
    {
      name: 'Join Chat Room',
      description: 'Connect with your community',
      href: '/chat-demo',
      icon: MessageCircle,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: 'Find Events',
      description: 'Discover local events',
      href: '/events',
      icon: Calendar,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      name: 'Explore Area',
      description: 'Discover local businesses and attractions',
      href: '/explore',
      icon: MapPin,
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-limpopo-green"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {profile?.first_name || 'Citizen'}!
              </h1>
              <p className="text-gray-600">
                Stay connected with your Limpopo community
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <Bell className="h-5 w-5 text-gray-600" />
              </button>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Citizen
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-md ${stat.color} text-white`}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.label}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stat.value}
                      </dd>
                      {stat.change && (
                        <dd className="text-sm text-gray-500">
                          {stat.change}
                        </dd>
                      )}
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quickActions.map((action) => {
                    const Icon = action.icon
                    return (
                      <Link
                        key={action.name}
                        to={action.href}
                        className={`group relative rounded-lg p-6 ${action.color} text-white hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg`}
                      >
                        <div>
                          <span className="rounded-lg inline-flex p-3 bg-white bg-opacity-20">
                            <Icon className="h-6 w-6" />
                          </span>
                        </div>
                        <div className="mt-8">
                          <h3 className="text-lg font-medium">
                            <span className="absolute inset-0" aria-hidden="true" />
                            {action.name}
                          </h3>
                          <p className="mt-2 text-sm text-white text-opacity-90">
                            {action.description}
                          </p>
                        </div>
                        <span className="pointer-events-none absolute top-6 right-6 text-white group-hover:text-opacity-80">
                          <Plus className="h-5 w-5" />
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Community Feed Preview */}
            <div className="bg-white shadow rounded-lg mt-6">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Community Updates
                  </h3>
                  <Link 
                    to="/news"
                    className="text-sm font-medium text-limpopo-green hover:text-limpopo-green-dark"
                  >
                    View all
                  </Link>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      title: 'New Road Construction in Polokwane',
                      excerpt: 'The municipality announced new road improvements starting next week...',
                      time: '3 hours ago'
                    },
                    {
                      title: 'Community Garden Project Success',
                      excerpt: 'The Tzaneen community garden has produced its first harvest...',
                      time: '1 day ago'
                    }
                  ].map((post, index) => (
                    <div key={index} className="border-l-4 border-limpopo-green pl-4">
                      <h4 className="text-sm font-medium text-gray-900">{post.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{post.excerpt}</p>
                      <p className="text-xs text-gray-400 mt-1">{post.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          {activity.type === 'message' && <MessageCircle className="h-4 w-4 text-gray-600" />}
                          {activity.type === 'connection' && <Users className="h-4 w-4 text-gray-600" />}
                          {activity.type === 'event' && <Calendar className="h-4 w-4 text-gray-600" />}
                          {activity.type === 'report' && <AlertTriangle className="h-4 w-4 text-gray-600" />}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Link
                    to="/notifications"
                    className="w-full bg-gray-50 text-gray-700 text-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors block"
                  >
                    View all activity
                  </Link>
                </div>
              </div>
            </div>

            {/* Local Weather or Info Widget */}
            <div className="bg-white shadow rounded-lg mt-6">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Local Info
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Weather</span>
                    <span className="text-sm font-medium">28°C Sunny</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Load Shedding</span>
                    <span className="text-sm font-medium text-green-600">None Today</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Emergency Contacts</span>
                    <Link to="/emergency" className="text-sm text-limpopo-green hover:text-limpopo-green-dark">
                      View
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}