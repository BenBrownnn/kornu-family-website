import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function RequestAccessPage() {
  const { setCurrentPage } = useStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase
      .from('access_requests')
      .insert({
        full_name: fullName,
        email,
        phone: phone || null,
        relationship,
        reason: reason || null,
        status: 'pending',
      });

    setLoading(false);

    if (error) {
      console.error(error);
      setError('We could not submit your request. Please try again.');
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 md:p-10 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle className="text-green-500" size={34} />
          </div>

          <h1 className="font-montserrat text-3xl font-bold text-gray-900 mb-3">
            Request Submitted
          </h1>

          <p className="text-gray-500 leading-relaxed mb-8">
            Thank you for your request. A family administrator will review your
            information and contact you regarding your portal access.
          </p>

          <button
            onClick={() => setCurrentPage('signin')}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3.5 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 p-4 pt-28 pb-12">
      <div className="w-full max-w-2xl mx-auto">
        <button
          onClick={() => setCurrentPage('signin')}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Sign In
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          <div className="mb-8">
            <div className="text-sm font-semibold text-orange-500 uppercase tracking-widest mb-2">
              Family Portal
            </div>

            <h1 className="font-montserrat text-3xl font-bold text-gray-900 mb-3">
              Request Access
            </h1>

            <p className="text-gray-500 leading-relaxed">
              Fill out the form below if you are a member of the Kornu family
              and would like access to the private family portal.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Your phone number"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Relationship to the Kornu Family *
              </label>
              <input
                type="text"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="e.g. Son, Daughter, Brother, Sister"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Why are you requesting access?
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Tell us briefly about your request..."
                rows={4}
                className="input-field resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
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
                <Send size={18} />
              )}

              {loading ? 'Submitting Request...' : 'Submit Access Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}