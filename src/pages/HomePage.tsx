import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabaseClient';
import {
  ArrowRight,
  Users,
  Heart,
  LockKeyhole,
  LockKeyholeOpen,
  ChevronDown,
  MapPin,
  Star,
  PlayCircle,
  Quote,
  BookOpen,
} from 'lucide-react';
import {
  familyMembers,
  familyEvents,
  familyStories,
} from '../data/familyData';
import Footer from '../components/Footer';

type EventType =
  | 'reunion'
  | 'birthday'
  | 'celebration'
  | 'memorial'
  | 'wedding';

type FamilyEvent = {
  id: string | number;
  title: string;
  date: string;
  location: string;
  description: string;
  type: EventType;
  image?: string;
  rsvpCount?: number;
};

type FamilyMember = {
  id: string | number;
  name: string;
  role?: string;
  image?: string;
  occupation?: string;
  location?: string;
  bio?: string;
};

type FamilyStory = {
  id: string | number;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  likes: number;
  comments?: number;
  image?: string;
  tags: string[];
};

export default function HomePage() {
  const {
    setCurrentPage,
    rsvpedEvents,
    toggleRSVP,
    isAuthenticated,
    logout,
  } = useStore();

  const [dbEvents, setDbEvents] = useState<FamilyEvent[]>([]);
  const [dbMembers, setDbMembers] = useState<FamilyMember[]>([]);

  /*
   * Portal icon changes automatically based on authentication.
   * Logged out → closed lock
   * Logged in → open lock
   */
  const PortalLockIcon = isAuthenticated
    ? LockKeyholeOpen
    : LockKeyhole;

  /* =========================
     FETCH EVENTS
  ========================= */
  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching homepage events:', error);
        return;
      }

      if (data) {
        const normalizedEvents: FamilyEvent[] = data.map(
          (event) => ({
            id: event.id,
            title: event.title ?? 'Family Event',
            date: event.date ?? '',
            location:
              event.location ?? 'Location to be announced',
            description: event.description ?? '',
            type:
              event.type &&
              [
                'reunion',
                'birthday',
                'celebration',
                'memorial',
                'wedding',
              ].includes(event.type)
                ? event.type
                : 'celebration',
            image: event.image,
            rsvpCount:
              typeof event.rsvpCount === 'number'
                ? event.rsvpCount
                : undefined,
          })
        );

        setDbEvents(normalizedEvents);
      }
    };

    fetchEvents();
  }, []);

  /* =========================
     FETCH MEMBERS
  ========================= */
  useEffect(() => {
    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*');

      if (error) {
        console.error('Error fetching homepage members:', error);
        return;
      }

      if (data) {
        setDbMembers(
          data.map((member) => ({
            id: member.id,
            name: member.name ?? 'Family Member',
            role: member.role,
            image: member.image,
            occupation: member.occupation,
            location: member.location,
            bio: member.bio,
          }))
        );
      }
    };

    fetchMembers();
  }, []);

  const staticEvents: FamilyEvent[] = familyEvents.map(
    (event) => ({
      id: event.id,
      title: event.title,
      date: event.date,
      location: event.location,
      description: event.description,
      type: event.type as EventType,
      image: event.image,
      rsvpCount: event.rsvpCount,
    })
  );

  const staticMembers: FamilyMember[] = familyMembers.map(
    (member) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      image: member.image,
      occupation: member.occupation,
      location: member.location,
      bio: member.bio,
    })
  );

  const allEvents: FamilyEvent[] = [
    ...dbEvents,
    ...staticEvents,
  ];

  const allMembers: FamilyMember[] = [
    ...dbMembers,
    ...staticMembers,
  ];

  /* =========================
     RSVP
  ========================= */
  const handleRSVP = (eventId: string) => {
    if (!isAuthenticated) {
      setCurrentPage('signin');

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      return;
    }

    toggleRSVP(eventId);
  };

  /* =========================
     NAVIGATION
  ========================= */
  const handleNav = (page: string) => {
    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  /* =========================
     PORTAL ACTION
  ========================= */
  const handlePortalAction = () => {
    if (isAuthenticated) {
      logout();
      handleNav('home');
      return;
    }

    handleNav('signin');
  };

  /* =========================
     STATS
  ========================= */
  const stats = [
    {
      label: 'Family Members',
      value: '47+',
      icon: Users,
    },
    {
      label: 'Years Together',
      value: '100+',
      icon: Heart,
    },
    {
      label: 'Countries',
      value: '1',
      icon: MapPin,
    },
    {
      label: 'Generations',
      value: '6',
      icon: Star,
    },
  ];

  /* =========================
     DATE FORMAT
  ========================= */
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  /* =========================
     EVENT COLORS
  ========================= */
  const eventColors: Record<EventType, string> = {
    reunion:
      'bg-[#D0E6FF] text-[#023570]',
    birthday:
      'bg-[#E9D5FF] text-[#6A1B9A]',
    celebration:
      'bg-[#DCE7DC] text-[#315B45]',
    memorial:
      'bg-[#E8EAF6] text-[#37306B]',
    wedding:
      'bg-[#F3E8FF] text-[#6A1B9A]',
  };

  /* =========================
     STORIES
  ========================= */
  const staticStories: FamilyStory[] =
    familyStories.map((story) => ({
      id: story.id,
      title: story.title,
      author: story.author,
      date: story.date,
      excerpt: story.excerpt,
      likes: story.likes,
      comments: story.comments,
      image: story.image,
      tags: story.tags,
    }));

  return (
    <div className="min-h-screen bg-[#FAF5EE] text-[#102A43]">

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">

        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-bg.jpg"
            alt="The Kornu Family"
            className="w-full h-full object-cover"
          />

          {/* Blue / Purple overlay */}
          <div className="absolute inset-0 bg-[#023570]/65" />

          <div className="absolute inset-0 bg-gradient-to-br from-[#023570]/80 via-[#023570]/35 to-[#2E1065]/80" />

          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FAF5EE]/30" />
        </div>

        {/* Decorative blue / purple elements */}
        <div className="absolute top-1/3 left-12 w-5 h-5 rounded-full bg-[#51A2FF] opacity-60 blur-[1px]" />

        <div className="absolute top-1/2 right-16 w-3 h-3 rounded-full bg-[#C084FC] opacity-70" />

        <div className="absolute bottom-1/3 left-1/4 w-4 h-4 rounded-full bg-[#A78BFA] opacity-60" />

        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#51A2FF]/15 blur-3xl" />

        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-[#6A1B9A]/20 blur-3xl" />

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/25 shadow-md text-sm font-medium text-white mb-8"
          >
            <MapPin
              size={14}
              className="text-[#51A2FF]"
            />

            Est. 1946 &bull; Ve-Gbodome, Ghana
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.1,
            }}
            className="font-['Montserrat'] text-6xl sm:text-7xl lg:text-8xl font-extrabold mb-6 leading-none"
          >
            <span className="text-white">
              The{' '}
            </span>

            <span
              className="inline-block"
              style={{
                background:
                  'linear-gradient(90deg, #51A2FF 0%, #D8B4FE 50%, #E9D5FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Kornu
            </span>

            <br />

            <span className="text-white">
              Family
            </span>
          </motion.h1>

          {/* Underline */}
          <div className="flex justify-center mb-6">
            <svg
              width="320"
              height="12"
              viewBox="0 0 320 12"
              fill="none"
            >
              <path
                d="M0 6 Q80 12 160 6 Q240 0 320 6"
                stroke="#51A2FF"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>

          {/* Subtitle */}
          <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 font-light">
            Where every memory is treasured, every story is celebrated,
            and every family member is loved always.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

            <button
              onClick={() => handleNav('portal')}
              className="inline-flex items-center gap-2 rounded-full bg-[#51A2FF] hover:bg-white text-[#023570] px-8 py-4 text-base font-bold shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              <PortalLockIcon size={18} />

              Enter Family Portal

              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => handleNav('family')}
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 hover:bg-white hover:text-[#023570] text-white px-8 py-4 text-base font-semibold backdrop-blur-md transition-all duration-300"
            >
              <Users size={18} />

              Meet the Family
            </button>

          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/80 animate-bounce">

          <span className="text-xs font-medium uppercase tracking-widest">
            Scroll
          </span>

          <ChevronDown size={18} />

        </div>
      </section>


      {/* =====================================================
          STATS
      ===================================================== */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

            {stats.map(({ label, value, icon: Icon }, i) => (
              <div
                key={i}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-[#D0E6FF] to-[#E9D5FF] card-hover"
              >
                <Icon
                  size={28}
                  className="text-[#51A2FF] mx-auto mb-3"
                />

                <div className="text-3xl font-black text-[#023570] font-['Montserrat']">
                  {value}
                </div>

                <div className="text-sm text-[#52667A] font-medium mt-1">
                  {label}
                </div>

              </div>
            ))}

          </div>
        </div>
      </section>


      {/* =====================================================
          ABOUT
      ===================================================== */}
      <section className="py-20 bg-gradient-to-br from-[#D0E6FF]/30 via-white to-[#E9D5FF]/30">
        <div className="max-w-6xl mx-auto px-4">

          <div className="grid md:grid-cols-2 gap-16 items-center">

            {/* Image */}
            <div className="relative">

              <div className="relative rounded-3xl overflow-hidden shadow-2xl">

                <img
                  src="/images/family-tree.jpg"
                  alt="Kornu Family Heritage"
                  className="w-full h-[450px] object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#023570]/60 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6">

                  <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg">

                    <p className="font-dancing text-2xl text-[#023570] leading-tight">
                      "A family is a circle of strength and love..."
                    </p>

                    <p className="text-sm text-[#52667A] mt-1">
                      — Granpa John Lily Kornu
                    </p>

                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 float-animation">

                <div className="text-center">

                  <div className="text-2xl font-black text-[#51A2FF] font-['Montserrat']">
                    100+
                  </div>

                  <div className="text-xs text-[#52667A] font-medium">
                    Years of
                    <br />
                    Legacy
                  </div>

                </div>
              </div>
            </div>


            {/* Text */}
            <div>

              <div className="inline-block bg-[#D0E6FF] text-[#023570] px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                Our Heritage
              </div>

              <h2 className="section-title mb-4">
                A Family Built on
                <br />

                <span
                  style={{
                    background:
                      'linear-gradient(135deg, #023570, #51A2FF, #6A1B9A)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Love & Legacy
                </span>
              </h2>

              <div
                className="divider-kornu mb-6 ml-0"
                style={{
                  margin: '0 0 24px 0',
                }}
              />

              <p className="section-subtitle mb-6">
                The Kornu family traces its roots to the vibrant heart of
                Ve-Gbodome, Ghana. Founded by Granpa John Lily Kornu and Mama
                Abena in 1946, our family has grown across four generations
                and eight countries.
              </p>

              <p className="section-subtitle mb-8">
                From humble beginnings in a small family compound, the Kornu
                name has come to represent education, service, resilience,
                and above all unconditional love. Our story is one of pride,
                perseverance, and the unbreakable bonds of family.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">

                <span className="bg-white border border-[#D0E6FF] px-4 py-1.5 rounded-full text-sm text-[#52667A] shadow-sm">
                  Ghana 🇬🇭
                </span>

              </div>

              <button
                onClick={() => handleNav('family')}
                className="inline-flex items-center gap-2 rounded-full bg-[#023570] hover:bg-[#51A2FF] hover:text-[#023570] text-white px-6 py-3 font-semibold transition-all"
              >
                <Users size={18} />

                Meet All Members

                <ArrowRight size={16} />
              </button>

            </div>
          </div>
        </div>
      </section>


      {/* =====================================================
          FEATURED MEMBERS
      ===================================================== */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">

          <div className="text-center mb-12">

            <div className="inline-block bg-[#D0E6FF] text-[#023570] px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              Our People
            </div>

            <h2 className="section-title mb-3">
              Meet the Family
            </h2>

            <div className="divider-kornu" />

            <p className="section-subtitle mt-4 max-w-2xl mx-auto">
              Across generations and continents, these are the faces that make
              the Kornu family extraordinary.
            </p>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

            {allMembers.slice(0, 4).map((member) => (

              <div
                key={member.id}
                className="member-card group"
              >

                <div className="relative h-60 overflow-hidden rounded-t-[20px]">

                  <img
                    src={member.image || '/images/placeholder.jpg'}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      const target =
                        e.target as HTMLImageElement;

                      if (
                        target.src.endsWith(
                          '/images/placeholder.jpg'
                        )
                      ) {
                        return;
                      }

                      target.src =
                        '/images/placeholder.jpg';
                    }}
                  />

                  <div className="member-overlay">

                    <div>

                      <p className="text-white text-xs opacity-90">
                        {member.occupation ||
                          'Kornu Family Member'}
                      </p>

                      <p className="text-white/70 text-xs">
                        {member.location ||
                          'Kornu Family'}
                      </p>

                    </div>

                  </div>
                </div>

                <div className="p-4">

                  <h3 className="font-bold text-[#102A43] font-['Montserrat'] text-base leading-tight">
                    {member.name}
                  </h3>

                  <p className="text-[#6A1B9A] text-xs font-medium mt-0.5">
                    {member.role ||
                      'Family Member'}
                  </p>

                  <p className="text-[#52667A] text-xs mt-2 line-clamp-2">
                    {member.bio ||
                      'A valued member of the Kornu family.'}
                  </p>

                </div>
              </div>

            ))}

          </div>

          <div className="text-center mt-10">

            <button
              onClick={() => handleNav('family')}
              className="inline-flex items-center gap-2 rounded-full border border-[#023570] text-[#023570] hover:bg-[#023570] hover:text-white px-6 py-3 font-semibold transition-all"
            >
              View All {allMembers.length} Family Members

              <ArrowRight size={16} />
            </button>

          </div>

        </div>
      </section>


      {/* =====================================================
          UPCOMING EVENTS
      ===================================================== */}
      <section className="py-20 bg-gradient-to-br from-[#061A33] via-[#023570] to-[#2E1065] relative overflow-hidden">

        <div className="absolute inset-0 opacity-10">

          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 25px 25px, #51A2FF 2px, transparent 0)',
              backgroundSize: '50px 50px',
            }}
          />

        </div>

        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#51A2FF]/15 blur-3xl" />

        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#6A1B9A]/25 blur-3xl" />

        <div className="relative z-10 max-w-6xl mx-auto px-4">

          <div className="text-center mb-12">

            <div className="inline-block bg-[#51A2FF]/15 text-[#51A2FF] px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              What's Coming
            </div>

            <h2 className="section-title !text-white/90 mt-4 max-w-xl mx-auto">
              Upcoming Events
            </h2>

            <div className="divider-kornu" />

            <p className="text-white/70 mt-4 max-w-xl mx-auto">
              Mark your calendars! Here are the events that bring the Kornu
              family together.
            </p>

          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {allEvents.slice(0, 3).map((event) => (

              <div
                key={String(event.id)}
                className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 card-hover group"
              >

                {event.image && (
                  <div className="rounded-xl overflow-hidden mb-4 h-36">

                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                  </div>
                )}

                <div className="flex items-center gap-2 mb-3">

                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      eventColors[event.type] ||
                      'bg-[#D0E6FF] text-[#023570]'
                    }`}
                  >
                    {event.type.charAt(0).toUpperCase() +
                      event.type.slice(1)}
                  </span>

                  {event.rsvpCount !== undefined && (
                    <span className="text-xs text-white/50">
                      {event.rsvpCount +
                        (rsvpedEvents.includes(
                          String(event.id)
                        )
                          ? 1
                          : 0)}{' '}
                      attending
                    </span>
                  )}

                </div>

                <h3 className="font-bold text-white font-['Montserrat'] text-lg leading-tight mb-2">
                  {event.title}
                </h3>

                <div className="flex items-center gap-1.5 mb-2">

                  <div className="w-1.5 h-1.5 rounded-full bg-[#51A2FF]" />

                  <span className="text-[#51A2FF] text-sm font-medium">
                    {formatDate(event.date)}
                  </span>

                </div>

                <div className="flex items-center gap-1.5 mb-3">

                  <MapPin
                    size={12}
                    className="text-white/50"
                  />

                  <span className="text-white/50 text-xs">
                    {event.location}
                  </span>

                </div>

                <p className="text-white/60 text-sm leading-relaxed line-clamp-2">
                  {event.description}
                </p>

                <button
                  onClick={() =>
                    handleRSVP(String(event.id))
                  }
                  className={`mt-4 w-full py-2 rounded-xl text-sm font-medium transition-all duration-300 border ${
                    rsvpedEvents.includes(
                      String(event.id)
                    )
                      ? 'bg-[#51A2FF] text-[#023570] border-[#51A2FF]'
                      : 'border-[#51A2FF]/40 text-[#51A2FF] hover:bg-[#51A2FF] hover:text-[#023570]'
                  }`}
                >
                  {!isAuthenticated
                    ? 'Sign In to RSVP'
                    : rsvpedEvents.includes(
                        String(event.id)
                      )
                    ? "✓ You're Going"
                    : 'RSVP Now'}
                </button>

              </div>

            ))}

          </div>

          <div className="text-center mt-10">

            <button
              onClick={() => handleNav('events')}
              className="inline-flex items-center gap-2 border border-white/30 text-white hover:bg-white hover:text-[#023570] px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300"
            >
              View All Events

              <ArrowRight size={16} />
            </button>

          </div>

        </div>
      </section>


      {/* =====================================================
          STORIES
      ===================================================== */}
      <section className="py-20 bg-white">

        <div className="max-w-6xl mx-auto px-4">

          <div className="text-center mb-12">

            <div className="inline-block bg-[#E9D5FF] text-[#6A1B9A] px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              Family Stories
            </div>

            <h2 className="section-title mb-3">
              Our Stories Live On
            </h2>

            <div className="divider-kornu" />

            <p className="section-subtitle mt-4 max-w-2xl mx-auto">
              Every family has stories worth telling. Here are some of ours.
            </p>

          </div>

          <div className="grid md:grid-cols-3 gap-8">

            {staticStories.map((story) => (

              <div
                key={String(story.id)}
                className="bg-white rounded-2xl shadow-md overflow-hidden card-hover border border-[#D0E6FF] group"
              >

                {story.image && (
                  <div className="h-48 overflow-hidden">

                    <img
                      src={story.image}
                      alt={story.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                  </div>
                )}

                <div className="p-6">

                  <div className="flex gap-2 mb-3 flex-wrap">

                    {story.tags
                      .slice(0, 2)
                      .map((tag) => (
                        <span
                          key={tag}
                          className="bg-[#E9D5FF] text-[#6A1B9A] text-xs px-2.5 py-1 rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}

                  </div>

                  <h3 className="font-bold text-[#102A43] font-['Montserrat'] text-lg leading-snug mb-3 line-clamp-2">
                    {story.title}
                  </h3>

                  <div className="flex items-start gap-2 mb-3">

                    <Quote
                      size={14}
                      className="text-[#51A2FF] mt-0.5 flex-shrink-0"
                    />

                    <p className="text-[#52667A] text-sm leading-relaxed line-clamp-3">
                      {story.excerpt}
                    </p>

                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#EEF2F6]">

                    <div className="flex items-center gap-2">

                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#51A2FF] to-[#6A1B9A] flex items-center justify-center text-white text-xs font-bold">
                        {story.author.charAt(0)}
                      </div>

                      <div>

                        <p className="text-xs font-medium text-[#102A43]">
                          {story.author}
                        </p>

                        <p className="text-xs text-[#52667A]">
                          {new Date(
                            story.date
                          ).toLocaleDateString(
                            'en-GB',
                            {
                              month: 'short',
                              year: 'numeric',
                            }
                          )}
                        </p>

                      </div>

                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#52667A]">

                      <span className="flex items-center gap-1">
                        <Heart size={12} />
                        {story.likes}
                      </span>

                    </div>

                  </div>
                </div>
              </div>

            ))}

          </div>

          <div className="text-center mt-10">

            <button
              onClick={() => handleNav('stories')}
              className="inline-flex items-center gap-2 rounded-full bg-[#023570] hover:bg-[#51A2FF] hover:text-[#023570] text-white px-6 py-3 font-semibold transition-all"
            >
              <BookOpen size={18} />

              Read All Stories

              <ArrowRight size={16} />
            </button>

          </div>

        </div>
      </section>


      {/* =====================================================
          GALLERY
      ===================================================== */}
      <section className="py-20 bg-gradient-to-br from-[#D0E6FF]/40 to-[#E9D5FF]/30">

        <div className="max-w-6xl mx-auto px-4">

          <div className="text-center mb-12">

            <div className="inline-block bg-[#D0E6FF] text-[#023570] px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              Photo Album
            </div>

            <h2 className="section-title mb-3">
              Memories in Photos
            </h2>

            <div className="divider-kornu" />

          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

            {[
              
              {
                src: '/images/Thanksgiving.webp',
                title: 'Family Thanksgiving 2023',
                span: 'md:col-span-2',
              },
              {
                src: '/images/Together.webp',
                title: 'Family Togetherness',
              },
              {
                src: '/images/Family (2).webp',
                title: 'Fam',
              },
              {
                src: '/images/Dine.webp',
                title: 'Family Dinner Celebration',
                span: 'md:col-span-2',
              }, 
              
              
            ].map((item, i) => (

              <div
                key={i}
                className={`gallery-item ${item.span || ''}`}
              >

                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-52 md:h-64 object-cover"
                />

                <div className="gallery-overlay">
                  <p className="text-white font-semibold text-sm">
                    {item.title}
                  </p>
                </div>

              </div>

            ))}

          </div>

          <div className="text-center mt-10">

            <button
              onClick={() => handleNav('gallery')}
              className="inline-flex items-center gap-2 rounded-full border border-[#023570] text-[#023570] hover:bg-[#023570] hover:text-white px-6 py-3 font-semibold transition-all"
            >
              <PlayCircle size={18} />

              View Full Gallery

              <ArrowRight size={16} />
            </button>

          </div>

        </div>
      </section>


      {/* =====================================================
          PORTAL CTA
      ===================================================== */}
      <section className="py-20 bg-white">

        <div className="max-w-4xl mx-auto px-4">

          <div className="relative rounded-3xl overflow-hidden shadow-2xl">

            <img
              src="/images/hero-bg.jpg"
              alt="Family Portal"
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-[#023570]/95 via-[#023570]/85 to-[#2E1065]/85" />

            <div className="relative z-10 p-12 text-center">

              <PortalLockIcon
                size={48}
                className="text-[#51A2FF] mx-auto mb-4"
              />

              <h2 className="font-['Montserrat'] text-4xl font-bold text-white mb-4">
                {isAuthenticated
                  ? 'You Are Inside the Family Portal'
                  : 'Join the Family Portal'}
              </h2>

              <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
                Access exclusive family content, private messages, family
                tree, shared documents, and more. The portal is for Kornu
                family members only.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

                {/* Dynamic Sign In / Sign Out */}
                <button
                  onClick={handlePortalAction}
                  className="inline-flex items-center gap-2 rounded-full bg-[#51A2FF] hover:bg-white text-[#023570] px-7 py-3.5 font-bold shadow-lg transition-all duration-300"
                >
                  <PortalLockIcon size={18} />

                  {isAuthenticated
                    ? 'Sign Out of Portal'
                    : 'Sign In to Portal'}

                  <ArrowRight size={16} />
                </button>

                {/* Keep portal navigation intact */}
                <button
                  onClick={() => handleNav('portal')}
                  className="border border-white/40 text-white hover:bg-white/10 px-6 py-3 rounded-full font-medium transition-all"
                >
                  {isAuthenticated
                    ? 'Open Family Portal'
                    : 'Learn More'}
                </button>

              </div>
            </div>
          </div>
        </div>
      </section>


      {/* =====================================================
          SHARED FOOTER
      ===================================================== */}
      <Footer />

    </div>
  );
}