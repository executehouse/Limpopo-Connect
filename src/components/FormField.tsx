import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'textarea';
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  icon?: React.ReactNode;
  rows?: number;
  maxLength?: number;
  className?: string;
  helpText?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  name,
  label,
  type = 'text',
  required = false,
  disabled = false,
  placeholder,
  value,
  onChange,
  error,
  icon,
  rows = 4,
  maxLength,
  className = '',
  helpText
}) => {
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;

  const inputClasses = `w-full ${icon ? 'pl-10' : 'px-4'} pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-limpopo-blue focus:border-transparent ${
    error ? 'border-red-300' : 'border-gray-300'
  } ${disabled ? 'bg-gray-50' : ''} ${className}`;

  const describedBy = [error ? errorId : '', helpText ? helpId : ''].filter(Boolean).join(' ');

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && '*'}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        {type === 'textarea' ? (
          <textarea
            id={id}
            name={name}
            rows={rows}
            maxLength={maxLength}
            className={inputClasses}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            aria-describedby={describedBy || undefined}
          />
        ) : (
          <input
            id={id}
            name={name}
            type={type}
            className={inputClasses}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            aria-describedby={describedBy || undefined}
          />
        )}
      </div>
      <div className="mt-1 flex justify-between">
        <div>
          {error && (
            <p id={errorId} className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          )}
        </div>
        {maxLength && (
          <p className="text-sm text-gray-500">
            {value.length}/{maxLength} characters
          </p>
        )}
      </div>
      {helpText && (
        <p id={helpId} className="text-sm text-gray-500 mt-1">
          {helpText}
        </p>
      )}
    </div>
  );
};

export default FormField;
