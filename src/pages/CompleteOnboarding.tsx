/**
 * Complete Onboarding Page
 * 
 * Collects additional profile information and handles role confirmation
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../lib/AuthProvider'
import type { UserRole } from '../lib/useAuth'
import { supabase } from '../lib/supabase'

interface OnboardingFormData {
  first_name: string
  last_name: string
  phone: string
  role: UserRole
  business_name?: string
  business_description?: string
  business_contact_email?: string
  business_contact_phone?: string
  business_address?: string
  business_registration_number?: string
}

export default function CompleteOnboarding() {
  const { user, profile, updateProfile, getDefaultLandingPage } = useAuthContext()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<OnboardingFormData>({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
    role: profile?.role || 'citizen'
  })

  useEffect(() => {
    // Redirect if profile is already complete
    if (profile?.first_name && profile?.last_name) {
      const defaultRoute = getDefaultLandingPage(profile.role)
      navigate(defaultRoute, { replace: true })
    }
  }, [profile, navigate, getDefaultLandingPage])

  const handleInputChange = (field: keyof OnboardingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleRoleChange = (newRole: UserRole) => {
    setFormData(prev => ({ ...prev, role: newRole }))
  }

  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.first_name || !formData.last_name) {
      alert('Please fill in all required fields')
      return
    }
    
    if (formData.role === 'business') {
      setStep(2) // Go to business info step
    } else {
      await completeOnboarding()
    }
  }

  const handleBusinessInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.business_name || !formData.business_contact_email) {
      alert('Please fill in all required business fields')
      return
    }
    
    await completeOnboarding()
  }

  const completeOnboarding = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Update profile
      await updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        role: formData.role
      })

      // If business role, create business verification record
      if (formData.role === 'business') {
        if (!supabase) throw new Error('Supabase not initialized')
        const { error: businessError } = await supabase
          .from('business_verification')
          .insert({
            user_id: user.id,
            business_name: formData.business_name!,
            registration_number: formData.business_registration_number,
            contact_email: formData.business_contact_email!,
            contact_phone: formData.business_contact_phone,
            address: formData.business_address,
            description: formData.business_description,
            status: 'pending'
          })

        if (businessError) {
          console.error('Error creating business verification:', businessError)
        }
      }

      // Navigate to appropriate dashboard
      const defaultRoute = getDefaultLandingPage(formData.role)
      navigate(defaultRoute, { replace: true })
    } catch (error) {
      console.error('Error completing onboarding:', error)
      alert('Error completing profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">Please log in to complete your profile.</p>
          <button
            onClick={() => navigate('/auth/login')}
            className="mt-4 bg-limpopo-green text-white px-4 py-2 rounded-md hover:bg-limpopo-green-dark"
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Help us personalize your Limpopo Connect experience
          </p>
          
          {/* Progress indicator */}
          <div className="mt-6 flex justify-center">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-limpopo-green text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${
                step >= 2 ? 'bg-limpopo-green' : 'bg-gray-300'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-limpopo-green text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === 1 ? (
            <form onSubmit={handleBasicInfoSubmit} className="space-y-6">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <input
                  id="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-limpopo-green focus:border-limpopo-green"
                />
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <input
                  id="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-limpopo-green focus:border-limpopo-green"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-limpopo-green focus:border-limpopo-green"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  I am a... *
                </label>
                <div className="space-y-3">
                  {(['citizen', 'business'] as UserRole[]).map((role) => (
                    <div key={role} className="flex items-center">
                      <input
                        id={role}
                        name="role"
                        type="radio"
                        checked={formData.role === role}
                        onChange={() => handleRoleChange(role)}
                        className="h-4 w-4 text-limpopo-green focus:ring-limpopo-green border-gray-300"
                      />
                      <label htmlFor={role} className="ml-3 block text-sm text-gray-700">
                        <span className="font-medium capitalize">{role}</span>
                        <span className="block text-gray-500">
                          {role === 'citizen' 
                            ? 'Limpopo resident or community member'
                            : 'Business owner or representative'
                          }
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-limpopo-green hover:bg-limpopo-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-limpopo-green disabled:opacity-50"
                >
                  {formData.role === 'business' ? 'Next: Business Info' : 'Complete Profile'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleBusinessInfoSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Business Information
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Tell us about your business. This information will be reviewed before your business account is activated.
                </p>
              </div>

              <div>
                <label htmlFor="business_name" className="block text-sm font-medium text-gray-700">
                  Business Name *
                </label>
                <input
                  id="business_name"
                  type="text"
                  required
                  value={formData.business_name || ''}
                  onChange={(e) => handleInputChange('business_name', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-limpopo-green focus:border-limpopo-green"
                />
              </div>

              <div>
                <label htmlFor="business_contact_email" className="block text-sm font-medium text-gray-700">
                  Business Email *
                </label>
                <input
                  id="business_contact_email"
                  type="email"
                  required
                  value={formData.business_contact_email || ''}
                  onChange={(e) => handleInputChange('business_contact_email', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-limpopo-green focus:border-limpopo-green"
                />
              </div>

              <div>
                <label htmlFor="business_contact_phone" className="block text-sm font-medium text-gray-700">
                  Business Phone
                </label>
                <input
                  id="business_contact_phone"
                  type="tel"
                  value={formData.business_contact_phone || ''}
                  onChange={(e) => handleInputChange('business_contact_phone', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-limpopo-green focus:border-limpopo-green"
                />
              </div>

              <div>
                <label htmlFor="business_registration_number" className="block text-sm font-medium text-gray-700">
                  Registration Number
                </label>
                <input
                  id="business_registration_number"
                  type="text"
                  value={formData.business_registration_number || ''}
                  onChange={(e) => handleInputChange('business_registration_number', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-limpopo-green focus:border-limpopo-green"
                />
              </div>

              <div>
                <label htmlFor="business_address" className="block text-sm font-medium text-gray-700">
                  Business Address
                </label>
                <textarea
                  id="business_address"
                  rows={3}
                  value={formData.business_address || ''}
                  onChange={(e) => handleInputChange('business_address', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-limpopo-green focus:border-limpopo-green"
                />
              </div>

              <div>
                <label htmlFor="business_description" className="block text-sm font-medium text-gray-700">
                  Business Description
                </label>
                <textarea
                  id="business_description"
                  rows={4}
                  placeholder="Tell us about your business, services, and products..."
                  value={formData.business_description || ''}
                  onChange={(e) => handleInputChange('business_description', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-limpopo-green focus:border-limpopo-green"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      Your business account will be reviewed by our team. You'll receive an email once it's approved and you can start using business features.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-limpopo-green"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-limpopo-green hover:bg-limpopo-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-limpopo-green disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Complete Profile'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}