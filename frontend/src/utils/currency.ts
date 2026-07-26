/**
 * Currency and market detection utility functions for PortOpt.
 */

export function detectCurrencySymbol(tickers: string[]): string {
  if (!tickers || tickers.length === 0) return '$';
  const hasIndianTicker = tickers.some((t) => t.trim().toUpperCase().endsWith('.NS'));
  return hasIndianTicker ? '₹' : '$';
}

export function getCurrencySymbol(currencyOrSymbol?: string): string {
  if (!currencyOrSymbol) return '$';
  switch (currencyOrSymbol.toUpperCase()) {
    case 'USD':
    case '$':
      return '$';
    case 'INR':
    case '₹':
      return '₹';
    case 'EUR':
    case '€':
      return '€';
    case 'GBP':
    case '£':
      return '£';
    case 'JPY':
    case '¥':
      return '¥';
    case 'CAD':
    case 'C$':
      return 'C$';
    case 'AUD':
    case 'A$':
      return 'A$';
    default:
      return currencyOrSymbol ? `${currencyOrSymbol} ` : '$';
  }
}

export function formatCurrency(
  value: number | null | undefined,
  currencyOrTickers?: string | string[]
): string {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  
  let symbol = '$';
  if (Array.isArray(currencyOrTickers)) {
    symbol = detectCurrencySymbol(currencyOrTickers);
  } else if (currencyOrTickers) {
    symbol = getCurrencySymbol(currencyOrTickers);
  }

  return `${symbol}${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatMarketCap(
  value: number | null | undefined,
  currencyOrTickers?: string | string[]
): string {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';

  let symbol = '$';
  if (Array.isArray(currencyOrTickers)) {
    symbol = detectCurrencySymbol(currencyOrTickers);
  } else if (currencyOrTickers) {
    symbol = getCurrencySymbol(currencyOrTickers);
  }

  const absVal = Math.abs(value);
  if (absVal >= 1.0e12) {
    return `${symbol}${(value / 1.0e12).toFixed(2)}T`;
  }
  if (absVal >= 1.0e9) {
    return `${symbol}${(value / 1.0e9).toFixed(2)}B`;
  }
  if (absVal >= 1.0e6) {
    return `${symbol}${(value / 1.0e6).toFixed(2)}M`;
  }
  return `${symbol}${value.toLocaleString()}`;
}
