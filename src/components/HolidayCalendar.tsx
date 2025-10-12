import { useState, useEffect, useCallback } from 'react';
import { Calendar, PartyPopper } from 'lucide-react';
import { holidayService, type PublicHoliday } from '@/services';

interface HolidayCalendarProps {
  maxHolidays?: number;
  showUpcomingOnly?: boolean;
}

export function HolidayCalendar({
  maxHolidays = 5,
  showUpcomingOnly = true,
}: HolidayCalendarProps) {
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHolidays = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const holidayList = showUpcomingOnly
        ? await holidayService.getUpcomingHolidays()
        : await holidayService.getCurrentYearHolidays();

      setHolidays(holidayList.slice(0, maxHolidays));
    } catch (err) {
      console.error('Holiday calendar error:', err);
      setError('Unable to load holidays');
    } finally {
      setLoading(false);
    }
  }, [showUpcomingOnly, maxHolidays]);

  useEffect(() => {
    loadHolidays();
  }, [loadHolidays]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const diffMs = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    if (diffDays < 14) return 'Next week';
    if (diffDays < 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
    return `In ${Math.ceil(diffDays / 30)} months`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <Calendar className="w-6 h-6 text-limpopo-green mr-2" />
          <h3 className="text-xl font-bold text-gray-900">Public Holidays</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || holidays.length === 0) {
    return null; // Silently fail if holidays are not available
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Calendar className="w-6 h-6 text-limpopo-green mr-2" />
          <h3 className="text-xl font-bold text-gray-900">
            {showUpcomingOnly ? 'Upcoming Holidays' : 'Public Holidays'}
          </h3>
        </div>
      </div>

      <div className="space-y-3">
        {holidays.map((holiday, index) => (
          <div
            key={`${holiday.date}-${index}`}
            className="flex items-start justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div className="flex items-start">
              <PartyPopper className="w-5 h-5 text-limpopo-green mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900">{holiday.name}</h4>
                <p className="text-sm text-gray-600">{formatDate(holiday.date)}</p>
                {showUpcomingOnly && (
                  <p className="text-xs text-limpopo-green font-medium mt-1">
                    {getDaysUntil(holiday.date)}
                  </p>
                )}
              </div>
            </div>
            {holiday.global && (
              <span className="text-xs bg-limpopo-green text-white px-2 py-1 rounded-full">
                National
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
