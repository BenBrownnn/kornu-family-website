import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import {
  Shield, Users, MessageCircle, Calendar, FileText, Bell, Settings,
  LogOut, TreePine, ArrowRight, Heart, Lock, Star, TrendingUp, Plus, Image, X,
} from 'lucide-react';
import { familyEvents, familyStories } from '../data/familyData';
import { supabase } from '../lib/supabaseClient';
import FamilyTreeNode from '@/components/FamilyTreeNode';

type Message = { id: string; created_at: string; user_id: string; author_name: string; text: string; };
type DbEvent = { id: string; title: string; date: string; location: string; description: string; type: string; image?: string | null; rsvpCount?: number; };
type DbAnnouncement = { id: string; title: string; author: string; date: string; priority: string; };
type DbMember = {
  id: string; name: string; role: string; age?: number; bio: string; image: string;
  generation: number; birthDate?:string | null; dateOfPassing?: string | null;
  location?: string; occupation?: string; tags: string[]; marriageId?: string | null;
};
type Marriage = { id: string; spouse_1_id: string | null; spouse_2_id: string | null; marriage_date: string | null; status: string; };
type ParentChildRelationship = { id: string; parent_id: string; child_id: string; relationship_type: 'father' | 'mother' | 'parent' | string; created_at?: string; };

const portalFeatures = [
  { id: 'messages', icon: MessageCircle, title: 'Family Chat', desc: 'Private family message board', color: 'from-blue-400 to-cyan-500', count: '12 new' },
  { id: 'tree', icon: TreePine, title: 'Family Tree', desc: 'Interactive genealogy explorer', color: 'from-green-400 to-emerald-600', count: '6 gen' },
  { id: 'docs', icon: FileText, title: 'Family Documents', desc: 'Shared important documents', color: 'from-orange-400 to-amber-500', count: '28 files' },
  { id: 'events', icon: Calendar, title: 'My Events', desc: 'Your RSVPs and calendar', color: 'from-pink-400 to-rose-500', count: '3 upcoming' },
  { id: 'gallery', icon: Image, title: 'Private Gallery', desc: 'Member-only photos', color: 'from-purple-400 to-violet-600', count: '145 photos' },
  { id: 'settings', icon: Settings, title: 'Settings', desc: 'Manage your profile', color: 'from-gray-400 to-slate-600', count: '' },
];

const fallbackAnnouncements: DbAnnouncement[] = [
  { id: 'fallback-1', title: 'Reunion 2025 Registration Open!', date: '2025-01-15', author: 'Kofi Kornu', priority: 'high' },
  { id: 'fallback-2', title: "Elder Kweku's Birthday Dinner Details", date: '2025-01-10', author: 'Ama Kornu-Mensah', priority: 'medium' },
  { id: 'fallback-3', title: 'New Baby! Welcome Kweku Jr.!', date: '2025-01-05', author: 'Family Admin', priority: 'high' },
];

