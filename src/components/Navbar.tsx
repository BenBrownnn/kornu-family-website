import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import {
  Home,
  Users,
  Image,
  Calendar,
  BookOpen,
  LockKeyhole,
  LockKeyholeOpen,
  LogIn,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'family', label: 'Our Family', icon: Users },
  { id: 'gallery', label: 'Gallery', icon: Image },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'stories', label: 'Stories', icon: BookOpen },
  { id: 'portal', label: 'Portal', icon: LockKeyhole },
];

export default function Navbar() {
  const {
    currentPage,
    setCurrentPage,
    isAuthenticated,
    currentUser,
    logout,
    mobileMenuOpen,
    setMobileMenuOpen,
  } = useStore();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleNav = (page: string) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#D0E6FF]/95 backdrop-blur-md shadow-[0_4px_20px_rgba(2,53,112,0.10)]'
            : 'bg-[#D0E6FF]/95 backdrop-blur-sm shadow-[0_2px_12px_rgba(2,53,112,0.06)]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[70px]">

            {/* =========================
                LOGO
            ========================== */}
            <button
              onClick={() => handleNav('home')}
              className="flex items-center gap-3 group"
            >
              <div className="relative w-11 h-11 rounded-full overflow-hidden bg-white shadow-md group-hover:shadow-[0_6px_18px_rgba(81,162,255,0.35)] transition-shadow duration-300">
                <img
                  src="/images/kornu-logo.png"
                  alt="Kornu Family Crest"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;

                    target.onerror = null;
                    target.style.display = 'none';

                    const parent = target.parentElement;

                    if (parent) {
                      parent.classList.add(
                        'bg-white',
                        'flex',
                        'items-center',
                        'justify-center'
                      );

                      parent.innerHTML =
                        '<span style="color:#023570;font-weight:900;font-size:1.2rem;font-family:serif;">K</span>';
                    }
                  }}
                />
              </div>

              <div className="text-left">
                <div className="font-bold text-[#023570] text-base leading-tight font-montserrat">
                  The Kornu
                </div>

                <div className="text-[#51A2FF] text-xs font-semibold uppercase tracking-widest">
                  Family
                </div>
              </div>
            </button>

            {/* =========================
                DESKTOP NAVIGATION
            ========================== */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(({ id, label, icon: Icon }) => {
                const PortalIcon =
                  isAuthenticated && id === 'portal'
                    ? LockKeyholeOpen
                    : Icon;

                return (
                  <button
                    key={id}
                    onClick={() => handleNav(id)}
                    className={`nav-pill flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      currentPage === id
                        ? 'bg-[#023570]/10 text-[#023570] font-semibold'
                        : 'text-[#52667A] hover:text-[#023570] hover:bg-[#51A2FF]/10'
                    }`}
                  >
                    <PortalIcon
                      size={14}
                      strokeWidth={currentPage === id ? 2.5 : 2}
                      className="transition-all duration-300"
                    />

                    {label}
                  </button>
                );
              })}
            </div>

            {/* =========================
                RIGHT SECTION
            ========================== */}
            <div className="flex items-center gap-3">

              {isAuthenticated ? (
                <div className="hidden md:flex items-center gap-3">

                  {/* User */}
                  <div className="flex items-center gap-2 bg-white/70 border border-[#51A2FF]/20 px-3 py-1.5 rounded-xl shadow-sm">
                    <div className="w-7 h-7 rounded-full bg-[#023570] flex items-center justify-center text-white text-xs font-bold">
                      {currentUser?.name?.charAt(0)}
                    </div>

                    <span className="text-sm font-medium text-[#102A43]">
                      {currentUser?.name?.split(' ')[0]}
                    </span>
                  </div>

                  {/* Sign Out */}
                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm text-[#52667A] hover:text-[#023570] rounded-lg hover:bg-[#51A2FF]/10 transition-all duration-200"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              ) : (
                /* Desktop Sign In */
                <button
                  onClick={() => handleNav('signin')}
                  className="hidden md:flex items-center gap-2 bg-[#023570] text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-md shadow-[#023570]/20 hover:bg-[#034B91] hover:shadow-[#51A2FF]/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <LogIn size={14} />
                  Sign In
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-full text-[#023570] hover:text-[#51A2FF] hover:bg-[#51A2FF]/10 transition-all"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X size={22} />
                ) : (
                  <Menu size={22} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* =========================
            MOBILE MENU
        ========================== */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#F5F9FF] border-t border-[#51A2FF]/20 shadow-lg">
            <div className="px-4 py-3 space-y-1">

              {/* Mobile Navigation */}
              {navItems.map(({ id, label, icon: Icon }) => {
                const PortalIcon =
                  isAuthenticated && id === 'portal'
                    ? LockKeyholeOpen
                    : Icon;

                return (
                  <button
                    key={id}
                    onClick={() => handleNav(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      currentPage === id
                        ? 'bg-[#023570]/10 text-[#023570] font-semibold'
                        : 'text-[#102A43] hover:bg-[#D0E6FF] hover:text-[#023570]'
                    }`}
                  >
                    <PortalIcon
                      size={16}
                      strokeWidth={currentPage === id ? 2.5 : 2}
                      className="transition-all duration-300"
                    />

                    {label}

                    <ChevronRight
                      size={14}
                      className={`ml-auto ${
                        currentPage === id
                          ? 'text-[#51A2FF]'
                          : 'text-[#9BB7D1]'
                      }`}
                    />
                  </button>
                );
              })}

              {/* =========================
                  MOBILE AUTHENTICATION
              ========================== */}
              <div className="pt-2 border-t border-[#023570]/10">
                {isAuthenticated ? (
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#023570] hover:bg-[#51A2FF]/10 transition-all"
                  >
                    <LogOut size={16} />
                    Sign Out ({currentUser?.name})
                  </button>
                ) : (
                  <button
                    onClick={() => handleNav('signin')}
                    className="w-full flex items-center justify-center gap-2 bg-[#023570] hover:bg-[#51A2FF] text-white px-4 py-3 rounded-full text-sm font-semibold shadow-md shadow-[#023570]/20 transition-all"
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