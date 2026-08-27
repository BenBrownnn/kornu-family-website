import { useState } from 'react';
import { useStore } from '../store/useStore';
import { LogIn, Eye, EyeOff, Shield, ArrowLeft } from 'lucide-react';

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
    await new Promise(r => setTimeout(r, 800));
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      setCurrentPage('portal');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-4xl">
        <div className="grid md:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Left Side - Image & Brand */}
          <div className="relative hidden md:block">
            <img
              src="/images/hero-bg.jpg"
              alt="Kornu Family"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/80 via-pink-600/70 to-purple-700/80" />
            <div className="relative z-10 p-10 h-full flex flex-col justify-between text-white">
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 overflow-hidden flex items-center justify-center">
                    <img src="/images/kornu-logo.png" alt="Kornu" className="w-full h-full object-cover"
                      onError={(e) => {
                        const t = e.target as HTMLImageElement;
                        t.style.display = 'none';
                        t.parentElement!.innerHTML = '<span style="color:white;font-weight:900;font-size:1.3rem;font-family:serif;">K</span>';
                      }}
                    />
                  </div>
                  <div>
                    <div className="font-bold text-lg font-montserrat">The Kornu Family</div>
                    <div className="text-white/70 text-xs">Family Portal</div>
                  </div>
                </div>
                <h2 className="font-montserrat text-4xl font-bold mb-4 leading-tight">
                  Welcome back to the family
                </h2>
                <p className="text-white/80 text-base leading-relaxed">
                  Sign in to access your family portal, share stories, view private content, and stay connected with the Kornu family.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { title: 'Private Family Gallery', desc: 'Access exclusive photos' },
                  { title: 'Family Message Board', desc: 'Share news & updates' },
                  { title: 'Event Management', desc: 'RSVP and manage events' },
                  { title: 'Family Tree', desc: 'Explore your lineage' },
                ].map(({ title, desc }) => (
                  <div key={title} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-300 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">{title}</p>
                      <p className="text-xs text-white/60">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="p-8 md:p-10">
            <button
              onClick={() => { setCurrentPage('home'); window.scrollTo({ top: 0 }); }}
              className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mb-8 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Home
            </button>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={20} className="text-orange-500" />
                <span className="text-sm font-semibold text-orange-500 uppercase tracking-widest">Family Portal</span>
              </div>
              <h2 className="font-montserrat text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
              <p className="text-gray-500 text-sm">
                For Kornu family members only. Contact admin if you need access.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@kornu.family"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input-field pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm flex items-center gap-2">
                  <span className="text-red-400">!</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center py-4 text-base disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn size={18} />
                )}
                {loading ? 'Signing In...' : 'Sign In to Portal'}
              </button>
            </form>

           <div className="mt-6 text-center">
  <p className="text-sm text-gray-500">
    Not a member?{' '}
    <a
      href="https://www.google.com"
      className="text-orange-500 font-semibold hover:text-orange-600 transition-colors"
    >
      Request Access
    </a>
  </p>
</div>
          </div>
        </div>
      </div>
    </div>
  );
}