export default function PortalPage() {
  const { isAuthenticated, currentUser, logout, setCurrentPage } = useStore();

  const [activeTab, setActiveTab] = useState('dashboard');

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState('');

  const [dbEvents, setDbEvents] = useState<DbEvent[]>([]);
  const [dbAnnouncements, setDbAnnouncements] = useState<DbAnnouncement[]>([]);
  const [dbMembers, setDbMembers] = useState<DbMember[]>([]);
  const [marriages, setMarriages] = useState<Marriage[]>([]);
  const [parentChildRelationships, setParentChildRelationships] = useState<ParentChildRelationship[]>([]);

  const [showMarriageForm, setShowMarriageForm] = useState(false);
  const [marriageSpouse1, setMarriageSpouse1] = useState('');
  const [marriageSpouse2, setMarriageSpouse2] = useState('');
  const [marriageDate, setMarriageDate] = useState('');
  const [marriageStatus, setMarriageStatus] = useState('married');
  const [marriageFormError, setMarriageFormError] = useState('');
  const [postingMarriage, setPostingMarriage] = useState(false);

  const [selectedMarriageId, setSelectedMarriageId] = useState('');
  const [selectedChildId, setSelectedChildId] = useState('');
  const [relationshipError, setRelationshipError] = useState('');
  const [savingRelationship, setSavingRelationship] = useState(false);

  const [showEventForm, setShowEventForm] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);

  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventType, setEventType] = useState('celebration');
  const [postingEvent, setPostingEvent] = useState(false);
  const [eventFormError, setEventFormError] = useState('');
  const [eventImageFile, setEventImageFile] = useState<File | null>(null);
  const [eventImagePreview, setEventImagePreview] = useState<string | null>(null);

  const [annTitle, setAnnTitle] = useState('');
  const [annPriority, setAnnPriority] = useState('medium');
  const [postingAnn, setPostingAnn] = useState(false);
  const [annFormError, setAnnFormError] = useState('');

  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('');
  const [memberBio, setMemberBio] = useState('');
  const [memberGeneration, setMemberGeneration] = useState('1');
  const [memberBirthDate, setMemberBirthDate] = useState('');
  const [memberDateOfPassing, setMemberDateOfPassing] = useState('');
  const [memberLocation, setMemberLocation] = useState('');
  const [memberOccupation, setMemberOccupation] = useState('');
  const [memberTags, setMemberTags] = useState('');
  // Relationship selections made while creating a new member
  const [memberSpouseId, setMemberSpouseId] = useState('');
  const [memberFatherId, setMemberFatherId] = useState('');
  const [memberMotherId, setMemberMotherId] = useState('');
  const [memberImageFile, setMemberImageFile] = useState<File | null>(null);
  const [memberImagePreview, setMemberImagePreview] = useState<string | null>(null);
  const [postingMember, setPostingMember] = useState(false);
  const [memberFormError, setMemberFormError] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  const fetchEvents = async () => {
    const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true });
    if (error) { console.error('Error loading events:', error); return; }
    if (!data) { setDbEvents([]); return; }
    setDbEvents(data.map((event) => ({
      id: event.id, title: event.title, date: event.date, location: event.location,
      description: event.description || '', type: event.type || 'celebration', image: event.image || null,
    })));
  };

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Error loading announcements:', error); return; }
    if (!data) { setDbAnnouncements([]); return; }
    setDbAnnouncements(data.map((a) => ({
      id: a.id, title: a.title, author: a.author_name || 'Family Admin', date: a.created_at, priority: a.priority || 'medium',
    })));
  };

  const fetchMembers = async () => {
    const { data, error } = await supabase.from('members').select('*').order('generation', { ascending: true });
    if (error) { console.error('Error loading members:', error); return; }
    if (!data) { setDbMembers([]); return; }
    setDbMembers(data.map((m) => ({
      id: m.id, name: m.name, role: m.role || '', age: m.age, bio: m.bio || '',
      image: m.image || '/images/placeholder.jpg', generation: Number(m.generation) || 1,
      birthDate: m.birth_date || null, dateOfPassing: m.date_of_passing || null,
      location: m.location || '', occupation: m.occupation || '',
      tags: Array.isArray(m.tags) ? m.tags : [], marriageId: m.marriage_id || null,
    })));
  };

  const fetchMarriages = async () => {
    const { data, error } = await supabase
      .from('marriages')
      .select('id, spouse_1_id, spouse_2_id, marriage_date, status')
      .order('marriage_date', { ascending: true, nullsFirst: false });
    if (error) { console.error('Error loading marriages:', error); return; }
    setMarriages((data || []) as Marriage[]);
  };

  const fetchParentChildRelationships = async () => {
    const { data, error } = await supabase
      .from('parent_child_relationships')
      .select('id, parent_id, child_id, relationship_type, created_at')
      .order('created_at', { ascending: true });
    if (error) { console.error('Error loading parent-child relationships:', error); return; }
    setParentChildRelationships((data || []) as ParentChildRelationship[]);
  };

  const resetMarriageForm = () => {
    setMarriageSpouse1(''); setMarriageSpouse2(''); setMarriageDate('');
    setMarriageStatus('married'); setMarriageFormError('');
  };

  const submitMarriage = async () => {
    setMarriageFormError('');
    if (!currentUser || !isAdmin) { setMarriageFormError('Only family administrators can create relationships.'); return; }
    if (!marriageSpouse1 || !marriageSpouse2) { setMarriageFormError('Please select both spouses.'); return; }
    if (marriageSpouse1 === marriageSpouse2) { setMarriageFormError('A person cannot be married to themselves.'); return; }

    try {
      setPostingMarriage(true);
      const { error } = await supabase.from('marriages').insert({
        spouse_1_id: marriageSpouse1, spouse_2_id: marriageSpouse2,
        marriage_date: marriageDate || null, status: marriageStatus,
      });
      if (error) { console.error('Error creating marriage:', error); setMarriageFormError(error.message || 'Unable to create relationship.'); return; }
      resetMarriageForm();
      setShowMarriageForm(false);
      await fetchMarriages();
    } catch (error) {
      console.error('Unexpected marriage error:', error);
      setMarriageFormError('Something went wrong. Please try again.');
    } finally {
      setPostingMarriage(false);
    }
  };

  const assignChildToMarriage = async () => {
    setRelationshipError('');
    if (!currentUser || !isAdmin) { setRelationshipError('Only family administrators can assign relationships.'); return; }
    if (!selectedMarriageId || !selectedChildId) { setRelationshipError('Please select a marriage and a child.'); return; }

    const marriage = marriages.find((item) => item.id === selectedMarriageId);
    if (!marriage) { setRelationshipError('The selected marriage could not be found.'); return; }

    try {
      setSavingRelationship(true);

      const parentRows = [marriage.spouse_1_id, marriage.spouse_2_id]
        .filter((id): id is string => Boolean(id))
        .map((parentId) => ({ parent_id: parentId, child_id: selectedChildId, relationship_type: 'parent' }));

      if (parentRows.length === 0) { setRelationshipError('This marriage has no valid spouse members.'); return; }

      const spouseIds = parentRows.map((row) => row.parent_id);
      const { error: deleteError } = await supabase
        .from('parent_child_relationships')
        .delete()
        .eq('child_id', selectedChildId)
        .in('parent_id', spouseIds);

      if (deleteError) { console.error('Error clearing existing parent links:', deleteError); setRelationshipError(deleteError.message || 'Unable to update parent relationship.'); return; }

      const { error: insertError } = await supabase.from('parent_child_relationships').insert(parentRows);
      if (insertError) { console.error('Error assigning child:', insertError); setRelationshipError(insertError.message || 'Unable to assign child.'); return; }

      const { error: memberUpdateError } = await supabase.from('members').update({ marriage_id: selectedMarriageId }).eq('id', selectedChildId);
      if (memberUpdateError) console.warn('Marriage assignment saved, but marriage_id could not be synchronized:', memberUpdateError);

      setSelectedChildId('');
      await Promise.all([fetchMembers(), fetchParentChildRelationships()]);
    } catch (error) {
      console.error('Unexpected relationship error:', error);
      setRelationshipError('Something went wrong. Please try again.');
    } finally {
      setSavingRelationship(false);
    }
  };

  const allEvents = [...dbEvents, ...familyEvents];
  const allAnnouncements = [...dbAnnouncements, ...fallbackAnnouncements];
  const allMembers = [...dbMembers];

  const getParentsOfChild = (childId: string) =>
    parentChildRelationships
      .filter((relationship) => relationship.child_id === childId)
      .map((relationship) => ({ ...relationship, parent: allMembers.find((member) => member.id === relationship.parent_id) }))
      .filter((relationship) => Boolean(relationship.parent));

  // Used in the Relationships tab to show each parent's children, independent of marriage grouping
  const getChildrenOfParent = (parentId: string) =>
    parentChildRelationships
      .filter((relationship) => relationship.parent_id === parentId)
      .map((relationship) => allMembers.find((member) => member.id === relationship.child_id))
      .filter((member): member is DbMember => Boolean(member));

  const getMemberName = (id: string | null) =>
    dbMembers.find((member) => member.id === id)?.name || 'Unknown member';

  const getMarriageChildren = (marriageId: string) => {
    const marriage = marriages.find((item) => item.id === marriageId);
    if (!marriage) return [];
    const parentIds = [marriage.spouse_1_id, marriage.spouse_2_id].filter((id): id is string => Boolean(id));
    const childIds = parentChildRelationships
      .filter((relationship) => parentIds.includes(relationship.parent_id))
      .map((relationship) => relationship.child_id);
    return allMembers.filter((member) => childIds.includes(member.id));
  };

  type TreeNode = {
  member: DbMember;
  marriages: MarriageGroup[];
};

