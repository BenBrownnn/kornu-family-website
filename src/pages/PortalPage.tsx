import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import {
  Shield,
  Users,
  MessageCircle,
  Calendar,
  FileText,
  Bell,
  Settings,
  LogOut,
  TreePine,
  ArrowRight,
  Heart,
  Lock,
  Star,
  TrendingUp,
  Plus,
  Image,
  X
} from 'lucide-react';
import {
  familyMembers,
  familyEvents,
  familyStories
} from '../data/familyData';
import { supabase } from '../lib/supabaseClient';


// ============================================================
// TYPES
// ============================================================

type Message = {
  id: string;
  created_at: string;
  user_id: string;
  author_name: string;
  text: string;
};

type DbEvent = {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  type: string;
  image?: string;
  rsvpCount?: number;
};

type DbAnnouncement = {
  id: string;
  title: string;
  author: string;
  date: string;
  priority: string;
};

type DbMember = {
  id: string;
  name: string;
  role: string;
  age?: number;
  bio: string;
  image: string;
  generation: number;
  location?: string;
  occupation?: string;
  tags: string[];
};


// ============================================================
// PORTAL FEATURES
// ============================================================

const portalFeatures = [
  {
    id: 'messages',
    icon: MessageCircle,
    title: 'Family Chat',
    desc: 'Private family message board',
    color: 'from-blue-400 to-cyan-500',
    count: '12 new'
  },
  {
    id: 'tree',
    icon: TreePine,
    title: 'Family Tree',
    desc: 'Interactive genealogy explorer',
    color: 'from-green-400 to-emerald-600',
    count: '4 gen'
  },
  {
    id: 'docs',
    icon: FileText,
    title: 'Family Documents',
    desc: 'Shared important documents',
    color: 'from-orange-400 to-amber-500',
    count: '28 files'
  },
  {
    id: 'events',
    icon: Calendar,
    title: 'My Events',
    desc: 'Your RSVPs and calendar',
    color: 'from-pink-400 to-rose-500',
    count: '3 upcoming'
  },
  {
    id: 'gallery',
    icon: Image,
    title: 'Private Gallery',
    desc: 'Member-only photos',
    color: 'from-purple-400 to-violet-600',
    count: '145 photos'
  },
  {
    id: 'settings',
    icon: Settings,
    title: 'Settings',
    desc: 'Manage your profile',
    color: 'from-gray-400 to-slate-600',
    count: ''
  },
];


// ============================================================
// FALLBACK ANNOUNCEMENTS (shown alongside real ones)
// ============================================================

const announcements = [
  {
    id: '1',
    title: 'Reunion 2025 Registration Open!',
    date: '2025-01-15',
    author: 'Kofi Kornu',
    priority: 'high'
  },
  {
    id: '2',
    title: "Elder Kweku's Birthday Dinner Details",
    date: '2025-01-10',
    author: 'Ama Kornu-Mensah',
    priority: 'medium'
  },
  {
    id: '3',
    title: 'New Baby! Welcome Kweku Jr.!',
    date: '2025-01-05',
    author: 'Family Admin',
    priority: 'high'
  },
];


// ============================================================
// PORTAL PAGE
// ============================================================

