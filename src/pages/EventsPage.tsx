import { familyEvents } from '../data/familyData';
import { Calendar, MapPin, Users, Clock, CheckCircle, Bell } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const eventTypeColors: Record<string, { bg: string; text: string; border: string }> = {
  reunion: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  birthday: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
  celebration: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  memorial: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  wedding: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
};

const eventTypeIcons: Record<string, string> = {
  reunion: '🎉',
  birthday: '🎂',
  celebration: '🥂',
  memorial: '🕊️',
  wedding: '💍',
};

type Attendee = { name: string; role: string };

export default function EventsPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const { setCurrentPage, rsvpedEvents, toggleRSVP, isAuthenticated } = useStore();

  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [attendees, setAttendees] = useState<Record<string, Attendee[]>>({});
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [loadingAttendees, setLoadingAttendees] = useState<string | null>(null);

  const [reminders, setReminders] = useState<Record<string, boolean>>({});

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

  const handleNav = (page: string) => {
    setCurrentPage(page);
  };

  const handleRSVP = (eventId: string) => {
    if (!isAuthenticated) {
      setCurrentPage('signin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    toggleRSVP(eventId);
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => {
      const updated = { ...prev, [id]: !prev[id] };
      if (updated[id]) {
        alert("You'll get a reminder before this event!");
      }
      return updated;
    });
  };

  const toggleAttendeesList = async (eventId: string) => {
    if (expandedEvent === eventId) {
      setExpandedEvent(null);
      return;
    }

    setExpandedEvent(eventId);

    // Only fetch if we don't already have it cached
    if (!attendees[eventId]) {
      setLoadingAttendees(eventId);
      const { data, error } = await supabase
        .from('rsvps')
        .select('profiles ( name, role )')
        .eq('event_id', eventId);

      if (!error && data) {
        const names = data
          .map((r: any) => r.profiles)
          .filter(Boolean) as Attendee[];
        setAttendees((prev) => ({ ...prev, [eventId]: names }));
      }
      setLoadingAttendees(null);
    }
  };

  const types = ['All', 'Reunion', 'Birthday', 'Celebration', 'Memorial'];
  const filtered = allEvents.filter(e =>
    activeFilter === 'All' || e.type === activeFilter.toLowerCase()
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-GB', { month: 'short' }),
      year: date.getFullYear(),
      full: date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    };
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    const event = new Date(dateStr);
    const diff = Math.ceil((event.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Past';
    if (diff === 0) return 'Today!';
    if (diff === 1) return 'Tomorrow!';
    return `${diff} days away`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="pt-24 pb-12 bg-gradient-to-r from-gray-900 via-gray-800 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="/images/family-gathering.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Calendar size={14} />
            Family Calendar
          </div>
          <h1 className="font-['Montserrat'] text-5xl font-bold text-white mb-4">Family Events</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Stay connected with every gathering, celebration, and milestone in the Kornu family calendar.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Filter */}
        <div className="flex gap-3 flex-wrap justify-center mb-10">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === type
                  ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
              }`}
            >
              {type !== 'All' && eventTypeIcons[type.toLowerCase()]} {type}
            </button>
          ))}
        </div>

        {/* Events List */}
        <div className="space-y-6">
          {filtered.map((event) => {
            const dateInfo = formatDate(event.date);
            const daysUntil = getDaysUntil(event.date);
            const colors = eventTypeColors[event.type];
            const hasRsvped = rsvpedEvents.includes(event.id);

            return (
              <div key={event.id} className={`bg-white rounded-2xl shadow-sm border-2 ${colors.border} overflow-hidden card-hover`}>
                <div className="flex">
                  {/* Date Column */}
                  <div className="flex-shrink-0 w-24 bg-gradient-to-b from-orange-500 to-orange-600 flex flex-col items-center justify-center text-white py-6">
                    <div className="text-xs font-semibold uppercase tracking-widest opacity-80">{dateInfo.month}</div>
                    <div className="text-4xl font-black font-montserrat leading-none">{dateInfo.day}</div>
                    <div className="text-xs opacity-80 mt-1">{dateInfo.year}</div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                            {eventTypeIcons[event.type]} {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                          </span>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            daysUntil === 'Past' ? 'bg-gray-100 text-gray-500' :
                            daysUntil.includes('!') ? 'bg-green-100 text-green-600' :
                            'bg-blue-50 text-blue-600'
                          }`}>
                            <Clock size={10} className="inline mr-1" />
                            {daysUntil}
                          </span>
                        </div>

                        <h3 className="font-bold text-gray-900 font-montserrat text-xl mb-2">{event.title}</h3>

                        <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-orange-400" />
                            {dateInfo.full}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-orange-400" />
                            {event.location}
                          </div>
                          {event.rsvpCount !== undefined && (
                            <span className="text-xs text-gray-400">
                              {event.rsvpCount + (hasRsvped ? 1 : 0)} attending
                            </span>
                          )}
                        </div>

                        <p className="text-gray-500 text-sm leading-relaxed">{event.description}</p>
                      </div>

                      {event.image && (
                        <div className="hidden md:block flex-shrink-0 w-28 h-24 rounded-xl overflow-hidden">
                          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleRSVP(event.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                          hasRsvped
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-gradient-to-r from-gray-800 to-gray-600 text-white shadow-md hover:shadow-lg'
                        }`}
                      >
                        {!isAuthenticated ? (
                          <>
                            <Users size={15} />
                            Sign In to RSVP
                          </>
                        ) : hasRsvped ? (
                          <>
                            <CheckCircle size={15} />
                            RSVP'd — Going!
                          </>
                        ) : (
                          <>
                            <Users size={15} />
                            RSVP Now
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => toggleReminder(event.id)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm transition-all ${
                          reminders[event.id]
                            ? 'bg-orange-50 text-orange-500 border border-orange-300'
                            : 'text-gray-500 border border-gray-200 hover:border-orange-300 hover:text-orange-500'
                        }`}
                      >
                        <Bell size={14} fill={reminders[event.id] ? 'currentColor' : 'none'} />
                        {reminders[event.id] ? 'Reminder Set' : 'Remind Me'}
                      </button>
                      {isAuthenticated && (
                        <button
                          onClick={() => toggleAttendeesList(event.id)}
                          className="text-sm text-gray-400 hover:text-orange-500 underline underline-offset-2 ml-auto"
                        >
                          {expandedEvent === event.id ? 'Hide attendees' : "See who's going"}
                        </button>
                      )}
                    </div>

                    {expandedEvent === event.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        {loadingAttendees === event.id ? (
                          <p className="text-sm text-gray-400">Loading attendees...</p>
                        ) : attendees[event.id]?.length ? (
                          <div className="flex flex-wrap gap-2">
                            {attendees[event.id].map((person, i) => (
                              <span
                                key={i}
                                className="flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full"
                              >
                                <span className="w-5 h-5 rounded-full bg-orange-400 text-white flex items-center justify-center font-bold text-[10px]">
                                  {person.name.charAt(0)}
                                </span>
                                {person.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">No one has RSVP'd yet — be the first!</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400 text-lg">No events in this category</p>
          </div>
        )}

        {/* Add Event CTA */}
        <div className="mt-16 bg-gray-900 rounded-3xl p-8 text-white text-center">
          <h2 className="font-montserrat text-2xl font-bold mb-3">Have a family event to share?</h2>
          <p className="text-white/80 mb-6">Sign in to the family portal to submit a new event for the family calendar.</p>
        <button
  onClick={() => {
    setCurrentPage('portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }}
  className="bg-white text-orange-600 px-8 py-3 rounded-full font-bold hover:bg-orange-50 transition-colors"
>
  Submit an Event
  </button>
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