type MarriageGroup = {
  id: string;
  spouse1: DbMember;
  spouse2: DbMember;
  children: TreeNode[];
};

const buildTree = (): TreeNode[] => {
  /*
   * FAMILY TREE STRUCTURE
   *
   * Person → Marriage → ❤️ → Children → Person → Marriage → ...
   *
   * A person may have multiple marriages. Each marriage is kept
   * as its own group so its spouse and children stay together.
   */
  const memberMap = new Map(
    dbMembers.map((member) => [member.id, member])
  );

  /*
   * Get the children belonging to one specific marriage.
   *
   * First use the explicit members.marriage_id assignment.
   * Then fall back to children whose parent-child records contain
   * BOTH spouses. This keeps existing relationship data working.
   */
  const getChildrenForMarriage = (marriage: Marriage): DbMember[] => {
    const spouseIds = [
      marriage.spouse_1_id,
      marriage.spouse_2_id,
    ].filter((id): id is string => Boolean(id));

    if (spouseIds.length === 0) {
      return [];
    }

    const explicitlyAssigned = dbMembers.filter(
      (member) => member.marriageId === marriage.id
    );

    const parentRelationships = parentChildRelationships.filter(
      (relationship) => spouseIds.includes(relationship.parent_id)
    );

    const possibleChildIds = new Set(
      parentRelationships.map((relationship) => relationship.child_id)
    );

    const childrenFromBothParents = dbMembers.filter((member) => {
      if (!possibleChildIds.has(member.id)) {
        return false;
      }

      const parentIds = new Set(
        parentChildRelationships
          .filter((relationship) => relationship.child_id === member.id)
          .map((relationship) => relationship.parent_id)
      );

      return spouseIds.every((spouseId) => parentIds.has(spouseId));
    });

    const children = [
      ...explicitlyAssigned,
      ...childrenFromBothParents,
    ];

    return Array.from(
      new Map(children.map((child) => [child.id, child])).values()
    );
  };

  /*
   * Recursively build a member and every marriage belonging to them.
   *
   * We deliberately do NOT use a global "alreadyPlaced" set.
   * A person can appear in multiple marriages, so each marriage must
   * remain visible. The ancestor set only prevents circular data from
   * causing infinite recursion.
   */
  const buildNode = (
    member: DbMember,
    ancestorIds: Set<string> = new Set()
  ): TreeNode => {
    if (ancestorIds.has(member.id)) {
      return {
        member,
        marriages: [],
      };
    }

    const nextAncestorIds = new Set(ancestorIds);
    nextAncestorIds.add(member.id);

    const memberMarriages = marriages.filter(
      (marriage) =>
        marriage.spouse_1_id === member.id ||
        marriage.spouse_2_id === member.id
    );

    const marriageGroups: MarriageGroup[] = memberMarriages
      .map((marriage) => {
        const spouseId =
          marriage.spouse_1_id === member.id
            ? marriage.spouse_2_id
            : marriage.spouse_1_id;

        if (!spouseId) {
          return null;
        }

        const spouse = memberMap.get(spouseId);

        if (!spouse) {
          return null;
        }

        const marriageChildren = getChildrenForMarriage(marriage);

        const children = marriageChildren
          .filter((child) => child.id !== member.id)
          .filter((child) => child.id !== spouse.id)
          .map((child) => buildNode(child, nextAncestorIds));

        return {
          id: marriage.id,
          spouse1: member,
          spouse2: spouse,
          children,
        };
      })
      .filter(
        (marriage): marriage is MarriageGroup => marriage !== null
      );

    return {
      member,
      marriages: marriageGroups,
    };
  };

    /* A root is a member who does not appear as somebody's child. */
  const childIds = new Set(
    parentChildRelationships.map((relationship) => relationship.child_id)
  );

  const rootCandidates = dbMembers.filter((member) => !childIds.has(member.id));
  const rootCandidateIds = new Set(rootCandidates.map((member) => member.id));
  const excludedFromRoots = new Set<string>();

  marriages.forEach((marriage) => {
    const { spouse_1_id, spouse_2_id } = marriage;
    if (!spouse_1_id || !spouse_2_id) return;

    const spouse1HasParent = childIds.has(spouse_1_id);
    const spouse2HasParent = childIds.has(spouse_2_id);

    if (spouse1HasParent && !spouse2HasParent) {
      // spouse_2 married in (no recorded parent) — will appear nested
      // as spouse_1's spouse, so drop them from the root list.
      excludedFromRoots.add(spouse_2_id);
    } else if (spouse2HasParent && !spouse1HasParent) {
      excludedFromRoots.add(spouse_1_id);
    } else if (
      !spouse1HasParent &&
      !spouse2HasParent &&
      rootCandidateIds.has(spouse_1_id) &&
      rootCandidateIds.has(spouse_2_id) &&
      !excludedFromRoots.has(spouse_1_id)
    ) {
      // Neither has a recorded parent (e.g. the founding couple) —
      // keep spouse_1 as the root, drop spouse_2 to avoid a duplicate tree.
      excludedFromRoots.add(spouse_2_id);
    }
  });

  const roots = rootCandidates.filter((member) => !excludedFromRoots.has(member.id));

  /* Keep the tree visible even if relationship data is incomplete. */
  const rootMembers =
    roots.length > 0
      ? roots
      : dbMembers.filter(
          (member, index, array) =>
            array.findIndex((item) => item.id === member.id) === index
        );

  return rootMembers.map((root) => buildNode(root));
};

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchEvents();
    fetchAnnouncements();
    fetchMembers();
    fetchMarriages();
    fetchParentChildRelationships();
  }, [isAuthenticated]);

  const handleEventImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setEventImageFile(selectedFile);
    setEventImagePreview(URL.createObjectURL(selectedFile));
  };

  const handleMemberImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setMemberImageFile(selectedFile);
    setMemberImagePreview(URL.createObjectURL(selectedFile));
  };

  const resetEventForm = () => {
    setEventTitle(''); setEventDate(''); setEventLocation(''); setEventDescription(''); setEventType('celebration');
    setEventImageFile(null);
    if (eventImagePreview) URL.revokeObjectURL(eventImagePreview);
    setEventImagePreview(null);
    setEventFormError('');
  };

  const resetAnnouncementForm = () => {
    setAnnTitle(''); setAnnPriority('medium'); setAnnFormError('');
  };

  const resetMemberForm = () => {
    setMemberName(''); setMemberRole(''); setMemberBio(''); setMemberGeneration('1');
    setMemberBirthDate(''); setMemberDateOfPassing('');
    setMemberLocation(''); setMemberOccupation(''); setMemberTags('');
    setMemberSpouseId(''); setMemberFatherId(''); setMemberMotherId('');
    setMemberImageFile(null);
    if (memberImagePreview) URL.revokeObjectURL(memberImagePreview);
    setMemberImagePreview(null);
    setMemberFormError('');
  };

  const submitEvent = async () => {
    setEventFormError('');
    if (!eventTitle.trim() || !eventDate || !eventLocation.trim()) { setEventFormError('Please fill in the title, date, and location.'); return; }
    if (!currentUser) { setEventFormError('You must be signed in to create an event.'); return; }
    if (!isAdmin) { setEventFormError('Only family administrators can create events.'); return; }

    try {
      setPostingEvent(true);
      let imageUrl: string | null = null;

      if (eventImageFile) {
        const fileExtension = eventImageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `events/${currentUser.id}-${Date.now()}.${fileExtension}`;
        const { error: uploadError } = await supabase.storage.from('gallery-photos').upload(fileName, eventImageFile, { cacheControl: '3600', upsert: false });
        if (uploadError) { console.error('Event image upload error:', uploadError); setEventFormError('Image upload failed. Please try again.'); return; }
        const { data: publicUrlData } = supabase.storage.from('gallery-photos').getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase.from('events').insert({
        title: eventTitle.trim(), date: eventDate, location: eventLocation.trim(),
        description: eventDescription.trim(), type: eventType, image: imageUrl, created_by: currentUser.id,
      });

      if (insertError) { console.error('Error posting event:', insertError); setEventFormError(insertError.message || 'Something went wrong while creating the event.'); return; }

      resetEventForm();
      setShowEventForm(false);
      await fetchEvents();
    } catch (error) {
      console.error('Unexpected event error:', error);
      setEventFormError('Something went wrong. Please try again.');
    } finally {
      setPostingEvent(false);
    }
  };

  const submitAnnouncement = async () => {
    setAnnFormError('');
    if (!annTitle.trim()) { setAnnFormError('Please enter an announcement title.'); return; }
    if (!currentUser) { setAnnFormError('You must be signed in.'); return; }
    if (!isAdmin) { setAnnFormError('Only family administrators can post announcements.'); return; }

    try {
      setPostingAnn(true);
      const { error } = await supabase.from('announcements').insert({
        title: annTitle.trim(), author_name: currentUser.name, priority: annPriority, created_by: currentUser.id,
      });
      if (error) { console.error('Error posting announcement:', error); setAnnFormError(error.message || 'Something went wrong. Please try again.'); return; }
      resetAnnouncementForm();
      setShowAnnouncementForm(false);
      await fetchAnnouncements();
    } catch (error) {
      console.error('Unexpected announcement error:', error);
      setAnnFormError('Something went wrong. Please try again.');
    } finally {
      setPostingAnn(false);
    }
  };

  // ==========================================================
  // SUBMIT MEMBER — now creates marriage + parent-child rows
  // ==========================================================
  const submitMember = async () => {
    setMemberFormError('');
    if (!memberName.trim() || !memberRole.trim() || !memberBio.trim()) { setMemberFormError('Please fill in the name, role, and bio.'); return; }
    if (!currentUser) { setMemberFormError('You must be signed in.'); return; }
    if (!isAdmin) { setMemberFormError('Only family administrators can add members.'); return; }
    if (memberFatherId && memberFatherId === memberMotherId) { setMemberFormError('Father and mother cannot be the same person.'); return; }

    try {
      setPostingMember(true);
      let imageUrl = '/images/placeholder.jpg';

      if (memberImageFile) {
        const fileExtension = memberImageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `members/${currentUser.id}-${Date.now()}.${fileExtension}`;
        const { error: uploadError } = await supabase.storage.from('gallery-photos').upload(fileName, memberImageFile, { cacheControl: '3600', upsert: false });
        if (uploadError) { console.error('Member image upload error:', uploadError); setMemberFormError('Image upload failed. Please try again.'); return; }
        const { data: publicUrlData } = supabase.storage.from('gallery-photos').getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }

      const tagsArray = memberTags.split(',').map((tag) => tag.trim()).filter(Boolean);

      // Insert the member and get the created row back so we can link relationships to its real id
      const { data: createdMemberRows, error } = await supabase
        .from('members')
        .insert({
          name: memberName.trim(),
          role: memberRole.trim(),
          bio: memberBio.trim(),
          image: imageUrl,
          generation: Number(memberGeneration) || 1,
          birth_date: memberBirthDate || null,
          date_of_passing: memberDateOfPassing || null,
          location: memberLocation.trim() || null,
          occupation: memberOccupation.trim() || null,
          tags: tagsArray,
          created_by: currentUser.id,
        })
        .select()
        .single();

      if (error) { console.error('Error adding member:', error); setMemberFormError(error.message || 'Something went wrong. Please try again.'); return; }

      if (!createdMemberRows) {
        console.error('Member insert succeeded but no row was returned.');
        setMemberFormError('Member was created, but relationships could not be linked. Please add them from the Relationships tab.');
        resetMemberForm();
        setShowMemberForm(false);
        await Promise.all([fetchMembers(), fetchMarriages(), fetchParentChildRelationships()]);
        return;
      }

      const newMemberId = createdMemberRows.id;

      // Create the marriage relationship, if a spouse was selected
      if (memberSpouseId) {
        const { data: newMarriage, error: marriageError } = await supabase
          .from('marriages')
          .insert({ spouse_1_id: newMemberId, spouse_2_id: memberSpouseId, status: 'married' })
          .select()
          .single();

        if (marriageError) {
          console.error('Error creating spouse relationship:', marriageError);
        } else if (newMarriage) {
          // Keep the legacy marriage_id column in sync for both spouses
          await supabase.from('members').update({ marriage_id: newMarriage.id }).eq('id', newMemberId);
        }
      }

      // Create father relationship, if selected
      if (memberFatherId) {
        const { error: fatherError } = await supabase
          .from('parent_child_relationships')
          .insert({ parent_id: memberFatherId, child_id: newMemberId, relationship_type: 'father' });
        if (fatherError) console.error('Error linking father:', fatherError);
      }

      // Create mother relationship, if selected
      if (memberMotherId) {
        const { error: motherError } = await supabase
          .from('parent_child_relationships')
          .insert({ parent_id: memberMotherId, child_id: newMemberId, relationship_type: 'mother' });
        if (motherError) console.error('Error linking mother:', motherError);
      }

      resetMemberForm();
      setShowMemberForm(false);

      await Promise.all([fetchMembers(), fetchMarriages(), fetchParentChildRelationships()]);
    } catch (error) {
      console.error('Unexpected member error:', error);
      setMemberFormError('Something went wrong. Please try again.');
    } finally {
      setPostingMember(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) { setMessages([]); return; }
    let cancelled = false;

    const fetchMessages = async () => {
      const { data, error } = await supabase.from('messages').select('id, created_at, user_id, author_name, text').order('created_at', { ascending: false });
      if (cancelled) return;
      if (error) { console.error('Error loading messages:', error); setMessageError('Unable to load family messages.'); return; }
      setMessages((data || []) as Message[]);
    };

    fetchMessages();

    const channel = supabase
      .channel(`family-messages-${Date.now()}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMessage = payload.new as Message;
        setMessages((prev) => prev.some((m) => m.id === newMessage.id) ? prev : [newMessage, ...prev]);
      })
      .subscribe((status) => console.log('Messages realtime status:', status));

    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [isAuthenticated]);

  const sendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;
    if (!currentUser) { setMessageError('You must be signed in to send a message.'); return; }

    try {
      setSendingMessage(true);
      setMessageError('');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) { console.error('Authentication error:', authError); setMessageError('Your session has expired. Please sign in again.'); return; }
      if (!user) { setMessageError('No authenticated user found. Please sign in again.'); return; }

      const { error } = await supabase.from('messages').insert({ user_id: user.id, author_name: currentUser.name, text: trimmedMessage });
      if (error) { console.error('Error sending message:', error); setMessageError(error.message || 'Unable to send message.'); return; }

      setMessage('');
    } catch (error) {
      console.error('Unexpected message error:', error);
      setMessageError('Something went wrong while sending your message.');
    } finally {
      setSendingMessage(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 flex items-center justify-center p-4 pt-24">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
            <Lock size={40} className="text-orange-400" />
          </div>
          <h2 className="font-montserrat text-4xl font-bold text-white mb-4">Family Portal Access</h2>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            The Kornu Family Portal is exclusive to family members. Please sign in with your family credentials to continue.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8 text-left">
            {[
              { icon: MessageCircle, title: 'Family Chat', desc: 'Private family board' },
              { icon: TreePine, title: 'Family Tree', desc: 'Explore your heritage' },
              { icon: FileText, title: 'Documents', desc: 'Shared family files' },
              { icon: Image, title: 'Private Gallery', desc: 'Exclusive photos' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <Icon size={20} className="text-orange-400 mb-2" />
                <p className="text-white text-sm font-semibold">{title}</p>
                <p className="text-gray-400 text-xs">{desc}</p>
              </div>
            ))}
          </div>
          <button onClick={() => { setCurrentPage('signin'); window.scrollTo({ top: 0 }); }} className="btn-primary text-base px-8 py-4">
            <Shield size={18} /> Sign In to Portal <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-[70px]">
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-orange-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 25px 25px, white 2px, transparent 0)', backgroundSize: '50px 50px' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {currentUser?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-orange-300 text-xs font-semibold uppercase tracking-widest">Family Portal</span>
                  {isAdmin && <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">Admin</span>}
                </div>
                <h1 className="font-montserrat text-2xl font-bold text-white">Welcome, {currentUser?.name?.split(' ')[0]}!</h1>
                <p className="text-gray-400 text-sm">{currentUser?.email}</p>
              </div>
            </div>
            <button onClick={logout} className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-all">
              <LogOut size={14} /> Sign Out
            </button>
          </div>

          <div className="flex gap-2 mt-6 overflow-x-auto pb-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Star },
              { id: 'messages', label: 'Family Chat', icon: MessageCircle },
              { id: 'members', label: 'Members', icon: Users },
              { id: 'relationships', label: 'Relationships', icon: Heart },
              { id: 'events', label: 'Events', icon: Calendar },
              { id: 'announcements', label: 'Announcements', icon: Bell },
              { id: 'tree', label: 'Family Tree', icon: TreePine },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === id ? 'bg-orange-500 text-white shadow-md' : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                }`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Users, label: 'Family Members', value: allMembers.length, color: 'text-orange-500', bg: 'bg-orange-50' },
                { icon: Calendar, label: 'Upcoming Events', value: allEvents.length, color: 'text-blue-500', bg: 'bg-blue-50' },
                { icon: MessageCircle, label: 'Family Stories', value: familyStories.length, color: 'text-purple-500', bg: 'bg-purple-50' },
                { icon: Heart, label: 'Countries', value: 8, color: 'text-pink-500', bg: 'bg-pink-50' },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className={`${bg} rounded-2xl p-5 border border-white`}>
                  <Icon size={20} className={`${color} mb-3`} />
                  <div className={`text-3xl font-black font-montserrat ${color}`}>{value}</div>
                  <div className="text-gray-600 text-xs font-medium mt-1">{label}</div>
                </div>
              ))}
            </div>

            <div>
              <h2 className="font-montserrat text-xl font-bold text-gray-900 mb-4">Portal Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {portalFeatures.map(({ id, icon: Icon, title, desc, color, count }) => (
                  <button
                    key={id}
                    onClick={() => {
                      if (id === 'messages') setActiveTab('messages');
                      if (id === 'members') setActiveTab('members');
                      if (id === 'events') setActiveTab('events');
                      if (id === 'settings') setActiveTab('settings');
                      if (id === 'tree') setActiveTab('tree');
                    }}
                    className="portal-card p-6 text-left group"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                      <Icon size={22} className="text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-base mb-1">{title}</h3>
                    <p className="text-gray-500 text-xs mb-3">{desc}</p>
                    {count && <span className="text-xs font-semibold bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full">{count}</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-montserrat text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Bell size={18} className="text-orange-500" /> Latest Announcements
              </h2>
              <div className="space-y-3">
                {allAnnouncements.map((a) => (
                  <div key={a.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${a.priority === 'high' ? 'bg-orange-500' : 'bg-blue-400'}`} />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{a.title}</p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        By {a.author} · {new Date(a.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    {a.priority === 'high' && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-semibold">Important</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl p-8 text-white">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={20} />
                <h3 className="font-montserrat text-xl font-bold">Family Activity</h3>
              </div>
              <div className="grid grid-cols-12 gap-1 items-end h-20">
                {[40, 60, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((height, index) => (
                  <div key={index} className="bg-white/30 hover:bg-white/50 rounded-sm transition-all cursor-pointer" style={{ height: `${height}%` }} title={`Month ${index + 1}`} />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-white/60 text-xs">
                <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Dec</span>
              </div>
              <p className="text-white/70 text-sm mt-4">Family engagement across all portal features</p>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-pink-50">
              <h2 className="font-montserrat text-xl font-bold text-gray-900 flex items-center gap-2">
                <MessageCircle size={20} className="text-orange-500" /> Family Message Board
              </h2>
              <p className="text-gray-500 text-sm mt-1">Private family conversations — only visible to family members</p>
            </div>

            <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No messages yet.</p>
                  <p className="text-gray-400 text-xs mt-1">Be the first family member to say something!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.user_id === currentUser?.id;
                  const avatar = msg.author_name ? msg.author_name.split(' ').map((n) => n.charAt(0)).join('').slice(0, 2).toUpperCase() : 'F';
                  const messageTime = msg.created_at ? new Date(msg.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

                  return (
                    <div key={msg.id} className={`flex gap-3 ${isMine ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm ${isMine ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-gradient-to-br from-gray-400 to-gray-600'}`}>
                        {avatar}
                      </div>
                      <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-700">{msg.author_name}</span>
                          <span className="text-xs text-gray-400">{messageTime}</span>
                        </div>
                        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isMine ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-700 rounded-tl-sm'}`}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {messageError && <div className="mx-4 mb-3 bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">{messageError}</div>}

            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {currentUser?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => { setMessage(e.target.value); if (messageError) setMessageError(''); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Share a message with the family..."
                    className="input-field flex-1"
                    disabled={sendingMessage}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!message.trim() || sendingMessage}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingMessage ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-montserrat text-xl font-bold text-gray-900">Family Members Directory</h2>
              {isAdmin && (
                <button onClick={() => { resetMemberForm(); setShowMemberForm(true); }} className="btn-primary py-2 px-4 text-sm">
                  <Plus size={14} /> Add Member
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allMembers.map((member) => (
                <div key={member.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 card-hover">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-14 h-14 rounded-full object-cover flex-shrink-0 ring-2 ring-orange-100"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src.includes('placeholder.jpg')) return;
                      target.src = '/images/placeholder.jpg';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 font-montserrat text-sm">{member.name}</h3>
                    <p className="text-orange-500 text-xs font-medium">{member.role}</p>
                    <p className="text-gray-400 text-xs mt-0.5 truncate">
                      {member.location || 'Location not specified'} · {member.occupation || 'Occupation not specified'}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs">
                      {member.birthDate && (
                        <span className="text-gray-500">
                          <span className="font-medium text-gray-700">Born:</span>{' '}
                          {new Date(member.birthDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      {(member as DbMember).dateOfPassing && (
  <span className="text-gray-500">
    <span className="font-medium text-gray-700">Passed:</span>{' '}
    {new Date((member as DbMember).dateOfPassing as string).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
  </span>
)}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                      member.generation === 1 ? 'bg-orange-100 text-orange-700'
                      : member.generation === 2 ? 'bg-pink-100 text-pink-700'
                      : member.generation === 3 ? 'bg-purple-100 text-purple-700'
                      : member.generation === 4 ? 'bg-emerald-100 text-emerald-700'
                      : member.generation === 5 ? 'bg-violet-100 text-violet-700'
                      : 'bg-cyan-100 text-cyan-700'
                    }`}
                  >
                    Gen {member.generation}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'relationships' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-montserrat text-xl font-bold text-gray-900">Family Relationships</h2>
                <p className="text-gray-500 text-sm mt-1">Connect spouses and assign children to the correct family unit.</p>
              </div>
              {isAdmin && (
                <button onClick={() => { resetMarriageForm(); setShowMarriageForm(true); }} className="btn-primary py-2 px-4 text-sm">
                  <Plus size={14} /> Add Marriage
                </button>
              )}
            </div>

            {isAdmin && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Heart size={18} className="text-orange-500" />
                  <h3 className="font-montserrat font-bold text-gray-900">Assign a Child to a Marriage</h3>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  <select value={selectedMarriageId} onChange={(e) => setSelectedMarriageId(e.target.value)} className="input-field">
                    <option value="">Select marriage</option>
                    {marriages.map((marriage) => (
                      <option key={marriage.id} value={marriage.id}>
                        {getMemberName(marriage.spouse_1_id)} & {getMemberName(marriage.spouse_2_id)}
                      </option>
                    ))}
                  </select>

                  <select value={selectedChildId} onChange={(e) => setSelectedChildId(e.target.value)} className="input-field">
                    <option value="">Select child</option>
                    {dbMembers.map((member) => (
                      <option key={member.id} value={member.id}>{member.name} — Gen {member.generation}</option>
                    ))}
                  </select>

                  <button onClick={assignChildToMarriage} disabled={savingRelationship} className="btn-primary justify-center disabled:opacity-60">
                    {savingRelationship ? 'Saving...' : 'Assign Child'}
                  </button>
                </div>

                {relationshipError && <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">{relationshipError}</div>}
              </div>
            )}

            <div className="space-y-4">
              {marriages.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                  <Heart size={36} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No marriages or partnerships have been added yet.</p>
                  {isAdmin && <p className="text-gray-400 text-sm mt-1">Use "Add Marriage" to create the first family relationship.</p>}
                </div>
              ) : (
                marriages.map((marriage) => {
                  const children = getMarriageChildren(marriage.id);
                  return (
                    <div key={marriage.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Heart size={17} className="text-orange-500" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-orange-500">{marriage.status}</span>
                          </div>
                          <h3 className="font-montserrat text-lg font-bold text-gray-900">
                            {getMemberName(marriage.spouse_1_id)} & {getMemberName(marriage.spouse_2_id)}
                          </h3>
                          <p className="text-gray-500 text-sm mt-1">
                            {marriage.marriage_date
                              ? `Married ${new Date(marriage.marriage_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
                              : 'Marriage date not specified'}
                          </p>
                        </div>
                        <div className="bg-orange-50 rounded-xl px-4 py-3 min-w-[150px]">
                          <div className="text-2xl font-black text-orange-500">{children.length}</div>
                          <div className="text-xs text-gray-500">Children assigned</div>
                        </div>
                      </div>
                      <div className="border-t border-gray-100 bg-gray-50 p-5">
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Children</p>
                        {children.length === 0 ? (
                          <p className="text-sm text-gray-400">No children have been assigned to this marriage yet.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {children.map((child) => {
                              const parents = getParentsOfChild(child.id);
                              return (
                                <div key={child.id} className="bg-white border border-gray-200 rounded-2xl px-3 py-2">
                                  <div className="text-sm font-medium text-gray-700">{child.name}</div>
                                  {parents.length > 0 && (
                                    <div className="text-[11px] text-gray-400 mt-1">
                                      Parents: {parents.map((item) => item.parent?.name).filter(Boolean).join(' & ')}
                                      
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Children grouped by individual parent — uses getChildrenOfParent */}
            <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-1">
                <Users size={18} className="text-orange-500" />
                <h3 className="font-montserrat font-bold text-gray-900">Children by Parent</h3>
              </div>
              <p className="text-gray-500 text-sm mb-5">Every member who has at least one recorded child, and who those children are.</p>

              {(() => {
                const parentsWithChildren = allMembers.filter((member) => getChildrenOfParent(member.id).length > 0);
                if (parentsWithChildren.length === 0) {
                  return <p className="text-sm text-gray-400">No parent-child relationships have been recorded yet.</p>;
                }
                return (
                  <div className="grid md:grid-cols-2 gap-3">
                    {parentsWithChildren.map((parent) => {
                      const children = getChildrenOfParent(parent.id);
                      return (
                        <div key={parent.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                          <div className="font-semibold text-gray-800">{parent.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {children.map((child) => child.name).join(', ')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {activeTab === 'tree' && (
  <div>
    <div className="mb-6">
      <h2 className="font-montserrat text-xl font-bold text-gray-900">Family Tree</h2>
      <p className="text-gray-500 text-sm mt-1">
        A visual map of the Kornu family, built from recorded marriages and parent-child relationships.
      </p>
    </div>

    {dbMembers.length === 0 ? (
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
        <TreePine size={36} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">No family members recorded yet.</p>
      </div>
    ) : (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 overflow-x-auto">
        <div className="family-tree min-w-max">
          <ul>
            {buildTree().map((rootNode) => (
              <FamilyTreeNode
                key={rootNode.member.id}
                node={rootNode}
                isRoot={true}
              />
            ))}
          </ul>
        </div>
      </div>
    )}
  </div>
)}

        {activeTab === 'events' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-montserrat text-xl font-bold text-gray-900">My Family Events</h2>
              {isAdmin && (
                <button onClick={() => { resetEventForm(); setShowEventForm(true); }} className="btn-primary py-2 px-4 text-sm">
                  <Plus size={14} /> Add Event
                </button>
              )}
            </div>

            <div className="space-y-4">
              {allEvents.map((event) => (
                <div key={event.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex gap-4">
                  {event.image ? (
                    <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden">
                      <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex flex-col items-center justify-center text-white">
                      <div className="text-xl font-black font-montserrat leading-none">{new Date(event.date).getDate()}</div>
                      <div className="text-xs font-semibold opacity-80">{new Date(event.date).toLocaleDateString('en-GB', { month: 'short' })}</div>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 font-montserrat text-base">{event.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{event.location}</p>
                    <p className="text-gray-400 text-xs mt-2 line-clamp-1">{event.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full font-semibold capitalize">{event.type}</span>
                    {event.rsvpCount !== undefined && <span className="text-xs text-gray-400">{event.rsvpCount} attending</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'announcements' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-montserrat text-xl font-bold text-gray-900">Family Announcements</h2>
              {isAdmin && (
                <button onClick={() => { resetAnnouncementForm(); setShowAnnouncementForm(true); }} className="btn-primary py-2 px-4 text-sm">
                  <Plus size={14} /> Post Announcement
                </button>
              )}
            </div>

            <div className="space-y-4">
              {allAnnouncements.map((a) => (
                <div key={a.id} className={`bg-white rounded-2xl p-6 shadow-sm border-l-4 ${a.priority === 'high' ? 'border-orange-500' : 'border-blue-400'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {a.priority === 'high' && <span className="text-xs bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full font-semibold">Important</span>}
                        <span className="text-xs text-gray-400">{new Date(a.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 font-montserrat text-lg">{a.title}</h3>
                      <p className="text-gray-500 text-sm mt-1">Posted by {a.author}</p>
                    </div>
                    <Bell size={18} className={a.priority === 'high' ? 'text-orange-500' : 'text-blue-400'} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showMarriageForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-montserrat text-xl font-bold text-gray-900">Add Marriage / Partnership</h2>
                <p className="text-gray-400 text-xs mt-1">Create the parent unit first, then assign children.</p>
              </div>
              <button onClick={() => { resetMarriageForm(); setShowMarriageForm(false); }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <select value={marriageSpouse1} onChange={(e) => setMarriageSpouse1(e.target.value)} className="input-field">
                <option value="">Select spouse 1</option>
                {dbMembers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>

              <select value={marriageSpouse2} onChange={(e) => setMarriageSpouse2(e.target.value)} className="input-field">
                <option value="">Select spouse 2</option>
                {dbMembers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Marriage Date</label>
                <input type="date" value={marriageDate} onChange={(e) => setMarriageDate(e.target.value)} className="input-field" />
              </div>

              <select value={marriageStatus} onChange={(e) => setMarriageStatus(e.target.value)} className="input-field">
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
                <option value="separated">Separated</option>
              </select>

              {marriageFormError && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">{marriageFormError}</div>}

              <div className="flex gap-3">
                <button onClick={() => { resetMarriageForm(); setShowMarriageForm(false); }} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-gray-600 font-medium">Cancel</button>
                <button onClick={submitMarriage} disabled={postingMarriage} className="flex-1 btn-primary justify-center disabled:opacity-60">
                  {postingMarriage ? 'Saving...' : 'Create Relationship'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEventForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-montserrat text-xl font-bold text-gray-900">Add Event</h2>
              <button onClick={() => { resetEventForm(); setShowEventForm(false); }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <input type="text" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="Event title" className="input-field" />
              <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="input-field" />
              <input type="text" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} placeholder="Location" className="input-field" />
              <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="input-field">
                <option value="reunion">Reunion</option>
                <option value="birthday">Birthday</option>
                <option value="wedding">Wedding</option>
                <option value="memorial">Memorial</option>
                <option value="celebration">Celebration</option>
              </select>
              <textarea value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} placeholder="Description" rows={3} className="input-field resize-none" />
              <label className="block">
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center cursor-pointer hover:border-orange-300 transition-colors">
                  {eventImagePreview ? <img src={eventImagePreview} alt="Event preview" className="max-h-32 mx-auto rounded-xl object-cover" /> : <p className="text-sm text-gray-400">Click to add a photo (optional)</p>}
                </div>
                <input type="file" accept="image/*" onChange={handleEventImageChange} className="hidden" />
              </label>
              {eventFormError && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">{eventFormError}</div>}
              <div className="flex gap-3">
                <button onClick={() => { resetEventForm(); setShowEventForm(false); }} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-gray-600 font-medium">Cancel</button>
                <button onClick={submitEvent} disabled={postingEvent} className="flex-1 btn-primary justify-center disabled:opacity-60">
                  {postingEvent ? 'Posting...' : 'Post Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAnnouncementForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-montserrat text-xl font-bold text-gray-900">Post Announcement</h2>
              <button onClick={() => { resetAnnouncementForm(); setShowAnnouncementForm(false); }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <input type="text" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} placeholder="Announcement title" className="input-field" />
              <select value={annPriority} onChange={(e) => setAnnPriority(e.target.value)} className="input-field">
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
              </select>
              {annFormError && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">{annFormError}</div>}
              <div className="flex gap-3">
                <button onClick={() => { resetAnnouncementForm(); setShowAnnouncementForm(false); }} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-gray-600 font-medium">Cancel</button>
                <button onClick={submitAnnouncement} disabled={postingAnn} className="flex-1 btn-primary justify-center disabled:opacity-60">
                  {postingAnn ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMemberForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-montserrat text-xl font-bold text-gray-900">Add Family Member</h2>
              <button onClick={() => { resetMemberForm(); setShowMemberForm(false); }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <input type="text" value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="Full name" className="input-field" />
              <input type="text" value={memberRole} onChange={(e) => setMemberRole(e.target.value)} placeholder="Role (e.g. Son · Doctor)" className="input-field" />
              <select value={memberGeneration} onChange={(e) => setMemberGeneration(e.target.value)} className="input-field">
                <option value="1">Generation 1 — Founders</option>
                <option value="2">Generation 2 — Parents</option>
                <option value="3">Generation 3 — Grandchildren</option>
                <option value="4">Generation 4 — Great-Grandchildren</option>
                <option value="5">Generation 5 — Great-Great-Grandchildren</option>
                <option value="6">Generation 6 — Great-Great-Great-Grandchildren</option>
              </select>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Birth Date (optional)</label>
                  <input type="date" value={memberBirthDate} onChange={(e) => setMemberBirthDate(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date of Passing (if applicable)</label>
                  <input type="date" value={memberDateOfPassing} onChange={(e) => setMemberDateOfPassing(e.target.value)} className="input-field" />
                </div>
              </div>

              <input type="text" value={memberLocation} onChange={(e) => setMemberLocation(e.target.value)} placeholder="Location (optional)" className="input-field" />
              <input type="text" value={memberOccupation} onChange={(e) => setMemberOccupation(e.target.value)} placeholder="Occupation (optional)" className="input-field" />
              <textarea value={memberBio} onChange={(e) => setMemberBio(e.target.value)} placeholder="Bio" rows={3} className="input-field resize-none" />
              <input type="text" value={memberTags} onChange={(e) => setMemberTags(e.target.value)} placeholder="Tags, comma separated (e.g. Doctor, Healer)" className="input-field" />

              {/* Relationship fields — spouse, father, mother, all optional, drawn from existing db members */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Family Relationships (optional)</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Spouse</label>
                    <select value={memberSpouseId} onChange={(e) => setMemberSpouseId(e.target.value)} className="input-field">
                      <option value="">None</option>
                      {dbMembers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Father</label>
                    <select value={memberFatherId} onChange={(e) => setMemberFatherId(e.target.value)} className="input-field">
                      <option value="">None / Unknown</option>
                      {dbMembers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Mother</label>
                    <select value={memberMotherId} onChange={(e) => setMemberMotherId(e.target.value)} className="input-field">
                      <option value="">None / Unknown</option>
                      {dbMembers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <label className="block">
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center cursor-pointer hover:border-orange-300 transition-colors">
                  {memberImagePreview ? <img src={memberImagePreview} alt="Member preview" className="max-h-32 mx-auto rounded-xl object-cover" /> : <p className="text-sm text-gray-400">Click to add a photo (optional)</p>}
                </div>
                <input type="file" accept="image/*" onChange={handleMemberImageChange} className="hidden" />
              </label>

              {memberFormError && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">{memberFormError}</div>}

              <div className="flex gap-3">
                <button onClick={() => { resetMemberForm(); setShowMemberForm(false); }} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-gray-600 font-medium">Cancel</button>
                <button onClick={submitMember} disabled={postingMember} className="flex-1 btn-primary justify-center disabled:opacity-60">
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