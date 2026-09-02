import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabaseClient';
import {
  ArrowRight, Users, Heart, Shield, ChevronDown,
  MapPin, Star, PlayCircle, Quote, BookOpen
} from 'lucide-react';
import { familyMembers, familyEvents, familyStories } from '../data/familyData';

export default function HomePage() {
  const { setCurrentPage, rsvpedEvents, toggleRSVP, isAuthenticated } = useStore();
  const [dbEvents, setDbEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      if (!error && data) setDbEvents(data);
    };
    fetchEvents();
  }, []);

  const allEvents = [...dbEvents, ...familyEvents];

  const handleRSVP = (eventId: string) => {
    if (!isAuthenticated) {
      setCurrentPage('signin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    toggleRSVP(eventId);
  };

  const handleNav = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stats = [
    { label: 'Family Members', value: '47+', icon: Users },
    { label: 'Years Together', value: '100+', icon: Heart },
    { label: 'Countries', value: '1', icon: MapPin },
    { label: 'Generations', value: '6', icon: Star },
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const eventColors: Record<string, string> = {
    reunion: 'bg-orange-100 text-orange-700',
    birthday: 'bg-pink-100 text-pink-700',
    celebration: 'bg-purple-100 text-purple-700',
    memorial: 'bg-blue-100 text-blue-700',
    wedding: 'bg-red-100 text-red-700',
  };
  const [dbMembers, setDbMembers] = useState<any[]>([]);

useEffect(() => {
  const fetchMembers = async () => {
    const { data } = await supabase.from('members').select('*');
    if (data) {
      setDbMembers(data.map((m: any) => ({
        id: m.id, name: m.name, role: m.role, image: m.image,
        occupation: m.occupation, location: m.location, bio: m.bio,
      })));
    }
  };
  fetchMembers();
}, []);

const allMembers = [...dbMembers, ...familyMembers];

  return (
    <div className="min-h-screen">
      {/* ========== HERO ========== */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-bg.jpg"
            alt="The Kornu Family"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent" />
        </div>

        {/* Decorative dots */}
        <div className="absolute top-1/3 left-12 w-5 h-5 rounded-full bg-orange-400 opacity-60" />
        <div className="absolute top-1/2 right-16 w-3 h-3 rounded-full bg-rose-400 opacity-60" />
        <div className="absolute bottom-1/3 left-1/4 w-4 h-4 rounded-full bg-purple-400 opacity-50" />

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-md text-sm font-medium text-gray-600 mb-8"
          >
            <MapPin size={14} className="text-orange-500" />
            Est. 1400 &bull; Ve-Gbodome, Ghana
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-['Montserrat'] text-6xl sm:text-7xl lg:text-8xl font-extrabold mb-6 leading-none"
          >
            <span className="text-gray-900">The </span>
            <span
              className="inline-block"
              style={{
                background: 'linear-gradient(90deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Kornu
            </span>
            <br />
            <span className="text-gray-900">Family</span>
          </motion.h1>

          {/* Underline decoration */}
          <div className="flex justify-center mb-6">
            <svg width="320" height="12" viewBox="0 0 320 12" fill="none">
              <path d="M0 6 Q80 12 160 6 Q240 0 320 6" stroke="#f97316" strokeWidth="3" strokeLinecap="round" fill="none" />
            </svg>
          </div>

          {/* Subtitle */}
          <p className="text-black text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 font-light">
            Where every memory is treasured, every story is celebrated, and
            every family member is loved — always.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => handleNav('portal')}
              className="btn-primary text-base px-8 py-4"
            >
              <Shield size={18} />
              Enter Family Portal
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => handleNav('family')}
              className="btn-secondary text-base px-8 py-4"
            >
              <Users size={18} />
              Meet the Family
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 animate-bounce">
          <span className="text-xs font-medium uppercase tracking-widest">Scroll</span>
          <ChevronDown size={18} />
        </div>
      </section>

      {/* ============ STATS SECTION ============ */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ label, value, icon: Icon }, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-pink-50 card-hover">
                <Icon size={28} className="text-orange-500 mx-auto mb-3" />
                <div className="text-3xl font-black text-gray-900 font-['Montserrat']">{value}</div>
                <div className="text-sm text-gray-500 font-medium mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ABOUT SECTION ============ */}
      <section className="py-20 bg-gradient-to-br from-orange-50/50 via-white to-purple-50/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Image Side */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/images/family-tree.jpg"
                  alt="Kornu Family Heritage"
                  className="w-full h-[450px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="glass-card rounded-2xl p-4">
                    <p className="font-dancing text-2xl text-orange-500 leading-tight">
                      "A family is a circle of strength and love..."
                    </p>
                    <p className="text-sm text-gray-500 mt-1">— Granpa John Lily Kornu</p>
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 float-animation">
                <div className="text-center">
                  <div className="text-2xl font-black text-orange-500 font-['Montserrat']">78</div>
                  <div className="text-xs text-gray-500 font-medium">Years of<br/>Legacy</div>
                </div>
              </div>
            </div>

            {/* Text Side */}
            <div>
              <div className="inline-block bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                Our Heritage
              </div>
              <h2 className="section-title mb-4">
                A Family Built on<br />
                <span style={{
                  background: 'linear-gradient(135deg, #f97316, #8b5cf6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>Love & Legacy</span>
              </h2>
              <div className="divider-kornu mb-6 ml-0" style={{ margin: '0 0 24px 0' }} />
              <p className="section-subtitle mb-6">
                The Kornu family traces its roots to the vibrant heart of Ve-Gbodome, Ghana. Founded by Granpa John Lily Kornu and Mama Abena in 1946, our family has grown across four generations and eight countries.
              </p>
              <p className="section-subtitle mb-8">
                From humble beginnings in a small family compound, the Kornu name has come to represent education, service, resilience, and above all — unconditional love. Our story is one of pride, perseverance, and the unbreakable bonds of family.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {['Ghana 🇬🇭', 'UK 🇬🇧', 'USA 🇺🇸', 'France 🇫🇷', 'Canada 🇨🇦'].map((c) => (
                  <span key={c} className="bg-white border border-gray-200 px-4 py-1.5 rounded-full text-sm text-gray-600 shadow-sm">
                    {c}
                  </span>
                ))}
              </div>
              <button
                onClick={() => handleNav('family')}
                className="btn-primary"
              >
                <Users size={18} />
                Meet All Members
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURED MEMBERS ============ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block bg-pink-100 text-pink-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              Our People
            </div>
            <h2 className="section-title mb-3">Meet the Family</h2>
            <div className="divider-kornu" />
            <p className="section-subtitle mt-4 max-w-2xl mx-auto">
              Across generations and continents, these are the faces that make the Kornu family extraordinary.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {allMembers.slice(0, 4).map((member) => (
              <div key={member.id} className="member-card group">
                <div className="relative h-60 overflow-hidden rounded-t-[20px]">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      t.src = '/images/placeholder.jpg';
                    }}
                  />
                  <div className="member-overlay">
                    <div>
                      <p className="text-white text-xs opacity-90">{member.occupation}</p>
                      <p className="text-white/70 text-xs">{member.location}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 font-['Montserrat'] text-base leading-tight">{member.name}</h3>
                  <p className="text-orange-500 text-xs font-medium mt-0.5">{member.role}</p>
                  <p className="text-gray-500 text-xs mt-2 line-clamp-2">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => handleNav('family')}
              className="btn-secondary"
            >
              View All {allMembers.length} Family Members
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ============ UPCOMING EVENTS ============ */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25px 25px, white 2px, transparent 0)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block bg-orange-500/20 text-orange-400 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              What's Coming
            </div>
            <h2 className="section-title !text-white/90 mt-4 max-w-xl mx-auto">Upcoming Events</h2>
            <div className="divider-kornu" />
            <p className="text-white/70 mt-4 max-w-xl mx-auto">
              Mark your calendars! Here are the events that bring the Kornu family together.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl p-6 card-hover group">
                {event.image && (
                  <div className="rounded-xl overflow-hidden mb-4 h-36">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${eventColors[event.type]}`}>
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </span>
                  {event.rsvpCount !== undefined && (
                    <span className="text-xs text-gray-400">
                      {event.rsvpCount + (rsvpedEvents.includes(event.id) ? 1 : 0)} attending
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-white font-['Montserrat'] text-lg leading-tight mb-2">{event.title}</h3>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  <span className="text-orange-400 text-sm font-medium">{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-1.5 mb-3">
                  <MapPin size={12} className="text-gray-400" />
                  <span className="text-gray-400 text-xs">{event.location}</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">{event.description}</p>
                <button
                  onClick={() => handleRSVP(event.id)}
                  className={`mt-4 w-full py-2 rounded-xl text-sm font-medium transition-all duration-300 border ${
                    rsvpedEvents.includes(event.id)
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'border-orange-500/40 text-orange-400 hover:bg-orange-500 hover:text-white'
                  }`}
                >
                  {!isAuthenticated
                    ? 'Sign In to RSVP'
                    : rsvpedEvents.includes(event.id)
                    ? "✓ You're Going"
                    : 'RSVP Now'}
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => handleNav('events')}
              className="inline-flex items-center gap-2 border border-white/30 text-white hover:bg-white hover:text-gray-900 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300"
            >
              View All Events
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ============ STORIES PREVIEW ============ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block bg-purple-100 text-purple-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              Family Stories
            </div>
            <h2 className="section-title mb-3">Our Stories Live On</h2>
            <div className="divider-kornu" />
            <p className="section-subtitle mt-4 max-w-2xl mx-auto">
              Every family has stories worth telling. Here are some of ours.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {familyStories.map((story) => (
              <div key={story.id} className="bg-white rounded-2xl shadow-md overflow-hidden card-hover border border-gray-100 group">
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
                    {story.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="bg-purple-50 text-purple-600 text-xs px-2.5 py-1 rounded-full font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-bold text-gray-900 font-['Montserrat'] text-lg leading-snug mb-3 line-clamp-2">{story.title}</h3>
                  <div className="flex items-start gap-2 mb-3">
                    <Quote size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{story.excerpt}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                        {story.author.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-700">{story.author}</p>
                        <p className="text-xs text-gray-400">{new Date(story.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Heart size={12} /> {story.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button onClick={() => handleNav('stories')} className="btn-primary">
              <BookOpen size={18} />
              Read All Stories
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ============ GALLERY PREVIEW ============ */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-pink-50/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              Photo Album
            </div>
            <h2 className="section-title mb-3">Memories in Photos</h2>
            <div className="divider-kornu" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { src: '/images/family-gathering.jpg', title: 'Family Reunion 2023', span: 'md:col-span-2' },
              { src: '/images/family-tree.jpg', title: 'Grandparents' },
              { src: '/images/gallery1.jpg', title: 'Christmas 2023' },
              { src: '/images/gallery2.jpg', title: 'Family Adventure', span: 'md:col-span-2' },
            ].map((item, i) => (
              <div key={i} className={`gallery-item ${item.span || ''}`}>
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-52 md:h-64 object-cover"
                />
                <div className="gallery-overlay">
                  <p className="text-white font-semibold text-sm">{item.title}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button onClick={() => handleNav('gallery')} className="btn-secondary">
              <PlayCircle size={18} />
              View Full Gallery
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ============ PORTAL CTA ============ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="/images/hero-bg.jpg"
              alt="Family Portal"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/80 to-orange-900/70" />
            <div className="relative z-10 p-12 text-center">
              <Shield size={48} className="text-orange-400 mx-auto mb-4" />
              <h2 className="font-['Montserrat'] text-4xl font-bold text-white mb-4">
                Join the Family Portal
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
                Access exclusive family content, private messages, family tree, shared documents, and more. The portal is for Kornu family members only.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => handleNav('signin')}
                  className="btn-primary"
                >
                  <Shield size={18} />
                  Sign In to Portal
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => handleNav('portal')}
                  className="border border-white/40 text-white hover:bg-white/10 px-6 py-3 rounded-full font-medium transition-all"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br items-center justify-center">
                  <img src="/images/kornu-logo.png" alt="Kornu" className="w-full h-full object-cover"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      t.style.display = 'none';
                      t.parentElement!.innerHTML = '<span style="color:white;font-weight:900;font-size:1.3rem;font-family:serif;">K</span>';
                    }}
                  />
                </div>
                <div>
                  <div className="font-bold text-lg font-'Montserrat'">The Kornu Family</div>
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