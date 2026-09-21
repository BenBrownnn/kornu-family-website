
import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { galleryItems } from '../data/familyData';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
  Upload,
  Images,
} from 'lucide-react';
import PhotoUploadForm from '../components/PhotoUploadForm';
import { supabase } from '../lib/supabaseClient';
import Footer from '../components/Footer';

/* ============================================================
   GALLERY CATEGORIES
============================================================ */

const categories = [
  'All',
  'Reunions',
  'Portraits',
  'Celebrations',
  'Adventures',
  'Traditions',
];

/* ============================================================
   IMAGE FALLBACK
============================================================ */

const FALLBACK_IMAGE = '/images/Home.webp';

/* ============================================================
   GALLERY PHOTO TYPE
============================================================ */

type GalleryPhoto = {
  id: string;
  src: string;
  title: string;
  date: string;
  category: string;
  description: string;
  uploader_name?: string;
};

/* ============================================================
   HELPERS
============================================================ */

/**
 * Converts common local image path formats into paths
 * that Vite can serve from /public/images.
 *
 * Examples:
 *   images/photo.jpg       -> /images/photo.jpg
 *   /images/photo.jpg      -> /images/photo.jpg
 *   ./images/photo.jpg     -> /images/photo.jpg
 *   photo.jpg              -> /images/photo.jpg
 *
 * Remote URLs are left untouched.
 */
const normalizeImageSrc = (
  source: unknown
): string => {
  if (typeof source !== 'string') {
    return FALLBACK_IMAGE;
  }

  const value = source.trim();

  if (!value) {
    return FALLBACK_IMAGE;
  }

  // Remote URL
  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('blob:')
  ) {
    return value;
  }

  // Already an absolute public path
  if (value.startsWith('/images/')) {
    return value;
  }

  // ./images/...
  if (value.startsWith('./images/')) {
    return value.replace('./images/', '/images/');
  }

  // images/...
  if (value.startsWith('images/')) {
    return `/${value}`;
  }

  // /photo.jpg -> /images/photo.jpg
  if (value.startsWith('/')) {
    return `/images${value}`;
  }

  // photo.jpg -> /images/photo.jpg
  return `/images/${value}`;
};

/**
 * Normalizes category names so old/incorrect values
 * such as "Portriat" still work with the current filters.
 */
const normalizeCategory = (
  value: unknown
): string => {
  if (typeof value !== 'string') {
    return 'Traditions';
  }

  const category = value.trim();

  if (!category) {
    return 'Traditions';
  }

  const normalized = category.toLowerCase();

  if (
    normalized === 'portrait' ||
    normalized === 'portriat' ||
    normalized === 'portraits'
  ) {
    return 'Portraits';
  }

  if (
    normalized === 'reunion' ||
    normalized === 'reunions'
  ) {
    return 'Reunions';
  }

  if (
    normalized === 'celebration' ||
    normalized === 'celebrations'
  ) {
    return 'Celebrations';
  }

  if (
    normalized === 'adventure' ||
    normalized === 'adventures'
  ) {
    return 'Adventures';
  }

  if (
    normalized === 'tradition' ||
    normalized === 'traditions'
  ) {
    return 'Traditions';
  }

  return category;
};

/* ============================================================
   STATIC GALLERY
============================================================ */

const staticGallery: GalleryPhoto[] =
  Array.isArray(galleryItems)
    ? galleryItems.map((item) => ({
        id: String(item.id),
        src: normalizeImageSrc(item.src),
        title:
          item.title || 'Family Memory',
        date: item.date || '',
        category: normalizeCategory(
          item.category
        ),
        description:
          item.description || '',
        uploader_name: undefined,
      }))
    : [];

/* ============================================================
   EXTENDED GALLERY
============================================================ */

