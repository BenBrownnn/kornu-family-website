import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { familyMembers } from '../data/familyData';
import { Search, MapPin, Users, Heart, BookOpen, Sprout } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

  const GENERATIONS = ['All', 'Generation 1', 'Generation 2', 'Generation 3', 'Generation 4', 'Generation 5', 'Generation 6'];

const GENERATION_META: Record<number, { label: string; badge: string; accent: string }> = {
  1: { label: 'Founders', badge: 'bg-amber-600', accent: 'text-amber-600' },
  2: { label: 'Parents', badge: 'bg-rose-600', accent: 'text-rose-600' },
  3: { label: 'Grandchildren', badge: 'bg-sky-600', accent: 'text-sky-600' },
  4: { label: 'Great-Grandchildren', badge: 'bg-emerald-600', accent: 'text-emerald-600' },
  5: { label: 'Great-Great-Grandchildren', badge: 'bg-violet-600', accent: 'text-violet-600' },
  6: { label: 'Great-Great-Great-Grandchildren', badge: 'bg-cyan-600', accent: 'text-cyan-600' },
};

const FAMILY_VALUES = [
  { icon: Heart, title: 'Love', desc: 'Unconditional love binds us across every distance' },
  { icon: Users, title: 'Unity', desc: 'We stand together in strength and celebration' },
  { icon: BookOpen, title: 'Education', desc: 'Knowledge is the greatest inheritance we pass on' },
  { icon: Sprout, title: 'Service', desc: 'We serve our communities with open hearts' },
];

export default function FamilyPage() {
  const { setCurrentPage } = useStore();
  const [search, setSearch] = useState('');
  const [genFilter, setGenFilter] = useState('All');
  const [selected, setSelected] = useState<string | null>(null);
  const [dbMembers, setDbMembers] = useState<any[]>([]);

  const allMembers = [...dbMembers, ...familyMembers];

  const filtered = allMembers.filter((m) => {
    const query = search.toLowerCase();
    const matchSearch =
      m.name.toLowerCase().includes(query) ||
      m.role.toLowerCase().includes(query) ||
      (m.occupation || '').toLowerCase().includes(query);
    const matchGen = genFilter === 'All' || `Generation ${m.generation}` === genFilter;
    return matchSearch && matchGen;
  });

  const selectedMember = allMembers.find((m) => m.id === selected);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.src = '/images/placeholder.jpg';
};

  const handleNav = (page: string) => {
    setCurrentPage(page);
  };
