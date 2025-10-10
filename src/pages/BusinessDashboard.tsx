/**
 * Business Dashboard
 * 
 * Main dashboard for business users with listing management and analytics
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../lib/AuthProvider'
import { 
  Store, 
  TrendingUp, 
  MessageCircle, 
  Eye,
  Phone,
  Star,
  Plus,
  BarChart3
} from 'lucide-react'

interface BusinessStats {
  views: number
  inquiries: number
  rating: number
  listings: number
}

interface BusinessListing {
  id: string
  name: string
  category: string
  status: 'active' | 'pending' | 'draft'
  views: number
  inquiries: number
  lastUpdated: string
}

export default function BusinessDashboard() {
  useAuthContext() // Access auth context
  const [stats, setStats] = useState<BusinessStats>({
    views: 0,
    inquiries: 0,
    rating: 0,
    listings: 0
  })
  const [listings, setListings] = useState<BusinessListing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBusinessData()
  }, [])

  const loadBusinessData = async () => {
    try {
      // Mock data - replace with actual API calls
      setStats({
        views: 1247,
        inquiries: 23,
        rating: 4.8,
        listings: 3
      })

      setListings([
        {
          id: '1',
          name: 'Limpopo Craft Store',
          category: 'Retail',
          status: 'active',
          views: 456,
          inquiries: 12,
          lastUpdated: '2 days ago'
        },
        {
          id: '2',
          name: 'Traditional Restaurant',
          category: 'Food & Dining',
          status: 'active',
          views: 789,
          inquiries: 18,
          lastUpdated: '1 week ago'
        },
        {
          id: '3',
          name: 'Tourism Guide Services',
          category: 'Tourism',
          status: 'pending',
          views: 0,
          inquiries: 0,
          lastUpdated: '3 days ago'
        }
      ])
    } catch (error) {
      console.error('Error loading business data:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickStats = [
    {
      name: 'Total Views',
      value: stats.views.toLocaleString(),
      change: '+12%',
      changeType: 'increase' as const,
      icon: Eye
    },
    {
      name: 'Inquiries',
      value: stats.inquiries.toString(),
      change: '+3 this week',
      changeType: 'increase' as const,
      icon: MessageCircle
    },
    {
      name: 'Average Rating',
      value: stats.rating.toString(),
      change: '5 reviews',
      changeType: 'neutral' as const,
      icon: Star
    },
    {
      name: 'Active Listings',
      value: stats.listings.toString(),
      change: '2 active',
      changeType: 'neutral' as const,
      icon: Store
    }
  ]

  const quickActions = [
    {
      name: 'Create New Listing',
      description: 'Add a new business listing',
      href: '/listings/new',
      icon: Plus,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      name: 'View Analytics',
      description: 'Detailed business insights',
      href: '/business-analytics',
      icon: BarChart3,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: 'Manage Listings',
      description: 'Edit existing listings',
      href: '/listings',
      icon: Store,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      name: 'Customer Messages',
      description: 'Respond to inquiries',
      href: '/messages',
      icon: MessageCircle,
      color: 'bg-orange-500 hover:bg-orange-600'
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
                Business Dashboard
              </h1>
              <p className="text-gray-600">
                Manage your business presence in Limpopo
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Business
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
                      <Icon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {stat.name}
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {stat.value}
                        </dd>
                        <dd className={`text-sm ${
                          stat.changeType === 'increase' ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {stat.change}
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
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Recent Listings */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Your Listings
                  </h3>
                  <Link 
                    to="/listings"
                    className="text-sm font-medium text-limpopo-green hover:text-limpopo-green-dark"
                  >
                    View all
                  </Link>
                </div>
                <div className="space-y-4">
                  {listings.map((listing) => (
                    <div key={listing.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium text-gray-900">
                              {listing.name}
                            </h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              listing.status === 'active' 
                                ? 'bg-green-100 text-green-800'
                                : listing.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {listing.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{listing.category}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                            <span className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {listing.views} views
                            </span>
                            <span className="flex items-center">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              {listing.inquiries} inquiries
                            </span>
                            <span>Updated {listing.lastUpdated}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Link
                            to={`/listings/${listing.id}/edit`}
                            className="text-sm text-limpopo-green hover:text-limpopo-green-dark"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Performance Summary */}
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  This Week
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm text-gray-600">Profile Views</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">+156</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageCircle className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-sm text-gray-600">New Inquiries</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-purple-500 mr-2" />
                      <span className="text-sm text-gray-600">Calls</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-500 mr-2" />
                      <span className="text-sm text-gray-600">New Reviews</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">2</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Recent Reviews
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Sarah M.',
                      rating: 5,
                      comment: 'Excellent service and great local products!',
                      time: '2 days ago'
                    },
                    {
                      name: 'John D.',
                      rating: 4,
                      comment: 'Very helpful staff, will visit again.',
                      time: '1 week ago'
                    }
                  ].map((review, index) => (
                    <div key={index} className="border-l-4 border-yellow-400 pl-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{review.name}</span>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-3 w-3 ${i < review.rating ? 'fill-current' : ''}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                      <p className="text-xs text-gray-400 mt-1">{review.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Business Tips */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Business Tips
                </h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Tip:</strong> Respond to inquiries within 24 hours to improve your response rate.
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <p className="text-sm text-green-800">
                      <strong>Boost visibility:</strong> Add photos and update your business hours regularly.
                    </p>
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