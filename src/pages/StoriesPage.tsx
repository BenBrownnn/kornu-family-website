import { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Heart,
  MessageCircle,
  Quote,
  PenLine,
  Tag,
  ArrowRight,
  X,
  ChevronLeft,
  ImagePlus,
  Upload,
  Trash2,
  Loader2,
} from 'lucide-react';

import { useStore } from '../store/useStore';
import { familyStories } from '../data/familyData';
import { supabase } from '../lib/supabaseClient';
import Footer from '../components/Footer';

type FamilyStory = {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string;
  excerpt: string;
  image?: string;
  likes: number;
  comments: number;
  tags: string[];
  isDatabaseStory?: boolean;
};

type StoryImageRecord = {
  story_id: string;
  image_url: string;
  storage_path?: string | null;
};

type StoryComment = {
  id: number;
  story_id: string;
  user_id: string;
  author_name: string;
  comment: string;
  created_at: string;
};

export default function StoriesPage() {
  const {
    setCurrentPage,
    currentUser,
    isAuthenticated,
  } = useStore();

  /* =========================================
     LIKE STATE
  ========================================= */

  const [liked, setLiked] = useState<
    Record<string, boolean>
  >({});

  /* =========================================
     SELECTED STORY
  ========================================= */

  const [selected, setSelected] = useState<
    string | null
  >(null);

  /* =========================================
     TAG FILTER
  ========================================= */

  const [activeTag, setActiveTag] =
    useState('All');

  /* =========================================
     DATABASE STORIES
  ========================================= */

  const [dbStories, setDbStories] = useState<
    FamilyStory[]
  >([]);

  /* =========================================
     STORY IMAGES
  ========================================= */

  const [storyImages, setStoryImages] = useState<
    Record<string, StoryImageRecord>
  >({});

  /* =========================================
     STORY FORM
  ========================================= */

  const [showStoryForm, setShowStoryForm] =
    useState(false);

  const [storyTitle, setStoryTitle] =
    useState('');

  const [storyContent, setStoryContent] =
    useState('');

  const [storyExcerpt, setStoryExcerpt] =
    useState('');

  const [storyTags, setStoryTags] =
    useState('');

  const [postingStory, setPostingStory] =
    useState(false);

  const [storyFormError, setStoryFormError] =
    useState('');

  /* =========================================
     NEW STORY IMAGE
  ========================================= */

  const [storyImageFile, setStoryImageFile] =
    useState<File | null>(null);

  const [storyImagePreview, setStoryImagePreview] =
    useState<string | null>(null);

  /* =========================================
     EXISTING STORY IMAGE
  ========================================= */

  const [editingImage, setEditingImage] =
    useState(false);

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState<string | null>(null);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [imageError, setImageError] =
    useState('');

  /* =========================================
     COMMENTS
  ========================================= */

  const [commentsByStory, setCommentsByStory] =
    useState<Record<string, StoryComment[]>>({});

  const [commentCounts, setCommentCounts] =
    useState<Record<string, number>>({});

  const [commentText, setCommentText] =
    useState('');

  const [loadingComments, setLoadingComments] =
    useState(false);

  const [postingComment, setPostingComment] =
    useState(false);

  const [commentError, setCommentError] =
    useState('');

  /* =========================================
     REFS
  ========================================= */

  const newStoryImageInput =
    useRef<HTMLInputElement | null>(null);

  const existingImageInput =
    useRef<HTMLInputElement | null>(null);

  /* =========================================
     FETCH STORIES
  ========================================= */

  const fetchStories = async () => {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .order('created_at', {
        ascending: false,
      });

    if (error) {
      console.error(
        'Error fetching stories:',
        error
      );

      setDbStories([]);
      return;
    }

    if (data) {
      const normalizedStories: FamilyStory[] =
        data.map((story) => ({
          id: String(story.id),
          title:
            story.title ?? 'Untitled Story',
          author:
            story.author_name ??
            'Family Member',
          date:
            story.created_at ??
            new Date().toISOString(),
          content: story.content ?? '',
          excerpt:
            story.excerpt ??
            story.content?.slice(0, 150) ??
            '',
          image:
            story.image ??
            undefined,
          likes:
            typeof story.likes === 'number'
              ? story.likes
              : 0,
          comments:
            typeof story.comments === 'number'
              ? story.comments
              : 0,
          tags: Array.isArray(story.tags)
            ? story.tags
            : [],
          isDatabaseStory: true,
        }));

      setDbStories(normalizedStories);
    }
  };

  /* =========================================
     FETCH STORY IMAGES
  ========================================= */

  const fetchStoryImages = async () => {
    const { data, error } = await supabase
      .from('story_images')
      .select(
        'story_id, image_url, storage_path'
      );

    if (error) {
      console.error(
        'Error fetching story images:',
        error
      );
      return;
    }

    if (data) {
      const imageMap: Record<
        string,
        StoryImageRecord
      > = {};

      data.forEach((item) => {
        imageMap[String(item.story_id)] =
          item;
      });

      setStoryImages(imageMap);
    }
  };

  /* =========================================
     FETCH COMMENT COUNTS
  ========================================= */

  const fetchCommentCounts = async () => {
    const { data, error } = await supabase
      .from('story_comments')
      .select('story_id');

    if (error) {
      console.error(
        'Error fetching comment counts:',
        error
      );
      return;
    }

    const counts: Record<string, number> = {};

    (data || []).forEach((comment) => {
      const storyId = String(
        comment.story_id
      );

      counts[storyId] =
        (counts[storyId] || 0) + 1;
    });

    setCommentCounts(counts);
  };

  /* =========================================
     INITIAL FETCH
  ========================================= */

  useEffect(() => {
    fetchStories();
    fetchStoryImages();
    fetchCommentCounts();
  }, []);

  /* =========================================
     NORMALIZE STATIC STORIES
  ========================================= */

  const staticStories: FamilyStory[] =
    familyStories.map((story) => ({
      id: String(story.id),
      title: story.title,
      author: story.author,
      date: story.date,
      content: story.content,
      excerpt: story.excerpt,
      image:
        storyImages[String(story.id)]
          ?.image_url ||
        story.image,
      likes:
        typeof story.likes === 'number'
          ? story.likes
          : 0,
      comments:
        typeof story.comments === 'number'
          ? story.comments
          : 0,
      tags: Array.isArray(story.tags)
        ? story.tags
        : [],
      isDatabaseStory: false,
    }));

  /* =========================================
     ALL STORIES
  ========================================= */

  const allStories: FamilyStory[] =
    dbStories.length > 0
      ? dbStories.map((story) => ({
          ...story,
          image:
            story.image ||
            storyImages[story.id]
              ?.image_url ||
            undefined,
        }))
      : staticStories;

  /* =========================================
     TAGS
  ========================================= */

  const allTags = [
    'All',
    ...Array.from(
      new Set(
        allStories.flatMap(
          (story) => story.tags || []
        )
      )
    ),
  ];

  const filtered: FamilyStory[] =
    allStories.filter(
      (story) =>
        activeTag === 'All' ||
        (story.tags || []).includes(activeTag)
    );

  const selectedStory = allStories.find(
    (story) => story.id === selected
  );

  /* =========================================
     GET COMMENT COUNT
  ========================================= */

  const getCommentCount = (
    story: FamilyStory
  ) => {
    const databaseCount =
      commentCounts[story.id];

    if (databaseCount === undefined) {
      return story.comments;
    }

    /*
     * Static stories may already have an
     * original comment count in familyData.
     * New Supabase comments are added to it.
     */
    return story.comments + databaseCount;
  };

  /* =========================================
     LOAD COMMENTS WHEN STORY OPENS
  ========================================= */

  useEffect(() => {
    if (!selected) {
      setCommentText('');
      setCommentError('');
      return;
    }

    const loadSelectedComments =
      async () => {
        setLoadingComments(true);
        setCommentError('');

        const { data, error } =
          await supabase
            .from('story_comments')
            .select(
              'id, story_id, user_id, author_name, comment, created_at'
            )
            .eq('story_id', selected)
            .order('created_at', {
              ascending: true,
            });

        if (error) {
          console.error(
            'Error loading comments:',
            error
          );

          setCommentError(
            'Unable to load comments right now.'
          );

          setLoadingComments(false);
          return;
        }

        setCommentsByStory(
          (previous) => ({
            ...previous,
            [selected]:
              (data || []) as StoryComment[],
          })
        );

        setLoadingComments(false);
      };

    loadSelectedComments();

    setCommentText('');
    setCommentError('');
  }, [selected]);

  /* =========================================
     LIKE
  ========================================= */

  const toggleLike = (
    id: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    setLiked((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  };

  /* =========================================
     COMMENT SUBMISSION
  ========================================= */

  const submitComment = async () => {
    if (!selectedStory) return;

    const trimmedComment =
      commentText.trim();

    if (!trimmedComment) {
      setCommentError(
        'Please write a comment before posting.'
      );
      return;
    }

    if (!currentUser) {
      setCommentError(
        'Please sign in to comment on family stories.'
      );
      return;
    }

    setPostingComment(true);
    setCommentError('');

    const { data, error } =
      await supabase
        .from('story_comments')
        .insert({
          story_id: selectedStory.id,
          user_id: currentUser.id,
          author_name:
            currentUser.name ||
            'Family Member',
          comment: trimmedComment,
        })
        .select(
          'id, story_id, user_id, author_name, comment, created_at'
        )
        .single();

    if (error) {
      console.error(
        'Error posting comment:',
        error
      );

      setCommentError(
        'Unable to post your comment. Please try again.'
      );

      setPostingComment(false);
      return;
    }

    const newComment =
      data as StoryComment;

    setCommentsByStory(
      (previous) => ({
        ...previous,
        [selectedStory.id]: [
          ...(previous[
            selectedStory.id
          ] || []),
          newComment,
        ],
      })
    );

    setCommentCounts(
      (previous) => ({
        ...previous,
        [selectedStory.id]:
          (previous[selectedStory.id] || 0) +
          1,
      })
    );

    setCommentText('');
    setPostingComment(false);
  };

  /* =========================================
     NEW STORY IMAGE SELECTION
  ========================================= */

  const handleNewStoryImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStoryFormError(
        'Please select a valid image file.'
      );
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setStoryFormError(
        'Image must be smaller than 8MB.'
      );
      return;
    }

    setStoryFormError('');
    setStoryImageFile(file);

    const preview =
      URL.createObjectURL(file);

    setStoryImagePreview(preview);
  };

  /* =========================================
     EXISTING STORY IMAGE SELECTION
  ========================================= */

  const handleExistingImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImageError('');

    if (!file.type.startsWith('image/')) {
      setImageError(
        'Please select a valid image file.'
      );
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setImageError(
        'Image must be smaller than 8MB.'
      );
      return;
    }

    setImageFile(file);

    const preview =
      URL.createObjectURL(file);

    setImagePreview(preview);
  };

  /* =========================================
     UPLOAD STORY IMAGE
  ========================================= */

  const uploadStoryImage = async (
    file: File,
    storyId: string
  ) => {
    if (!currentUser) {
      throw new Error(
        'You must be signed in.'
      );
    }

    const extension =
      file.name.split('.').pop() ||
      'jpg';

    const safeExtension =
      extension.toLowerCase();

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}.${safeExtension}`;

    const storagePath =
      `${storyId}/${fileName}`;

    const { error: uploadError } =
      await supabase.storage
        .from('story-images')
        .upload(
          storagePath,
          file,
          {
            cacheControl: '3600',
            upsert: false,
          }
        );

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: publicUrlData,
    } = supabase.storage
      .from('story-images')
      .getPublicUrl(
        storagePath
      );

    if (!publicUrlData?.publicUrl) {
      throw new Error(
        'Could not create image URL.'
      );
    }

    return {
      imageUrl:
        publicUrlData.publicUrl,
      storagePath,
    };
  };

  /* =========================================
     SUBMIT STORY
  ========================================= */

  const submitStory = async () => {
    setStoryFormError('');

    if (
      !storyTitle.trim() ||
      !storyContent.trim()
    ) {
      setStoryFormError(
        'Please fill in a title and story content.'
      );
      return;
    }

    if (!currentUser) {
      setStoryFormError(
        'You must be signed in to share a story.'
      );
      return;
    }

    setPostingStory(true);

    try {
      const tagsArray = storyTags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      const excerpt =
        storyExcerpt.trim() ||
        `${storyContent
          .trim()
          .slice(0, 150)}...`;

      const {
        data: insertedStory,
        error,
      } = await supabase
        .from('stories')
        .insert({
          title: storyTitle.trim(),
          author_name:
            currentUser.name,
          content:
            storyContent.trim(),
          excerpt,
          tags:
            tagsArray.length > 0
              ? tagsArray
              : ['Memories'],
          created_by:
            currentUser.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (
        storyImageFile &&
        insertedStory
      ) {
        const {
          imageUrl,
        } = await uploadStoryImage(
          storyImageFile,
          String(insertedStory.id)
        );

        const {
          error:
            imageUpdateError,
        } = await supabase
          .from('stories')
          .update({
            image: imageUrl,
          })
          .eq(
            'id',
            insertedStory.id
          );

        if (imageUpdateError) {
          throw imageUpdateError;
        }
      }

      setStoryTitle('');
      setStoryContent('');
      setStoryExcerpt('');
      setStoryTags('');
      setStoryImageFile(null);
      setStoryImagePreview(null);
      setStoryFormError('');
      setShowStoryForm(false);

      await fetchStories();
      await fetchStoryImages();
    } catch (error) {
      console.error(
        'Error posting story:',
        error
      );

      setStoryFormError(
        'Something went wrong while posting the story or image. Please try again.'
      );
    } finally {
      setPostingStory(false);
    }
  };

  /* =========================================
     SAVE EXISTING STORY IMAGE
  ========================================= */

  const saveExistingStoryImage =
    async () => {
      if (!selectedStory) return;

      if (!currentUser) {
        setImageError(
          'You must be signed in to add an image.'
        );
        return;
      }

      if (!imageFile) {
        setImageError(
          'Please choose an image first.'
        );
        return;
      }

      setUploadingImage(true);
      setImageError('');

      try {
        const {
          imageUrl,
          storagePath,
        } = await uploadStoryImage(
          imageFile,
          selectedStory.id
        );

        if (
          selectedStory.isDatabaseStory
        ) {
          const {
            error: updateError,
          } = await supabase
            .from('stories')
            .update({
              image: imageUrl,
            })
            .eq(
              'id',
              selectedStory.id
            );

          if (updateError) {
            throw updateError;
          }
        } else {
          const {
            error:
              imageRecordError,
          } = await supabase
            .from('story_images')
            .upsert(
              {
                story_id:
                  selectedStory.id,
                image_url:
                  imageUrl,
                storage_path:
                  storagePath,
                created_by:
                  currentUser.id,
                updated_at:
                  new Date().toISOString(),
              },
              {
                onConflict:
                  'story_id',
              }
            );

          if (imageRecordError) {
            throw imageRecordError;
          }
        }

        await fetchStories();
        await fetchStoryImages();

        setImageFile(null);
        setImagePreview(null);
        setEditingImage(false);

        if (
          existingImageInput.current
        ) {
          existingImageInput.current.value =
            '';
        }
      } catch (error) {
        console.error(
          'Error saving story image:',
          error
        );

        setImageError(
          'Unable to save the image. Please try again.'
        );
      } finally {
        setUploadingImage(false);
      }
    };

  /* =========================================
     CANCEL IMAGE EDIT
  ========================================= */

  const cancelImageEdit = () => {
    setEditingImage(false);
    setImageFile(null);
    setImagePreview(null);
    setImageError('');

    if (
      existingImageInput.current
    ) {
      existingImageInput.current.value =
        '';
    }
  };

  /* =========================================
     OPEN STORY FORM
  ========================================= */

  const openStoryForm = () => {
    if (!isAuthenticated) {
      setCurrentPage('signin');

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      return;
    }

    setStoryFormError('');
    setShowStoryForm(true);
  };

  /* =========================================
     NAVIGATION
  ========================================= */

  const handleNav = (
    target: string
  ) => {
    const pageMap: Record<
      string,
      string
    > = {
      home: 'home',
      family: 'family',
      gallery: 'gallery',
      events: 'events',
      stories: 'stories',
      portal: 'portal',
      signin: 'signin',
    };

    setCurrentPage(
      pageMap[target] ?? 'home'
    );

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  /* =========================================
     CLOSE STORY MODAL
  ========================================= */

  const closeStoryModal = () => {
    cancelImageEdit();
    setSelected(null);
    setCommentText('');
    setCommentError('');
  };

  /* =========================================
     CLEAN PREVIEW URLS
  ========================================= */

  useEffect(() => {
    return () => {
      if (storyImagePreview) {
        URL.revokeObjectURL(
          storyImagePreview
        );
      }

      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview
        );
      }
    };
  }, [
    storyImagePreview,
    imagePreview,
  ]);

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="min-h-screen bg-[#FAF5EE] text-[#102A43]">

      {/* =====================================
          HERO
      ===================================== */}

      <section className="relative min-h-[560px] overflow-hidden text-white">

        <img
          src="/images/gather.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-[#023570]/60" />

        <div className="absolute inset-0 bg-gradient-to-br from-[#023570]/90 via-[#023570]/40 to-[#2E1065]/60" />

        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#FAF5EE] to-transparent" />

        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#51A2FF]/20 blur-3xl" />

        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#6A1B9A]/25 blur-3xl" />

        <div className="relative z-10 mx-auto flex min-h-[560px] max-w-6xl items-center px-4 py-20">

          <div className="max-w-3xl">

            <button
              onClick={() =>
                handleNav('home')
              }
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:border-white/40 hover:bg-white/20"
            >
              <ChevronLeft size={16} />
              Back to Home
            </button>

            <h1 className="font-['Montserrat'] text-4xl font-black leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Stories

              <span className="block text-[#51A2FF]">
                Worth Telling
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-blue-100 md:text-lg">
              Our history lives in the stories
              we share. Every tale told keeps
              the Kornu spirit alive for future
              generations.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-md">

                <BookOpen
                  size={16}
                  className="text-[#51A2FF]"
                />

                {allStories.length} Stories

              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-md">

                <MessageCircle
                  size={16}
                  className="text-[#51A2FF]"
                />

                Family Conversations

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* =====================================
          CONTENT
      ===================================== */}

      <main className="mx-auto max-w-5xl px-4 py-16">

        {/* TAG FILTER */}

        <div className="mb-10 flex flex-wrap justify-center gap-2">

          {allTags.map((tag) => {

            const isActive =
              activeTag === tag;

            return (
              <button
                key={tag}
                onClick={() =>
                  setActiveTag(tag)
                }
                className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#023570] text-white shadow-md'
                    : 'bg-white text-[#023570] ring-1 ring-[#D0E6FF] hover:bg-[#E9D5FF] hover:text-[#6A1B9A]'
                }`}
              >
                {tag !== 'All' && (
                  <Tag size={12} />
                )}

                {tag}
              </button>
            );
          })}
        </div>

        {/* RESULTS COUNT */}

        <div className="mb-8 text-center">

          <p className="text-sm font-semibold text-[#52667A]">

            Showing{' '}

            <span className="font-black text-[#023570]">
              {filtered.length}
            </span>{' '}

            {filtered.length === 1
              ? 'story'
              : 'stories'}

          </p>

        </div>

        {/* FEATURED STORY */}

        {filtered.length > 0 && (

          <article
            className="group mb-10 cursor-pointer overflow-hidden rounded-3xl border border-[#D0E6FF] bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            onClick={() =>
              setSelected(
                filtered[0].id
              )
            }
          >

            {filtered[0].image && (
              <div className="h-72 overflow-hidden">

                <img
                  src={filtered[0].image}
                  alt={filtered[0].title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

              </div>
            )}

            <div className="p-7 md:p-8">

              <div className="mb-4 flex flex-wrap gap-2">

                {(filtered[0].tags || []).map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-lg bg-[#E9D5FF] px-3 py-1 text-xs font-semibold text-[#6A1B9A]"
                    >
                      {tag}
                    </span>
                  )
                )}

              </div>

              <h2 className="font-['Montserrat'] text-2xl font-bold leading-tight text-[#102A43] md:text-3xl">
                {filtered[0].title}
              </h2>

              <div className="mt-4 flex items-start gap-3">

                <Quote
                  size={20}
                  className="mt-1 flex-shrink-0 text-[#6A1B9A]"
                />

                <p className="text-base italic leading-relaxed text-[#52667A]">
                  {filtered[0].excerpt}
                </p>

              </div>

              <div className="mt-6 flex flex-col gap-5 border-t border-[#EEF2F6] pt-5 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#023570] to-[#6A1B9A] text-sm font-bold text-white">
                    {filtered[0].author?.charAt(
                      0
                    ) || '?'}
                  </div>

                  <div>

                    <p className="text-sm font-semibold text-[#102A43]">
                      {filtered[0].author}
                    </p>

                    <p className="text-xs text-[#8796A5]">
                      {new Date(
                        filtered[0].date
                      ).toLocaleDateString(
                        'en-GB',
                        {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        }
                      )}
                    </p>

                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">

                  <span className="flex items-center gap-1.5 text-sm text-[#8796A5]">

                    <Heart
                      size={14}
                      className={
                        liked[
                          filtered[0].id
                        ]
                          ? 'fill-current text-[#6A1B9A]'
                          : 'text-[#6A1B9A]'
                      }
                    />

                    {filtered[0].likes +
                      (liked[
                        filtered[0].id
                      ]
                        ? 1
                        : 0)}

                  </span>

                  <span className="flex items-center gap-1.5 text-sm text-[#8796A5]">

                    <MessageCircle
                      size={14}
                    />

                    {getCommentCount(
                      filtered[0]
                    )}

                  </span>

                  <span className="flex items-center gap-1 text-sm font-semibold text-[#023570]">
                    Read Full Story
                    <ArrowRight size={14} />
                  </span>

                </div>
              </div>
            </div>
          </article>
        )}

        {/* OTHER STORIES */}

        <div className="grid gap-6 md:grid-cols-2">

          {filtered
            .slice(1)
            .map((story) => (

              <article
                key={story.id}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-[#D0E6FF] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                onClick={() =>
                  setSelected(story.id)
                }
              >

                {story.image && (
                  <div className="h-48 overflow-hidden">

                    <img
                      src={story.image}
                      alt={story.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                  </div>
                )}

                <div className="p-6">

                  <div className="mb-3 flex flex-wrap gap-2">

                    {(story.tags || [])
                      .slice(0, 2)
                      .map((tag) => (
                        <span
                          key={tag}
                          className="rounded-lg bg-[#D0E6FF] px-2.5 py-1 text-xs font-semibold text-[#023570]"
                        >
                          {tag}
                        </span>
                      ))}

                  </div>

                  <h3 className="mb-3 line-clamp-2 font-['Montserrat'] text-lg font-bold leading-snug text-[#102A43]">
                    {story.title}
                  </h3>

                  <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-[#52667A]">
                    {story.excerpt}
                  </p>

                  <div className="flex items-center justify-between border-t border-[#EEF2F6] pt-4">

                    <div className="flex items-center gap-2">

                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#023570] to-[#6A1B9A] text-xs font-bold text-white">
                        {story.author?.charAt(
                          0
                        ) || '?'}
                      </div>

                      <div>

                        <p className="text-xs font-semibold text-[#102A43]">
                          {story.author}
                        </p>

                        <p className="text-xs text-[#8796A5]">
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

                    <div className="flex items-center gap-3">

                      <button
                        onClick={(e) =>
                          toggleLike(
                            story.id,
                            e
                          )
                        }
                        className={`flex items-center gap-1 text-xs transition-colors ${
                          liked[story.id]
                            ? 'text-[#6A1B9A]'
                            : 'text-[#8796A5] hover:text-[#6A1B9A]'
                        }`}
                      >

                        <Heart
                          size={13}
                          className={
                            liked[story.id]
                              ? 'fill-current'
                              : ''
                          }
                        />

                        {story.likes +
                          (liked[
                            story.id
                          ]
                            ? 1
                            : 0)}

                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(
                            story.id
                          );
                        }}
                        className="flex items-center gap-1 text-xs text-[#8796A5] transition-colors hover:text-[#023570]"
                      >

                        <MessageCircle
                          size={13}
                        />

                        {getCommentCount(
                          story
                        )}

                      </button>

                    </div>
                  </div>
                </div>
              </article>
            ))}
        </div>

        {/* NO STORIES */}

        {filtered.length === 0 && (

          <div className="rounded-3xl bg-white px-6 py-20 text-center shadow-sm ring-1 ring-[#D0E6FF]">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E9D5FF] text-[#6A1B9A]">
              <BookOpen size={28} />
            </div>

            <p className="mt-5 font-['Montserrat'] text-xl font-bold text-[#023570]">
              No stories in this category yet
            </p>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#52667A]">
              Try another category or share
              your own family story.
            </p>

            <button
              onClick={() =>
                setActiveTag('All')
              }
              className="mt-6 rounded-full bg-[#023570] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2E1065]"
            >
              View All Stories
            </button>

          </div>
        )}

        {/* SHARE STORY CTA */}

        <div className="relative mt-16 overflow-hidden rounded-3xl bg-gradient-to-br from-[#023570] to-[#2E1065] p-8 text-center text-white md:p-10">

          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#51A2FF]/20 blur-3xl" />

          <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[#6A1B9A]/30 blur-3xl" />

          <div className="relative z-10">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10">

              <PenLine
                size={26}
                className="text-[#51A2FF]"
              />

            </div>

            <h3 className="font-['Montserrat'] text-2xl font-bold">
              Share Your Story
            </h3>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-blue-100">
              Have a memory, lesson, or tale
              from the Kornu family? Sign in
              and add your story to our growing
              collection.
            </p>

            <button
              onClick={openStoryForm}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#51A2FF] px-7 py-3 font-bold text-[#023570] shadow-lg transition hover:-translate-y-0.5 hover:bg-white"
            >
              <PenLine size={16} />
              Write a Story
            </button>

          </div>
        </div>
      </main>

      {/* =====================================
          STORY DETAILS MODAL
      ===================================== */}

      {selectedStory && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#023570]/80 p-4 backdrop-blur-sm"
          onClick={closeStoryModal}
        >

          <div
            className="relative my-8 w-full max-w-2xl overflow-hidden rounded-3xl bg-[#FAF5EE] shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* CLOSE */}

            <button
              onClick={closeStoryModal}
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-[#023570]/80 text-white backdrop-blur-md transition hover:bg-[#2E1065]"
              aria-label="Close story"
            >
              <X size={19} />
            </button>

            {/* STORY IMAGE */}

            {selectedStory.image ? (

              <div className="relative h-56 overflow-hidden">

                <img
                  src={selectedStory.image}
                  alt={selectedStory.title}
                  className="h-full w-full object-cover"
                />

                {isAuthenticated && (
                  <button
                    onClick={() => {
                      setEditingImage(true);
                      setImageError('');
                    }}
                    className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-[#023570]/90 px-4 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-md transition hover:bg-[#2E1065]"
                  >
                    <ImagePlus size={14} />
                    Change Image
                  </button>
                )}

              </div>

            ) : (

              isAuthenticated && (
                <div className="border-b border-[#D0E6FF] bg-gradient-to-br from-[#D0E6FF] to-[#E9D5FF] px-6 py-5">

                  <button
                    onClick={() => {
                      setEditingImage(true);
                      setImageError('');
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#023570] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#FAF5EE]"
                  >
                    <ImagePlus size={16} />
                    Add Story Image
                  </button>

                  <p className="mt-2 text-xs text-[#52667A]">
                    Add a family photo to this
                    story.
                  </p>

                </div>
              )
            )}

            {/* IMAGE EDITOR */}

            {editingImage && (

              <div className="border-b border-[#D0E6FF] bg-white p-5">

                <div className="mb-4 flex items-center justify-between">

                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#6A1B9A]">
                      Story Image
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#102A43]">
                      Add or replace the story photo
                    </p>
                  </div>

                  <button
                    onClick={
                      cancelImageEdit
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D0E6FF] text-[#023570] transition hover:bg-[#E9D5FF]"
                  >
                    <X size={15} />
                  </button>

                </div>

                <input
                  ref={existingImageInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={
                    handleExistingImageChange
                  }
                  className="hidden"
                />

                {imagePreview ? (

                  <div className="relative overflow-hidden rounded-2xl border border-[#D0E6FF]">

                    <img
                      src={imagePreview}
                      alt="New story preview"
                      className="h-48 w-full object-cover"
                    />

                    <button
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#023570]/85 text-white transition hover:bg-red-600"
                      title="Remove selected image"
                    >
                      <Trash2 size={15} />
                    </button>

                  </div>

                ) : (

                  <button
                    onClick={() =>
                      existingImageInput.current?.click()
                    }
                    className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D0E6FF] bg-[#FAF5EE] px-6 py-10 text-center transition hover:border-[#51A2FF] hover:bg-[#D0E6FF]/40"
                  >

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D0E6FF] text-[#023570]">
                      <Upload size={21} />
                    </div>

                    <p className="mt-3 text-sm font-bold text-[#023570]">
                      Choose an image
                    </p>

                    <p className="mt-1 text-xs text-[#8796A5]">
                      JPG, PNG or WebP · Max 8MB
                    </p>

                  </button>
                )}

                {imagePreview && (

                  <button
                    onClick={() =>
                      existingImageInput.current?.click()
                    }
                    className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[#D0E6FF] bg-white px-4 py-2 text-xs font-semibold text-[#023570] transition hover:bg-[#E9D5FF]"
                  >
                    <ImagePlus size={14} />
                    Choose Different Image
                  </button>
                )}

                {imageError && (
                  <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
                    {imageError}
                  </div>
                )}

                <div className="mt-4 flex gap-3">

                  <button
                    onClick={
                      cancelImageEdit
                    }
                    disabled={
                      uploadingImage
                    }
                    className="flex-1 rounded-xl border border-[#D0E6FF] bg-white py-2.5 text-sm font-semibold text-[#52667A] transition hover:bg-[#E9D5FF]"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={
                      saveExistingStoryImage
                    }
                    disabled={
                      uploadingImage ||
                      !imageFile
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#023570] py-2.5 text-sm font-bold text-white transition hover:bg-[#2E1065] disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {uploadingImage ? (
                      <>
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />

                        Saving...
                      </>
                    ) : (
                      <>
                        <Upload size={15} />
                        Save Image
                      </>
                    )}

                  </button>
                </div>
              </div>
            )}

            <div className="p-7 md:p-8">

              {/* TAGS */}

              <div className="mb-4 flex flex-wrap gap-2">

                {(selectedStory.tags || []).map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-lg bg-[#E9D5FF] px-3 py-1 text-xs font-semibold text-[#6A1B9A]"
                    >
                      {tag}
                    </span>
                  )
                )}

              </div>

              {/* TITLE */}

              <h2 className="font-['Montserrat'] text-2xl font-bold leading-tight text-[#102A43]">
                {selectedStory.title}
              </h2>

              {/* AUTHOR */}

              <div className="mb-6 mt-5 flex items-center gap-3 border-b border-[#D0E6FF] pb-5">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#023570] to-[#6A1B9A] font-bold text-white">
                  {selectedStory.author?.charAt(
                    0
                  ) || '?'}
                </div>

                <div>

                  <p className="font-semibold text-[#102A43]">
                    {selectedStory.author}
                  </p>

                  <p className="text-xs text-[#8796A5]">
                    {new Date(
                      selectedStory.date
                    ).toLocaleDateString(
                      'en-GB',
                      {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      }
                    )}
                  </p>

                </div>
              </div>

              {/* CONTENT */}

              <div>

                {selectedStory.content
                  .split('\n\n')
                  .map(
                    (
                      paragraph,
                      index
                    ) => (
                      <p
                        key={index}
                        className="mb-4 text-base leading-8 text-[#52667A]"
                      >
                        {paragraph}
                      </p>
                    )
                  )}

              </div>

              {/* ACTIONS */}

              <div className="mt-6 flex flex-col gap-4 border-t border-[#D0E6FF] pt-5 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-4">

                  <button
                    onClick={(e) =>
                      toggleLike(
                        selectedStory.id,
                        e
                      )
                    }
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                      liked[
                        selectedStory.id
                      ]
                        ? 'bg-[#E9D5FF] text-[#6A1B9A]'
                        : 'bg-[#D0E6FF] text-[#023570] hover:bg-[#E9D5FF] hover:text-[#6A1B9A]'
                    }`}
                  >

                    <Heart
                      size={14}
                      className={
                        liked[
                          selectedStory.id
                        ]
                          ? 'fill-current'
                          : ''
                      }
                    />

                    {selectedStory.likes +
                      (liked[
                        selectedStory.id
                      ]
                        ? 1
                        : 0)}{' '}
                    Likes

                  </button>

                  <span className="flex items-center gap-1.5 text-sm text-[#8796A5]">

                    <MessageCircle
                      size={14}
                    />

                    {getCommentCount(
                      selectedStory
                    )}{' '}
                    Comments

                  </span>

                </div>

                <button
                  onClick={closeStoryModal}
                  className="rounded-xl border border-[#D0E6FF] px-5 py-2.5 text-sm font-semibold text-[#023570] transition hover:bg-[#E9D5FF] hover:text-[#6A1B9A]"
                >
                  Close
                </button>

              </div>

              {/* =================================
                  COMMENTS SECTION
              ================================= */}

              <div className="mt-8 border-t border-[#D0E6FF] pt-7">

                <div className="mb-5 flex items-center justify-between">

                  <div>

                    <h3 className="font-['Montserrat'] text-lg font-bold text-[#102A43]">
                      Family Comments
                    </h3>

                    <p className="mt-1 text-xs text-[#8796A5]">
                      Share your thoughts and memories about this story.
                    </p>

                  </div>

                  <div className="flex items-center gap-1.5 rounded-full bg-[#D0E6FF] px-3 py-1.5 text-xs font-semibold text-[#023570]">

                    <MessageCircle size={13} />

                    {getCommentCount(
                      selectedStory
                    )}

                  </div>

                </div>

                {/* COMMENT BOX */}

                {isAuthenticated ? (

                  <div className="mb-6 rounded-2xl border border-[#D0E6FF] bg-white p-4">

                    <div className="flex gap-3">

                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#023570] to-[#6A1B9A] text-xs font-bold text-white">
                        {currentUser?.name?.charAt(
                          0
                        ) || 'F'}
                      </div>

                      <div className="flex-1">

                        <textarea
                          value={commentText}
                          onChange={(e) => {
                            setCommentText(
                              e.target.value
                            );

                            if (
                              commentError
                            ) {
                              setCommentError(
                                ''
                              );
                            }
                          }}
                          placeholder="Write a comment about this story..."
                          rows={3}
                          maxLength={1000}
                          className="w-full resize-none rounded-xl border border-[#D0E6FF] bg-[#FAF5EE] px-4 py-3 text-sm leading-6 text-[#102A43] outline-none transition placeholder:text-[#9AA9B8] focus:border-[#51A2FF] focus:bg-white focus:ring-2 focus:ring-[#51A2FF]/20"
                        />

                        <div className="mt-3 flex items-center justify-between gap-3">

                          <span className="text-xs text-[#8796A5]">
                            {commentText.length}/1000
                          </span>

                          <button
                            onClick={
                              submitComment
                            }
                            disabled={
                              postingComment ||
                              !commentText.trim()
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-[#023570] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#2E1065] disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            {postingComment ? (
                              <>
                                <Loader2
                                  size={14}
                                  className="animate-spin"
                                />

                                Posting...
                              </>
                            ) : (
                              <>
                                <MessageCircle
                                  size={14}
                                />

                                Post Comment
                              </>
                            )}

                          </button>

                        </div>
                      </div>
                    </div>
                  </div>

                ) : (

                  <div className="mb-6 rounded-2xl border border-[#D0E6FF] bg-gradient-to-br from-[#D0E6FF]/50 to-[#E9D5FF]/40 p-5 text-center">

                    <MessageCircle
                      size={24}
                      className="mx-auto text-[#023570]"
                    />

                    <p className="mt-3 text-sm font-bold text-[#102A43]">
                      Sign in to join the conversation
                    </p>

                    <p className="mt-1 text-xs text-[#52667A]">
                      Family members can comment on shared stories.
                    </p>

                    <button
                      onClick={() => {
                        closeStoryModal();
                        handleNav(
                          'signin'
                        );
                      }}
                      className="mt-4 rounded-full bg-[#023570] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#2E1065]"
                    >
                      Sign In
                    </button>

                  </div>
                )}

                {/* COMMENT ERROR */}

                {commentError && (
                  <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
                    {commentError}
                  </div>
                )}

                {/* COMMENT LIST */}

                <div className="space-y-4">

                  {loadingComments ? (

                    <div className="flex items-center justify-center rounded-2xl bg-white py-10">

                      <Loader2
                        size={22}
                        className="animate-spin text-[#51A2FF]"
                      />

                      <span className="ml-2 text-sm text-[#8796A5]">
                        Loading comments...
                      </span>

                    </div>

                  ) : (

                    <>
                      {(commentsByStory[
                        selectedStory.id
                      ] || []).length === 0 ? (

                        <div className="rounded-2xl border border-dashed border-[#D0E6FF] bg-white px-5 py-8 text-center">

                          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#D0E6FF] text-[#023570]">
                            <MessageCircle size={19} />
                          </div>

                          <p className="mt-3 text-sm font-bold text-[#102A43]">
                            No comments yet
                          </p>

                          <p className="mt-1 text-xs text-[#8796A5]">
                            Be the first family member to share a thought.
                          </p>

                        </div>

                      ) : (

                        (
                          commentsByStory[
                            selectedStory.id
                          ] || []
                        ).map(
                          (comment) => (

                            <div
                              key={comment.id}
                              className="rounded-2xl border border-[#D0E6FF] bg-white p-4"
                            >

                              <div className="flex gap-3">

                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#023570] to-[#6A1B9A] text-xs font-bold text-white">
                                  {comment.author_name?.charAt(
                                    0
                                  ) || 'F'}
                                </div>

                                <div className="min-w-0 flex-1">

                                  <div className="flex flex-wrap items-center justify-between gap-2">

                                    <p className="text-sm font-bold text-[#102A43]">
                                      {comment.author_name}
                                    </p>

                                    <p className="text-[11px] text-[#8796A5]">
                                      {new Date(
                                        comment.created_at
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

                                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#52667A]">
                                    {comment.comment}
                                  </p>

                                </div>
                              </div>
                            </div>
                          )
                        )
                      )}
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* =====================================
          WRITE STORY MODAL
      ===================================== */}

      {showStoryForm && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#023570]/80 p-4 backdrop-blur-sm"
          onClick={() =>
            setShowStoryForm(false)
          }
        >

          <div
            className="w-full max-w-lg overflow-y-auto rounded-3xl bg-[#FAF5EE] p-6 shadow-2xl md:p-7"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="mb-6 flex items-center justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-widest text-[#6A1B9A]">
                  Family Stories
                </p>

                <h2 className="mt-1 font-['Montserrat'] text-xl font-bold text-[#102A43]">
                  Write a Story
                </h2>

              </div>

              <button
                onClick={() =>
                  setShowStoryForm(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D0E6FF] text-[#023570] transition hover:bg-[#E9D5FF] hover:text-[#6A1B9A]"
                aria-label="Close"
              >
                <X size={18} />
              </button>

            </div>

            <div className="space-y-4">

              {/* TITLE */}

              <input
                type="text"
                value={storyTitle}
                onChange={(e) =>
                  setStoryTitle(
                    e.target.value
                  )
                }
                placeholder="Story title"
                className="w-full rounded-xl border border-[#D0E6FF] bg-white px-4 py-3 text-sm text-[#102A43] outline-none transition placeholder:text-[#9AA9B8] focus:border-[#51A2FF] focus:ring-2 focus:ring-[#51A2FF]/20"
              />

              {/* EXCERPT */}

              <textarea
                value={storyExcerpt}
                onChange={(e) =>
                  setStoryExcerpt(
                    e.target.value
                  )
                }
                placeholder="Short excerpt (optional — auto-generated if left blank)"
                rows={3}
                className="w-full resize-none rounded-xl border border-[#D0E6FF] bg-white px-4 py-3 text-sm text-[#102A43] outline-none transition placeholder:text-[#9AA9B8] focus:border-[#51A2FF] focus:ring-2 focus:ring-[#51A2FF]/20"
              />

              {/* CONTENT */}

              <textarea
                value={storyContent}
                onChange={(e) =>
                  setStoryContent(
                    e.target.value
                  )
                }
                placeholder="Tell your story... (use blank lines to separate paragraphs)"
                rows={9}
                className="w-full resize-none rounded-xl border border-[#D0E6FF] bg-white px-4 py-3 text-sm leading-7 text-[#102A43] outline-none transition placeholder:text-[#9AA9B8] focus:border-[#51A2FF] focus:ring-2 focus:ring-[#51A2FF]/20"
              />

              {/* STORY IMAGE */}

              <div className="rounded-2xl border border-[#D0E6FF] bg-white p-4">

                <div className="mb-3 flex items-center gap-2">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D0E6FF] text-[#023570]">
                    <ImagePlus size={17} />
                  </div>

                  <div>

                    <p className="text-sm font-bold text-[#102A43]">
                      Story Image
                    </p>

                    <p className="text-xs text-[#8796A5]">
                      Optional · JPG, PNG or WebP · Max 8MB
                    </p>

                  </div>
                </div>

                <input
                  ref={newStoryImageInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={
                    handleNewStoryImageChange
                  }
                  className="hidden"
                />

                {storyImagePreview ? (

                  <div className="relative overflow-hidden rounded-xl">

                    <img
                      src={storyImagePreview}
                      alt="Story preview"
                      className="h-44 w-full object-cover"
                    />

                    <button
                      onClick={() => {
                        setStoryImageFile(
                          null
                        );

                        setStoryImagePreview(
                          null
                        );

                        if (
                          newStoryImageInput.current
                        ) {
                          newStoryImageInput.current.value =
                            '';
                        }
                      }}
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#023570]/85 text-white transition hover:bg-red-600"
                      title="Remove image"
                    >
                      <Trash2 size={15} />
                    </button>

                  </div>

                ) : (

                  <button
                    type="button"
                    onClick={() =>
                      newStoryImageInput.current?.click()
                    }
                    className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D0E6FF] bg-[#FAF5EE] px-5 py-8 text-center transition hover:border-[#51A2FF] hover:bg-[#D0E6FF]/30"
                  >

                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#D0E6FF] text-[#023570]">
                      <Upload size={19} />
                    </div>

                    <p className="mt-3 text-sm font-bold text-[#023570]">
                      Add an image
                    </p>

                    <p className="mt-1 text-xs text-[#8796A5]">
                      Choose a family photo for this story
                    </p>

                  </button>
                )}

                {storyImagePreview && (

                  <button
                    type="button"
                    onClick={() =>
                      newStoryImageInput.current?.click()
                    }
                    className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[#D0E6FF] bg-white px-4 py-2 text-xs font-semibold text-[#023570] transition hover:bg-[#E9D5FF]"
                  >
                    <ImagePlus size={14} />
                    Change Image
                  </button>
                )}

              </div>

              {/* TAGS */}

              <input
                type="text"
                value={storyTags}
                onChange={(e) =>
                  setStoryTags(
                    e.target.value
                  )
                }
                placeholder="Tags, comma separated (e.g. Heritage, Memories)"
                className="w-full rounded-xl border border-[#D0E6FF] bg-white px-4 py-3 text-sm text-[#102A43] outline-none transition placeholder:text-[#9AA9B8] focus:border-[#51A2FF] focus:ring-2 focus:ring-[#51A2FF]/20"
              />

              {/* ERROR */}

              {storyFormError && (

                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {storyFormError}
                </div>

              )}

              {/* BUTTONS */}

              <div className="flex gap-3 pt-2">

                <button
                  onClick={() =>
                    setShowStoryForm(false)
                  }
                  className="flex-1 rounded-xl border border-[#D0E6FF] bg-white py-3 text-sm font-semibold text-[#52667A] transition hover:bg-[#E9D5FF] hover:text-[#6A1B9A]"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    submitStory
                  }
                  disabled={
                    postingStory
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#023570] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#2E1065] disabled:cursor-not-allowed disabled:opacity-60"
                >

                  <PenLine size={15} />

                  {postingStory
                    ? 'Posting...'
                    : 'Share Story'}

                </button>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* =====================================
          FOOTER
      ===================================== */}

      <Footer />

    </div>
  );
}