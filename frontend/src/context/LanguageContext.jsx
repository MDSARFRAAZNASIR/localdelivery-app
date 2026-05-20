// import React, { createContext, useState, useEffect } from 'react';

// export const LanguageContext = createContext();

// export const LanguageProvider = ({ children }) => {
//   // Get saved language from localStorage, default to 'en'
//   const [language, setLanguage] = useState(localStorage.getItem('appLanguage') || 'en');

//   const switchLanguage = (lang) => {
//     setLanguage(lang);
//     localStorage.setItem('appLanguage', lang); // Save it for next time!
//   };

//   return (
//     <LanguageContext.Provider value={{ language, switchLanguage }}>
//       {children}
//     </LanguageContext.Provider>
//   );
// };


import { createContext, useState } from 'react';
import { translations } from '../i18n/translations';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('appLanguage') || 'en');

  const switchLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('appLanguage', lang);
  };

  // The "t" function: it looks up the key in the current language
  const t = (key) => {
    return translations[language][key] || key; 
  };

  return (
    <LanguageContext.Provider value={{ language, switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};