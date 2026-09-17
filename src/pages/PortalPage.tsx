import { useEffect, useState, type ChangeEvent } from 'react';
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
  X,
  Search,
} from 'lucide-react';

import { familyEvents, familyStories } from '../data/familyData';
import { supabase } from '../lib/supabaseClient';
import FamilyTreeNode, {
  type DbMember as TreeDbMember,
  type TreeNode,
  type MarriageGroup,
} from '../components/FamilyTreeNode';

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

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
  image?: string | null;
  rsvpCount?: number;
};

type DbAnnouncement = {
  id: string;
  title: string;
  author: string;
  date: string;
  priority: string;
};

type DbMember = TreeDbMember & {
  age?: number | null;
  bio: string;
  generation: number;
  birthDate?: string | null;
  location?: string | null;
  occupation?: string | null;
  tags: string[];
  marriageId?: string | null;
};

type Marriage = {
  id: string;
  spouse_1_id: string | null;
  spouse_2_id: string | null;
  marriage_date: string | null;
  status: string;
};

type ParentChildRelationship = {
  id: string;
  parent_id: string;
  child_id: string;
  relationship_type: string;
  created_at?: string;
};

/* -------------------------------------------------------------------------- */
/* PORTAL FEATURES                                                            */
/* -------------------------------------------------------------------------- */

const portalFeatures = [
  {
    id: 'messages',
    icon: MessageCircle,
    title: 'Family Chat',
    desc: 'Private family message board',
    color: 'from-blue-400 to-cyan-500',
    count: '12 new',
  },
  {
    id: 'members',
    icon: Users,
    title: 'Family Members',
    desc: 'View the family directory',
    color: 'from-orange-400 to-amber-500',
    count: '',
  },
  {
    id: 'events',
    icon: Calendar,
    title: 'My Events',
    desc: 'Family events and calendar',
    color: 'from-pink-400 to-rose-500',
    count: '3 upcoming',
  },
  {
    id: 'tree',
    icon: TreePine,
    title: 'Family Tree',
    desc: 'Interactive genealogy explorer',
    color: 'from-green-400 to-emerald-600',
    count: '6 gen',
  },
  {
    id: 'announcements',
    icon: Bell,
    title: 'Announcements',
    desc: 'Important family updates',
    color: 'from-purple-400 to-violet-600',
    count: '',
  },
  {
    id: 'settings',
    icon: Settings,
    title: 'Settings',
    desc: 'Manage your profile',
    color: 'from-gray-400 to-slate-600',
    count: '',
  },
];

/* -------------------------------------------------------------------------- */
/* FALLBACK ANNOUNCEMENTS                                                     */
/* -------------------------------------------------------------------------- */

