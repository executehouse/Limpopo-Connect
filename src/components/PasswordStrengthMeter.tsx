/**
 * Password Strength Meter Component
 * 
 * Provides real-time password strength feedback using zxcvbn library
 */

import React, { useMemo } from 'react'
import zxcvbn from 'zxcvbn'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface PasswordStrengthMeterProps {
  password: string
  className?: string
}

interface StrengthConfig {
  label: string
  color: string
  bgColor: string
  textColor: string
}

const strengthConfigs: StrengthConfig[] = [
  { label: 'Very Weak', color: 'bg-red-500', bgColor: 'bg-red-100', textColor: 'text-red-700' },
  { label: 'Weak', color: 'bg-orange-500', bgColor: 'bg-orange-100', textColor: 'text-orange-700' },
  { label: 'Fair', color: 'bg-yellow-500', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
  { label: 'Strong', color: 'bg-green-500', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  { label: 'Very Strong', color: 'bg-green-600', bgColor: 'bg-green-100', textColor: 'text-green-800' },
]

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ 
  password, 
  className = '' 
}) => {
  const analysis = useMemo(() => {
    if (!password) {
      return null
    }
    return zxcvbn(password)
  }, [password])

  if (!password || !analysis) {
    return null
  }

  const score = analysis.score
  const strengthConfig = strengthConfigs[score]
  const percentage = ((score + 1) / 5) * 100

  // Determine requirements met
  const requirements = [
    { met: password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
    { met: /[a-z]/.test(password), text: 'One lowercase letter' },
    { met: /\d/.test(password), text: 'One number' },
    { met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password), text: 'One special character' },
  ]

  return (
    <div className={`mt-2 ${className}`}>
      {/* Strength bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Password Strength</span>
          <span className={`text-sm font-semibold ${strengthConfig.textColor}`}>
            {strengthConfig.label}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${strengthConfig.color} transition-all duration-300 ease-in-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center text-sm">
            {req.met ? (
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
            )}
            <span className={req.met ? 'text-green-700' : 'text-gray-600'}>
              {req.text}
            </span>
          </div>
        ))}
      </div>

      {/* Feedback from zxcvbn */}
      {analysis.feedback.warning && (
        <div className={`mt-2 p-2 rounded-md ${strengthConfig.bgColor} flex items-start`}>
          <AlertCircle className={`h-4 w-4 ${strengthConfig.textColor} mr-2 mt-0.5 flex-shrink-0`} />
          <p className={`text-sm ${strengthConfig.textColor}`}>
            {analysis.feedback.warning}
          </p>
        </div>
      )}

      {/* Suggestions */}
      {analysis.feedback.suggestions && analysis.feedback.suggestions.length > 0 && (
        <div className="mt-2">
          <ul className="text-xs text-gray-600 space-y-1">
            {analysis.feedback.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/**
 * Hook to check if password meets minimum requirements
 */
export default PasswordStrengthMeter
