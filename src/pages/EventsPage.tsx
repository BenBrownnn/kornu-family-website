import { useEffect, useState } from 'react';
import { familyEvents } from '../data/familyData';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  Bell,
  Cake,
  PartyPopper,
  Bird,
  Heart,
  ChevronLeft,
  type LucideIcon,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { supabase } from '../lib/supabaseClient';
import Footer from '../components/Footer';

/* ============================================================
   EVENT TYPES
============================================================ */

type EventType =
  | 'reunion'
  | 'birthday'
  | 'celebration'
  | 'memorial'
  | 'wedding';

type FamilyEvent = {
  id: string;
  title: string;
  date: string;
  type: EventType;
  location: string;
  description: string;
  image?: string;
  rsvpCount?: number;
};

type Attendee = {
  name: string;
  role: string;
};

/* ============================================================
   EVENT TYPE STYLES
============================================================ */

const eventTypeColors: Record<
  EventType,
  {
    bg: string;
    text: string;
    border: string;
  }
> = {
  reunion: {
    bg: 'bg-[#D0E6FF]',
    text: 'text-[#023570]',
    border: 'border-[#9BC7F5]',
  },

  birthday: {
    bg: 'bg-[#E9D5FF]',
    text: 'text-[#6A1B9A]',
    border: 'border-[#C8A6E8]',
  },

  celebration: {
    bg: 'bg-[#DCE7DC]',
    text: 'text-[#3D5A3D]',
    border: 'border-[#AFC4AF]',
  },

  memorial: {
    bg: 'bg-[#E8E9ED]',
    text: 'text-[#3A4350]',
    border: 'border-[#C6CBD3]',
  },

  wedding: {
    bg: 'bg-[#E9D5FF]',
    text: 'text-[#6A1B9A]',
    border: 'border-[#C8A6E8]',
  },
};

/* ============================================================
   EVENT TYPE ICONS
============================================================ */

const eventTypeIcons: Record<EventType, LucideIcon> = {
  reunion: PartyPopper,
  birthday: Cake,
  celebration: PartyPopper,
  memorial: Bird,
  wedding: Heart,
};

/* ============================================================
   NORMALIZE LOCAL EVENTS
============================================================ */

const normalizeEvent = (
  event: Partial<FamilyEvent> & {
    id: string | number;
  }
): FamilyEvent => ({
  id: String(event.id),
  title: event.title || 'Family Event',
  date: event.date || new Date().toISOString(),
  type: (event.type || 'celebration') as EventType,
  location: event.location || 'Location to be announced',
  description: event.description || '',
  image: event.image,
  rsvpCount: event.rsvpCount,
});

/* ============================================================
   EVENTS PAGE
============================================================ */