const extendedGallery: GalleryPhoto[] = [
  ...staticGallery,

  {
    id: '7',
    src: '/images/Home.webp',
    title: 'Home Sweet Home',
    date: 'November 2023',
    category: 'Portraits',
    description:
      'Home is where the heart is. A cozy family gathering at our ancestral home.',
  },

  /*
  Additional gallery images can be enabled when
  the corresponding files actually exist in:

  public/images/

  {
    id: '8',
    src: '/images/family-gathering.jpg',
    title: 'Summer Picnic',
    date: 'July 2023',
    category: 'Adventures',
    description: 'Annual family picnic by the river',
  },

  {
    id: '9',
    src: '/images/gallery/graduation-day.jpg',
    title: 'Graduation Day',
    date: 'June 2023',
    category: 'Celebrations',
    description: 'Akua graduates with honors',
  },

  {
    id: '10',
    src: '/images/gallery/new-year-2024.jpg',
    title: 'New Year 2024',
    date: 'January 2024',
    category: 'Celebrations',
    description: 'Welcoming 2024 as a family',
  },

  {
    id: '11',
    src: '/images/gallery/grandfather-story-time.jpg',
    title: "Grandfather's Story Time",
    date: 'October 2023',
    category: 'Traditions',
    description: 'Elder Kweku shares family wisdom',
  },

  {
    id: '12',
    src: '/images/gallery/family-portrait-2023.jpg',
    title: 'Family Portrait 2023',
    date: 'December 2023',
    category: 'Portraits',
    description: 'Our annual family portrait session',
  },
  */
];

/* ============================================================
   PAGE
============================================================ */