const fallbackAnnouncements: DbAnnouncement[] = [
  {
    id: 'fallback-1',
    title: 'Reunion Registration Open!',
    date: '2026-01-15',
    author: 'Kornu Family',
    priority: 'high',
  },
  {
    id: 'fallback-2',
    title: "Elder Kweku's Birthday Dinner Details",
    date: '2026-01-10',
    author: 'Family Admin',
    priority: 'medium',
  },
  {
    id: 'fallback-3',
    title: 'Welcome to the Kornu Family Portal',
    date: '2026-01-05',
    author: 'Family Admin',
    priority: 'high',
  },
];

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function PortalPage() {
  const {
    isAuthenticated,
    currentUser,
    logout,
    setCurrentPage,
  } = useStore();

  const [activeTab, setActiveTab] = useState('dashboard');

  /* ------------------------------------------------------------------------ */
  /* MESSAGES                                                                 */
  /* ------------------------------------------------------------------------ */

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [treeSearch, setTreeSearch] = useState('');
  const [focusedMemberId, setFocusedMemberId] = useState<string | null>(null);
  const [selectedTreeMember, setSelectedTreeMember] = useState<DbMember | null>(null);

  const focusFamilyMember = (memberId: string) => {
    setFocusedMemberId(memberId);
    const member = dbMembers.find((item) => item.id === memberId);

    if (member) {
      setSelectedTreeMember(member);
    }

    window.setTimeout(() => {
      const element = document.getElementById(
        `family-member-${memberId}`
      );

      element?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }, 100);
  };

  /* ------------------------------------------------------------------------ */
  /* DATABASE DATA                                                             */
  /* ------------------------------------------------------------------------ */

  const [dbEvents, setDbEvents] = useState<DbEvent[]>([]);
  const [dbAnnouncements, setDbAnnouncements] = useState<DbAnnouncement[]>([]);
  const [dbMembers, setDbMembers] = useState<DbMember[]>([]);
  const [marriages, setMarriages] = useState<Marriage[]>([]);
  const [parentChildRelationships, setParentChildRelationships] =
    useState<ParentChildRelationship[]>([]);

  /* ------------------------------------------------------------------------ */
  /* MARRIAGE FORM                                                             */
  /* ------------------------------------------------------------------------ */

  const [showMarriageForm, setShowMarriageForm] = useState(false);
  const [marriageSpouse1, setMarriageSpouse1] = useState('');
  const [marriageSpouse2, setMarriageSpouse2] = useState('');
  const [marriageDate, setMarriageDate] = useState('');
  const [marriageStatus, setMarriageStatus] = useState('married');
  const [marriageFormError, setMarriageFormError] = useState('');
  const [postingMarriage, setPostingMarriage] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* CHILD RELATIONSHIP                                                       */
  /* ------------------------------------------------------------------------ */

  const [selectedMarriageId, setSelectedMarriageId] = useState('');
  const [selectedChildId, setSelectedChildId] = useState('');
  const [relationshipError, setRelationshipError] = useState('');
  const [savingRelationship, setSavingRelationship] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* EVENT FORM                                                                */
  /* ------------------------------------------------------------------------ */

  const [showEventForm, setShowEventForm] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventType, setEventType] = useState('celebration');
  const [postingEvent, setPostingEvent] = useState(false);
  const [eventFormError, setEventFormError] = useState('');
  const [eventImageFile, setEventImageFile] = useState<File | null>(null);
  const [eventImagePreview, setEventImagePreview] =
    useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* ANNOUNCEMENT FORM                                                        */
  /* ------------------------------------------------------------------------ */

  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annPriority, setAnnPriority] = useState('medium');
  const [postingAnn, setPostingAnn] = useState(false);
  const [annFormError, setAnnFormError] = useState('');

  /* ------------------------------------------------------------------------ */
  /* MEMBER FORM                                                              */
  /* ------------------------------------------------------------------------ */

  const [showMemberForm, setShowMemberForm] = useState(false);

  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('');
  const [memberBio, setMemberBio] = useState('');
  const [memberGeneration, setMemberGeneration] = useState('1');
  const [memberBirthDate, setMemberBirthDate] = useState('');
  const [memberDateOfPassing, setMemberDateOfPassing] = useState('');
  const [memberLocation, setMemberLocation] = useState('');
  const [memberOccupation, setMemberOccupation] = useState('');
  const [memberTags, setMemberTags] = useState('');

  const [memberSpouseId, setMemberSpouseId] = useState('');
  const [memberFatherId, setMemberFatherId] = useState('');
  const [memberMotherId, setMemberMotherId] = useState('');

  const [memberImageFile, setMemberImageFile] =
    useState<File | null>(null);
  const [memberImagePreview, setMemberImagePreview] =
    useState<string | null>(null);

  const [postingMember, setPostingMember] = useState(false);
  const [memberFormError, setMemberFormError] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  /* ------------------------------------------------------------------------ */
  /* FETCH EVENTS                                                             */
  /* ------------------------------------------------------------------------ */

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error loading events:', error);

      

      return;
    }

    if (!data) {
      setDbEvents([]);
      return;
    }

    setDbEvents(
      data.map((event) => ({
        id: event.id,
        title: event.title,
        date: event.date,
        location: event.location || '',
        description: event.description || '',
        type: event.type || 'celebration',
        image: event.image || null,
      }))
    );
  };

  /* ------------------------------------------------------------------------ */
  /* FETCH ANNOUNCEMENTS                                                      */
  /* ------------------------------------------------------------------------ */

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading announcements:', error);
      return;
    }

    if (!data) {
      setDbAnnouncements([]);
      return;
    }

    setDbAnnouncements(
      data.map((announcement) => ({
        id: announcement.id,
        title: announcement.title,
        author:
          announcement.author_name || 'Family Admin',
        date: announcement.created_at,
        priority: announcement.priority || 'medium',
      }))
    );
  };

  /* ------------------------------------------------------------------------ */
  /* FETCH MEMBERS                                                            */
  /* ------------------------------------------------------------------------ */

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('generation', { ascending: true });

    if (error) {
      console.error('Error loading members:', error);
      return;
    }

    if (!data) {
      setDbMembers([]);
      return;
    }

    setDbMembers(
      data.map((member) => ({
        id: member.id,
        name: member.name,
        role: member.role || '',
        image: member.image || '/images/placeholder.jpg',
        dateOfPassing: member.date_of_passing || null,

        age: member.age ?? null,
        bio: member.bio || '',
        generation: Number(member.generation) || 1,
        birthDate: member.birth_date || null,
        location: member.location || null,
        occupation: member.occupation || null,
        tags: Array.isArray(member.tags)
          ? member.tags
          : [],
        marriageId: member.marriage_id || null,
      }))
    );
  };

  /* ------------------------------------------------------------------------ */
  /* FETCH MARRIAGES                                                          */
  /* ------------------------------------------------------------------------ */

  const fetchMarriages = async () => {
    const { data, error } = await supabase
      .from('marriages')
      .select(
        'id, spouse_1_id, spouse_2_id, marriage_date, status'
      )
      .order('marriage_date', {
        ascending: true,
        nullsFirst: false,
      });

    if (error) {
      console.error('Error loading marriages:', error);
      return;
    }

    setMarriages((data || []) as Marriage[]);
  };

  /* ------------------------------------------------------------------------ */
  /* FETCH PARENT CHILD RELATIONSHIPS                                         */
  /* ------------------------------------------------------------------------ */

  const fetchParentChildRelationships = async () => {
    const { data, error } = await supabase
      .from('parent_child_relationships')
      .select(
        'id, parent_id, child_id, relationship_type, created_at'
      )
      .order('created_at', { ascending: true });

    if (error) {
      console.error(
        'Error loading parent-child relationships:',
        error
      );
      return;
    }

    setParentChildRelationships(
      (data || []) as ParentChildRelationship[]
    );
  };

  /* ------------------------------------------------------------------------ */
  /* FORM RESET FUNCTIONS                                                     */
  /* ------------------------------------------------------------------------ */

  const resetMarriageForm = () => {
    setMarriageSpouse1('');
    setMarriageSpouse2('');
    setMarriageDate('');
    setMarriageStatus('married');
    setMarriageFormError('');
  };

  const resetEventForm = () => {
    setEventTitle('');
    setEventDate('');
    setEventLocation('');
    setEventDescription('');
    setEventType('celebration');
    setEventImageFile(null);

    if (eventImagePreview) {
      URL.revokeObjectURL(eventImagePreview);
    }

    setEventImagePreview(null);
    setEventFormError('');
  };

  const resetAnnouncementForm = () => {
    setAnnTitle('');
    setAnnPriority('medium');
    setAnnFormError('');
  };

  const resetMemberForm = () => {
    setMemberName('');
    setMemberRole('');
    setMemberBio('');
    setMemberGeneration('1');
    setMemberBirthDate('');
    setMemberDateOfPassing('');
    setMemberLocation('');
    setMemberOccupation('');
    setMemberTags('');

    setMemberSpouseId('');
    setMemberFatherId('');
    setMemberMotherId('');

    setMemberImageFile(null);

    if (memberImagePreview) {
      URL.revokeObjectURL(memberImagePreview);
    }

    setMemberImagePreview(null);
    setMemberFormError('');
  };

  /* ------------------------------------------------------------------------ */
  /* CREATE MARRIAGE                                                          */
  /* ------------------------------------------------------------------------ */

  const submitMarriage = async () => {
    setMarriageFormError('');

    if (!currentUser || !isAdmin) {
      setMarriageFormError(
        'Only family administrators can create relationships.'
      );
      return;
    }

    if (!marriageSpouse1 || !marriageSpouse2) {
      setMarriageFormError(
        'Please select both spouses.'
      );
      return;
    }

    if (marriageSpouse1 === marriageSpouse2) {
      setMarriageFormError(
        'A person cannot be married to themselves.'
      );
      return;
    }

    try {
      setPostingMarriage(true);

      const { data, error } = await supabase
        .from('marriages')
        .insert({
          spouse_1_id: marriageSpouse1,
          spouse_2_id: marriageSpouse2,
          marriage_date: marriageDate || null,
          status: marriageStatus,
        })
        .select()
        .single();

      if (error) {
        console.error(
          'Error creating marriage:',
          error
        );
        setMarriageFormError(
          error.message ||
            'Unable to create relationship.'
        );
        return;
      }

      /* Keep both members linked to this marriage. */
      if (data?.id) {
        const { error: memberUpdateError } =
          await supabase
            .from('members')
            .update({
              marriage_id: data.id,
            })
            .in('id', [
              marriageSpouse1,
              marriageSpouse2,
            ]);

        if (memberUpdateError) {
          console.warn(
            'Marriage created but member marriage links could not be synchronized:',
            memberUpdateError
          );
        }
      }

      resetMarriageForm();
      setShowMarriageForm(false);

      await Promise.all([
        fetchMarriages(),
        fetchMembers(),
      ]);
    } catch (error) {
      console.error(
        'Unexpected marriage error:',
        error
      );

      setMarriageFormError(
        'Something went wrong. Please try again.'
      );
    } finally {
      setPostingMarriage(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* ASSIGN CHILD TO MARRIAGE                                                 */
  /* ------------------------------------------------------------------------ */

  const assignChildToMarriage = async () => {
    setRelationshipError('');

    if (!currentUser || !isAdmin) {
      setRelationshipError(
        'Only family administrators can assign relationships.'
      );
      return;
    }

    if (!selectedMarriageId || !selectedChildId) {
      setRelationshipError(
        'Please select a marriage and a child.'
      );
      return;
    }

    if (
      selectedChildId ===
        marriageSpouse1 ||
      selectedChildId ===
        marriageSpouse2
    ) {
      setRelationshipError(
        'A spouse cannot be assigned as their own child.'
      );
      return;
    }

    const marriage = marriages.find(
      (item) => item.id === selectedMarriageId
    );

    if (!marriage) {
      setRelationshipError(
        'The selected marriage could not be found.'
      );
      return;
    }

    try {
      setSavingRelationship(true);

      const parentRows = [
        marriage.spouse_1_id,
        marriage.spouse_2_id,
      ]
        .filter(
          (id): id is string =>
            Boolean(id)
        )
        .map((parentId) => ({
          parent_id: parentId,
          child_id: selectedChildId,
          relationship_type: 'parent',
        }));

      if (parentRows.length === 0) {
        setRelationshipError(
          'This marriage has no valid spouse members.'
        );
        return;
      }

      const spouseIds = parentRows.map(
        (row) => row.parent_id
      );

      /*
       * Remove existing links between these parents
       * and this child before inserting the current ones.
       */
      const { error: deleteError } =
        await supabase
          .from('parent_child_relationships')
          .delete()
          .eq('child_id', selectedChildId)
          .in('parent_id', spouseIds);

      if (deleteError) {
        console.error(
          'Error clearing existing parent links:',
          deleteError
        );

        setRelationshipError(
          deleteError.message ||
            'Unable to update parent relationship.'
        );
        return;
      }

      const { error: insertError } =
        await supabase
          .from('parent_child_relationships')
          .insert(parentRows);

      if (insertError) {
        console.error(
          'Error assigning child:',
          insertError
        );

        setRelationshipError(
          insertError.message ||
            'Unable to assign child.'
        );
        return;
      }

      /*
       * The existing schema uses marriage_id to associate
       * a child with the family unit/parent marriage.
       */
      const { error: memberUpdateError } =
        await supabase
          .from('members')
          .update({
            marriage_id: selectedMarriageId,
          })
          .eq('id', selectedChildId);

      if (memberUpdateError) {
        console.warn(
          'Parent relationship saved, but marriage_id could not be synchronized:',
          memberUpdateError
        );
      }

      setSelectedChildId('');

      await Promise.all([
        fetchMembers(),
        fetchParentChildRelationships(),
      ]);
    } catch (error) {
      console.error(
        'Unexpected relationship error:',
        error
      );

      setRelationshipError(
        'Something went wrong. Please try again.'
      );
    } finally {
      setSavingRelationship(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* IMAGE HANDLERS                                                            */
  /* ------------------------------------------------------------------------ */

  const handleEventImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) return;

    if (eventImagePreview) {
      URL.revokeObjectURL(eventImagePreview);
    }

    setEventImageFile(selectedFile);
    setEventImagePreview(
      URL.createObjectURL(selectedFile)
    );
  };

  const handleMemberImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) return;

    if (memberImagePreview) {
      URL.revokeObjectURL(memberImagePreview);
    }

    setMemberImageFile(selectedFile);
    setMemberImagePreview(
      URL.createObjectURL(selectedFile)
    );
  };

  /* ------------------------------------------------------------------------ */
  /* CREATE EVENT                                                              */
  /* ------------------------------------------------------------------------ */

  const submitEvent = async () => {
    setEventFormError('');

    if (
      !eventTitle.trim() ||
      !eventDate ||
      !eventLocation.trim()
    ) {
      setEventFormError(
        'Please fill in the title, date, and location.'
      );
      return;
    }

    if (!currentUser) {
      setEventFormError(
        'You must be signed in to create an event.'
      );
      return;
    }

    if (!isAdmin) {
      setEventFormError(
        'Only family administrators can create events.'
      );
      return;
    }

    try {
      setPostingEvent(true);

      let imageUrl: string | null = null;

      if (eventImageFile) {
        const extension =
          eventImageFile.name
            .split('.')
            .pop()
            ?.toLowerCase() || 'jpg';

        const fileName =
          `events/${currentUser.id}-${Date.now()}.${extension}`;

        const { error: uploadError } =
          await supabase.storage
            .from('gallery-photos')
            .upload(
              fileName,
              eventImageFile,
              {
                cacheControl: '3600',
                upsert: false,
              }
            );

        if (uploadError) {
          console.error(
            'Event image upload error:',
            uploadError
          );

          setEventFormError(
            'Image upload failed. Please try again.'
          );
          return;
        }

        const { data: publicUrlData } =
          supabase.storage
            .from('gallery-photos')
            .getPublicUrl(fileName);

        imageUrl =
          publicUrlData.publicUrl;
      }

      const { error: insertError } =
        await supabase.from('events').insert({
          title: eventTitle.trim(),
          date: eventDate,
          location: eventLocation.trim(),
          description:
            eventDescription.trim(),
          type: eventType,
          image: imageUrl,
          created_by: currentUser.id,
        });

      if (insertError) {
        console.error(
          'Error posting event:',
          insertError
        );

        setEventFormError(
          insertError.message ||
            'Something went wrong while creating the event.'
        );
        return;
      }

      resetEventForm();
      setShowEventForm(false);

      await fetchEvents();
    } catch (error) {
      console.error(
        'Unexpected event error:',
        error
      );

      setEventFormError(
        'Something went wrong. Please try again.'
      );
    } finally {
      setPostingEvent(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* CREATE ANNOUNCEMENT                                                       */
  /* ------------------------------------------------------------------------ */

  const submitAnnouncement = async () => {
    setAnnFormError('');

    if (!annTitle.trim()) {
      setAnnFormError(
        'Please enter an announcement title.'
      );
      return;
    }

    if (!currentUser) {
      setAnnFormError(
        'You must be signed in.'
      );
      return;
    }

    if (!isAdmin) {
      setAnnFormError(
        'Only family administrators can post announcements.'
      );
      return;
    }

    try {
      setPostingAnn(true);

      const { error } =
        await supabase
          .from('announcements')
          .insert({
            title: annTitle.trim(),
            author_name:
              currentUser.name,
            priority: annPriority,
            created_by: currentUser.id,
          });

      if (error) {
        console.error(
          'Error posting announcement:',
          error
        );

        setAnnFormError(
          error.message ||
            'Something went wrong. Please try again.'
        );
        return;
      }

      resetAnnouncementForm();
      setShowAnnouncementForm(false);

      await fetchAnnouncements();
    } catch (error) {
      console.error(
        'Unexpected announcement error:',
        error
      );

      setAnnFormError(
        'Something went wrong. Please try again.'
      );
    } finally {
      setPostingAnn(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* CREATE MEMBER                                                             */
  /* ------------------------------------------------------------------------ */

  const submitMember = async () => {
    setMemberFormError('');

    if (
      !memberName.trim() ||
      !memberRole.trim() ||
      !memberBio.trim()
    ) {
      setMemberFormError(
        'Please fill in the name, role, and bio.'
      );
      return;
    }

    if (!currentUser) {
      setMemberFormError(
        'You must be signed in.'
      );
      return;
    }

    if (!isAdmin) {
      setMemberFormError(
        'Only family administrators can add members.'
      );
      return;
    }

    if (
      memberFatherId &&
      memberFatherId === memberMotherId
    ) {
      setMemberFormError(
        'Father and mother cannot be the same person.'
      );
      return;
    }

    if (
      memberSpouseId &&
      (
        memberSpouseId === memberFatherId ||
        memberSpouseId === memberMotherId
      )
    ) {
      setMemberFormError(
        'The spouse cannot also be selected as the father or mother.'
      );
      return;
    }

    try {
      setPostingMember(true);

      let imageUrl =
        '/images/placeholder.jpg';

      if (memberImageFile) {
        const extension =
          memberImageFile.name
            .split('.')
            .pop()
            ?.toLowerCase() || 'jpg';

        const fileName =
          `members/${currentUser.id}-${Date.now()}.${extension}`;

        const { error: uploadError } =
          await supabase.storage
            .from('gallery-photos')
            .upload(
              fileName,
              memberImageFile,
              {
                cacheControl: '3600',
                upsert: false,
              }
            );

        if (uploadError) {
          console.error(
            'Member image upload error:',
            uploadError
          );

          setMemberFormError(
            'Image upload failed. Please try again.'
          );
          return;
        }

        const { data: publicUrlData } =
          supabase.storage
            .from('gallery-photos')
            .getPublicUrl(fileName);

        imageUrl =
          publicUrlData.publicUrl;
      }

      const tagsArray =
        memberTags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);

      const { data: createdMember, error } =
        await supabase
          .from('members')
          .insert({
            name: memberName.trim(),
            role: memberRole.trim(),
            bio: memberBio.trim(),
            image: imageUrl,
            generation:
              Number(memberGeneration) || 1,
            birth_date:
              memberBirthDate || null,
            date_of_passing:
              memberDateOfPassing || null,
            location:
              memberLocation.trim() || null,
            occupation:
              memberOccupation.trim() || null,
            tags: tagsArray,
            created_by: currentUser.id,
          })
          .select()
          .single();

      if (error) {
        console.error(
          'Error adding member:',
          error
        );

        setMemberFormError(
          error.message ||
            'Something went wrong. Please try again.'
        );
        return;
      }

      if (!createdMember?.id) {
        setMemberFormError(
          'Member was created, but the new member ID could not be returned.'
        );

        await fetchMembers();
        return;
      }

      const newMemberId =
        createdMember.id;

      /* -------------------------------------------------------------------- */
      /* SPOUSE                                                                */
      /* -------------------------------------------------------------------- */

      if (memberSpouseId) {
        const { data: newMarriage, error: marriageError } =
          await supabase
            .from('marriages')
            .insert({
              spouse_1_id:
                newMemberId,
              spouse_2_id:
                memberSpouseId,
              status: 'married',
            })
            .select()
            .single();

        if (marriageError) {
          console.error(
            'Error creating spouse relationship:',
            marriageError
          );
        } else if (newMarriage?.id) {
          /*
           * IMPORTANT:
           * Both spouses receive the marriage ID.
           */
          const {
            error: marriageLinkError,
          } = await supabase
            .from('members')
            .update({
              marriage_id:
                newMarriage.id,
            })
            .in('id', [
              newMemberId,
              memberSpouseId,
            ]);

          if (marriageLinkError) {
            console.warn(
              'Marriage created but member marriage links could not be synchronized:',
              marriageLinkError
            );
          }
        }
      }

      /* -------------------------------------------------------------------- */
      /* FATHER                                                                */
      /* -------------------------------------------------------------------- */

      if (memberFatherId) {
        const {
          error: fatherError,
        } = await supabase
          .from(
            'parent_child_relationships'
          )
          .insert({
            parent_id:
              memberFatherId,
            child_id:
              newMemberId,
            relationship_type:
              'father',
          });

        if (fatherError) {
          console.error(
            'Error linking father:',
            fatherError
          );
        }
      }

      /* -------------------------------------------------------------------- */
      /* MOTHER                                                                */
      /* -------------------------------------------------------------------- */

      if (memberMotherId) {
        const {
          error: motherError,
        } = await supabase
          .from(
            'parent_child_relationships'
          )
          .insert({
            parent_id:
              memberMotherId,
            child_id:
              newMemberId,
            relationship_type:
              'mother',
          });

        if (motherError) {
          console.error(
            'Error linking mother:',
            motherError
          );
        }
      }

      resetMemberForm();
      setShowMemberForm(false);

      await Promise.all([
        fetchMembers(),
        fetchMarriages(),
        fetchParentChildRelationships(),
      ]);
    } catch (error) {
      console.error(
        'Unexpected member error:',
        error
      );

      setMemberFormError(
        'Something went wrong. Please try again.'
      );
    } finally {
      setPostingMember(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* MESSAGES                                                                 */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!isAuthenticated) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    const fetchMessages = async () => {
      const { data, error } =
        await supabase
          .from('messages')
          .select(
            'id, created_at, user_id, author_name, text'
          )
          .order('created_at', {
            ascending: false,
          });

      if (cancelled) return;

      if (error) {
        console.error(
          'Error loading messages:',
          error
        );

        setMessageError(
          'Unable to load family messages.'
        );
        return;
      }

      setMessages(
        (data || []) as Message[]
      );
    };

    fetchMessages();

    const channel =
      supabase
        .channel(
          `family-messages-${Date.now()}`
        )
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

            setMessages((previous) =>
              previous.some(
                (item) =>
                  item.id ===
                  newMessage.id
              )
                ? previous
                : [
                    newMessage,
                    ...previous,
                  ]
            );
          }
        )
        .subscribe((status) => {
          console.log(
            'Messages realtime status:',
            status
          );
        });

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

  /* ------------------------------------------------------------------------ */
  /* SEND MESSAGE                                                              */
  /* ------------------------------------------------------------------------ */

  const sendMessage = async () => {
    const trimmedMessage =
      message.trim();

    if (!trimmedMessage) return;

    if (!currentUser) {
      setMessageError(
        'You must be signed in to send a message.'
      );
      return;
    }

    try {
      setSendingMessage(true);
      setMessageError('');

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error(
          'Authentication error:',
          authError
        );

        setMessageError(
          'Your session has expired. Please sign in again.'
        );
        return;
      }

      if (!user) {
        setMessageError(
          'No authenticated user found. Please sign in again.'
        );
        return;
      }

      const { error } =
        await supabase
          .from('messages')
          .insert({
            user_id: user.id,
            author_name:
              currentUser.name,
            text: trimmedMessage,
          });

      if (error) {
        console.error(
          'Error sending message:',
          error
        );

        setMessageError(
          error.message ||
            'Unable to send message.'
        );
        return;
      }

      setMessage('');
    } catch (error) {
      console.error(
        'Unexpected message error:',
        error
      );

      setMessageError(
        'Something went wrong while sending your message.'
      );
    } finally {
      setSendingMessage(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* LOAD DATA                                                                 */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!isAuthenticated) return;

    void fetchEvents();
    void fetchAnnouncements();
    void fetchMembers();
    void fetchMarriages();
    void fetchParentChildRelationships();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!selectedTreeMember) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedTreeMember(null);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedTreeMember]);

  /* ------------------------------------------------------------------------ */
  /* DATA HELPERS                                                              */
  /* ------------------------------------------------------------------------ */

  const allEvents = [
    ...dbEvents,
    ...familyEvents,
  ];

  const allAnnouncements = [
    ...dbAnnouncements,
    ...fallbackAnnouncements,
  ];

  const allMembers = [
    ...dbMembers,
  ];

  const getParentsOfChild = (
    childId: string
  ) =>
    parentChildRelationships
      .filter(
        (relationship) =>
          relationship.child_id ===
          childId
      )
      .map((relationship) => ({
        ...relationship,
        parent:
          allMembers.find(
            (member) =>
              member.id ===
              relationship.parent_id
          ),
      }))
      .filter(
        (relationship) =>
          Boolean(relationship.parent)
      );

  const getChildrenOfParent = (
    parentId: string
  ) =>
    parentChildRelationships
      .filter(
        (relationship) =>
          relationship.parent_id ===
          parentId
      )
      .map((relationship) =>
        allMembers.find(
          (member) =>
            member.id ===
            relationship.child_id
        )
      )
      .filter(
        (
          member
        ): member is DbMember =>
          Boolean(member)
      );

  const getMemberName = (
    id: string | null
  ) =>
    dbMembers.find(
      (member) =>
        member.id === id
    )?.name ||
    'Unknown member';

  const getMarriageChildren = (
    marriageId: string
  ) => {
    const marriage =
      marriages.find(
        (item) =>
          item.id ===
          marriageId
      );

    if (!marriage) return [];

    const parentIds = [
      marriage.spouse_1_id,
      marriage.spouse_2_id,
    ].filter(
      (
        id
      ): id is string =>
        Boolean(id)
    );

    const childIds =
      parentChildRelationships
        .filter((relationship) =>
          parentIds.includes(
            relationship.parent_id
          )
        )
        .map(
          (relationship) =>
            relationship.child_id
        );

    return allMembers.filter(
      (member) =>
        childIds.includes(
          member.id
        )
    );
  };

  /* ------------------------------------------------------------------------ */
  /* FAMILY TREE                                                              */
  /* ------------------------------------------------------------------------ */

  const buildTree = (): TreeNode[] => {
    const memberMap = new Map<string, DbMember>(
      dbMembers.map((member) => [member.id, member])
    );

    /*
     * FIX: resolve exactly ONE marriage per child up front, so a child
     * is never matched under more than one marriage group in the tree.
     * Previously, getChildrenForMarriage unioned three overlapping sets
     * (explicit marriageId, both-parents match, either-parent match)
     * and only deduped WITHIN a single marriage's list — a child linked
     * to just one parent who had multiple marriages would appear once
     * per marriage. This map deduplicates GLOBALLY across marriages.
     *
     * Priority:
     *   1) member.marriageId, if it points to a real marriage.
     *   2) A marriage where BOTH spouses are recorded parents of the child.
     *   3) A marriage where AT LEAST ONE spouse is a recorded parent
     *      (first match wins).
     */
    const childToMarriageId = new Map<string, string>();

    dbMembers.forEach((member) => {
      const parentIds = new Set(
        parentChildRelationships
          .filter(
            (relationship) =>
              relationship.child_id === member.id
          )
          .map((relationship) => relationship.parent_id)
      );

      if (
        member.marriageId &&
        marriages.some(
          (marriage) => marriage.id === member.marriageId
        )
      ) {
        childToMarriageId.set(member.id, member.marriageId);
        return;
      }

      if (parentIds.size === 0) return;

      const bothParentsMatch = marriages.find((marriage) => {
        const spouseIds = [
          marriage.spouse_1_id,
          marriage.spouse_2_id,
        ].filter((id): id is string => Boolean(id));

        return (
          spouseIds.length > 0 &&
          spouseIds.every((spouseId) => parentIds.has(spouseId))
        );
      });

      if (bothParentsMatch) {
        childToMarriageId.set(member.id, bothParentsMatch.id);
        return;
      }

      const singleParentMatch = marriages.find((marriage) => {
        const spouseIds = [
          marriage.spouse_1_id,
          marriage.spouse_2_id,
        ].filter((id): id is string => Boolean(id));

        return spouseIds.some((spouseId) => parentIds.has(spouseId));
      });

      if (singleParentMatch) {
        childToMarriageId.set(member.id, singleParentMatch.id);
      }
    });

    const getChildrenForMarriage = (
      marriage: Marriage
    ): DbMember[] =>
      dbMembers.filter(
        (member) =>
          childToMarriageId.get(member.id) === marriage.id
      );

    const buildNode = (
      member: DbMember,
      ancestorIds: Set<string> = new Set()
    ): TreeNode => {
      /*
       * Prevent circular family relationships.
       */
      if (
        ancestorIds.has(
          member.id
        )
      ) {
        return {
          member,
          marriages: [],
        };
      }

      const nextAncestorIds =
        new Set(
          ancestorIds
        );

      nextAncestorIds.add(
        member.id
      );

      const memberMarriages =
        marriages.filter(
          (marriage) =>
            marriage.spouse_1_id ===
              member.id ||
            marriage.spouse_2_id ===
              member.id
        );

      const marriageGroups: MarriageGroup[] =
        memberMarriages
          .map(
            (
              marriage
            ): MarriageGroup | null => {
              const spouseId =
                marriage.spouse_1_id ===
                member.id
                  ? marriage.spouse_2_id
                  : marriage.spouse_1_id;

              if (
                !spouseId ||
                spouseId ===
                  member.id
              ) {
                return null;
              }

              const spouse =
                memberMap.get(
                  spouseId
                );

              if (!spouse) {
                return null;
              }

              const marriageChildren =
                getChildrenForMarriage(
                  marriage
                );

              const children =
                marriageChildren
                  .filter(
                    (child) =>
                      child.id !==
                      member.id
                  )
                  .filter(
                    (child) =>
                      child.id !==
                      spouse.id
                  )
                  .filter(
                    (child) =>
                      !nextAncestorIds.has(
                        child.id
                      )
                  )
                  .map(
                    (child) =>
                      buildNode(
                        child,
                        nextAncestorIds
                      )
                  );

              return {
                id: marriage.id,
                spouse1: member,
                spouse2: spouse,
                children,
              };
            }
          )
          .filter(
            (
              marriage
            ): marriage is MarriageGroup =>
              marriage !== null
          );

      return {
        member,
        marriages:
          marriageGroups,
      };
    };

    /*
     * Any person appearing as a child is not a root.
     */
    const childIds =
      new Set(
        parentChildRelationships.map(
          (relationship) =>
            relationship.child_id
        )
      );

    const possibleRoots =
      dbMembers.filter(
        (member) =>
          !childIds.has(
            member.id
          )
      );

    if (
      possibleRoots.length === 0
    ) {
      return dbMembers.length > 0
        ? [buildNode(dbMembers[0])]
        : [];
    }

    /*
     * Select the oldest generation
     * among the possible roots.
     */
    const oldestGeneration =
      Math.min(
        ...possibleRoots.map(
          (member) =>
            Number(
              member.generation
            ) || 1
        )
      );

    const oldestRoots =
      possibleRoots.filter(
        (member) =>
          (Number(
            member.generation
          ) || 1) ===
          oldestGeneration
      );

    /*
     * If two oldest roots are married,
     * use the marriage as the main root.
     */
    const rootMarriage =
      marriages.find(
        (marriage) =>
          marriage.spouse_1_id &&
          marriage.spouse_2_id &&
          oldestRoots.some(
            (root) =>
              root.id ===
              marriage.spouse_1_id
          ) &&
          oldestRoots.some(
            (root) =>
              root.id ===
              marriage.spouse_2_id
          )
      );

    const mainRoot =
      rootMarriage?.spouse_1_id
        ? memberMap.get(
            rootMarriage.spouse_1_id
          )
        : oldestRoots[0];

    return mainRoot
      ? [buildNode(mainRoot)]
      : [];
  };

  /* ------------------------------------------------------------------------ */
  /* NOT AUTHENTICATED                                                        */
  /* ------------------------------------------------------------------------ */

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 flex items-center justify-center p-4 pt-24">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
            <Lock
              size={40}
              className="text-blue-400"
            />
          </div>

          <h2 className="font-montserrat text-4xl font-bold text-white mb-4">
            Family Portal Access
          </h2>

          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            The Kornu Family Portal is
            exclusive to family members.
            Please sign in with your
            family credentials to continue.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8 text-left">
            {[
              {
                icon: MessageCircle,
                title: 'Family Chat',
                desc: 'Private family board',
              },
              {
                icon: TreePine,
                title: 'Family Tree',
                desc: 'Explore your heritage',
              },
              {
                icon: FileText,
                title: 'Documents',
                desc: 'Shared family files',
              },
              {
                icon: Image,
                title: 'Private Gallery',
                desc: 'Exclusive photos',
              },
            ].map(
              ({
                icon: Icon,
                title,
                desc,
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
              setCurrentPage(
                'signin'
              );

              window.scrollTo({
                top: 0,
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

  /* ------------------------------------------------------------------------ */
  /* AUTHENTICATED PORTAL                                                     */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-gray-50 pt-[70px]">
      {/* ==================================================================== */}
      {/* HEADER                                                                */}
      {/* ==================================================================== */}

      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-orange-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 25px 25px, white 2px, transparent 0)',
              backgroundSize:
                '50px 50px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
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

                  {isAdmin && (
                    <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                      Admin
                    </span>
                  )}
                </div>

                <h1 className="font-montserrat text-2xl font-bold text-white">
                  Welcome,{' '}
                  {currentUser?.name?.split(
                    ' '
                  )[0]}
                  !
                </h1>

                <p className="text-gray-400 text-sm">
                  {currentUser?.email}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-all"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>

          {/* ================================================================= */}
          {/* TABS                                                               */}
          {/* ================================================================= */}

          <div className="flex gap-2 mt-6 overflow-x-auto pb-1">
            {[
              {
                id: 'dashboard',
                label: 'Dashboard',
                icon: Star,
              },
              {
                id: 'messages',
                label: 'Family Chat',
                icon: MessageCircle,
              },
              {
                id: 'members',
                label: 'Members',
                icon: Users,
              },
              {
                id: 'relationships',
                label: 'Relationships',
                icon: Heart,
              },
              {
                id: 'events',
                label: 'Events',
                icon: Calendar,
              },
              {
                id: 'announcements',
                label: 'Announcements',
                icon: Bell,
              },
              {
                id: 'tree',
                label: 'Family Tree',
                icon: TreePine,
              },
            ].map(
              ({
                id,
                label,
                icon: Icon,
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

      {/* ==================================================================== */}
      {/* CONTENT                                                               */}
      {/* ==================================================================== */}

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ================================================================== */}
        {/* DASHBOARD                                                           */}
        {/* ================================================================== */}

        {activeTab ===
          'dashboard' && (
          <div className="space-y-8">

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  icon: Users,
                  label:
                    'Family Members',
                  value:
                    allMembers.length,
                  color:
                    'text-orange-500',
                  bg:
                    'bg-orange-50',
                },
                {
                  icon: Calendar,
                  label:
                    'Upcoming Events',
                  value:
                    allEvents.length,
                  color:
                    'text-blue-500',
                  bg:
                    'bg-blue-50',
                },
                {
                  icon: MessageCircle,
                  label:
                    'Family Stories',
                  value:
                    familyStories.length,
                  color:
                    'text-purple-500',
                  bg:
                    'bg-purple-50',
                },
                {
                  icon: Heart,
                  label:
                    'Countries',
                  value: 8,
                  color:
                    'text-pink-500',
                  bg:
                    'bg-pink-50',
                },
              ].map(
                ({
                  icon: Icon,
                  label,
                  value,
                  color,
                  bg,
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
                    count,
                  }) => (
                    <button
                      key={id}
                      onClick={() =>
                        setActiveTab(id)
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

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-montserrat text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Bell
                  size={18}
                  className="text-orange-500"
                />
                Latest Announcements
              </h2>

              <div className="space-y-3">
                {allAnnouncements.map(
                  (announcement) => (
                    <div
                      key={
                        announcement.id
                      }
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                          announcement.priority ===
                          'high'
                            ? 'bg-orange-500'
                            : 'bg-blue-400'
                        }`}
                      />

                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">
                          {
                            announcement.title
                          }
                        </p>

                        <p className="text-gray-400 text-xs mt-0.5">
                          By{' '}
                          {
                            announcement.author
                          }{' '}
                          ·{' '}
                          {new Date(
                            announcement.date
                          ).toLocaleDateString(
                            'en-GB',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            }
                          )}
                        </p>
                      </div>

                      {announcement.priority ===
                        'high' && (
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-semibold">
                          Important
                        </span>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl p-8 text-white">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={20} />

                <h3 className="font-montserrat text-xl font-bold">
                  Family Activity
                </h3>
              </div>

              <div className="grid grid-cols-12 gap-1 items-end h-20">
                {[
                  40,
                  60,
                  45,
                  80,
                  55,
                  90,
                  70,
                  85,
                  60,
                  95,
                  75,
                  100,
                ].map(
                  (
                    height,
                    index
                  ) => (
                    <div
                      key={index}
                      className="bg-white/30 hover:bg-white/50 rounded-sm transition-all cursor-pointer"
                      style={{
                        height: `${height}%`,
                      }}
                      title={`Month ${
                        index + 1
                      }`}
                    />
                  )
                )}
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
                Family engagement
                across all portal
                features
              </p>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* MESSAGES                                                            */}
        {/* ================================================================== */}

        {activeTab ===
          'messages' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-pink-50">
              <h2 className="font-montserrat text-xl font-bold text-gray-900 flex items-center gap-2">
                <MessageCircle
                  size={20}
                  className="text-orange-500"
                />
                Family Message Board
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Private family conversations —
                only visible to family members
              </p>
            </div>

            <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              {messages.length ===
              0 ? (
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
                messages.map(
                  (msg) => {
                    const isMine =
                      msg.user_id ===
                      currentUser?.id;

                    const avatar =
                      msg.author_name
                        ? msg.author_name
                            .split(
                              ' '
                            )
                            .map(
                              (name) =>
                                name.charAt(
                                  0
                                )
                            )
                            .join('')
                            .slice(
                              0,
                              2
                            )
                            .toUpperCase()
                        : 'F';

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
                              minute: '2-digit',
                            }
                          )
                        : '';

                    return (
                      <div
                        key={
                          msg.id
                        }
                        className={`flex gap-3 ${
                          isMine
                            ? 'flex-row-reverse'
                            : ''
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm ${
                            isMine
                              ? 'bg-gradient-to-br from-orange-500 to-red-500'
                              : 'bg-gradient-to-br from-gray-400 to-gray-600'
                          }`}
                        >
                          {avatar}
                        </div>

                        <div
                          className={`max-w-[75%] ${
                            isMine
                              ? 'items-end'
                              : 'items-start'
                          } flex flex-col gap-1`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-700">
                              {
                                msg.author_name
                              }
                            </span>

                            <span className="text-xs text-gray-400">
                              {
                                messageTime
                              }
                            </span>
                          </div>

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
                  }
                )
              )}
            </div>

            {messageError && (
              <div className="mx-4 mb-3 bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                {messageError}
              </div>
            )}

            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {currentUser?.name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(event) => {
                      setMessage(
                        event.target
                          .value
                      );

                      if (
                        messageError
                      ) {
                        setMessageError(
                          ''
                        );
                      }
                    }}
                    onKeyDown={(
                      event
                    ) => {
                      if (
                        event.key ===
                          'Enter' &&
                        !event.shiftKey
                      ) {
                        event.preventDefault();
                        void sendMessage();
                      }
                    }}
                    placeholder="Share a message with the family..."
                    className="input-field flex-1"
                    disabled={
                      sendingMessage
                    }
                  />

                  <button
                    onClick={() =>
                      void sendMessage()
                    }
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

        {/* ================================================================== */}
        {/* MEMBERS                                                             */}
        {/* ================================================================== */}

        {activeTab ===
          'members' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-montserrat text-xl font-bold text-gray-900">
                Family Members Directory
              </h2>

              {isAdmin && (
                <button
                  onClick={() => {
                    resetMemberForm();
                    setShowMemberForm(
                      true
                    );
                  }}
                  className="btn-primary py-2 px-4 text-sm"
                >
                  <Plus size={14} />
                  Add Member
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allMembers.map(
                (member) => (
                  <div
                    key={
                      member.id
                    }
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 card-hover"
                  >
                    <img
                      src={
                        member.image
                      }
                      alt={
                        member.name
                      }
                      className="w-14 h-14 rounded-full object-cover flex-shrink-0 ring-2 ring-orange-100"
                      onError={(
                        event
                      ) => {
                        const target =
                          event.currentTarget;

                        if (
                          target.src.includes(
                            'placeholder.jpg'
                          )
                        ) {
                          return;
                        }

                        target.src =
                          '/images/placeholder.jpg';
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 font-montserrat text-sm">
                        {
                          member.name
                        }
                      </h3>

                      <p className="text-orange-500 text-xs font-medium">
                        {
                          member.role
                        }
                      </p>

                      <p className="text-gray-400 text-xs mt-0.5 truncate">
                        {member.location ||
                          'Location not specified'}{' '}
                        ·{' '}
                        {member.occupation ||
                          'Occupation not specified'}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs">
                        {member.birthDate && (
                          <span className="text-gray-500">
                            <span className="font-medium text-gray-700">
                              Born:
                            </span>{' '}
                            {new Date(
                              member.birthDate
                            ).toLocaleDateString(
                              'en-GB',
                              {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              }
                            )}
                          </span>
                        )}

                        {member.dateOfPassing && (
                          <span className="text-gray-500">
                            <span className="font-medium text-gray-700">
                              Passed:
                            </span>{' '}
                            {new Date(
                              member.dateOfPassing
                            ).toLocaleDateString(
                              'en-GB',
                              {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              }
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                        member.generation ===
                        1
                          ? 'bg-orange-100 text-orange-700'
                          : member.generation ===
                            2
                          ? 'bg-pink-100 text-pink-700'
                          : member.generation ===
                            3
                          ? 'bg-purple-100 text-purple-700'
                          : member.generation ===
                            4
                          ? 'bg-emerald-100 text-emerald-700'
                          : member.generation ===
                            5
                          ? 'bg-violet-100 text-violet-700'
                          : 'bg-cyan-100 text-cyan-700'
                      }`}
                    >
                      Gen{' '}
                      {
                        member.generation
                      }
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* RELATIONSHIPS                                                       */}
        {/* ================================================================== */}

        {activeTab ===
          'relationships' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-montserrat text-xl font-bold text-gray-900">
                  Family Relationships
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  Connect spouses and assign
                  children to the correct
                  family unit.
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => {
                    resetMarriageForm();
                    setShowMarriageForm(
                      true
                    );
                  }}
                  className="btn-primary py-2 px-4 text-sm"
                >
                  <Plus size={14} />
                  Add Marriage
                </button>
              )}
            </div>

            {isAdmin && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Heart
                    size={18}
                    className="text-orange-500"
                  />

                  <h3 className="font-montserrat font-bold text-gray-900">
                    Assign a Child to a
                    Marriage
                  </h3>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  <select
                    value={
                      selectedMarriageId
                    }
                    onChange={(event) =>
                      setSelectedMarriageId(
                        event.target.value
                      )
                    }
                    className="input-field"
                  >
                    <option value="">
                      Select marriage
                    </option>

                    {marriages.map(
                      (
                        marriage
                      ) => (
                        <option
                          key={
                            marriage.id
                          }
                          value={
                            marriage.id
                          }
                        >
                          {
                            getMemberName(
                              marriage.spouse_1_id
                            )
                          }{' '}
                          &{' '}
                          {
                            getMemberName(
                              marriage.spouse_2_id
                            )
                          }
                        </option>
                      )
                    )}
                  </select>

                  <select
                    value={
                      selectedChildId
                    }
                    onChange={(event) =>
                      setSelectedChildId(
                        event.target.value
                      )
                    }
                    className="input-field"
                  >
                    <option value="">
                      Select child
                    </option>

                    {dbMembers.map(
                      (
                        member
                      ) => (
                        <option
                          key={
                            member.id
                          }
                          value={
                            member.id
                          }
                        >
                          {
                            member.name
                          }{' '}
                          — Gen{' '}
                          {
                            member.generation
                          }
                        </option>
                      )
                    )}
                  </select>

                  <button
                    onClick={() =>
                      void assignChildToMarriage()
                    }
                    disabled={
                      savingRelationship
                    }
                    className="btn-primary justify-center disabled:opacity-60"
                  >
                    {savingRelationship
                      ? 'Saving...'
                      : 'Assign Child'}
                  </button>
                </div>

                {relationshipError && (
                  <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                    {
                      relationshipError
                    }
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              {marriages.length ===
              0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                  <Heart
                    size={36}
                    className="mx-auto text-gray-300 mb-3"
                  />

                  <p className="text-gray-500">
                    No marriages or
                    partnerships have
                    been added yet.
                  </p>

                  {isAdmin && (
                    <p className="text-gray-400 text-sm mt-1">
                      Use "Add Marriage"
                      to create the
                      first family
                      relationship.
                    </p>
                  )}
                </div>
              ) : (
                marriages.map(
                  (
                    marriage
                  ) => {
                    const children =
                      getMarriageChildren(
                        marriage.id
                      );

                    return (
                      <div
                        key={
                          marriage.id
                        }
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                      >
                        <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Heart
                                size={17}
                                className="text-orange-500"
                              />

                              <span className="text-xs font-semibold uppercase tracking-wider text-orange-500">
                                {
                                  marriage.status
                                }
                              </span>
                            </div>

                            <h3 className="font-montserrat text-lg font-bold text-gray-900">
                              {
                                getMemberName(
                                  marriage.spouse_1_id
                                )
                              }{' '}
                              &{' '}
                              {
                                getMemberName(
                                  marriage.spouse_2_id
                                )
                              }
                            </h3>

                            <p className="text-gray-500 text-sm mt-1">
                              {marriage.marriage_date
                                ? `Married ${new Date(
                                    marriage.marriage_date
                                  ).toLocaleDateString(
                                    'en-GB',
                                    {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                    }
                                  )}`
                                : 'Marriage date not specified'}
                            </p>
                          </div>

                          <div className="bg-orange-50 rounded-xl px-4 py-3 min-w-[150px]">
                            <div className="text-2xl font-black text-orange-500">
                              {
                                children.length
                              }
                            </div>

                            <div className="text-xs text-gray-500">
                              Children assigned
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-100 bg-gray-50 p-5">
                          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                            Children
                          </p>

                          {children.length ===
                          0 ? (
                            <p className="text-sm text-gray-400">
                              No children
                              have been
                              assigned to
                              this marriage
                              yet.
                            </p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {children.map(
                                (
                                  child
                                ) => {
                                  const parents =
                                    getParentsOfChild(
                                      child.id
                                    );

                                  return (
                                    <div
                                      key={
                                        child.id
                                      }
                                      className="bg-white border border-gray-200 rounded-2xl px-3 py-2"
                                    >
                                      <div className="text-sm font-medium text-gray-700">
                                        {
                                          child.name
                                        }
                                      </div>

                                      {parents.length >
                                        0 && (
                                        <div className="text-[11px] text-gray-400 mt-1">
                                          Parents:{' '}
                                          {parents
                                            .map(
                                              (
                                                item
                                              ) =>
                                                item.parent
                                                  ?.name
                                            )
                                            .filter(
                                              Boolean
                                            )
                                            .join(
                                              ' & '
                                            )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                )
              )}
            </div>

            <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-1">
                <Users
                  size={18}
                  className="text-orange-500"
                />

                <h3 className="font-montserrat font-bold text-gray-900">
                  Children by Parent
                </h3>
              </div>

              <p className="text-gray-500 text-sm mb-5">
                Every member who has at
                least one recorded child,
                and who those children are.
              </p>

              {(() => {
                const parentsWithChildren =
                  allMembers.filter(
                    (member) =>
                      getChildrenOfParent(
                        member.id
                      ).length > 0
                  );

                if (
                  parentsWithChildren.length ===
                  0
                ) {
                  return (
                    <p className="text-sm text-gray-400">
                      No parent-child
                      relationships have
                      been recorded yet.
                    </p>
                  );
                }

                return (
                  <div className="grid md:grid-cols-2 gap-3">
                    {parentsWithChildren.map(
                      (parent) => {
                        const children =
                          getChildrenOfParent(
                            parent.id
                          );

                        return (
                          <div
                            key={
                              parent.id
                            }
                            className="border border-gray-100 rounded-xl p-4 bg-gray-50"
                          >
                            <div className="font-semibold text-gray-800">
                              {
                                parent.name
                              }
                            </div>

                            <div className="text-xs text-gray-500 mt-1">
                              {children
                                .map(
                                  (
                                    child
                                  ) =>
                                    child.name
                                )
                                .join(
                                  ', '
                                )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* FAMILY TREE                                                         */}
        {/* ================================================================== */}

        {activeTab === 'tree' && (
  <div>
    {/* Header */}
    <div className="mb-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <TreePine
              size={22}
              className="text-[#0077B6]"
            />

            <h2 className="font-montserrat text-xl font-bold text-gray-900">
              Kornu Family Tree
            </h2>

          </div>

          <p className="mt-1 text-sm text-gray-500">
            Explore the Kornu family through generations,
            marriages and parent-child relationships.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-[320px]">
          <Search
            size={17}
            className="
              pointer-events-none absolute
              left-3 top-1/2 -translate-y-1/2
              text-gray-400
            "
          />

          <input
            type="text"
            value={treeSearch}
            onChange={(event) => setTreeSearch(event.target.value)}
            placeholder="Search family member..."
            className="
              h-11 w-full rounded-xl
              border border-gray-200
              bg-white pl-10 pr-4
              text-sm text-gray-700
              outline-none
              transition-all duration-200
              focus:border-[#0077B6]
              focus:ring-2 focus:ring-[#0077B6]/10
            "
          />

          {treeSearch.trim() && (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-60 overflow-y-auto rounded-xl border border-gray-100 bg-white p-2 shadow-lg">
              {dbMembers
                .filter((member) =>
                  member.name
                    .toLowerCase()
                    .includes(treeSearch.trim().toLowerCase())
                )
                .map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => focusFamilyMember(member.id)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-blue-50"
                  >
                    <img
                      src={member.image || '/images/placeholder.jpg'}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium text-gray-800">
                      {member.name}
                    </span>
                  </button>
                ))}
              {dbMembers.every(
                (member) =>
                  !member.name
                    .toLowerCase()
                    .includes(treeSearch.trim().toLowerCase())
              ) && (
                <p className="px-3 py-2 text-sm text-gray-400">
                  No family member found.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Tree information / controls */}
    <div
      className="
        mb-4 flex flex-col gap-3
        rounded-2xl border border-blue-100
        bg-blue-50/60 p-4
        sm:flex-row sm:items-center
        sm:justify-between
      "
    >
      <div className="flex items-start gap-3">
        <div
          className="
            flex h-9 w-9 shrink-0
            items-center justify-center
            rounded-full bg-white
            text-[#0077B6] shadow-sm
          "
        >
          <TreePine size={17} />
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-800">
            One continuous family tree
          </p>

          <p className="text-xs text-gray-500">
            Click a member's focus button to center them.
            Use the branch controls to expand or collapse descendants.
          </p>
        </div>
      </div>

      {treeSearch && (
        <div className="text-xs font-medium text-[#0077B6]">
          Searching for "{treeSearch}"
        </div>
      )}
    </div>

    {/* Tree */}
    {dbMembers.length === 0 ? (
      <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
        <TreePine
          size={36}
          className="mx-auto mb-3 text-gray-300"
        />

        <p className="text-gray-500">
          No family members recorded yet.
        </p>
      </div>
    ) : (
      <div
        className="
          relative overflow-x-auto
          rounded-2xl border border-gray-100
          bg-white shadow-sm
        "
      >
        {/* Tree canvas */}
        <div
          className="
            family-tree
            min-w-max
            px-6 py-10
            sm:px-10
            lg:px-16
          "
        >
          {(() => {
            const roots = buildTree();
            const rootNode = roots[0];

            if (!rootNode) {
              return (
                <div className="py-10 text-center text-sm text-gray-400">
                  Unable to determine the family tree root.
                </div>
              );
            }

            return (
              <FamilyTreeNode
                key={rootNode.member.id}
                node={rootNode}
                isRoot={true}
                searchTerm={treeSearch}
                focusedMemberId={focusedMemberId}
                onFocusMember={focusFamilyMember}
              />
            );
          })()}
        </div>
      </div>
    )}

    {/* Mobile hint */}
    <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-gray-400 sm:hidden">
      <span>←</span>
      <span>Swipe horizontally to explore the tree</span>
      <span>→</span>
    </div>
  </div>
)}
        {/* ================================================================== */}
        {/* EVENTS                                                              */}
        {/* ================================================================== */}

        {activeTab ===
          'events' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-montserrat text-xl font-bold text-gray-900">
                My Family Events
              </h2>

              {isAdmin && (
                <button
                  onClick={() => {
                    resetEventForm();
                    setShowEventForm(
                      true
                    );
                  }}
                  className="btn-primary py-2 px-4 text-sm"
                >
                  <Plus size={14} />
                  Add Event
                </button>
              )}
            </div>

            <div className="space-y-4">
              {allEvents.map(
                (event) => (
                  <div
                    key={
                      event.id
                    }
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex gap-4"
                  >
                    {event.image ? (
                      <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden">
                        <img
                          src={
                            event.image
                          }
                          alt={
                            event.title
                          }
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
                              month: 'short',
                            }
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 font-montserrat text-base">
                        {
                          event.title
                        }
                      </h3>

                      <p className="text-gray-500 text-sm mt-1">
                        {
                          event.location
                        }
                      </p>

                      <p className="text-gray-400 text-xs mt-2 line-clamp-1">
                        {
                          event.description
                        }
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full font-semibold capitalize">
                        {
                          event.type
                        }
                      </span>

                      {event.rsvpCount !==
                        undefined && (
                        <span className="text-xs text-gray-400">
                          {
                            event.rsvpCount
                          }{' '}
                          attending
                        </span>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* ANNOUNCEMENTS                                                       */}
        {/* ================================================================== */}

        {activeTab ===
          'announcements' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-montserrat text-xl font-bold text-gray-900">
                Family Announcements
              </h2>

              {isAdmin && (
                <button
                  onClick={() => {
                    resetAnnouncementForm();
                    setShowAnnouncementForm(
                      true
                    );
                  }}
                  className="btn-primary py-2 px-4 text-sm"
                >
                  <Plus size={14} />
                  Post Announcement
                </button>
              )}
            </div>

            <div className="space-y-4">
              {allAnnouncements.map(
                (announcement) => (
                  <div
                    key={
                      announcement.id
                    }
                    className={`bg-white rounded-2xl p-6 shadow-sm border-l-4 ${
                      announcement.priority ===
                      'high'
                        ? 'border-orange-500'
                        : 'border-blue-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {announcement.priority ===
                            'high' && (
                            <span className="text-xs bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full font-semibold">
                              Important
                            </span>
                          )}

                          <span className="text-xs text-gray-400">
                            {new Date(
                              announcement.date
                            ).toLocaleDateString(
                              'en-GB',
                              {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              }
                            )}
                          </span>
                        </div>

                        <h3 className="font-bold text-gray-900 font-montserrat text-lg">
                          {
                            announcement.title
                          }
                        </h3>

                        <p className="text-gray-500 text-sm mt-1">
                          Posted by{' '}
                          {
                            announcement.author
                          }
                        </p>
                      </div>

                      <Bell
                        size={18}
                        className={
                          announcement.priority ===
                          'high'
                            ? 'text-orange-500'
                            : 'text-blue-400'
                        }
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* SETTINGS                                                            */}
        {/* ================================================================== */}

        {activeTab ===
          'settings' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <Settings
                size={22}
                className="text-orange-500"
              />

              <div>
                <h2 className="font-montserrat text-xl font-bold text-gray-900">
                  Settings
                </h2>

                <p className="text-gray-500 text-sm">
                  Your family portal account
                  information.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Name
                </p>

                <p className="font-semibold text-gray-800 mt-1">
                  {
                    currentUser?.name
                  }
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Email
                </p>

                <p className="font-semibold text-gray-800 mt-1">
                  {
                    currentUser?.email
                  }
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Account Role
                </p>

                <p className="font-semibold text-gray-800 mt-1 capitalize">
                  {
                    currentUser?.role
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedTreeMember && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedTreeMember(null);
            }
          }}
          role="presentation"
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl animate-[fadeIn_0.2s_ease-out]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tree-member-details-title"
          >
            <div className="relative bg-gradient-to-r from-[#0077B6] to-cyan-600 px-6 pb-8 pt-6 text-white sm:px-8">
              <button
                type="button"
                onClick={() => setSelectedTreeMember(null)}
                className="absolute right-4 top-4 rounded-full p-2 text-white/80 transition hover:bg-white/15 hover:text-white"
                aria-label="Close member details"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center sm:flex-row sm:items-end sm:gap-5 sm:text-left">
                <img
                  src={selectedTreeMember.image || '/images/placeholder.jpg'}
                  alt={selectedTreeMember.name}
                  className="h-28 w-28 rounded-full border-4 border-white/80 object-cover shadow-lg"
                  onError={(event) => {
                    event.currentTarget.src = '/images/placeholder.jpg';
                  }}
                />
                <div className="mt-4 sm:mt-0">
                  <h2 id="tree-member-details-title" className="font-montserrat text-2xl font-bold">
                    {selectedTreeMember.name}
                  </h2>
                  <p className="mt-1 text-sm text-white/80">
                    {selectedTreeMember.role || 'Family member'}
                    {selectedTreeMember.generation
                      ? ` · Generation ${selectedTreeMember.generation}`
                      : ''}
                  </p>
                  {selectedTreeMember.dateOfPassing && (
                    <p className="mt-2 text-xs italic text-white/80">
                      🕊️ In loving memory
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  ['Birth date', selectedTreeMember.birthDate],
                  ['Age', selectedTreeMember.age ? String(selectedTreeMember.age) : null],
                  ['Date of passing', selectedTreeMember.dateOfPassing],
                  ['Occupation', selectedTreeMember.occupation],
                  ['Location', selectedTreeMember.location],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-gray-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {value || 'Not specified'}
                    </p>
                  </div>
                ))}
              </div>

              {selectedTreeMember.bio && (
                <section>
                  <h3 className="mb-2 font-montserrat font-bold text-gray-900">Biography</h3>
                  <p className="text-sm leading-relaxed text-gray-600">{selectedTreeMember.bio}</p>
                </section>
              )}

              <section className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-montserrat font-bold text-gray-900">Parents</h3>
                  <p className="text-sm text-gray-600">
                    {getParentsOfChild(selectedTreeMember.id)
                      .map((item) => item.parent?.name)
                      .filter(Boolean)
                      .join(' & ') || 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-montserrat font-bold text-gray-900">Partner</h3>
                  <p className="text-sm text-gray-600">
                    {marriages
                      .filter(
                        (marriage) =>
                          marriage.spouse_1_id === selectedTreeMember.id ||
                          marriage.spouse_2_id === selectedTreeMember.id
                      )
                      .map((marriage) =>
                        getMemberName(
                          marriage.spouse_1_id === selectedTreeMember.id
                            ? marriage.spouse_2_id
                            : marriage.spouse_1_id
                        )
                      )
                      .join(' & ') || 'Not specified'}
                  </p>
                </div>
              </section>

              <section>
                <h3 className="mb-2 font-montserrat font-bold text-gray-900">Children</h3>
                <p className="text-sm text-gray-600">
                  {getChildrenOfParent(selectedTreeMember.id)
                    .map((child) => child.name)
                    .join(', ') || 'No children recorded'}
                </p>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MARRIAGE MODAL                                                        */}
      {/* ==================================================================== */}

      {showMarriageForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-montserrat text-xl font-bold text-gray-900">
                  Add Marriage /
                  Partnership
                </h2>

                <p className="text-gray-400 text-xs mt-1">
                  Create the parent unit
                  first, then assign
                  children.
                </p>
              </div>

              <button
                onClick={() => {
                  resetMarriageForm();
                  setShowMarriageForm(
                    false
                  );
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <select
                value={
                  marriageSpouse1
                }
                onChange={(event) =>
                  setMarriageSpouse1(
                    event.target.value
                  )
                }
                className="input-field"
              >
                <option value="">
                  Select spouse 1
                </option>

                {dbMembers.map(
                  (member) => (
                    <option
                      key={
                        member.id
                      }
                      value={
                        member.id
                      }
                    >
                      {
                        member.name
                      }
                    </option>
                  )
                )}
              </select>

              <select
                value={
                  marriageSpouse2
                }
                onChange={(event) =>
                  setMarriageSpouse2(
                    event.target.value
                  )
                }
                className="input-field"
              >
                <option value="">
                  Select spouse 2
                </option>

                {dbMembers.map(
                  (member) => (
                    <option
                      key={
                        member.id
                      }
                      value={
                        member.id
                      }
                    >
                      {
                        member.name
                      }
                    </option>
                  )
                )}
              </select>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Marriage Date
                </label>

                <input
                  type="date"
                  value={
                    marriageDate
                  }
                  onChange={(event) =>
                    setMarriageDate(
                      event.target.value
                    )
                  }
                  className="input-field"
                />
              </div>

              <select
                value={
                  marriageStatus
                }
                onChange={(event) =>
                  setMarriageStatus(
                    event.target.value
                  )
                }
                className="input-field"
              >
                <option value="married">
                  Married
                </option>
                <option value="divorced">
                  Divorced
                </option>
                <option value="widowed">
                  Widowed
                </option>
                <option value="separated">
                  Separated
                </option>
              </select>

              {marriageFormError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                  {
                    marriageFormError
                  }
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    resetMarriageForm();
                    setShowMarriageForm(
                      false
                    );
                  }}
                  className="flex-1 border border-gray-200 rounded-xl py-2.5 text-gray-600 font-medium"
                >
                  Cancel
                </button>

                <button
                  onClick={() =>
                    void submitMarriage()
                  }
                  disabled={
                    postingMarriage
                  }
                  className="flex-1 btn-primary justify-center disabled:opacity-60"
                >
                  {postingMarriage
                    ? 'Saving...'
                    : 'Create Relationship'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* EVENT MODAL                                                           */}
      {/* ==================================================================== */}

      {showEventForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-montserrat text-xl font-bold text-gray-900">
                Add Event
              </h2>

              <button
                onClick={() => {
                  resetEventForm();
                  setShowEventForm(
                    false
                  );
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={
                  eventTitle
                }
                onChange={(event) =>
                  setEventTitle(
                    event.target.value
                  )
                }
                placeholder="Event title"
                className="input-field"
              />

              <input
                type="date"
                value={
                  eventDate
                }
                onChange={(event) =>
                  setEventDate(
                    event.target.value
                  )
                }
                className="input-field"
              />

              <input
                type="text"
                value={
                  eventLocation
                }
                onChange={(event) =>
                  setEventLocation(
                    event.target.value
                  )
                }
                placeholder="Location"
                className="input-field"
              />

              <select
                value={
                  eventType
                }
                onChange={(event) =>
                  setEventType(
                    event.target.value
                  )
                }
                className="input-field"
              >
                <option value="reunion">
                  Reunion
                </option>
                <option value="birthday">
                  Birthday
                </option>
                <option value="wedding">
                  Wedding
                </option>
                <option value="memorial">
                  Memorial
                </option>
                <option value="celebration">
                  Celebration
                </option>
              </select>

              <textarea
                value={
                  eventDescription
                }
                onChange={(event) =>
                  setEventDescription(
                    event.target.value
                  )
                }
                placeholder="Description"
                rows={3}
                className="input-field resize-none"
              />

              <label className="block">
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center cursor-pointer hover:border-orange-300 transition-colors">
                  {eventImagePreview ? (
                    <img
                      src={
                        eventImagePreview
                      }
                      alt="Event preview"
                      className="max-h-32 mx-auto rounded-xl object-cover"
                    />
                  ) : (
                    <p className="text-sm text-gray-400">
                      Click to add a photo
                      (optional)
                    </p>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleEventImageChange
                  }
                  className="hidden"
                />
              </label>

              {eventFormError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                  {
                    eventFormError
                  }
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    resetEventForm();
                    setShowEventForm(
                      false
                    );
                  }}
                  className="flex-1 border border-gray-200 rounded-xl py-2.5 text-gray-600 font-medium"
                >
                  Cancel
                </button>

                <button
                  onClick={() =>
                    void submitEvent()
                  }
                  disabled={
                    postingEvent
                  }
                  className="flex-1 btn-primary justify-center disabled:opacity-60"
                >
                  {postingEvent
                    ? 'Posting...'
                    : 'Post Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ANNOUNCEMENT MODAL                                                    */}
      {/* ==================================================================== */}

      {showAnnouncementForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-montserrat text-xl font-bold text-gray-900">
                Post Announcement
              </h2>

              <button
                onClick={() => {
                  resetAnnouncementForm();
                  setShowAnnouncementForm(
                    false
                  );
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={
                  annTitle
                }
                onChange={(event) =>
                  setAnnTitle(
                    event.target.value
                  )
                }
                placeholder="Announcement title"
                className="input-field"
              />

              <select
                value={
                  annPriority
                }
                onChange={(event) =>
                  setAnnPriority(
                    event.target.value
                  )
                }
                className="input-field"
              >
                <option value="medium">
                  Medium priority
                </option>

                <option value="high">
                  High priority
                </option>
              </select>

              {annFormError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                  {
                    annFormError
                  }
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    resetAnnouncementForm();
                    setShowAnnouncementForm(
                      false
                    );
                  }}
                  className="flex-1 border border-gray-200 rounded-xl py-2.5 text-gray-600 font-medium"
                >
                  Cancel
                </button>

                <button
                  onClick={() =>
                    void submitAnnouncement()
                  }
                  disabled={
                    postingAnn
                  }
                  className="flex-1 btn-primary justify-center disabled:opacity-60"
                >
                  {postingAnn
                    ? 'Posting...'
                    : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MEMBER MODAL                                                          */}
      {/* ==================================================================== */}

      {showMemberForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-montserrat text-xl font-bold text-gray-900">
                Add Family Member
              </h2>

              <button
                onClick={() => {
                  resetMemberForm();
                  setShowMemberForm(
                    false
                  );
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={
                  memberName
                }
                onChange={(event) =>
                  setMemberName(
                    event.target.value
                  )
                }
                placeholder="Full name"
                className="input-field"
              />

              <input
                type="text"
                value={
                  memberRole
                }
                onChange={(event) =>
                  setMemberRole(
                    event.target.value
                  )
                }
                placeholder="Role (e.g. Son · Doctor)"
                className="input-field"
              />

              <select
                value={
                  memberGeneration
                }
                onChange={(event) =>
                  setMemberGeneration(
                    event.target.value
                  )
                }
                className="input-field"
              >
                <option value="1">
                  Generation 1 —
                  Founders
                </option>

                <option value="2">
                  Generation 2 —
                  Parents
                </option>

                <option value="3">
                  Generation 3 —
                  Grandchildren
                </option>

                <option value="4">
                  Generation 4 —
                  Great-Grandchildren
                </option>

                <option value="5">
                  Generation 5 —
                  Great-Great-Grandchildren
                </option>

                <option value="6">
                  Generation 6 —
                  Great-Great-Great-Grandchildren
                </option>
              </select>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Birth Date
                    (optional)
                  </label>

                  <input
                    type="date"
                    value={
                      memberBirthDate
                    }
                    onChange={(
                      event
                    ) =>
                      setMemberBirthDate(
                        event.target
                          .value
                      )
                    }
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Date of Passing
                  </label>

                  <input
                    type="date"
                    value={
                      memberDateOfPassing
                    }
                    onChange={(
                      event
                    ) =>
                      setMemberDateOfPassing(
                        event.target
                          .value
                      )
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <input
                type="text"
                value={
                  memberLocation
                }
                onChange={(event) =>
                  setMemberLocation(
                    event.target.value
                  )
                }
                placeholder="Location (optional)"
                className="input-field"
              />

              <input
                type="text"
                value={
                  memberOccupation
                }
                onChange={(event) =>
                  setMemberOccupation(
                    event.target.value
                  )
                }
                placeholder="Occupation (optional)"
                className="input-field"
              />

              <textarea
                value={
                  memberBio
                }
                onChange={(event) =>
                  setMemberBio(
                    event.target.value
                  )
                }
                placeholder="Bio"
                rows={3}
                className="input-field resize-none"
              />

              <input
                type="text"
                value={
                  memberTags
                }
                onChange={(event) =>
                  setMemberTags(
                    event.target.value
                  )
                }
                placeholder="Tags, comma separated (e.g. Doctor, Healer)"
                className="input-field"
              />

              {/* ------------------------------------------------------------ */}
              {/* RELATIONSHIPS                                                */}
              {/* ------------------------------------------------------------ */}

              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Family Relationships
                  (optional)
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Spouse
                    </label>

                    <select
                      value={
                        memberSpouseId
                      }
                      onChange={(
                        event
                      ) =>
                        setMemberSpouseId(
                          event.target
                            .value
                        )
                      }
                      className="input-field"
                    >
                      <option value="">
                        None
                      </option>

                      {dbMembers.map(
                        (
                          member
                        ) => (
                          <option
                            key={
                              member.id
                            }
                            value={
                              member.id
                            }
                          >
                            {
                              member.name
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Father
                    </label>

                    <select
                      value={
                        memberFatherId
                      }
                      onChange={(
                        event
                      ) =>
                        setMemberFatherId(
                          event.target
                            .value
                        )
                      }
                      className="input-field"
                    >
                      <option value="">
                        None / Unknown
                      </option>

                      {dbMembers.map(
                        (
                          member
                        ) => (
                          <option
                            key={
                              member.id
                            }
                            value={
                              member.id
                            }
                          >
                            {
                              member.name
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Mother
                    </label>

                    <select
                      value={
                        memberMotherId
                      }
                      onChange={(
                        event
                      ) =>
                        setMemberMotherId(
                          event.target
                            .value
                        )
                      }
                      className="input-field"
                    >
                      <option value="">
                        None / Unknown
                      </option>

                      {dbMembers.map(
                        (
                          member
                        ) => (
                          <option
                            key={
                              member.id
                            }
                            value={
                              member.id
                            }
                          >
                            {
                              member.name
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* IMAGE                                                         */}
              {/* ------------------------------------------------------------ */}

              <label className="block">
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center cursor-pointer hover:border-orange-300 transition-colors">
                  {memberImagePreview ? (
                    <img
                      src={
                        memberImagePreview
                      }
                      alt="Member preview"
                      className="max-h-32 mx-auto rounded-xl object-cover"
                    />
                  ) : (
                    <p className="text-sm text-gray-400">
                      Click to add a photo
                      (optional)
                    </p>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleMemberImageChange
                  }
                  className="hidden"
                />
              </label>

              {memberFormError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
                  {
                    memberFormError
                  }
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    resetMemberForm();
                    setShowMemberForm(
                      false
                    );
                  }}
                  className="flex-1 border border-gray-200 rounded-xl py-2.5 text-gray-600 font-medium"
                >
                  Cancel
                </button>

                <button
                  onClick={() =>
                    void submitMember()
                  }
                  disabled={
                    postingMember
                  }
                  className="flex-1 btn-primary justify-center disabled:opacity-60"
                >
                  {postingMember
                    ? 'Adding...'
                    : 'Add Member'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}