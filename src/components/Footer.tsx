import { useStore } from '../store/useStore';
import {
  LockKeyhole,
  LockKeyholeOpen,
} from 'lucide-react';

export default function Footer() {
  const {
    setCurrentPage,
    isAuthenticated,
    logout,
  } = useStore();

  const PortalLockIcon = isAuthenticated
    ? LockKeyholeOpen
    : LockKeyhole;

  const handlePortalAction = () => {
    if (isAuthenticated) {
      logout();
      setCurrentPage('home');
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      return;
    }

    setCurrentPage('signin');
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleNav = (page: string) => {
    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-6xl mx-auto px-4">

        <div className="grid md:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
          <div className="md:col-span-2">

            <div className="flex items-center gap-3 mb-4">

              <div className="w-12 h-12 flex items-center justify-center">

                <img
                  src="/images/kornu-logo.webp"
                  alt="Kornu"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const t = e.target as HTMLImageElement;

                    t.style.display = 'none';

                    t.parentElement!.innerHTML =
                      '<span style="color:white;font-weight:900;font-size:1.3rem;font-family:serif;">K</span>';
                  }}
                />

              </div>

              <div>

                <div className="font-bold text-lg font-['Montserrat']">
                  The Kornu Family
                </div>

                <div className="text-blue-400 text-xs uppercase tracking-widest">
                  Est. 1946 · Ve-Gbodome, Ghana
                </div>

              </div>

            </div>

            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Where every memory is treasured, every story is celebrated,
              and every family member is loved always.
            </p>

          </div>


          {/* Explore */}
          <div>

            <h4 className="font-semibold text-sm uppercase tracking-widest text-gray-400 mb-4">
              Explore
            </h4>

            <ul className="space-y-2">

              {[
                { label: 'Home', page: 'home' },
                { label: 'Our Family', page: 'family' },
                { label: 'Gallery', page: 'gallery' },
                { label: 'Events', page: 'events' },
                { label: 'Stories', page: 'stories' },
                { label: 'Portal', page: 'portal' },
              ].map((link) => (

                <li key={link.page}>

                  <button
                    onClick={() => handleNav(link.page)}
                    className="text-gray-400 hover:text-blue-400 text-sm transition-colors"
                  >
                    {link.label}
                  </button>

                </li>

              ))}

            </ul>

          </div>


          {/* Connect */}
          <div>

            <h4 className="font-semibold text-sm uppercase tracking-widest text-gray-400 mb-4">
              Connect
            </h4>

            <ul className="space-y-2 text-sm text-gray-400">

              <li>
                Ve-Gbodome, Ghana
              </li>

              <li>
                family@kornu.family
              </li>

              <li className="pt-2">

                <button
                  onClick={handlePortalAction}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-xs font-semibold transition-all inline-flex items-center gap-2"
                >

                  <PortalLockIcon size={14} />

                  {isAuthenticated
                    ? 'Sign Out of Portal'
                    : 'Sign In to Portal'}

                </button>

              </li>

            </ul>

          </div>

        </div>


        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8">

          <p className="text-gray-500 text-sm">
            © 2026 The Kornu Family Website. All rights reserved. Made with
            for our family.
          </p>

        </div>

      </div>
    </footer>
  );
}