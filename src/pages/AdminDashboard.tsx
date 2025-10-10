/**
 * Admin Dashboard
 * 
 * Administrative dashboard with user management, content moderation, and system monitoring
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../lib/AuthProvider'
import { 
  Users, 
  Shield, 
  AlertTriangle, 
  BarChart3,
  FileText,
  Settings,
  Activity,
  Flag,
  Clock,
  CheckCircle,
  XCircle,

} from 'lucide-react'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  pendingReports: number
  totalBusinesses: number
  pendingBusinesses: number
  totalPosts: number
  flaggedContent: number
  systemHealth: number
}

interface RecentActivity {
  id: string
  type: 'user_registration' | 'business_application' | 'content_report' | 'system_alert'
  title: string
  description: string
  timestamp: string
  status: 'pending' | 'resolved' | 'active'
  priority: 'low' | 'medium' | 'high'
}

export default function AdminDashboard() {
  useAuthContext() // Access auth context
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingReports: 0,
    totalBusinesses: 0,
    pendingBusinesses: 0,
    totalPosts: 0,
    flaggedContent: 0,
    systemHealth: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      // Mock data - replace with actual API calls
      setStats({
        totalUsers: 2847,
        activeUsers: 1923,
        pendingReports: 12,
        totalBusinesses: 156,
        pendingBusinesses: 8,
        totalPosts: 5693,
        flaggedContent: 4,
        systemHealth: 98
      })

      setRecentActivity([
        {
          id: '1',
          type: 'business_application',
          title: 'New Business Application',
          description: 'Limpopo Crafts & Arts submitted verification documents',
          timestamp: '2 hours ago',
          status: 'pending',
          priority: 'medium'
        },
        {
          id: '2',
          type: 'content_report',
          title: 'Content Reported',
          description: 'Inappropriate comment reported in Polokwane Community room',
          timestamp: '4 hours ago',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '3',
          type: 'user_registration',
          title: 'User Registration Spike',
          description: '24 new users registered in the last hour',
          timestamp: '1 hour ago',
          status: 'active',
          priority: 'low'
        },
        {
          id: '4',
          type: 'system_alert',
          title: 'Database Performance',
          description: 'Query response time increased by 15%',
          timestamp: '6 hours ago',
          status: 'resolved',
          priority: 'medium'
        }
      ])
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickStats = [
    {
      name: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      subtext: `${stats.activeUsers} active today`,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'Pending Reports',
      value: stats.pendingReports.toString(),
      subtext: '2 high priority',
      icon: AlertTriangle,
      color: 'bg-red-500'
    },
    {
      name: 'Business Applications',
      value: stats.pendingBusinesses.toString(),
      subtext: `${stats.totalBusinesses} total businesses`,
      icon: Shield,
      color: 'bg-green-500'
    },
    {
      name: 'System Health',
      value: `${stats.systemHealth}%`,
      subtext: 'All systems operational',
      icon: Activity,
      color: 'bg-purple-500'
    }
  ]

  const quickActions = [
    {
      name: 'User Management',
      description: 'Manage user accounts and roles',
      href: '/admin/users',
      icon: Users,
      color: 'bg-blue-500 hover:bg-blue-600',
      badge: stats.totalUsers > 0 ? `${stats.totalUsers}` : null
    },
    {
      name: 'Content Moderation',
      description: 'Review flagged content and reports',
      href: '/admin/content',
      icon: Flag,
      color: 'bg-red-500 hover:bg-red-600',
      badge: stats.flaggedContent > 0 ? `${stats.flaggedContent}` : null
    },
    {
      name: 'Business Verification',
      description: 'Approve business applications',
      href: '/admin/businesses',
      icon: Shield,
      color: 'bg-green-500 hover:bg-green-600',
      badge: stats.pendingBusinesses > 0 ? `${stats.pendingBusinesses}` : null
    },
    {
      name: 'Analytics',
      description: 'Platform usage and insights',
      href: '/admin/analytics',
      icon: BarChart3,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      name: 'Audit Logs',
      description: 'System and user activity logs',
      href: '/admin/audit-logs',
      icon: FileText,
      color: 'bg-gray-500 hover:bg-gray-600'
    },
    {
      name: 'System Settings',
      description: 'Platform configuration',
      href: '/admin/settings',
      icon: Settings,
      color: 'bg-indigo-500 hover:bg-indigo-600'
    }
  ]

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_registration': return <Users className="h-4 w-4" />
      case 'business_application': return <Shield className="h-4 w-4" />
      case 'content_report': return <Flag className="h-4 w-4" />
      case 'system_alert': return <Activity className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: RecentActivity['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3 text-yellow-500" />
      case 'resolved': return <CheckCircle className="h-3 w-3 text-green-500" />
      case 'active': return <Activity className="h-3 w-3 text-blue-500" />
      default: return <XCircle className="h-3 w-3 text-red-500" />
    }
  }

  const getPriorityColor = (priority: RecentActivity['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-500'
      case 'medium': return 'border-l-yellow-500'
      case 'low': return 'border-l-green-500'
      default: return 'border-l-gray-500'
    }
  }

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
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Platform administration and monitoring
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">System Online</span>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Admin
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-md ${stat.color} text-white`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {stat.name}
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stat.value}
                        </dd>
                        <dd className="text-sm text-gray-500">
                          {stat.subtext}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Admin Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quickActions.map((action) => {
                    const Icon = action.icon
                    return (
                      <Link
                        key={action.name}
                        to={action.href}
                        className={`group relative rounded-lg p-4 ${action.color} text-white hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg`}
                      >
                        <div className="flex items-center justify-between">
                          <Icon className="h-6 w-6" />
                          {action.badge && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
                              {action.badge}
                            </span>
                          )}
                        </div>
                        <div className="mt-4">
                          <h3 className="text-sm font-medium">
                            {action.name}
                          </h3>
                          <p className="mt-1 text-xs text-white text-opacity-90">
                            {action.description}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Platform Overview */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Platform Overview
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalPosts.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Total Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.totalBusinesses}</div>
                    <div className="text-sm text-gray-500">Businesses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{Math.round(stats.totalUsers / 30)}</div>
                    <div className="text-sm text-gray-500">Daily Average Users</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Recent Activity
                  </h3>
                  <Link 
                    to="/admin/activity"
                    className="text-sm font-medium text-limpopo-green hover:text-limpopo-green-dark"
                  >
                    View all
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className={`border-l-4 ${getPriorityColor(activity.priority)} pl-4 pb-4`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900">
                                {activity.title}
                              </p>
                              {getStatusIcon(activity.status)}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {activity.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white shadow rounded-lg mt-6">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  System Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Database</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Operational</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Services</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Operational</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">File Storage</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium">Degraded</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">CDN</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Operational</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link 
                    to="/admin/system-status"
                    className="text-sm text-limpopo-green hover:text-limpopo-green-dark"
                  >
                    View detailed status →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}