export default function EventsPage() {
  const [activeFilter, setActiveFilter] = useState('All');

  const {
    setCurrentPage,
    rsvpedEvents,
    toggleRSVP,
    isAuthenticated,
  } = useStore();

  const [dbEvents, setDbEvents] = useState<FamilyEvent[]>([]);
  const [attendees, setAttendees] = useState<
    Record<string, Attendee[]>
  >({});
  const [expandedEvent, setExpandedEvent] =
    useState<string | null>(null);
  const [loadingAttendees, setLoadingAttendees] =
    useState<string | null>(null);
  const [reminders, setReminders] = useState<
    Record<string, boolean>
  >({});

  /* ==========================================================
     FETCH EVENTS FROM SUPABASE
  ========================================================== */

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', {
          ascending: true,
        });

      if (error) {
        console.error(
          'Error fetching family events:',
          error
        );
        return;
      }

      if (!data) {
        setDbEvents([]);
        return;
      }

      const normalizedEvents: FamilyEvent[] = data.map(
        (event) =>
          normalizeEvent({
            id: event.id,
            title: event.title,
            date: event.date,
            type: event.type,
            location: event.location,
            description: event.description,
            image: event.image,
            rsvpCount: event.rsvpCount,
          })
      );

      setDbEvents(normalizedEvents);
    };

    fetchEvents();
  }, []);

  /* ==========================================================
     COMBINE DATABASE + LOCAL EVENTS
  ========================================================== */

  const localEvents: FamilyEvent[] = familyEvents.map(
    (event) =>
      normalizeEvent({
        id: event.id,
        title: event.title,
        date: event.date,
        type: event.type,
        location: event.location,
        description: event.description,
        image: event.image,
        rsvpCount: event.rsvpCount,
      })
  );

  const allEvents: FamilyEvent[] = [
    ...dbEvents,
    ...localEvents,
  ];

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const handleNav = (page: string) => {
    const pageMap: Record<string, string> = {
      home: 'home',
      family: 'family',
      gallery: 'gallery',
      events: 'events',
      stories: 'stories',
      portal: 'portal',
      signin: 'signin',
    };

    setCurrentPage(pageMap[page] ?? 'home');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  /* ==========================================================
     RSVP
  ========================================================== */

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

  /* ==========================================================
     REMINDERS
  ========================================================== */

  const toggleReminder = (id: string) => {
    setReminders((previous) => {
      const updated = {
        ...previous,
        [id]: !previous[id],
      };

      if (updated[id]) {
        alert(
          "You'll get a reminder before this event!"
        );
      }

      return updated;
    });
  };

  /* ==========================================================
     ATTENDEE LIST
  ========================================================== */

  const toggleAttendeesList = async (
    eventId: string
  ) => {
    if (expandedEvent === eventId) {
      setExpandedEvent(null);
      return;
    }

    setExpandedEvent(eventId);

    if (attendees[eventId]) {
      return;
    }

    setLoadingAttendees(eventId);

    const { data, error } = await supabase
      .from('rsvps')
      .select('profiles ( name, role )')
      .eq('event_id', eventId);

    if (error) {
      console.error(
        'Error loading event attendees:',
        error
      );

      setAttendees((previous) => ({
        ...previous,
        [eventId]: [],
      }));

      setLoadingAttendees(null);
      return;
    }

    if (data) {
      const names: Attendee[] = data
        .map((rsvp) => rsvp.profiles)
        .filter(Boolean)
        .map((profile: any) => ({
          name: profile.name || 'Family Member',
          role: profile.role || 'member',
        }));

      setAttendees((previous) => ({
        ...previous,
        [eventId]: names,
      }));
    }

    setLoadingAttendees(null);
  };

  /* ==========================================================
     FILTERS
  ========================================================== */

  const types = [
    'All',
    'Reunion',
    'Birthday',
    'Celebration',
    'Memorial',
    'Wedding',
  ];

  const filtered: FamilyEvent[] =
    allEvents.filter(
      (event) =>
        activeFilter === 'All' ||
        event.type === activeFilter.toLowerCase()
    );

  /* ==========================================================
     DATE FORMATTING
  ========================================================== */

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);

    return {
      day: date.getDate(),

      month: date.toLocaleDateString('en-GB', {
        month: 'short',
      }),

      year: date.getFullYear(),

      full: date.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };
  };

  /* ==========================================================
     DAYS UNTIL EVENT
  ========================================================== */

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const event = new Date(dateStr);

    event.setHours(0, 0, 0, 0);

    const diff = Math.ceil(
      (event.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (diff < 0) return 'Past';

    if (diff === 0) return 'Today!';

    if (diff === 1) return 'Tomorrow!';

    return `${diff} days away`;
  };

  /* ==========================================================
     GROUP EVENTS BY MONTH
  ========================================================== */

  const groupEventsByMonth = (
    events: FamilyEvent[]
  ): Record<string, FamilyEvent[]> => {
    const groups: Record<
      string,
      FamilyEvent[]
    > = {};

    events.forEach((event) => {
      const monthKey = new Date(
        event.date
      ).toLocaleDateString('en-GB', {
        month: 'long',
        year: 'numeric',
      });

      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }

      groups[monthKey].push(event);
    });

    return groups;
  };

  const groupedEvents =
    groupEventsByMonth(filtered);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="min-h-screen bg-[#FAF5EE] text-[#102A43]">

      {/* ========================================================
          HERO
      ========================================================= */}

      <section className="relative min-h-[540px] overflow-hidden text-white">

        {/* Background image */}
        <img
          src="/images/gallery-3.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Main blue overlay */}
        <div className="absolute inset-0 bg-[#023570]/55" />

        {/* Blue / purple gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#023570]/90 via-[#023570]/50 to-[#2E1065]/65" />

        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#FAF5EE] to-transparent" />

        {/* Decorative glow */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#51A2FF]/20 blur-3xl" />

        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#6A1B9A]/20 blur-3xl" />

        {/* Hero content */}
        <div className="relative z-10 mx-auto flex min-h-[540px] max-w-6xl items-center px-4 py-20">

          <div className="max-w-3xl">

            {/* Back */}
            <button
              onClick={() => handleNav('home')}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <ChevronLeft size={16} />
              Back to Home
            </button>

            {/* Eyebrow 
            
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-100 backdrop-blur-md">
              <Calendar size={15} />
              Family Calendar
            </div>
            */}

            {/* Heading */}
            <h1 className="font-['Montserrat'] text-4xl font-black leading-tight tracking-tight md:text-6xl lg:text-7xl">
              Family
              <span className="block text-[#51A2FF]">
                Events
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-2xl text-base leading-8 text-blue-100 md:text-lg">
              Stay connected with every gathering,
              celebration, milestone, and special moment
              in the Kornu family calendar.
            </p>

            {/* Hero actions */}
            <div className="mt-8 flex flex-wrap gap-3">

              <button
                onClick={() => {
                  document
                    .getElementById('events-list')
                    ?.scrollIntoView({
                      behavior: 'smooth',
                    });
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[#51A2FF] px-6 py-3 text-sm font-bold text-[#023570] shadow-lg transition hover:-translate-y-0.5 hover:bg-white"
              >
                <Calendar size={17} />
                View Events
              </button>

              <button
                onClick={() => handleNav('portal')}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20"
              >
                <Users size={17} />
                Family Portal
              </button>

            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          MAIN CONTENT
      ========================================================= */}

      <main
        id="events-list"
        className="mx-auto max-w-5xl px-4 py-16"
      >

        {/* ======================================================
            FILTERS
        ======================================================= */}

        <div className="mb-12">

          <div className="mb-4 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#52667A]">
              Browse the calendar
            </p>

            <h2 className="mt-2 font-['Montserrat'] text-2xl font-black text-[#023570]">
              Upcoming & Family Events
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5">

            {types.map((type) => {
              const isActive =
                activeFilter === type;

              const Icon =
                type !== 'All'
                  ? eventTypeIcons[
                      type.toLowerCase() as EventType
                    ]
                  : null;

              return (
                <button
                  key={type}
                  onClick={() =>
                    setActiveFilter(type)
                  }
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#023570] text-white shadow-md'
                      : 'bg-white text-[#023570] ring-1 ring-[#D0E6FF] hover:bg-[#E9D5FF] hover:text-[#6A1B9A]'
                  }`}
                >
                  {Icon && <Icon size={14} />}
                  {type}
                </button>
              );
            })}

          </div>
        </div>

        {/* ======================================================
            EVENTS LIST
        ======================================================= */}

        <div className="space-y-10">

          {Object.entries(
            groupedEvents
          ).map(([month, monthEvents]) => (
            <section
              key={month}
              className="mb-10"
            >

              {/* Month heading */}
              <div className="mb-5 flex items-center gap-4">

                <h3 className="whitespace-nowrap text-sm font-bold uppercase tracking-[0.2em] text-[#6A1B9A]">
                  {month}
                </h3>

                <div className="h-px flex-1 bg-[#D0E6FF]" />

              </div>

              {/* Events */}
              <div className="space-y-6">

                {monthEvents.map((event) => {
                  const dateInfo =
                    formatDate(event.date);

                  const daysUntil =
                    getDaysUntil(event.date);

                  const colors =
                    eventTypeColors[event.type] ||
                    eventTypeColors.celebration;

                  const EventIcon =
                    eventTypeIcons[event.type] ||
                    Calendar;

                  const hasRsvped =
                    rsvpedEvents.includes(
                      event.id
                    );

                  return (
                    <article
                      key={event.id}
                      className={`group overflow-hidden rounded-3xl border ${colors.border} bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
                    >

                      <div className="flex flex-col sm:flex-row">

                        {/* =================================================
                            DATE COLUMN
                        ================================================== */}

                        <div className="relative flex w-full flex-shrink-0 flex-row items-center justify-center gap-4 overflow-hidden bg-[#023570] px-5 py-5 text-white sm:w-28 sm:flex-col sm:gap-0 sm:py-7">

                          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#51A2FF]/20 blur-xl" />

                          <div className="relative text-xs font-bold uppercase tracking-[0.15em] text-blue-100">
                            {dateInfo.month}
                          </div>

                          <div className="relative font-['Montserrat'] text-4xl font-black leading-none sm:mt-1">
                            {dateInfo.day}
                          </div>

                          <div className="relative text-xs text-blue-200 sm:mt-1">
                            {dateInfo.year}
                          </div>

                        </div>

                        {/* =================================================
                            EVENT CONTENT
                        ================================================== */}

                        <div className="flex-1 p-5 md:p-7">

                          <div className="flex items-start justify-between gap-5">

                            <div className="min-w-0 flex-1">

                              {/* Badges */}
                              <div className="mb-3 flex flex-wrap items-center gap-2">

                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${colors.bg} ${colors.text}`}
                                >
                                  <EventIcon size={13} />
                                  {event.type
                                    .charAt(0)
                                    .toUpperCase() +
                                    event.type.slice(
                                      1
                                    )}
                                </span>

                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                    daysUntil ===
                                    'Past'
                                      ? 'bg-gray-100 text-gray-500'
                                      : daysUntil.includes(
                                          '!'
                                        )
                                      ? 'bg-[#DCE7DC] text-[#3D5A3D]'
                                      : 'bg-[#D0E6FF] text-[#023570]'
                                  }`}
                                >
                                  <Clock size={11} />
                                  {daysUntil}
                                </span>

                              </div>

                              {/* Title */}
                              <h3 className="font-['Montserrat'] text-xl font-black text-[#102A43] md:text-2xl">
                                {event.title}
                              </h3>

                              {/* Metadata */}
                              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#52667A]">

                                <div className="flex items-center gap-1.5">
                                  <Calendar
                                    size={14}
                                    className="flex-shrink-0 text-[#51A2FF]"
                                  />

                                  <span>
                                    {dateInfo.full}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <MapPin
                                    size={14}
                                    className="flex-shrink-0 text-[#51A2FF]"
                                  />

                                  <span>
                                    {event.location}
                                  </span>
                                </div>

                                {event.rsvpCount !==
                                  undefined && (
                                  <span className="font-semibold text-[#6A1B9A]">
                                    {event.rsvpCount +
                                      (hasRsvped
                                        ? 1
                                        : 0)}{' '}
                                    attending
                                  </span>
                                )}

                              </div>

                              {/* Description */}
                              {event.description && (
                                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#52667A]">
                                  {event.description}
                                </p>
                              )}

                            </div>

                            {/* Event image */}
                            {event.image && (
                              <div className="hidden h-28 w-32 flex-shrink-0 overflow-hidden rounded-2xl ring-1 ring-[#D0E6FF] md:block">

                                <img
                                  src={event.image}
                                  alt={event.title}
                                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                  onError={(
                                    event
                                  ) => {
                                    event.currentTarget.style.display =
                                      'none';
                                  }}
                                />

                              </div>
                            )}

                          </div>

                          {/* =================================================
                              ACTIONS
                          ================================================== */}

                          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#EDF2F7] pt-5">

                            {/* RSVP */}
                            <button
                              onClick={() =>
                                handleRSVP(
                                  event.id
                                )
                              }
                              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                                hasRsvped
                                  ? 'border border-[#AFC4AF] bg-[#DCE7DC] text-[#3D5A3D]'
                                  : 'bg-[#023570] text-white shadow-sm hover:bg-[#51A2FF] hover:text-[#023570]'
                              }`}
                            >
                              {!isAuthenticated ? (
                                <>
                                  <Users
                                    size={15}
                                  />
                                  Sign In to RSVP
                                </>
                              ) : hasRsvped ? (
                                <>
                                  <CheckCircle
                                    size={15}
                                  />
                                  RSVP'd — Going!
                                </>
                              ) : (
                                <>
                                  <Users
                                    size={15}
                                  />
                                  RSVP Now
                                </>
                              )}
                            </button>

                            {/* Reminder */}
                            <button
                              onClick={() =>
                                toggleReminder(
                                  event.id
                                )
                              }
                              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                                reminders[
                                  event.id
                                ]
                                  ? 'border-[#C8A6E8] bg-[#E9D5FF] text-[#6A1B9A]'
                                  : 'border-[#D0E6FF] text-[#023570] hover:bg-[#D0E6FF]'
                              }`}
                            >
                              <Bell
                                size={14}
                                fill={
                                  reminders[
                                    event.id
                                  ]
                                    ? 'currentColor'
                                    : 'none'
                                }
                              />

                              {reminders[
                                event.id
                              ]
                                ? 'Reminder Set'
                                : 'Remind Me'}
                            </button>

                            {/* Attendees */}
                            {isAuthenticated && (
                              <button
                                onClick={() =>
                                  toggleAttendeesList(
                                    event.id
                                  )
                                }
                                className="ml-auto text-sm font-semibold text-[#52667A] underline decoration-[#D0E6FF] underline-offset-4 transition hover:text-[#51a2ff]"
                              >
                                {expandedEvent ===
                                event.id
                                  ? 'Hide attendees'
                                  : "See who's going"}
                              </button>
                            )}

                          </div>

                          {/* =================================================
                              ATTENDEES
                          ================================================== */}

                          {expandedEvent ===
                            event.id && (
                            <div className="mt-5 border-t border-[#EDF2F7] pt-5">

                              {loadingAttendees ===
                              event.id ? (
                                <div className="flex items-center gap-2 text-sm text-[#52667A]">
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#D0E6FF] border-t-[#023570]" />
                                  Loading attendees...
                                </div>
                              ) : attendees[
                                  event.id
                                ]?.length ? (
                                <div>

                                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#52667A]">
                                    Family members attending
                                  </p>

                                  <div className="flex flex-wrap gap-2">

                                    {attendees[
                                      event.id
                                    ].map(
                                      (
                                        person,
                                        index
                                      ) => (
                                        <span
                                          key={`${event.id}-${person.name}-${index}`}
                                          className="inline-flex items-center gap-2 rounded-xl bg-[#F3F6FA] px-3 py-1.5 text-xs font-semibold text-[#102A43]"
                                        >

                                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#023570] text-[10px] font-black text-white">
                                            {person.name
                                              .charAt(
                                                0
                                              )
                                              .toUpperCase()}
                                          </span>

                                          {person.name}

                                        </span>
                                      )
                                    )}

                                  </div>

                                </div>
                              ) : (
                                <p className="text-sm text-[#52667A]">
                                  No one has RSVP'd
                                  yet — be the first!
                                </p>
                              )}

                            </div>
                          )}

                        </div>
                      </div>
                    </article>
                  );
                })}

              </div>
            </section>
          ))}

        </div>

        {/* ========================================================
            NO EVENTS
        ========================================================= */}

        {filtered.length === 0 && (
          <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-[#D0E6FF]">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E9D5FF] text-[#6A1B9A]">
              <Calendar size={28} />
            </div>

            <h3 className="mt-5 font-['Montserrat'] text-xl font-black text-[#023570]">
              No events found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#52667A]">
              There are currently no events in this
              category. Try another filter or check back
              later.
            </p>

            <button
              onClick={() =>
                setActiveFilter('All')
              }
              className="mt-6 rounded-full bg-[#023570] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#2E1065]"
            >
              View All Events
            </button>

          </div>
        )}

        {/* ========================================================
            SUBMIT EVENT CTA
        ========================================================= */}

        <section className="relative mt-16 overflow-hidden rounded-3xl bg-[#101828] p-8 text-center text-white md:p-12">

          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#51A2FF]/10 blur-3xl" />

          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-[#6A1B9A]/10 blur-3xl" />

          <div className="relative z-10">

            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#51A2FF]/15 text-[#51A2FF]">
              <Calendar size={22} />
            </div>

            <h2 className="font-['Montserrat'] text-2xl font-black md:text-3xl">
              Have a family event to share?
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/70">
              Sign in to the family portal to submit
              a new event for the family calendar and
              keep everyone connected.
            </p>

            <button
              onClick={() =>
                handleNav('portal')
              }
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#51A2FF] px-7 py-3 text-sm font-black text-[#023570] transition hover:-translate-y-0.5 hover:bg-white"
            >
              <Calendar size={16} />
              Submit an Event
            </button>

          </div>
        </section>

      </main>

      {/* ========================================================
          SHARED FOOTER
      ========================================================= */}

      <Footer />

    </div>
  );
}