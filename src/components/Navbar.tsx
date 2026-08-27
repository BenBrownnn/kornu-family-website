import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import {
  Home, Users, Image, Calendar, BookOpen, Shield,
  LogIn, LogOut, Menu, X, ChevronRight
} from 'lucide-react';

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'family', label: 'Our Family', icon: Users },
  { id: 'gallery', label: 'Gallery', icon: Image },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'stories', label: 'Stories', icon: BookOpen },
  { id: 'portal', label: 'Portal', icon: Shield },
];

export default function Navbar() {
  const { currentPage, setCurrentPage, isAuthenticated, currentUser, logout, mobileMenuOpen, setMobileMenuOpen } = useStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (page: string) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white/90 backdrop-blur-sm shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[70px]">
            {/* Logo */}
            <button
              onClick={() => handleNav('home')}
              className="flex items-center gap-3 group"
            >
              <div className="relative w-11 h-11 rounded-full overflow-hidden shadow-md group-hover:shadow-orange-300 transition-shadow duration-300">
                <img
                  src="/images/kornu-logo.png"
                  alt="Kornu Family Crest"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.style.display = 'none';
                    const parent = target.parentElement!;
                    parent.classList.add('bg-gradient-to-br', 'from-orange-500', 'to-red-600', 'flex', 'items-center', 'justify-center');
                    parent.innerHTML = '<span style="color:white;font-weight:900;font-size:1.2rem;font-family:serif;">K</span>';
                  }}
                />
              </div>
              <div className="text-left">
                <div className="font-bold text-gray-900 text-base leading-tight font-playfair">The Kornu</div>
                <div className="text-orange-500 text-xs font-semibold uppercase tracking-widest">Family</div>
              </div>
            </button>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleNav(id)}
                  className={`nav-pill flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    currentPage === id
                      ? 'bg-orange-50 text-orange-500 font-semibold'
                      : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50'
                  }`}
                >
                  <Icon size={14} strokeWidth={currentPage === id ? 2.5 : 2} />
                  {label}
                </button>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <div className="hidden md:flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                      {currentUser?.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{currentUser?.name.split(' ')[0]}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-500 hover:text-red-500 rounded-full hover:bg-red-50 transition-all duration-200"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleNav('signin')}
                  className="hidden md:flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-md shadow-orange-200 hover:shadow-orange-300 hover:from-orange-600 hover:to-red-600 transition-all duration-300"
                >
                  <LogIn size={14} />
                  Sign In
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-full hover:bg-orange-50 text-gray-600 hover:text-orange-500 transition-all"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleNav(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    currentPage === id
                      ? 'bg-orange-50 text-orange-500'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                  <ChevronRight size={14} className="ml-auto text-gray-300" />
                </button>
              ))}
              <div className="pt-2 border-t border-gray-100">
                {isAuthenticated ? (
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                  >
                    <LogOut size={16} />
                    Sign Out ({currentUser?.name})
                  </button>
                ) : (
                  <button
                    onClick={() => handleNav('signin')}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-xl text-sm font-semibold"
                  >
                    <LogIn size={16} />
                    Sign In to Portal
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