export default function GalleryPage() {
  const {
    lightboxImage,
    setLightboxImage,
    setCurrentPage,
    isAuthenticated,
  } = useStore();

  const [category, setCategory] =
    useState('All');

  const [lightboxIndex, setLightboxIndex] =
    useState(-1);

  const [showUploadForm, setShowUploadForm] =
    useState(false);

  const [uploadedPhotos, setUploadedPhotos] =
    useState<GalleryPhoto[]>([]);

  const [isLoadingPhotos, setIsLoadingPhotos] =
    useState(true);

  /* ==========================================================
     FETCH SUPABASE PHOTOS
  ========================================================== */

  const fetchUploadedPhotos = async () => {
    try {
      setIsLoadingPhotos(true);

      const { data, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .order('created_at', {
          ascending: false,
        });

      if (error) {
        console.error(
          'Error fetching uploaded gallery photos:',
          error
        );

        setUploadedPhotos([]);
        return;
      }

      if (!data || data.length === 0) {
        setUploadedPhotos([]);
        return;
      }

      const photos: GalleryPhoto[] =
        data.map((photo) => {
          let publicUrl =
            FALLBACK_IMAGE;

          if (photo.storage_path) {
            try {
              const {
                data: publicUrlData,
              } = supabase.storage
                .from('gallery-photos')
                .getPublicUrl(
                  photo.storage_path
                );

              if (
                publicUrlData?.publicUrl
              ) {
                publicUrl =
                  publicUrlData.publicUrl;
              }
            } catch (storageError) {
              console.error(
                'Unable to create gallery storage URL:',
                storageError
              );
            }
          }

          return {
            id: String(photo.id),

            src: publicUrl,

            title:
              photo.title ||
              'Family Memory',

            date: photo.created_at
              ? new Date(
                  photo.created_at
                ).toLocaleDateString(
                  'en-GB',
                  {
                    month: 'long',
                    year: 'numeric',
                  }
                )
              : '',

            category:
              normalizeCategory(
                photo.category
              ),

            description:
              photo.description || '',

            uploader_name:
              photo.uploader_name ||
              undefined,
          };
        });

      setUploadedPhotos(photos);
    } catch (error) {
      console.error(
        'Unexpected gallery loading error:',
        error
      );

      setUploadedPhotos([]);
    } finally {
      setIsLoadingPhotos(false);
    }
  };

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    fetchUploadedPhotos();
  }, []);

  /* ==========================================================
     COMBINED GALLERY
  ========================================================== */

  const fullGallery = useMemo(
    () => [
      ...uploadedPhotos,
      ...extendedGallery,
    ],
    [uploadedPhotos]
  );

  /* ==========================================================
     FILTERED GALLERY
  ========================================================== */

  const filtered = useMemo(
    () =>
      fullGallery.filter(
        (item) =>
          category === 'All' ||
          normalizeCategory(
            item.category
          ) === category
      ),
    [fullGallery, category]
  );

  /* ==========================================================
     PAGE NAVIGATION
  ========================================================== */

  const handleNav = (target: string) => {
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

  /* ==========================================================
     LIGHTBOX
  ========================================================== */

  const openLightbox = (index: number) => {
    const photo = filtered[index];

    if (!photo) return;

    setLightboxIndex(index);
    setLightboxImage(photo.src);
  };

  const closeLightbox = () => {
    setLightboxIndex(-1);
    setLightboxImage(null);
  };

  const prevImage = () => {
    if (filtered.length === 0) return;

    const newIndex =
      (lightboxIndex -
        1 +
        filtered.length) %
      filtered.length;

    const photo = filtered[newIndex];

    if (!photo) return;

    setLightboxIndex(newIndex);
    setLightboxImage(photo.src);
  };

  const nextImage = () => {
    if (filtered.length === 0) return;

    const newIndex =
      (lightboxIndex + 1) %
      filtered.length;

    const photo = filtered[newIndex];

    if (!photo) return;

    setLightboxIndex(newIndex);
    setLightboxImage(photo.src);
  };

  /* ==========================================================
     KEYBOARD CONTROLS
  ========================================================== */

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (
        !lightboxImage ||
        lightboxIndex < 0
      ) {
        return;
      }

      if (event.key === 'Escape') {
        closeLightbox();
      }

      if (event.key === 'ArrowLeft') {
        prevImage();
      }

      if (event.key === 'ArrowRight') {
        nextImage();
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [
    lightboxImage,
    lightboxIndex,
    filtered,
  ]);

  /* ==========================================================
     CLOSE LIGHTBOX WHEN FILTER CHANGES
  ========================================================== */

  useEffect(() => {
    setLightboxImage(null);
    setLightboxIndex(-1);
  }, [
    category,
    setLightboxImage,
  ]);

  /* ==========================================================
     IMAGE ERROR HANDLER
  ========================================================== */

  const handleImageError = (
    event: React.SyntheticEvent<HTMLImageElement>
  ) => {
    const image =
      event.currentTarget;

    /*
     * Prevent an infinite loop if the fallback
     * image itself cannot be loaded.
     */
    if (
      image.dataset.fallbackApplied ===
      'true'
    ) {
      return;
    }

    image.dataset.fallbackApplied = 'true';

    console.error(
      'Gallery image failed to load:',
      image.src
    );

    image.src = FALLBACK_IMAGE;
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="min-h-screen bg-[#FAF5EE] text-[#102A43]">

      {/* ========================================================
          HERO
      ========================================================= */}

      <section className="relative min-h-[560px] overflow-hidden text-white">

        {/* Background image */}
        <img
          src="/images/gallery-2.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          onError={handleImageError}
        />

        {/* Dark blue overlay */}
        <div className="absolute inset-0 bg-[#023570]/55" />

        {/* Purple gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#023570]/90 via-[#023570]/50 to-[#2E1065]/70" />

        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#FAF5EE] to-transparent" />

        {/* Decorative glow */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#51A2FF]/20 blur-3xl" />

        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#6A1B9A]/25 blur-3xl" />

        {/* Hero content */}
        <div className="relative z-10 mx-auto flex min-h-[560px] max-w-6xl items-center px-4 py-20">

          <div className="max-w-3xl">

            <div className="flex flex-col items-start">

              {/* Back button */}
              <button
                type="button"
                onClick={() =>
                  handleNav('home')
                }
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:border-white/40 hover:bg-white/20"
              >
                <ChevronLeft size={16} />
                Back to Home
              </button>

              {/* Family Memories */}
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-100 backdrop-blur-md">
                <Camera size={15} />
                Family Memories
              </div>

            </div>

            {/* Heading */}
            <h1 className="font-['Montserrat'] text-4xl font-black leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Family
              <span className="block text-[#51A2FF]">
                Gallery
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-2xl text-base leading-8 text-blue-100 md:text-lg">
              A collection of moments,
              celebrations, traditions,
              adventures, and memories that
              tell the story of the Kornu
              family.
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap gap-3">

              <button
                type="button"
                onClick={() => {
                  setCategory('All');

                  window.requestAnimationFrame(
                    () => {
                      document
                        .getElementById(
                          'gallery'
                        )
                        ?.scrollIntoView({
                          behavior:
                            'smooth',
                          block: 'start',
                        });
                    }
                  );
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[#51A2FF] px-6 py-3 text-sm font-bold text-[#023570] shadow-lg transition hover:-translate-y-0.5 hover:bg-white"
              >
                <Images size={17} />
                Explore Memories
              </button>

              

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() =>
                    setShowUploadForm(true)
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20"
                >
                  <Upload size={17} />
                  Add a Photo
                </button>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          GALLERY
      ========================================================= */}

      <main
        id="gallery"
        className="mx-auto max-w-6xl px-4 py-16"
      >

        {/* Category filters */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">

          {categories.map((item) => {
            const isActive =
              category === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setCategory(item)
                }
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#023570] text-white shadow-md'
                    : 'bg-white text-[#52667A] ring-1 ring-[#D0E6FF] hover:bg-[#E9D5FF] hover:text-[#023570]'
                }`}
              >
                {item}
              </button>
            );
          })}

        </div>

        {/* Gallery heading */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm font-semibold text-[#52667A]">
              Showing{' '}
              <span className="font-black text-[#023570]">
                {filtered.length}
              </span>{' '}
              {filtered.length === 1
                ? 'memory'
                : 'memories'}
            </p>
          </div>

          {isAuthenticated && (
            <button
              type="button"
              onClick={() =>
                setShowUploadForm(true)
              }
              className="inline-flex w-fit items-center gap-2 rounded-full bg-[#023570] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#2E1065]"
            >
              <Camera size={15} />
              Upload Photo
            </button>
          )}

        </div>

        {/* ======================================================
            LOADING
        ======================================================= */}

        {isLoadingPhotos ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <div
                  key={item}
                  className="h-72 animate-pulse rounded-2xl bg-white ring-1 ring-[#D0E6FF]"
                />
              )
            )}

          </div>
        ) : filtered.length > 0 ? (

          /* ====================================================
             PHOTO GRID
          ==================================================== */

          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">

            {filtered.map(
              (item, index) => (
                <button
                  key={`${item.id}-${item.src}`}
                  type="button"
                  onClick={() =>
                    openLightbox(index)
                  }
                  className="group relative mb-5 block w-full overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-[#D0E6FF] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >

                  {/* Image */}
                  <img
                    src={normalizeImageSrc(
                      item.src
                    )}
                    alt={
                      item.title ||
                      'Family memory'
                    }
                    loading="lazy"
                    className="block h-auto min-h-[180px] w-full object-cover transition duration-500 group-hover:scale-105"
                    onError={
                      handleImageError
                    }
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#023570]/95 via-[#023570]/40 to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">

                    <div className="translate-y-3 transition-transform duration-300 group-hover:translate-y-0">

                      <div className="mb-2 inline-flex rounded-full bg-[#51A2FF] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#023570]">
                        {normalizeCategory(
                          item.category
                        )}
                      </div>

                      <h3 className="font-['Montserrat'] text-lg font-bold text-white">
                        {item.title}
                      </h3>

                      {item.date && (
                        <p className="mt-1 text-xs text-blue-100">
                          {item.date}
                        </p>
                      )}

                      {item.description && (
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-blue-100">
                          {
                            item.description
                          }
                        </p>
                      )}

                      {item.uploader_name && (
                        <p className="mt-2 text-xs font-semibold text-[#D0E6FF]">
                          Uploaded by{' '}
                          {
                            item.uploader_name
                          }
                        </p>
                      )}

                    </div>
                  </div>

                </button>
              )
            )}

          </div>

        ) : (

          /* ====================================================
             EMPTY STATE
          ==================================================== */

          <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-[#D0E6FF]">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E9D5FF] text-[#6A1B9A]">
              <Camera size={28} />
            </div>

            <h3 className="mt-5 font-['Montserrat'] text-xl font-bold text-[#023570]">
              No memories found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#52667A]">
              There are currently no photos
              in this category. Try another
              category or check back after
              more family memories are
              added.
            </p>

            <button
              type="button"
              onClick={() => {
                setCategory('All');

                window.requestAnimationFrame(
                  () => {
                    document
                      .getElementById(
                        'gallery'
                      )
                      ?.scrollIntoView({
                        behavior:
                          'smooth',
                        block: 'start',
                      });
                  }
                );
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#023570] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#51A2FF] hover:text-[#023570] hover:shadow-lg"
            >
              <Images size={16} />
              View All Memories
            </button>

          </div>
        )}

        {/* ======================================================
            STATISTICS
        ======================================================= */}

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-[#D0E6FF]">
            <div className="text-3xl font-black text-[#023570]">
              {fullGallery.length}
            </div>

            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#52667A]">
              Total Memories
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-[#D0E6FF]">
            <div className="text-3xl font-black text-[#6A1B9A]">
              {
                new Set(
                  fullGallery.map(
                    (photo) =>
                      normalizeCategory(
                        photo.category
                      )
                  )
                ).size
              }
            </div>

            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#52667A]">
              Categories
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-[#D0E6FF]">
            <div className="text-3xl font-black text-[#51A2FF]">
              {uploadedPhotos.length}
            </div>

            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#52667A]">
              Family Uploads
            </div>
          </div>

        </div>

      </main>

      {/* ========================================================
          PHOTO UPLOAD MODAL
      ========================================================= */}

      {showUploadForm &&
        isAuthenticated && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#023570]/75 p-4 backdrop-blur-sm">

            <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

              <button
                type="button"
                onClick={() =>
                  setShowUploadForm(false)
                }
                className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F6FA] text-[#52667A] transition hover:bg-[#E9D5FF] hover:text-[#023570]"
                aria-label="Close upload form"
              >
                <X size={20} />
              </button>

              <div className="p-6 md:p-8">

                <PhotoUploadForm
                  onClose={() =>
                    setShowUploadForm(false)
                  }
                  onUploadSuccess={() => {
                    setShowUploadForm(false);
                    fetchUploadedPhotos();
                  }}
                />

              </div>
            </div>
          </div>
        )}

      {/* ========================================================
          LIGHTBOX
      ========================================================= */}

      {lightboxImage &&
        lightboxIndex >= 0 && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#020B18]/95 p-4"
            onClick={closeLightbox}
          >

            {/* Close */}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                closeLightbox();
              }}
              className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20"
              aria-label="Close image"
            >
              <X size={22} />
            </button>

            {/* Previous */}
            {filtered.length > 1 && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-[#51A2FF] hover:text-[#023570]"
                aria-label="Previous image"
              >
                <ChevronLeft
                  size={26}
                />
              </button>
            )}

            {/* Next */}
            {filtered.length > 1 && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-[#51A2FF] hover:text-[#023570]"
                aria-label="Next image"
              >
                <ChevronRight
                  size={26}
                />
              </button>
            )}

            {/* Image content */}
            <div
              className="relative flex max-h-[90vh] max-w-6xl flex-col items-center"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <img
                src={normalizeImageSrc(
                  lightboxImage
                )}
                alt={
                  filtered[
                    lightboxIndex
                  ]?.title ||
                  'Family memory'
                }
                className="max-h-[75vh] max-w-full rounded-xl object-contain shadow-2xl"
                onError={
                  handleImageError
                }
              />

              {filtered[
                lightboxIndex
              ] && (
                <div className="mt-4 text-center">

                  <h3 className="font-['Montserrat'] text-lg font-bold text-white">
                    {
                      filtered[
                        lightboxIndex
                      ].title
                    }
                  </h3>

                  <p className="mt-1 text-sm text-gray-300">
                    {
                      filtered[
                        lightboxIndex
                      ].date
                    }
                    {' · '}
                    {normalizeCategory(
                      filtered[
                        lightboxIndex
                      ].category
                    )}
                  </p>

                  {filtered[
                    lightboxIndex
                  ].description && (
                    <p className="mx-auto mt-2 max-w-xl text-sm text-gray-400">
                      {
                        filtered[
                          lightboxIndex
                        ].description
                      }
                    </p>
                  )}

                  {filtered[
                    lightboxIndex
                  ]
                    .uploader_name && (
                    <p className="mt-2 text-xs font-semibold text-[#51A2FF]">
                      Uploaded by{' '}
                      {
                        filtered[
                          lightboxIndex
                        ]
                          .uploader_name
                      }
                    </p>
                  )}

                  {filtered.length >
                    1 && (
                    <p className="mt-3 text-xs text-gray-500">
                      {lightboxIndex +
                        1}{' '}
                      of{' '}
                      {
                        filtered.length
                      }
                    </p>
                  )}

                </div>
              )}

            </div>
          </div>
        )}

      {/* ========================================================
          FOOTER
      ========================================================= */}

      <Footer />

    </div>
  );
}

