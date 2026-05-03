import { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('USD');

  // Detect currency based on locale initially
  useEffect(() => {
    const saved = localStorage.getItem('user-currency');
    if (saved) {
      setCurrency(saved);
    } else {
      try {
        // Robust detection using Intl
        const locale = navigator.language;
        const detectedCurrency = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' })
          .resolvedOptions().currency || 'USD';
        
        // Map detected currency to our supported list or default to USD
        const supported = ['USD', 'INR', 'EUR', 'GBP'];
        if (supported.includes(detectedCurrency)) {
          setCurrency(detectedCurrency);
        } else {
          // Fallback mapping for common regions
          if (locale.includes('IN')) setCurrency('INR');
          else if (locale.includes('GB')) setCurrency('GBP');
          else if (locale.includes('EU')) setCurrency('EUR');
          else setCurrency('USD');
        }
      } catch (e) {
        setCurrency('USD');
      }
    }
  }, []);

  const changeCurrency = (code) => {
    setCurrency(code);
    localStorage.setItem('user-currency', code);
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
