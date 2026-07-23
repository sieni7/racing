import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const navLinks = [
  { path: '/', label: 'Accueil' },
  { path: '/effectif', label: 'Effectif' },
  { path: '/matchs', label: 'Matchs' },
  { path: '/news', label: 'Actualités' },
  { path: '/galerie', label: 'Galerie' },
  { path: '/classement', label: 'Classement' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col">
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur shadow-md py-2'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <Link to="/" className={`font-display font-bold text-xl ${scrolled ? 'text-primary' : 'text-white'}`}>
            RC Bingerville
          </Link>

          <button
            className="lg:hidden p-2 rounded"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <svg className={`w-6 h-6 ${scrolled ? 'text-gray-800 dark:text-white' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <div className={`${menuOpen ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row gap-4 lg:items-center absolute lg:static top-full left-0 right-0 p-4 lg:p-0 ${scrolled ? 'bg-white dark:bg-gray-900' : 'bg-transparent'} lg:bg-transparent shadow-lg lg:shadow-none`}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium transition-colors ${
                  scrolled
                    ? 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
                    : 'text-white/90 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="flex items-center gap-3 lg:ml-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-colors ${
                  scrolled
                    ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    : 'text-white/80 hover:text-white'
                }`}
                aria-label="Changer le thème"
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>

              {!loading && !user ? (
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-cta transition-colors text-sm"
                >
                  Connexion
                </Link>
              ) : (
                <button
                  onClick={signOut}
                  className="px-4 py-2 rounded-lg border border-red-500 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
                >
                  Déconnexion
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-16">
        {children}
      </main>

      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-display font-semibold text-white mb-3">Racing Club de Bingerville</h3>
              <p className="text-sm">Stade de Bingerville, Côte d'Ivoire</p>
              <p className="text-sm">contact@racingclub.ci</p>
            </div>
            <div>
              <h3 className="font-display font-semibold text-white mb-3">Liens</h3>
              <ul className="space-y-2 text-sm">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="hover:text-white transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display font-semibold text-white mb-3">Suivez-nous</h3>
              <div className="flex gap-4">
                <a href="#" className="hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm">
            &copy; 2026 Racing Club de Bingerville. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
