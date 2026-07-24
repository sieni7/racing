import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!localStorage.getItem('cookies_accepted'));
  }, []);

  const accept = () => {
    localStorage.setItem('cookies_accepted', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-7xl mx-auto bg-gray-900/95 backdrop-blur-md text-white rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-white/10">
        <div className="flex-1 text-sm text-white/80">
          Nous utilisons des cookies pour améliorer votre expérience. En poursuivant, vous acceptez notre utilisation des cookies.
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button onClick={accept}
            className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