export default function PortalPage() {

  const {
    isAuthenticated,
    currentUser,
    logout,
    setCurrentPage
  } = useStore();

  const [activeTab, setActiveTab] = useState('dashboard');

  const [message, setMessage] = useState('');

  const [messages, setMessages] = useState<Message[]>([]);

  const [sendingMessage, setSendingMessage] = useState(false);


  // ==========================================================
  // EVENTS + ANNOUNCEMENTS + MEMBERS STATE
  // ==========================================================

  const [dbEvents, setDbEvents] = useState<DbEvent[]>([]);
  const [dbAnnouncements, setDbAnnouncements] = useState<DbAnnouncement[]>([]);
  const [dbMembers, setDbMembers] = useState<DbMember[]>([]);

  const [showEventForm, setShowEventForm] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);

  // New event form fields
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventType, setEventType] = useState('celebration');
  const [postingEvent, setPostingEvent] = useState(false);
  const [eventFormError, setEventFormError] = useState('');

  // New event image
  const [eventImageFile, setEventImageFile] = useState<File | null>(null);
  const [eventImagePreview, setEventImagePreview] = useState<string | null>(null);

  // New announcement form fields
  const [annTitle, setAnnTitle] = useState('');
  const [annPriority, setAnnPriority] = useState('medium');
  const [postingAnn, setPostingAnn] = useState(false);
  const [annFormError, setAnnFormError] = useState('');

  // New member form fields
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('');
  const [memberBio, setMemberBio] = useState('');
  const [memberGeneration, setMemberGeneration] = useState('1');
  const [memberLocation, setMemberLocation] = useState('');
  const [memberOccupation, setMemberOccupation] = useState('');
  const [memberTags, setMemberTags] = useState('');
  const [memberImageFile, setMemberImageFile] = useState<File | null>(null);
  const [memberImagePreview, setMemberImagePreview] = useState<string | null>(null);
  const [postingMember, setPostingMember] = useState(false);
  const [memberFormError, setMemberFormError] = useState('');


  // ==========================================================
  // FETCH EVENTS + ANNOUNCEMENTS + MEMBERS
  // ==========================================================

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error loading events:', error);
      return;
    }

    if (data) {
      setDbEvents(
        data.map((e: any) => ({
          id: e.id,
          title: e.title,
          date: e.date,
          location: e.location,
          description: e.description,
          type: e.type,
          image: e.image,
        }))
      );
    }
  };

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading announcements:', error);
      return;
    }

    if (data) {
      setDbAnnouncements(
        data.map((a: any) => ({
          id: a.id,
          title: a.title,
          author: a.author_name,
          date: a.created_at,
          priority: a.priority,
        }))
      );
    }
  };

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('generation', { ascending: true });

    if (error) {
      console.error('Error loading members:', error);
      return;
    }

    if (data) {
      setDbMembers(
        data.map((m: any) => ({
          id: m.id,
          name: m.name,
          role: m.role,
          age: m.age,
          bio: m.bio,
          image: m.image,
          generation: m.generation,
          location: m.location,
          occupation: m.occupation,
          tags: Array.isArray(m.tags) ? m.tags : [],
        }))
      );
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents();
      fetchAnnouncements();
      fetchMembers();
    }
  }, [isAuthenticated]);


  // ==========================================================
  // EVENT IMAGE HANDLER
  // ==========================================================

  const handleEventImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setEventImageFile(selected);
    setEventImagePreview(URL.createObjectURL(selected));
  };


  // ==========================================================
  // MEMBER IMAGE HANDLER
  // ==========================================================

  const handleMemberImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setMemberImageFile(selected);
    setMemberImagePreview(URL.createObjectURL(selected));
  };


  // ==========================================================
  // SUBMIT EVENT
  // ==========================================================

  const submitEvent = async () => {
    setEventFormError('');

    if (!eventTitle.trim() || !eventDate || !eventLocation.trim()) {
      setEventFormError('Please fill in title, date, and location.');
      return;
    }

    if (!currentUser) return;

    setPostingEvent(true);

    let imageUrl: string | null = null;

    // Upload image first, if one was selected
    if (eventImageFile) {
      const fileExt = eventImageFile.name.split('.').pop();
      const fileName = `event-${currentUser.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery-photos')
        .upload(fileName, eventImageFile);

      if (uploadError) {
        console.error('Error uploading event image:', uploadError);
        setEventFormError('Image upload failed. Try again.');
        setPostingEvent(false);
        return;
      }

      imageUrl = supabase.storage.from('gallery-photos').getPublicUrl(fileName).data.publicUrl;
    }

    const { error } = await supabase.from('events').insert({
      title: eventTitle.trim(),
      date: eventDate,
      location: eventLocation.trim(),
      description: eventDescription.trim(),
      type: eventType,
      image: imageUrl,
      created_by: currentUser.id,
    });

    if (error) {
      console.error('Error posting event:', error);
      setEventFormError('Something went wrong. Please try again.');
    } else {
      setEventTitle('');
      setEventDate('');
      setEventLocation('');
      setEventDescription('');
      setEventType('celebration');
      setEventImageFile(null);
      setEventImagePreview(null);
      setShowEventForm(false);
      fetchEvents();
    }

    setPostingEvent(false);
  };


  // ==========================================================
  // SUBMIT ANNOUNCEMENT
  // ==========================================================

  const submitAnnouncement = async () => {
    setAnnFormError('');

    if (!annTitle.trim()) {
      setAnnFormError('Please enter a title.');
      return;
    }

    if (!currentUser) return;

    setPostingAnn(true);

    const { error } = await supabase.from('announcements').insert({
      title: annTitle.trim(),
      author_name: currentUser.name,
      priority: annPriority,
      created_by: currentUser.id,
    });

    if (error) {
      console.error('Error posting announcement:', error);
      setAnnFormError('Something went wrong. Please try again.');
    } else {
      setAnnTitle('');
      setAnnPriority('medium');
      setShowAnnouncementForm(false);
      fetchAnnouncements();
    }

    setPostingAnn(false);
  };


  // ==========================================================
  // SUBMIT MEMBER
  // ==========================================================

  const submitMember = async () => {
    setMemberFormError('');

    if (!memberName.trim() || !memberRole.trim() || !memberBio.trim()) {
      setMemberFormError('Please fill in name, role, and bio.');
      return;
    }

    if (!currentUser) return;

    setPostingMember(true);

    let imageUrl = '/images/placeholder.jpg';

    if (memberImageFile) {
      const fileExt = memberImageFile.name.split('.').pop();
      const fileName = `member-${currentUser.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery-photos')
        .upload(fileName, memberImageFile);

      if (uploadError) {
        console.error('Error uploading member image:', uploadError);
        setMemberFormError('Image upload failed. Try again.');
        setPostingMember(false);
        return;
      }

      imageUrl = supabase.storage.from('gallery-photos').getPublicUrl(fileName).data.publicUrl;
    }

    const tagsArray = memberTags.split(',').map(t => t.trim()).filter(Boolean);

    const { error } = await supabase.from('members').insert({
      name: memberName.trim(),
      role: memberRole.trim(),
      bio: memberBio.trim(),
      image: imageUrl,
      generation: parseInt(memberGeneration),
      location: memberLocation.trim() || null,
      occupation: memberOccupation.trim() || null,
      tags: tagsArray,
      created_by: currentUser.id,
    });

    if (error) {
      console.error('Error adding member:', error);
      setMemberFormError('Something went wrong. Please try again.');
    } else {
      setMemberName('');
      setMemberRole('');
      setMemberBio('');
      setMemberGeneration('1');
      setMemberLocation('');
      setMemberOccupation('');
      setMemberTags('');
      setMemberImageFile(null);
      setMemberImagePreview(null);
      setShowMemberForm(false);
      fetchMembers();
    }

    setPostingMember(false);
  };


  // ==========================================================
  // MERGED LISTS (real data first, hardcoded as fallback/demo)
  // ==========================================================

  const allEvents = [...dbEvents, ...familyEvents];
  const allAnnouncements = [...dbAnnouncements, ...announcements];
  const allMembers = [...dbMembers, ...familyMembers];


  // ==========================================================
  // LOAD MESSAGES + REALTIME SUBSCRIPTION
  // ==========================================================

  useEffect(() => {

    // Don't connect to the messages channel if
    // the user isn't authenticated.
    if (!isAuthenticated) {
      setMessages([]);
      return;
    }


    // --------------------------------------------------------
    // Load existing messages
    // --------------------------------------------------------

    const fetchMessages = async () => {

      const {
        data,
        error
      } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', {
          ascending: false
        });


      if (error) {
        console.error(
          'Error loading messages:',
          error
        );

        return;
      }


      if (data) {
        setMessages(data as Message[]);
      }
    };


    fetchMessages();


    // --------------------------------------------------------
    // Realtime subscription
    // --------------------------------------------------------

    const channel = supabase
      .channel('messages-channel')

      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },

        (payload) => {

          const newMessage =
            payload.new as Message;


          setMessages((previousMessages) => {

            // Prevent duplicate messages
            // in case the same realtime event
            // is received more than once.
            const alreadyExists =
              previousMessages.some(
                (msg) =>
                  msg.id === newMessage.id
              );


            if (alreadyExists) {
              return previousMessages;
            }


            return [
              newMessage,
              ...previousMessages
            ];
          });
        }
      )

      .subscribe((status) => {

        console.log(
          'Messages realtime status:',
          status
        );

      });


    // --------------------------------------------------------
    // Cleanup
    // --------------------------------------------------------

    return () => {

      supabase.removeChannel(channel);

    };

  }, [isAuthenticated]);


  // ==========================================================
  // SEND MESSAGE
  // ==========================================================

  const sendMessage = async () => {

    const trimmedMessage =
      message.trim();


    // Don't send empty messages.
    if (!trimmedMessage) {
      return;
    }


    if (!currentUser) {
      return;
    }


    try {

      setSendingMessage(true);


      // ------------------------------------------------------
      // Get the actual authenticated Supabase user.
      // This guarantees that user_id is the Auth UUID.
      // ------------------------------------------------------

      const {
        data: {
          user
        },
        error: authError
      } = await supabase.auth.getUser();


      if (authError) {

        console.error(
          'Authentication error:',
          authError
        );

        return;
      }


      if (!user) {

        console.error(
          'No authenticated Supabase user found.'
        );

        return;
      }


      // ------------------------------------------------------
      // Insert into Supabase
      // ------------------------------------------------------

      const {
        error
      } = await supabase
        .from('messages')
        .insert({
          user_id: user.id,
          author_name: currentUser.name,
          text: trimmedMessage,
        });


      if (error) {

        console.error(
          'Error sending message:',
          error
        );

        return;
      }


      // The realtime subscription will automatically
      // add the message to the messages state.
      setMessage('');


    } catch (error) {

      console.error(
        'Unexpected error sending message:',
        error
      );

    } finally {

      setSendingMessage(false);

    }

  };


  // ==========================================================
  // IF NOT AUTHENTICATED
  // ==========================================================

  if (!isAuthenticated) {

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 flex items-center justify-center p-4 pt-24">

        <div className="text-center max-w-md">

          <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">

            <Lock
              size={40}
              className="text-orange-400"
            />

          </div>


          <h2 className="font-montserrat text-4xl font-bold text-white mb-4">
            Family Portal Access
          </h2>


          <p className="text-gray-300 text-lg mb-8 leading-relaxed">

            The Kornu Family Portal is exclusive
            to family members. Please sign in with
            your family credentials to continue.

          </p>


          <div className="grid grid-cols-2 gap-4 mb-8 text-left">

            {[
              {
                icon: MessageCircle,
                title: 'Family Chat',
                desc: 'Private family board'
              },
              {
                icon: TreePine,
                title: 'Family Tree',
                desc: 'Explore your heritage'
              },
              {
                icon: FileText,
                title: 'Documents',
                desc: 'Shared family files'
              },
              {
                icon: Image,
                title: 'Private Gallery',
                desc: 'Exclusive photos'
              },
            ].map(
              ({
                icon: Icon,
                title,
                desc
              }) => (

                <div
                  key={title}
                  className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-xl p-4"
                >

                  <Icon
                    size={20}
                    className="text-orange-400 mb-2"
                  />

                  <p className="text-white text-sm font-semibold">
                    {title}
                  </p>

                  <p className="text-gray-400 text-xs">
                    {desc}
                  </p>

                </div>

              )
            )}

          </div>


          <button
            onClick={() => {
              setCurrentPage('signin');
              window.scrollTo({
                top: 0
              });
            }}
            className="btn-primary text-base px-8 py-4"
          >

            <Shield size={18} />

            Sign In to Portal

            <ArrowRight size={16} />

          </button>

        </div>

      </div>
    );
  }


  // ==========================================================
  // AUTHENTICATED PORTAL
  // ==========================================================

  return (

    <div className="min-h-screen bg-gray-50 pt-[70px]">


      {/* ======================================================
          PORTAL HEADER
      ====================================================== */}

      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-orange-900 relative overflow-hidden">

        <div className="absolute inset-0 opacity-5">

          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 25px 25px, white 2px, transparent 0)',
              backgroundSize: '50px 50px'
            }}
          />

        </div>


        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">

          <div className="flex items-center justify-between">


            {/* USER INFORMATION */}

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">

                {currentUser?.name
                  ?.charAt(0)
                  .toUpperCase()}

              </div>


              <div>

                <div className="flex items-center gap-2 mb-1">

                  <span className="text-orange-300 text-xs font-semibold uppercase tracking-widest">
                    Family Portal
                  </span>


                  {currentUser?.role === 'admin' && (

                    <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                      Admin
                    </span>

                  )}

                </div>


                <h1 className="font-montserrat text-2xl font-bold text-white">

                  Welcome,{' '}

                  {currentUser?.name
                    ?.split(' ')[0]}

                  !

                </h1>


                <p className="text-gray-400 text-sm">
                  {currentUser?.email}
                </p>

              </div>

            </div>


            {/* SIGN OUT */}

            <button
              onClick={logout}
              className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-all"
            >

              <LogOut size={14} />

              Sign Out

            </button>

          </div>


          {/* ==================================================
              PORTAL NAVIGATION
          ================================================== */}

          <div className="flex gap-2 mt-6 overflow-x-auto pb-1">

            {[
              {
                id: 'dashboard',
                label: 'Dashboard',
                icon: Star
              },
              {
                id: 'messages',
                label: 'Family Chat',
                icon: MessageCircle
              },
              {
                id: 'members',
                label: 'Members',
                icon: Users
              },
              {
                id: 'events',
                label: 'Events',
                icon: Calendar
              },
              {
                id: 'announcements',
                label: 'Announcements',
                icon: Bell
              },
            ].map(
              ({
                id,
                label,
                icon: Icon
              }) => (

                <button
                  key={id}
                  onClick={() =>
                    setActiveTab(id)
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === id
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                  }`}
                >

                  <Icon size={14} />

                  {label}

                </button>

              )
            )}

          </div>

        </div>

      </div>


      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="max-w-7xl mx-auto px-4 py-8">


        {/* ====================================================
            DASHBOARD
        ==================================================== */}

        {activeTab === 'dashboard' && (

          <div className="space-y-8">


            {/* STATS */}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              {[
                {
                  icon: Users,
                  label: 'Family Members',
                  value: allMembers.length,
                  color: 'text-orange-500',
                  bg: 'bg-orange-50'
                },
                {
                  icon: Calendar,
                  label: 'Upcoming Events',
                  value: allEvents.length,
                  color: 'text-blue-500',
                  bg: 'bg-blue-50'
                },
                {
                  icon: MessageCircle,
                  label: 'Family Stories',
                  value: familyStories.length,
                  color: 'text-purple-500',
                  bg: 'bg-purple-50'
                },
                {
                  icon: Heart,
                  label: 'Countries',
                  value: 8,
                  color: 'text-pink-500',
                  bg: 'bg-pink-50'
                },
              ].map(
                ({
                  icon: Icon,
                  label,
                  value,
                  color,
                  bg
                }) => (

                  <div
                    key={label}
                    className={`${bg} rounded-2xl p-5 border border-white`}
                  >

                    <Icon
                      size={20}
                      className={`${color} mb-3`}
                    />

                    <div
                      className={`text-3xl font-black font-montserrat ${color}`}
                    >
                      {value}
                    </div>

                    <div className="text-gray-600 text-xs font-medium mt-1">
                      {label}
                    </div>

                  </div>

                )
              )}

            </div>


            {/* PORTAL FEATURES */}

            <div>

              <h2 className="font-montserrat text-xl font-bold text-gray-900 mb-4">
                Portal Features
              </h2>


              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                {portalFeatures.map(
                  ({
                    id,
                    icon: Icon,
                    title,
                    desc,
                    color,
                    count
                  }) => (

                    <button
                      key={id}
                      onClick={() =>
                        id === 'messages' &&
                        setActiveTab('messages')
                      }
                      className="portal-card p-6 text-left group"
                    >

                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}
                      >

                        <Icon
                          size={22}
                          className="text-white"
                        />

                      </div>


                      <h3 className="font-bold text-gray-900 text-base mb-1">
                        {title}
                      </h3>


                      <p className="text-gray-500 text-xs mb-3">
                        {desc}
                      </p>


                      {count && (

                        <span className="text-xs font-semibold bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full">
                          {count}
                        </span>

                      )}

                    </button>

                  )
                )}

              </div>

            </div>


            {/* ANNOUNCEMENTS */}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

              <h2 className="font-montserrat text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">

                <Bell
                  size={18}
                  className="text-orange-500"
                />

                Latest Announcements

              </h2>


              <div className="space-y-3">

                {allAnnouncements.map((ann) => (

                  <div
                    key={ann.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100"
                  >

                    <div
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                        ann.priority === 'high'
                          ? 'bg-orange-500'
                          : 'bg-blue-400'
                      }`}
                    />


                    <div className="flex-1">

                      <p className="font-semibold text-gray-900 text-sm">
                        {ann.title}
                      </p>


                      <p className="text-gray-400 text-xs mt-0.5">

                        By {ann.author} ·{' '}

                        {new Date(
                          ann.date
                        ).toLocaleDateString(
                          'en-GB',
                          {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }
                        )}

                      </p>

                    </div>


                    {ann.priority === 'high' && (

                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-semibold">
                        Important
                      </span>

                    )}

                  </div>

                ))}

              </div>

            </div>


            {/* ACTIVITY GRAPH */}

            <div className="bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl p-8 text-white">

              <div className="flex items-center gap-2 mb-4">

                <TrendingUp size={20} />

                <h3 className="font-montserrat text-xl font-bold">
                  Family Activity
                </h3>

              </div>


              <div className="grid grid-cols-12 gap-1 items-end h-20">

                {[40, 60, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100]
                  .map((h, i) => (

                    <div
                      key={i}
                      className="bg-white/30 hover:bg-white/50 rounded-sm transition-all cursor-pointer"
                      style={{
                        height: `${h}%`
                      }}
                      title={`Month ${i + 1}`}
                    />

                  ))}

              </div>


              <div className="flex justify-between mt-2 text-white/60 text-xs">

                <span>Jan</span>
                <span>Mar</span>
                <span>May</span>
                <span>Jul</span>
                <span>Sep</span>
                <span>Dec</span>

              </div>


              <p className="text-white/70 text-sm mt-4">
                Family engagement across all portal features in 2024
              </p>

            </div>

          </div>

        )}


        {/* ====================================================
            MESSAGES TAB
        ==================================================== */}

        {activeTab === 'messages' && (

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">


            {/* MESSAGE HEADER */}

            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-pink-50">

              <h2 className="font-montserrat text-xl font-bold text-gray-900 flex items-center gap-2">

                <MessageCircle
                  size={20}
                  className="text-orange-500"
                />

                Family Message Board

              </h2>


              <p className="text-gray-500 text-sm mt-1">
                Private family conversations — only visible to family members
              </p>

            </div>


            {/* ==================================================
                MESSAGES LIST
            ================================================== */}

            <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">


              {messages.length === 0 ? (

                <div className="text-center py-12">

                  <MessageCircle
                    size={40}
                    className="mx-auto text-gray-300 mb-3"
                  />

                  <p className="text-gray-500 text-sm">
                    No messages yet.
                  </p>

                  <p className="text-gray-400 text-xs mt-1">
                    Be the first family member to say something!
                  </p>

                </div>

              ) : (

                messages.map((msg) => {

                  // Determine whether this message
                  // belongs to the currently logged-in user.

                  const isMine =
                    msg.user_id ===
                    currentUser?.id;


                  // Create initials from author name.

                  const avatar =
                    msg.author_name
                      ? msg.author_name
                          .split(' ')
                          .map(
                            (name) =>
                              name.charAt(0)
                          )
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      : 'F';


                  // Format Supabase timestamp.

                  const messageTime =
                    msg.created_at
                      ? new Date(
                          msg.created_at
                        ).toLocaleString(
                          'en-GB',
                          {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          }
                        )
                      : '';


                  return (

                    <div
                      key={msg.id}
                      className={`flex gap-3 ${
                        isMine
                          ? 'flex-row-reverse'
                          : ''
                      }`}
                    >


                      {/* AVATAR */}

                      <div
                        className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm ${
                          isMine
                            ? 'bg-gradient-to-br from-orange-500 to-red-500'
                            : 'bg-gradient-to-br from-gray-400 to-gray-600'
                        }`}
                      >

                        {avatar}

                      </div>


                      {/* MESSAGE CONTENT */}

                      <div
                        className={`max-w-[75%] ${
                          isMine
                            ? 'items-end'
                            : 'items-start'
                        } flex flex-col gap-1`}
                      >


                        <div className="flex items-center gap-2">

                          <span className="text-xs font-semibold text-gray-700">
                            {msg.author_name}
                          </span>


                          <span className="text-xs text-gray-400">
                            {messageTime}
                          </span>

                        </div>


                        {/* CHAT BUBBLE */}

                        <div
                          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                            isMine
                              ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-tr-sm'
                              : 'bg-gray-100 text-gray-700 rounded-tl-sm'
                          }`}
                        >

                          {msg.text}

                        </div>

                      </div>

                    </div>

                  );

                })

              )}

            </div>


            {/* ==================================================
                MESSAGE INPUT
            ================================================== */}

            <div className="p-4 border-t border-gray-100 bg-gray-50">

              <div className="flex gap-3">


                {/* CURRENT USER AVATAR */}

                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">

                  {currentUser?.name
                    ?.charAt(0)
                    .toUpperCase()}

                </div>


                <div className="flex-1 flex gap-2">

                  <input
                    type="text"
                    value={message}
                    onChange={(e) =>
                      setMessage(
                        e.target.value
                      )
                    }
                    onKeyDown={(e) => {

                      if (
                        e.key === 'Enter' &&
                        !e.shiftKey
                      ) {

                        e.preventDefault();

                        sendMessage();

                      }

                    }}
                    placeholder="Share a message with the family..."
                    className="input-field flex-1"
                    disabled={sendingMessage}
                  />


                  <button
                    onClick={sendMessage}
                    disabled={
                      !message.trim() ||
                      sendingMessage
                    }
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >

                    {sendingMessage
                      ? 'Sending...'
                      : 'Send'}

                  </button>

                </div>

              </div>

            </div>

          </div>

        )}


        {/* ====================================================
            MEMBERS TAB
        ==================================================== */}

        {activeTab === 'members' && (

          <div>

            <div className="flex items-center justify-between mb-6">

              <h2 className="font-montserrat text-xl font-bold text-gray-900">
                Family Members Directory
              </h2>


              {currentUser?.role === 'admin' && (

                <button
                  onClick={() => setShowMemberForm(true)}
                  className="btn-primary py-2 px-4 text-sm"
                >

                  <Plus size={14} />

                  Add Member

                </button>

              )}

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {allMembers.map((member) => (

                <div
                  key={member.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 card-hover"
                >

                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-14 h-14 rounded-full object-cover flex-shrink-0 ring-2 ring-orange-100"
                    onError={(e) => {

                      const target =
                        e.target as HTMLImageElement;

                      target.src =
                        '/images/placeholder.jpg';

                    }}
                  />


                  <div className="flex-1 min-w-0">

                    <h3 className="font-bold text-gray-900 font-montserrat text-sm">
                      {member.name}
                    </h3>


                    <p className="text-orange-500 text-xs font-medium">
                      {member.role}
                    </p>


                    <p className="text-gray-400 text-xs mt-0.5 truncate">
                      {member.location} ·{' '}
                      {member.occupation}
                    </p>

                  </div>


                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                      member.generation === 1
                        ? 'bg-orange-100 text-orange-700'
                        : member.generation === 2
                        ? 'bg-pink-100 text-pink-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >

                    Gen {member.generation}

                  </span>

                </div>

              ))}

            </div>

          </div>

        )}


        {/* ====================================================
            EVENTS TAB
        ==================================================== */}

        {activeTab === 'events' && (

          <div>

            <div className="flex items-center justify-between mb-6">

              <h2 className="font-montserrat text-xl font-bold text-gray-900">
                My Family Events
              </h2>

              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => setShowEventForm(true)}
                  className="btn-primary py-2 px-4 text-sm"
                >
                  <Plus size={14} />
                  Add Event
                </button>
              )}

            </div>


            <div className="space-y-4">

              {allEvents.map((event) => (

                <div
                  key={event.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex gap-4"
                >

                  {event.image ? (
                    <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex flex-col items-center justify-center text-white">

                      <div className="text-xl font-black font-montserrat leading-none">

                        {new Date(
                          event.date
                        ).getDate()}

                      </div>


                      <div className="text-xs font-semibold opacity-80">

                        {new Date(
                          event.date
                        ).toLocaleDateString(
                          'en-GB',
                          {
                            month: 'short'
                          }
                        )}

                      </div>

                    </div>
                  )}


                  <div className="flex-1">

                    <h3 className="font-bold text-gray-900 font-montserrat text-base">
                      {event.title}
                    </h3>


                    <p className="text-gray-500 text-sm mt-1">
                      {event.location}
                    </p>


                    <p className="text-gray-400 text-xs mt-2 line-clamp-1">
                      {event.description}
                    </p>

                  </div>


                  <div className="flex flex-col items-end gap-2">

                    <span className="text-xs bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full font-semibold capitalize">
                      {event.type}
                    </span>


                    {event.rsvpCount !== undefined && (
                      <span className="text-xs text-gray-400">
                        {event.rsvpCount} attending
                      </span>
                    )}

                  </div>

                </div>

              ))}

            </div>

          </div>

        )}


        {/* ====================================================
            ANNOUNCEMENTS TAB
        ==================================================== */}

        {activeTab === 'announcements' && (

          <div>

            <div className="flex items-center justify-between mb-6">

              <h2 className="font-montserrat text-xl font-bold text-gray-900">
                Family Announcements
              </h2>


              {currentUser?.role === 'admin' && (

                <button
                  onClick={() => setShowAnnouncementForm(true)}
                  className="btn-primary py-2 px-4 text-sm"
                >

                  <Plus size={14} />

                  Post Announcement

                </button>

              )}

            </div>


            <div className="space-y-4">

              {allAnnouncements.map((ann) => (

                <div
                  key={ann.id}
                  className={`bg-white rounded-2xl p-6 shadow-sm border-l-4 ${
                    ann.priority === 'high'
                      ? 'border-orange-500'
                      : 'border-blue-400'
                  }`}
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <div className="flex items-center gap-2 mb-2">

                        {ann.priority === 'high' && (

                          <span className="text-xs bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full font-semibold">
                            Important
                          </span>

                        )}


                        <span className="text-xs text-gray-400">

                          {new Date(
                            ann.date
                          ).toLocaleDateString(
                            'en-GB',
                            {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            }
                          )}

                        </span>

                      </div>


                      <h3 className="font-bold text-gray-900 font-montserrat text-lg">
                        {ann.title}
                      </h3>


                      <p className="text-gray-500 text-sm mt-1">
                        Posted by {ann.author}
                      </p>

                    </div>


                    <Bell
                      size={18}
                      className={
                        ann.priority === 'high'
                          ? 'text-orange-500'
                          : 'text-blue-400'
                      }
                    />

                  </div>

                </div>

              ))}

            </div>

          </div>

        )}

      </div>


      {/* ======================================================
          ADD EVENT MODAL
      ====================================================== */}

      {showEventForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-6">
              <h2 className="font-montserrat text-xl font-bold text-gray-900">Add Event</h2>
              <button
                onClick={() => setShowEventForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">

              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Event title"
                className="input-field"
              />

              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="input-field"
              />

              <input
                type="text"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="Location"
                className="input-field"
              />

              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="input-field"
              >
                <option value="reunion">Reunion</option>
                <option value="birthday">Birthday</option>
                <option value="wedding">Wedding</option>
                <option value="memorial">Memorial</option>
                <option value="celebration">Celebration</option>
              </select>

              <textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Description"
                rows={3}
                className="input-field resize-none"
              />

              <label className="block">
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center cursor-pointer hover:border-orange-300 transition-colors">
                  {eventImagePreview ? (
                    <img
                      src={eventImagePreview}
                      alt="Preview"
                      className="max-h-32 mx-auto rounded-xl object-cover"
                    />
                  ) : (
                    <p className="text-sm text-gray-400">Click to add a photo (optional)</p>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEventImageChange}
                  className="hidden"
                />
              </label>

              {eventFormError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                  {eventFormError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEventForm(false)}
                  className="flex-1 border border-gray-200 rounded-xl py-2.5 text-gray-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={submitEvent}
                  disabled={postingEvent}
                  className="flex-1 btn-primary justify-center disabled:opacity-60"
                >
                  {postingEvent ? 'Posting...' : 'Post Event'}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}


      {/* ======================================================
          POST ANNOUNCEMENT MODAL
      ====================================================== */}

      {showAnnouncementForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">

            <div className="flex items-center justify-between mb-6">
              <h2 className="font-montserrat text-xl font-bold text-gray-900">Post Announcement</h2>
              <button
                onClick={() => setShowAnnouncementForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">

              <input
                type="text"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="Announcement title"
                className="input-field"
              />

              <select
                value={annPriority}
                onChange={(e) => setAnnPriority(e.target.value)}
                className="input-field"
              >
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
              </select>

              {annFormError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                  {annFormError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAnnouncementForm(false)}
                  className="flex-1 border border-gray-200 rounded-xl py-2.5 text-gray-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={submitAnnouncement}
                  disabled={postingAnn}
                  className="flex-1 btn-primary justify-center disabled:opacity-60"
                >
                  {postingAnn ? 'Posting...' : 'Post'}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}


      {/* ======================================================
          ADD MEMBER MODAL
      ====================================================== */}

      {showMemberForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-6">
              <h2 className="font-montserrat text-xl font-bold text-gray-900">Add Family Member</h2>
              <button
                onClick={() => setShowMemberForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">

              <input
                type="text"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="Full name"
                className="input-field"
              />

              <input
                type="text"
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value)}
                placeholder="Role (e.g. Son · Doctor)"
                className="input-field"
              />

              <select
                value={memberGeneration}
                onChange={(e) => setMemberGeneration(e.target.value)}
                className="input-field"
              >
                <option value="1">Generation 1 — Founders</option>
                <option value="2">Generation 2 — Parents</option>
                <option value="3">Generation 3 — Grandchildren</option>
                <option value="4">Generation 4 — Great-Grandchildren</option>
              </select>

              <input
                type="text"
                value={memberLocation}
                onChange={(e) => setMemberLocation(e.target.value)}
                placeholder="Location (optional)"
                className="input-field"
              />

              <input
                type="text"
                value={memberOccupation}
                onChange={(e) => setMemberOccupation(e.target.value)}
                placeholder="Occupation (optional)"
                className="input-field"
              />

              <textarea
                value={memberBio}
                onChange={(e) => setMemberBio(e.target.value)}
                placeholder="Bio"
                rows={3}
                className="input-field resize-none"
              />

              <input
                type="text"
                value={memberTags}
                onChange={(e) => setMemberTags(e.target.value)}
                placeholder="Tags, comma separated (e.g. Doctor, Healer)"
                className="input-field"
              />

              <label className="block">
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center cursor-pointer hover:border-orange-300 transition-colors">
                  {memberImagePreview ? (
                    <img
                      src={memberImagePreview}
                      alt="Preview"
                      className="max-h-32 mx-auto rounded-xl object-cover"
                    />
                  ) : (
                    <p className="text-sm text-gray-400">Click to add a photo (optional)</p>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMemberImageChange}
                  className="hidden"
                />
              </label>

              {memberFormError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                  {memberFormError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowMemberForm(false)}
                  className="flex-1 border border-gray-200 rounded-xl py-2.5 text-gray-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={submitMember}
                  disabled={postingMember}
                  className="flex-1 btn-primary justify-center disabled:opacity-60"
                >
                  {postingMember ? 'Adding...' : 'Add Member'}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>

  );
}