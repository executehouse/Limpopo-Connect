import { useState, useEffect, useCallback } from 'react';
import { DollarSign, ArrowRightLeft } from 'lucide-react';
import { exchangeRateService } from '@/services';

const POPULAR_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
];

export function CurrencyConverter() {
  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState('ZAR');
  const [toCurrency, setToCurrency] = useState('USD');
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertCurrency = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        setResult(null);
        return;
      }

      if (fromCurrency === toCurrency) {
        setResult(numAmount);
        return;
      }

      const converted = await exchangeRateService.convert(
        numAmount,
        fromCurrency,
        toCurrency
      );

      setResult(converted);
    } catch (err) {
      console.error('Currency conversion error:', err);
      setError('Unable to convert currency');
    } finally {
      setLoading(false);
    }
  }, [amount, fromCurrency, toCurrency]);

  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      convertCurrency();
    }
  }, [amount, fromCurrency, toCurrency, convertCurrency]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-4">
        <DollarSign className="w-6 h-6 text-limpopo-green mr-2" />
        <h3 className="text-xl font-bold text-gray-900">Currency Converter</h3>
      </div>

      <div className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limpopo-green focus:border-transparent"
            placeholder="Enter amount"
            min="0"
            step="0.01"
          />
        </div>

        {/* From Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From
          </label>
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limpopo-green focus:border-transparent"
          >
            {POPULAR_CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} {currency.name} ({currency.code})
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={swapCurrencies}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Swap currencies"
          >
            <ArrowRightLeft className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* To Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To
          </label>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limpopo-green focus:border-transparent"
          >
            {POPULAR_CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} {currency.name} ({currency.code})
              </option>
            ))}
          </select>
        </div>

        {/* Result */}
        {loading ? (
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 rounded-lg p-4 text-center text-red-600 text-sm">
            {error}
          </div>
        ) : result !== null ? (
          <div className="bg-limpopo-green/10 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Converted Amount</p>
            <p className="text-2xl font-bold text-limpopo-green">
              {POPULAR_CURRENCIES.find((c) => c.code === toCurrency)?.symbol}
              {result.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {amount} {fromCurrency} = {result.toFixed(2)} {toCurrency}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
