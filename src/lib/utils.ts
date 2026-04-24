/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = '$') {
  const normCurrency = currency.trim().toUpperCase();
  const isINR = normCurrency.includes('INR') || normCurrency === '₹';
  const isEUR = normCurrency.includes('EUR') || normCurrency === '€';
  const isGBP = normCurrency.includes('GBP') || normCurrency === '£';
  
  let currencyCode = 'USD';
  let locale = 'en-US';

  if (isINR) { currencyCode = 'INR'; locale = 'en-IN'; }
  else if (isEUR) { currencyCode = 'EUR'; locale = 'en-DE'; }
  else if (isGBP) { currencyCode = 'GBP'; locale = 'en-GB'; }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  } catch (e) {
    return `${currency}${amount.toLocaleString()}`;
  }
}
