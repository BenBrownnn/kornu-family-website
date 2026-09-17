import { useEffect, useState } from 'react';
import {
  Search,
  MapPin,
  Users,
  Heart,
  BookOpen,
  Sprout,
  ChevronDown,
  X,
  Bird,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabaseClient';
import Footer from '../components/Footer';

const GENERATIONS = [
  'All',
  'Generation 1',
  'Generation 2',
  'Generation 3',
  'Generation 4',
  'Generation 5',
  'Generation 6',
];

const GENERATION_META: Record<
  string,
  {
    title: string;
    subtitle: string;
    color: string;
  }
> = {
  'Generation 1': {
    title: 'The Founders',
    subtitle: 'The generation that began our family story',
    color: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  'Generation 2': {
    title: 'The Second Generation',
    subtitle: 'The children who carried the family forward',
    color: 'bg-orange-50 text-orange-800 border-orange-200',
  },
  'Generation 3': {
    title: 'The Third Generation',
    subtitle: 'A new generation of Kornu family members',
    color: 'bg-green-50 text-green-800 border-green-200',
  },
  'Generation 4': {
    title: 'The Fourth Generation',
    subtitle: 'Growing the family legacy',
    color: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  'Generation 5': {
    title: 'The Fifth Generation',
    subtitle: 'The next chapter of our family',
    color: 'bg-purple-50 text-purple-800 border-purple-200',
  },
  'Generation 6': {
    title: 'The Sixth Generation',
    subtitle: 'The newest branches of our family tree',
    color: 'bg-pink-50 text-pink-800 border-pink-200',
  },
};

const FAMILY_VALUES = [
  {
    icon: Heart,
    title: 'Love',
    description:
      'We cherish one another and keep family bonds strong through every generation.',
  },
  {
    icon: BookOpen,
    title: 'Heritage',
    description:
      'We preserve our history, stories, traditions, and the wisdom passed down to us.',
  },
  {
    icon: Users,
    title: 'Unity',
    description:
      'We stand together, support one another, and celebrate every member of our family.',
  },
  {
    icon: Sprout,
    title: 'Legacy',
    description:
      'We nurture the next generation so the Kornu family story continues to grow.',
  },
];

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  age?: number | null;
  bio?: string | null;
  image?: string | null;
  generation: number;
  birthDate?: string | null;
  dateOfPassing?: string | null;
  location?: string | null;
  occupation?: string | null;
  tags?: string[];
}

function normalizeTags(value: unknown): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((tag) => String(tag).trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);

      if (Array.isArray(parsed)) {
        return parsed
          .map((tag) => String(tag).trim())
          .filter(Boolean);
      }
    } catch {
      // Continue with comma-separated parsing.
    }

    return trimmed
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

export default function FamilyPage() {
  const { setCurrentPage } = useStore();

  const [search, setSearch] = useState('');
  const [genFilter, setGenFilter] = useState('All');
  const [selected, setSelected] = useState<string | null>(null);
  const [dbMembers, setDbMembers] = useState<FamilyMember[]>([]);
  const [expandedGenerations, setExpandedGenerations] = useState<
    Record<number, boolean>
  >({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
  });

  const handleNav = (page: string) => {
    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('generation', { ascending: true });

      if (error) {
        console.error('Error fetching family members:', error);
        return;
      }

      const members: FamilyMember[] = (data || []).map((member: any) => ({
        id: member.id,
        name:
          member.name ||
          [member.first_name, member.last_name]
            .filter(Boolean)
            .join(' ') ||
          'Family Member',
        role: member.role || member.relationship || 'Family Member',
        age: member.age ?? null,
        bio: member.bio ?? null,
        image: member.image ?? member.avatar ?? null,
        generation: Number(member.generation) || 1,
        birthDate: member.birth_date ?? null,
        dateOfPassing: member.date_of_passing ?? null,
        location: member.location ?? null,
        occupation: member.occupation ?? null,
        tags: normalizeTags(member.tags),
      }));

      setDbMembers(members);
    };

    fetchMembers();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelected(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const filtered = dbMembers.filter((member) => {
    const searchTerm = search.toLowerCase().trim();

    const matchesSearch =
      !searchTerm ||
      member.name.toLowerCase().includes(searchTerm) ||
      member.role.toLowerCase().includes(searchTerm) ||
      (member.occupation || '').toLowerCase().includes(searchTerm) ||
      (member.location || '').toLowerCase().includes(searchTerm) ||
      (member.bio || '').toLowerCase().includes(searchTerm) ||
      (member.tags || []).some((tag) =>
        tag.toLowerCase().includes(searchTerm)
      );

    const matchesGeneration =
      genFilter === 'All' ||
      genFilter === `Generation ${member.generation}`;

    return matchesSearch && matchesGeneration;
  });

  const selectedMember = dbMembers.find(
    (member) => member.id === selected
  );

  const toggleGeneration = (generation: number) => {
    setExpandedGenerations((previous) => ({
      ...previous,
      [generation]: !previous[generation],
    }));
  };

  const formatDate = (date?: string | null) => {
    if (!date) return '';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const calculateAge = (
    birthDate?: string | null,
    dateOfPassing?: string | null
  ) => {
    if (!birthDate) return null;

    const birth = new Date(birthDate);

    if (Number.isNaN(birth.getTime())) {
      return null;
    }

    const endDate = dateOfPassing
      ? new Date(dateOfPassing)
      : new Date();

    if (Number.isNaN(endDate.getTime())) {
      return null;
    }

    let age = endDate.getFullYear() - birth.getFullYear();

    const monthDifference =
      endDate.getMonth() - birth.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        endDate.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age >= 0 ? age : null;
  };

  const getMemberAge = (member: FamilyMember) => {
    if (member.age !== null && member.age !== undefined) {
      return member.age;
    }

    return calculateAge(
      member.birthDate,
      member.dateOfPassing
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF5EE] text-[#102A43]">

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden min-h-[520px] flex items-center text-white">

        {/* Previous Family Image */}
        <img
          src="/images/family-gathering.webp"
          alt="The Kornu Family"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Main Blue Overlay */}
        <div className="absolute inset-0 bg-[#023570]/20" />

        {/* Blue / Purple Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#023570]/95 via-[#0B4A8B]/70 to-[#2E1065]/60" />

        {/* Subtle Light Effects */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#51A2FF]/20 blur-3xl" />

        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#E9D5FF]/20 blur-3xl" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-24 md:py-32 w-full">
          <div className="max-w-3xl">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-blue-100 text-sm font-medium mb-6 backdrop-blur-sm">
              <Users size={16} />
              The Kornu Family
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 font-['Montserrat']">
              Our Family
            </h1>

            <p className="text-lg md:text-xl text-blue-100 leading-relaxed max-w-2xl">
              Meet the people who make the Kornu family what it is
              connected by love, heritage, memories, and generations
              of shared stories.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">

              <button
                onClick={() => handleNav('home')}
                className="px-5 py-3 rounded-full bg-white text-[#023570] font-semibold hover:bg-blue-50 transition-all"
              >
                Back to Home
              </button>

              <button
                onClick={() => {
                  const familySection =
                    document.getElementById('family-members');

                  familySection?.scrollIntoView({
                    behavior: 'smooth',
                  });
                }}
                className="px-5 py-3 rounded-full border border-white/30 bg-white/10 text-white font-semibold hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                Meet the Family
              </button>

            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FAMILY INTRODUCTION
      ========================================================= */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4">

          <div className="grid md:grid-cols-2 gap-10 items-center">

            <div>
              <span className="text-[#6A1B9A] text-sm font-bold uppercase tracking-widest">
                One Family · Many Generations
              </span>

              <h2 className="text-3xl md:text-4xl font-black mt-3 mb-5 font-['Montserrat']">
                Our story lives through every generation
              </h2>

              <p className="text-[#52667A] leading-relaxed mb-5">
                From the elders who laid the foundation to the
                youngest members carrying the family forward, every
                person has a special place in the Kornu story.
              </p>

              <p className="text-[#52667A] leading-relaxed">
                Explore our family members, discover their stories,
                and celebrate the connections that make our family
                strong.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">

              <div className="rounded-3xl bg-white p-6 shadow-sm border border-blue-100">
                <Users
                  size={28}
                  className="text-[#51A2FF] mb-4"
                />

                <div className="text-3xl font-black text-[#023570]">
                  {dbMembers.length}
                </div>

                <div className="text-sm text-[#52667A] mt-1">
                  Family Members
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm border border-purple-100">
                <Sprout
                  size={28}
                  className="text-[#6A1B9A] mb-4"
                />

                <div className="text-3xl font-black text-[#023570]">
                  6
                </div>

                <div className="text-sm text-[#52667A] mt-1">
                  Generations
                </div>
              </div>

              <div className="col-span-2 rounded-3xl bg-gradient-to-r from-[#D0E6FF] to-[#E9D5FF] p-6">
                <div className="flex items-center gap-3">

                  <Heart
                    size={28}
                    className="text-[#6A1B9A]"
                  />

                  <div>
                    <div className="font-bold text-[#023570]">
                      Connected by Love
                    </div>

                    <div className="text-sm text-[#52667A] mt-1">
                      Our family grows stronger together.
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FAMILY MEMBERS
      ========================================================= */}
      <section
        id="family-members"
        className="py-16 md:py-20 bg-white"
      >
        <div className="max-w-6xl mx-auto px-4">

          <div className="text-center max-w-2xl mx-auto mb-10">

            <span className="text-[#6A1B9A] text-sm font-bold uppercase tracking-widest">
              Meet the Kornus
            </span>

            <h2 className="text-3xl md:text-4xl font-black mt-3 mb-4 font-['Montserrat']">
              Family Members
            </h2>

            <p className="text-[#52667A]">
              Search for a family member or browse through the
              different generations.
            </p>

          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">

              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by name, role, occupation or location..."
                className="w-full rounded-2xl border border-gray-200 bg-[#FAF5EE] pl-12 pr-4 py-4 outline-none focus:border-[#51A2FF] focus:ring-4 focus:ring-blue-100 transition-all"
              />

            </div>
          </div>

          {/* Generation Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">

            {GENERATIONS.map((generation) => (
              <button
                key={generation}
                onClick={() => setGenFilter(generation)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  genFilter === generation
                    ? 'bg-[#023570] text-white shadow-md'
                    : 'bg-[#FAF5EE] text-[#52667A] hover:bg-[#D0E6FF]'
                }`}
              >
                {generation}
              </button>
            ))}

          </div>

          {/* All Generations */}
          {genFilter === 'All' ? (
            <div className="space-y-12">

              {GENERATIONS.slice(1).map((generation) => {

                const generationNumber = Number(
                  generation.replace('Generation ', '')
                );

                const members = filtered.filter(
                  (member) =>
                    member.generation === generationNumber
                );

                if (members.length === 0) {
                  return null;
                }

                const meta =
                  GENERATION_META[generation];

                const isExpanded =
                  expandedGenerations[generationNumber];

                return (
                  <div key={generation}>

                    <button
                      type="button"
                      onClick={() =>
                        toggleGeneration(generationNumber)
                      }
                      className="w-full flex items-center justify-between text-left mb-6 group"
                    >
                      <div>

                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${meta.color}`}
                        >
                          Generation {generationNumber}
                        </div>

                        <h3 className="text-2xl md:text-3xl font-black mt-3 font-['Montserrat']">
                          {meta.title}
                        </h3>

                        <p className="text-[#52667A] mt-1">
                          {meta.subtitle}
                        </p>

                      </div>

                      <div className="flex items-center gap-2 text-[#52667A]">

                        <span className="hidden sm:block text-sm">
                          {members.length}{' '}
                          {members.length === 1
                            ? 'member'
                            : 'members'}
                        </span>

                        <ChevronDown
                          size={22}
                          className={`transition-transform ${
                            isExpanded
                              ? 'rotate-180'
                              : ''
                          }`}
                        />

                      </div>
                    </button>

                    {isExpanded && (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

                        {members.map((member) => (
                          <button
                            type="button"
                            key={member.id}
                            onClick={() =>
                              setSelected(member.id)
                            }
                            className="member-card cursor-pointer group text-left"
                          >
                            <div className="bg-[#FAF5EE] rounded-3xl overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 h-full">

                              <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#D0E6FF] to-[#E9D5FF]">

                                {member.image ? (
                                  <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Users
                                      size={52}
                                      className="text-[#51A2FF]"
                                    />
                                  </div>
                                )}

                                {member.dateOfPassing && (
                                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-semibold backdrop-blur-sm">
                                    In Memory
                                  </div>
                                )}

                                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />

                              </div>

                              <div className="p-5">

                                <div className="text-xs font-bold uppercase tracking-wider text-[#6A1B9A] mb-1">
                                  {member.role}
                                </div>

                                <h4 className="text-xl font-black text-[#023570] font-['Montserrat']">
                                  {member.name}
                                </h4>

                                {member.occupation && (
                                  <p className="text-sm text-[#52667A] mt-1">
                                    {member.occupation}
                                  </p>
                                )}

                                {member.location && (
                                  <div className="flex items-center gap-1.5 mt-3 text-sm text-[#52667A]">
                                    <MapPin size={15} />
                                    <span>
                                      {member.location}
                                    </span>
                                  </div>
                                )}

                                <div className="mt-4 flex items-center justify-between">

                                  <span className="text-xs font-semibold text-[#52667A]">
                                    View Details
                                  </span>

                                  <span className="w-8 h-8 rounded-full bg-[#D0E6FF] flex items-center justify-center text-[#023570] group-hover:bg-[#51A2FF] group-hover:text-white transition-colors">
                                    →
                                  </span>

                                </div>

                              </div>
                            </div>
                          </button>
                        ))}

                      </div>
                    )}

                  </div>
                );
              })}

            </div>
          ) : (
            <div>

              <div className="mb-6">

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D0E6FF] text-[#023570] text-xs font-bold uppercase tracking-wider">
                  {genFilter}
                </div>

                <h3 className="text-2xl md:text-3xl font-black mt-3 font-['Montserrat']">
                  {GENERATION_META[genFilter]?.title ||
                    genFilter}
                </h3>

                <p className="text-[#52667A] mt-1">
                  {GENERATION_META[genFilter]?.subtitle}
                </p>

              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

                {filtered.map((member) => (
                  <button
                    type="button"
                    key={member.id}
                    onClick={() =>
                      setSelected(member.id)
                    }
                    className="member-card cursor-pointer group text-left"
                  >
                    <div className="bg-[#FAF5EE] rounded-3xl overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 h-full">

                      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#D0E6FF] to-[#E9D5FF]">

                        {member.image ? (
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users
                              size={52}
                              className="text-[#51A2FF]"
                            />
                          </div>
                        )}

                        {member.dateOfPassing && (
                          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-semibold backdrop-blur-sm">
                            In Memory
                          </div>
                        )}

                      </div>

                      <div className="p-5">

                        <div className="text-xs font-bold uppercase tracking-wider text-[#6A1B9A] mb-1">
                          {member.role}
                        </div>

                        <h4 className="text-xl font-black text-[#023570] font-['Montserrat']">
                          {member.name}
                        </h4>

                        {member.occupation && (
                          <p className="text-sm text-[#52667A] mt-1">
                            {member.occupation}
                          </p>
                        )}

                        {member.location && (
                          <div className="flex items-center gap-1.5 mt-3 text-sm text-[#52667A]">
                            <MapPin size={15} />
                            <span>
                              {member.location}
                            </span>
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-between">

                          <span className="text-xs font-semibold text-[#52667A]">
                            View Details
                          </span>

                          <span className="w-8 h-8 rounded-full bg-[#D0E6FF] flex items-center justify-center text-[#023570] group-hover:bg-[#51A2FF] group-hover:text-white transition-colors">
                            →
                          </span>

                        </div>

                      </div>
                    </div>
                  </button>
                ))}

              </div>
            </div>
          )}

          {/* No Results */}
          {filtered.length === 0 && (
            <div className="py-16 text-center">

              <Users
                size={42}
                className="mx-auto mb-4 text-gray-300"
              />

              <h3 className="text-lg font-semibold text-gray-700">
                No family members found
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                Try adjusting your search or generation filter.
              </p>

              {(search || genFilter !== 'All') && (
                <button
                  onClick={() => {
                    setSearch('');
                    setGenFilter('All');
                  }}
                  className="mt-5 px-5 py-2.5 rounded-full bg-[#023570] text-white text-sm font-semibold hover:bg-[#51A2FF] transition-colors"
                >
                  Clear Filters
                </button>
              )}

            </div>
          )}

        </div>
      </section>

      {/* =========================================================
          FAMILY VALUES
      ========================================================= */}
      <section className="py-16 md:py-20 bg-[#FAF5EE]">
        <div className="max-w-6xl mx-auto px-4">

          <div className="text-center max-w-2xl mx-auto mb-12">

            <span className="text-[#6A1B9A] text-sm font-bold uppercase tracking-widest">
              What Holds Us Together
            </span>

            <h2 className="text-3xl md:text-4xl font-black mt-3 mb-4 font-['Montserrat']">
              Our Family Values
            </h2>

            <p className="text-[#52667A]">
              These values have guided the Kornu family through
              generations and continue to shape our future.
            </p>

          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {FAMILY_VALUES.map((value) => {
              const Icon = value.icon;

              return (
                <div
                  key={value.title}
                  className="bg-white rounded-3xl p-7 border border-gray-100 hover:shadow-lg transition-all"
                >

                  <div className="w-12 h-12 rounded-2xl bg-[#D0E6FF] flex items-center justify-center mb-5">
                    <Icon
                      size={24}
                      className="text-[#023570]"
                    />
                  </div>

                  <h3 className="text-xl font-black text-[#023570] font-['Montserrat'] mb-2">
                    {value.title}
                  </h3>

                  <p className="text-sm text-[#52667A] leading-relaxed">
                    {value.description}
                  </p>

                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* =========================================================
          FAMILY LEGACY
      ========================================================= */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-[#023570] to-[#2E1065] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">

          <BookOpen
            size={42}
            className="mx-auto mb-6 text-[#51A2FF]"
          />

          <h2 className="text-3xl md:text-4xl font-black font-['Montserrat'] mb-5">
            Every Branch Tells a Story
          </h2>

          <p className="text-blue-100 leading-relaxed max-w-2xl mx-auto">
            From the oldest family stories to the newest memories,
            every member contributes something unique to the Kornu
            legacy. Together, we continue building a story worth
            remembering.
          </p>

          <button
            onClick={() => handleNav('stories')}
            className="mt-8 px-6 py-3 rounded-full bg-white text-[#023570] font-bold hover:bg-blue-50 transition-all"
          >
            Explore Family Stories
          </button>

        </div>
      </section>

      {/* =========================================================
          MEMBER DETAILS MODAL
      ========================================================= */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >

          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >

            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 z-10 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-600 hover:text-[#023570] hover:bg-white transition-colors"
              aria-label="Close member details"
            >
              <X size={20} />
            </button>

            <div className="relative">

              <div className="h-64 md:h-80 bg-gradient-to-br from-[#D0E6FF] to-[#E9D5FF]">

                {selectedMember.image ? (
                  <img
                    src={selectedMember.image}
                    alt={selectedMember.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Users
                      size={72}
                      className="text-[#51A2FF]"
                    />
                  </div>
                )}

                {selectedMember.dateOfPassing && (
                  <div className="absolute bottom-5 left-5 flex items-center gap-2 px-4 py-2 rounded-full bg-black/65 text-white text-sm font-semibold backdrop-blur-sm">
                    <Bird size={16} />
                    Blessed Memory
                  </div>
                )}

              </div>
            </div>

            <div className="p-6 md:p-8">

              <div className="text-sm font-bold uppercase tracking-widest text-[#6A1B9A] mb-2">
                {selectedMember.role}
              </div>

              <h2 className="text-3xl md:text-4xl font-black text-[#023570] font-['Montserrat']">
                {selectedMember.name}
              </h2>

              {selectedMember.occupation && (
                <p className="text-[#52667A] mt-2 text-lg">
                  {selectedMember.occupation}
                </p>
              )}

              <div className="grid sm:grid-cols-2 gap-4 mt-7">

                {getMemberAge(selectedMember) !== null && (
                  <div className="rounded-2xl bg-[#FAF5EE] p-4">

                    <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Age
                    </div>

                    <div className="font-semibold text-[#023570]">
                      {getMemberAge(selectedMember)}
                    </div>

                  </div>
                )}

                {selectedMember.generation && (
                  <div className="rounded-2xl bg-[#FAF5EE] p-4">

                    <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Generation
                    </div>

                    <div className="font-semibold text-[#023570]">
                      Generation {selectedMember.generation}
                    </div>

                  </div>
                )}

                {selectedMember.location && (
                  <div className="rounded-2xl bg-[#FAF5EE] p-4">

                    <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Location
                    </div>

                    <div className="flex items-center gap-2 font-semibold text-[#023570]">
                      <MapPin size={16} />
                      {selectedMember.location}
                    </div>

                  </div>
                )}

                {selectedMember.birthDate && (
                  <div className="rounded-2xl bg-[#FAF5EE] p-4">

                    <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Born
                    </div>

                    <div className="font-semibold text-[#023570]">
                      {formatDate(selectedMember.birthDate)}
                    </div>

                  </div>
                )}

                {selectedMember.dateOfPassing && (
                  <div className="rounded-2xl bg-[#FAF5EE] p-4">

                    <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Passed
                    </div>

                    <div className="font-semibold text-[#023570]">
                      {formatDate(
                        selectedMember.dateOfPassing
                      )}
                    </div>

                  </div>
                )}

              </div>

              {selectedMember.bio && (
                <div className="mt-7">

                  <h3 className="text-lg font-black text-[#023570] mb-2 font-['Montserrat']">
                    About
                  </h3>

                  <p className="text-[#52667A] leading-relaxed">
                    {selectedMember.bio}
                  </p>

                </div>
              )}

              {selectedMember.tags &&
                selectedMember.tags.length > 0 && (
                  <div className="mt-7">

                    <h3 className="text-lg font-black text-[#023570] mb-3 font-['Montserrat']">
                      Family Tags
                    </h3>

                    <div className="flex flex-wrap gap-2">

                      {selectedMember.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1.5 rounded-full bg-[#D0E6FF] text-[#023570] text-xs font-semibold"
                        >
                          {tag}
                        </span>
                      ))}

                    </div>
                  </div>
                )}

              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">

                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="px-5 py-2.5 rounded-full bg-[#023570] text-white font-semibold hover:bg-[#51A2FF] transition-colors"
                >
                  Close
                </button>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          SHARED FOOTER
      ========================================================= */}
      <Footer />

    </div>
  );
}