useEffect(() => {
 const fetchMembers = async () => {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('generation', { ascending: true });

  if (!error && data) {
    setDbMembers(
      data.map((m: any) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        age: m.age,
        bio: m.bio,
        image: m.image,
        generation: m.generation,
        birthDate: m.birth_date,
        dateOfPassing: m.date_of_passing,
        location: m.location,
        occupation: m.occupation,
        tags: Array.isArray(m.tags) ? m.tags : [],
      }))
    );
  }
};
  fetchMembers();
}, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="pt-24 pb-12 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="/images/family-gathering.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <div className="inline-block bg-orange-500/15 text-orange-300 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            Our People
          </div>
          <h1 className="font-['Montserrat'] text-5xl font-bold text-white mb-4">Meet the Kornu Family</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Four generations, eight countries, one unbreakable bond. Every face here is a chapter in our family story.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Family Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
       {([1, 2, 3, 4, 5, 6] as const).map((gen) => {
            const meta = GENERATION_META[gen];
            const count = allMembers.filter((m) => m.generation === gen).length;
            return (
              <div key={gen} className="bg-white border border-gray-200 rounded-2xl p-5 text-center">
                <div className={`w-2 h-2 rounded-full ${meta.badge} mx-auto mb-3`} />
                <div className="text-3xl font-bold font['Montserrat'] text-gray-900">{count}</div>
                <div className="text-sm font-medium text-gray-700">{meta.label}</div>
                <div className="text-xs text-gray-400">Generation {gen}</div>
              </div>
            );
          })}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search family members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-11"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {GENERATIONS.map((g) => (
              <button
                key={g}
                onClick={() => setGenFilter(g)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  genFilter === g
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((member) => {
            const meta = GENERATION_META[member.generation as 1 | 2 | 3 | 4 | 5 | 6];
            return (
              <div
                key={member.id}
                className="member-card cursor-pointer group"
                onClick={() => setSelected(member.id === selected ? null : member.id)}
              >
                <div className="relative h-56 overflow-hidden rounded-t-[20px]">
                  <img
  src={member.image}
  alt={member.name}
  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
    member.dateOfPassing ? 'grayscale-[30%]' : ''
  }`}
  onError={handleImageError}
/>
               <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
  <span className={`text-xs font-semibold px-2 py-1 rounded-full text-white ${meta.badge}`}>
    Gen {member.generation}
  </span>
  {member.dateOfPassing && (
    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-900/80 text-white flex items-center gap-1">
      🕊️ In Memory
    </span>
  )}
</div>
                  <div className="member-overlay">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <MapPin size={10} className="text-white/80" />
                        <span className="text-white/80 text-xs">{member.location}</span>
                      </div>
                      <p className="text-white text-xs">{member.occupation}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 font['Montserrat'] text-sm leading-tight">{member.name}</h3>
                  <p className={`text-xs font-medium mt-0.5 ${meta.accent}`}>{member.role}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(Array.isArray(member.tags) ? member.tags : []).slice(0, 2).map((tag: string) => (
                      <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Member Detail */}
        {selectedMember && (
          <div className="mt-12 bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 p-8">
              <div>
                <img
                  src={selectedMember.image}
                  alt={selectedMember.name}
                  className="w-full rounded-xl object-cover aspect-square"
                  onError={handleImageError}
                />
              </div>
              <div>
                <div className="mb-2">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full text-white ${GENERATION_META[selectedMember.generation as 1 | 2 | 3 | 4].badge}`}>
                    Generation {selectedMember.generation}
                  </span>
                </div>
                <h2 className="font-montserrat text-4xl font-bold text-gray-900 mb-1">{selectedMember.name}</h2>
                <p className={`text-lg font-medium ${GENERATION_META[selectedMember.generation as 1 | 2 | 3 | 4].accent} mb-6`}>
                  {selectedMember.role}
                </p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-gray-400" />
                    <span className="text-gray-700">{selectedMember.location}</span>
                  </div>

      {(selectedMember.birthDate || selectedMember.dateOfPassing) && (
  <div className="flex items-center gap-2">
    <span className="text-gray-700">
      {selectedMember.birthDate && new Date(selectedMember.birthDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
      {selectedMember.dateOfPassing && (
        <>
          {' '}– {new Date(selectedMember.dateOfPassing).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          <span className="ml-2 text-sm text-gray-400 italic">In loving memory</span>
        </>
      )}
    </span>
  </div>
)}
                  <div>
                    <p className="text-gray-600 mb-2 font-medium">Occupation</p>
                    <p className="text-gray-900">{selectedMember.occupation}</p>
                  </div>
                  {selectedMember.bio && (
                    <div>
                      <p className="text-gray-600 mb-2 font-medium">About</p>
                      <p className="text-gray-900 leading-relaxed">{selectedMember.bio}</p>
                    </div>
                  )}
                </div>
                {Array.isArray(selectedMember.tags) && selectedMember.tags.length > 0 && (
                  <div>
                    <p className="text-gray-600 mb-3 font-medium">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.tags.map((tag: string) => (
                        <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Family Values */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="font-montserrat text-3xl font-bold text-gray-900 mb-4">What Binds Us Together</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These core values have guided our family through generations and across continents.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {FAMILY_VALUES.map((value, idx) => {
              const Icon = value.icon;
              return (
                <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="inline-block bg-gray-100 p-3 rounded-full mb-4">
                    <Icon size={24} className="text-gray-900" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============ FOOTER ============ */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br items-center justify-center">
                  <img
                    src="/images/kornu-logo.png"
                    alt="Kornu"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      t.style.display = 'none';
                      t.parentElement!.innerHTML = '<span style="color:white;font-weight:900;font-size:1.3rem;font-family:serif;">K</span>';
                    }}
                  />
                </div>
                <div>
                  <div className="font-bold text-lg font-montserrat">The Kornu Family</div>
                  <div className="text-orange-400 text-xs uppercase tracking-widest">Est. 1946 · Ve-Gbodome, Ghana</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                Where every memory is treasured, every story is celebrated, and every family member is loved — always.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-widest text-gray-400 mb-4">Explore</h4>
              <ul className="space-y-2">
                {['Home', 'Our Family', 'Gallery', 'Events', 'Stories', 'Portal'].map((link) => (
                  <li key={link}>
                    <button
                      onClick={() => handleNav(link.toLowerCase().replace('our ', ''))}
                      className="text-gray-400 hover:text-orange-400 text-sm transition-colors"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-widest text-gray-400 mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Ve-Gbodome, Ghana</li>
                <li>family@kornu.family</li>
                <li className="pt-2">
                  <button
                    onClick={() => handleNav('signin')}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-xs font-semibold transition-colors"
                  >
                    Sign In to Portal
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © 2025 The Kornu Family Website. All rights reserved. Made with for our family.
            </p>
            <p className="text-gray-600 text-xs">
              "A family is a circle of strength and love" — Granpa John Lily Kornu
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}