import { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  LogIn,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export default function SignInPage() {
  const { login, setCurrentPage } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    await new Promise((r) => setTimeout(r, 800));

    const success = await login(email, password);

    setLoading(false);

    if (success) {
      setCurrentPage('portal');

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  const handleBackHome = () => {
    setCurrentPage('home');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleRequestAccess = () => {
    setCurrentPage('request-access');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D0E6FF]/50 via-[#FAF5EE] to-[#E9D5FF]/60 flex items-center justify-center p-4 pt-24 pb-10">

      <div className="w-full max-w-5xl">

        {/* Main Card */}
        <div className="grid md:grid-cols-2 bg-white rounded-[2rem] shadow-[0_25px_80px_rgba(2,53,112,0.15)] overflow-hidden border border-white/80">

          {/* =====================================================
              LEFT SIDE — IMAGE & BRAND
          ====================================================== */}
          <div className="relative hidden md:block min-h-[680px]">

            {/* Background Image */}
            <img
              src="/images/hero-bg.jpg"
              alt="Kornu Family"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Deep Blue Overlay */}
            <div className="absolute inset-0 bg-[#023570]/75" />

            {/* Blue → Purple Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#023570]/95 via-[#023570]/65 to-[#2E1065]/95" />

            {/* Soft Highlight */}
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#51A2FF]/25 rounded-full blur-3xl" />

            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#6A1B9A]/30 rounded-full blur-3xl" />

            <div className="relative z-10 p-10 lg:p-12 h-full flex flex-col justify-between text-white">

              {/* =================================================
                  BRAND & WELCOME
              ================================================== */}
              <div>

                {/* Logo */}
                <div className="flex items-center gap-3 mb-10">

                  <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">

                    <img
                      src="/images/kornu-logo.png"
                      alt="Kornu"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const t = e.target as HTMLImageElement;

                        t.style.display = 'none';

                        const parent = t.parentElement;

                        if (parent) {
                          parent.innerHTML =
                            '<span style="color:white;font-weight:900;font-size:1.3rem;font-family:serif;">K</span>';
                        }
                      }}
                    />

                  </div>

                  <div>
                    <div className="font-bold text-lg font-montserrat tracking-tight">
                      The Kornu Family
                    </div>

                    <div className="text-[#D0E6FF] text-xs uppercase tracking-[0.18em]">
                      Family Portal
                    </div>
                  </div>

                </div>

                {/* Welcome Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md mb-5">

                  <ShieldCheck
                    size={15}
                    className="text-[#51A2FF]"
                  />

                  <span className="text-xs font-semibold text-white/90">
                    Private Family Space
                  </span>

                </div>

                {/* Heading */}
                <h2 className="font-montserrat text-4xl lg:text-[2.8rem] font-bold mb-5 leading-[1.1] tracking-tight">
                  Welcome back
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#51A2FF] via-[#D0E6FF] to-[#E9D5FF]">
                    to the family.
                  </span>
                </h2>

                <p className="text-white/75 text-base leading-relaxed max-w-md">
                  Sign in to access your family portal, share stories,
                  view private content, manage events, and stay
                  connected with the Kornu family.
                </p>

              </div>

              {/* =================================================
                  FEATURES
              ================================================== */}
              <div className="space-y-4">

                {[
                  {
                    title: 'Private Family Gallery',
                    desc: 'Access exclusive family photos',
                  },
                  {
                    title: 'Family Message Board',
                    desc: 'Share news and updates',
                  },
                  {
                    title: 'Event Management',
                    desc: 'RSVP and stay updated',
                  },
                  {
                    title: 'Family Tree',
                    desc: 'Explore your family lineage',
                  },
                ].map(({ title, desc }) => (

                  <div
                    key={title}
                    className="flex items-center gap-3"
                  >

                    <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm flex items-center justify-center">

                      <CheckCircle2
                        size={15}
                        className="text-[#51A2FF]"
                      />

                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        {title}
                      </p>

                      <p className="text-xs text-white/55">
                        {desc}
                      </p>
                    </div>

                  </div>

                ))}

              </div>

              {/* Bottom Security Note */}
              <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-2">

                <LockKeyhole
                  size={14}
                  className="text-[#51A2FF]"
                />

                <span className="text-xs text-white/55">
                  Your family space is private and protected.
                </span>

              </div>

            </div>
          </div>

          {/* =====================================================
              RIGHT SIDE — SIGN IN FORM
          ====================================================== */}
          <div className="p-7 sm:p-9 lg:p-12 flex flex-col justify-center">

            {/* Back to Home */}
            <button
              onClick={handleBackHome}
              className="flex items-center gap-2 text-[#52667A] hover:text-[#51a2ff] text-sm mb-10 transition-colors w-fit group"
            >

              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />

              Back to Home

            </button>

            {/* =================================================
                HEADING
            ================================================== */}
            <div className="mb-8">

              <div className="flex items-center gap-3 mb-4">

                <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D0E6FF] to-[#E9D5FF]">

                  <LockKeyhole
                    size={21}
                    strokeWidth={2.2}
                    className="text-[#023570]"
                  />

                </div>

                <div>

                  <span className="block text-xs font-bold text-[#6A1B9A] uppercase tracking-[0.18em]">
                    Family Portal
                  </span>

                  <span className="text-xs text-[#52667A]">
                    Secure member access
                  </span>

                </div>

              </div>

              <h2 className="font-montserrat text-3xl lg:text-4xl font-bold text-[#102A43] mb-3 tracking-tight">
                Sign In
              </h2>

              <p className="text-[#52667A] text-sm leading-relaxed max-w-md">
                For Kornu family members only. Sign in to continue
                to your private family space.
              </p>

            </div>

            {/* =================================================
                FORM
            ================================================== */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Email */}
              <div>

                <label className="block text-sm font-semibold text-[#102A43] mb-2">
                  Email Address
                </label>

                <div className="relative">

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@kornu.family"
                    className="w-full bg-[#F8FAFC] border border-[#D9E4F0] text-[#102A43] placeholder:text-[#94A3B8] rounded-2xl px-4 py-3.5 outline-none transition-all focus:border-[#51A2FF] focus:ring-4 focus:ring-[#51A2FF]/10 focus:bg-white"
                    required
                  />

                </div>

              </div>

              {/* Password */}
              <div>

                <label className="block text-sm font-semibold text-[#102A43] mb-2">
                  Password
                </label>

                <div className="relative">

                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-[#F8FAFC] border border-[#D9E4F0] text-[#102A43] placeholder:text-[#94A3B8] rounded-2xl px-4 py-3.5 pr-12 outline-none transition-all focus:border-[#51A2FF] focus:ring-4 focus:ring-[#51A2FF]/10 focus:bg-white"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#52667A] hover:text-[#023570] transition-colors"
                    aria-label={
                      showPass
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showPass ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm flex items-start gap-3">

                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">

                    <span className="text-red-500 font-bold text-xs">
                      !
                    </span>

                  </div>

                  <div>
                    <p className="font-semibold mb-0.5">
                      Sign in failed
                    </p>

                    <p className="text-red-500/90">
                      {error}
                    </p>
                  </div>

                </div>
              )}

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center gap-2 justify-center py-4 px-6 text-base font-semibold text-white rounded-full bg-gradient-to-r from-[#023570] via-[#0757A6] to-[#2E1065] hover:from-[#03458F] hover:via-[#0868C7] hover:to-[#3D1785] shadow-lg shadow-[#023570]/20 hover:shadow-xl hover:shadow-[#023570]/25 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-lg"
              >

                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn size={18} />
                )}

                {loading
                  ? 'Signing In...'
                  : 'Sign In to Portal'}

              </button>

            </form>

            {/* =================================================
                REQUEST ACCESS
            ================================================== */}
            <div className="mt-7 text-center">

              <p className="text-sm text-[#52667A]">

                Not a member?{' '}

                <button
                  type="button"
                  onClick={handleRequestAccess}
                  className="text-[#023570] font-semibold hover:text-[#51a2ff] transition-colors"
                >
                  Request Access
                </button>

              </p>

            </div>

            {/* Security Footer */}
            <div className="mt-8 pt-6 border-t border-[#E5EAF0]">

              <div className="flex items-center justify-center gap-2 text-xs text-[#7A8A9A]">

                <LockKeyhole
                  size={13}
                  className="text-[#51A2FF]"
                />

                <span>
                  Private access for Kornu family members
                </span>

              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}