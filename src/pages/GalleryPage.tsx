import { useEffect, useState } from 'react';
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
   CONSISTENT GALLERY PHOTO TYPE
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
   STATIC GALLERY
============================================================ */

const staticGallery: GalleryPhoto[] = galleryItems.map((item) => ({
  id: String(item.id),
  src: item.src,
  title: item.title,
  date: item.date,
  category: item.category,
  description: item.description,
  uploader_name: undefined,
}));

/* ============================================================
   EXTENDED GALLERY
============================================================ */

const extendedGallery: GalleryPhoto[] = [
  ...staticGallery,

  {
    id: '7',
    src: '/images/gallery/family-game-night.jpg',
    title: 'Family Game Night',
    date: 'November 2023',
    category: 'Traditions',
    description: 'Saturday game nights are sacred',
  },

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

  const [category, setCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<GalleryPhoto[]>([]);

  /* ==========================================================
     FETCH SUPABASE PHOTOS
  ========================================================== */

  const fetchUploadedPhotos = async () => {
    const { data, error } = await supabase
      .from('gallery_photos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(
        'Error fetching uploaded gallery photos:',
        error
      );
      return;
    }

    if (!data) {
      setUploadedPhotos([]);
      return;
    }

    const photos: GalleryPhoto[] = data.map((photo) => {
      const { data: publicUrlData } = supabase.storage
        .from('gallery-photos')
        .getPublicUrl(photo.storage_path);

      return {
        id: String(photo.id),
        src: publicUrlData.publicUrl,
        title: photo.title || 'Family Memory',
        date: photo.created_at
          ? new Date(photo.created_at).toLocaleDateString('en-GB', {
              month: 'long',
              year: 'numeric',
            })
          : '',
        category: photo.category || 'Traditions',
        description: photo.description || '',
        uploader_name: photo.uploader_name || undefined,
      };
    });

    setUploadedPhotos(photos);
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

  const fullGallery: GalleryPhoto[] = [
    ...uploadedPhotos,
    ...extendedGallery,
  ];

  /* ==========================================================
     FILTERED GALLERY
  ========================================================== */

  const filtered: GalleryPhoto[] = fullGallery.filter(
    (item) =>
      category === 'All' || item.category === category
  );

  /* ==========================================================
     PAGE NAVIGATION
  ========================================================== */

  const handleNav = (target: string) => {
    const pageMap: Record<string, string> = {
      home: 'home',
      family: 'family',
      gallery: 'gallery',
      events: 'events',
      stories: 'stories',
      portal: 'portal',
      signin: 'signin',
    };

    setCurrentPage(pageMap[target] ?? 'home');

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
      (lightboxIndex - 1 + filtered.length) %
      filtered.length;

    const photo = filtered[newIndex];

    if (!photo) return;

    setLightboxIndex(newIndex);
    setLightboxImage(photo.src);
  };

  const nextImage = () => {
    if (filtered.length === 0) return;

    const newIndex =
      (lightboxIndex + 1) % filtered.length;

    const photo = filtered[newIndex];

    if (!photo) return;

    setLightboxIndex(newIndex);
    setLightboxImage(photo.src);
  };

  /* ==========================================================
     KEYBOARD CONTROLS
  ========================================================== */

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!lightboxImage || lightboxIndex < 0) return;

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

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [lightboxImage, lightboxIndex, filtered]);

  /* ==========================================================
     CLOSE LIGHTBOX WHEN FILTER CHANGES
  ========================================================== */

  useEffect(() => {
    setLightboxImage(null);
    setLightboxIndex(-1);
  }, [category, setLightboxImage]);

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

            {/* Back button */}
            <button
              onClick={() => handleNav('home')}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:border-white/40 hover:bg-white/20"
            >
              <ChevronLeft size={16} />
              Back to Home
            </button>

            {/* Eyebrow */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-100 backdrop-blur-md">
              <Camera size={15} />
              Family Memories
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
              A collection of moments, celebrations,
              traditions, adventures, and memories that
              tell the story of the Kornu family.
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap gap-3">

              <button
                onClick={() => {
                  document
                    .getElementById('gallery')
                    ?.scrollIntoView({
                      behavior: 'smooth',
                    });
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[#51A2FF] px-6 py-3 text-sm font-bold text-[#023570] shadow-lg transition hover:-translate-y-0.5 hover:bg-white"
              >
                <Images size={17} />
                Explore Memories
              </button>

              {isAuthenticated && (
                <button
                  onClick={() => setShowUploadForm(true)}
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
            const isActive = category === item;

            return (
              <button
                key={item}
                onClick={() => setCategory(item)}
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

        {/* Gallery heading row */}
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
              onClick={() => setShowUploadForm(true)}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-[#023570] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#2E1065]"
            >
              <Camera size={15} />
              Upload Photo
            </button>
          )}

        </div>

        {/* ======================================================
            PHOTO GRID
        ======================================================= */}

        {filtered.length > 0 ? (
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">

            {filtered.map((item, index) => (
              <button
                key={`${item.id}-${item.src}`}
                onClick={() => openLightbox(index)}
                className="group relative mb-5 block w-full overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-[#D0E6FF] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >

                {/* Image */}
                <img
                  src={item.src}
                  alt={item.title}
                  loading="lazy"
                  className="block h-auto w-full object-cover transition duration-500 group-hover:scale-105"
                  onError={(event) => {
                    const image =
                      event.currentTarget;

                    image.style.display = 'none';

                    const parent =
                      image.parentElement;

                    if (parent) {
                      parent.classList.add(
                        'flex',
                        'min-h-[220px]',
                        'items-center',
                        'justify-center',
                        'bg-[#E9D5FF]'
                      );

                      parent.insertAdjacentHTML(
                        'beforeend',
                        '<span class="text-[#6A1B9A] text-sm font-semibold">Image unavailable</span>'
                      );
                    }
                  }}
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#023570]/95 via-[#023570]/40 to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">

                  <div className="translate-y-3 transition-transform duration-300 group-hover:translate-y-0">

                    <div className="mb-2 inline-flex rounded-full bg-[#51A2FF] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#023570]">
                      {item.category}
                    </div>

                    <h3 className="font-['Montserrat'] text-lg font-bold text-white">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-xs text-blue-100">
                      {item.date}
                    </p>

                    {item.description && (
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-blue-100">
                        {item.description}
                      </p>
                    )}

                    {item.uploader_name && (
                      <p className="mt-2 text-xs font-semibold text-[#D0E6FF]">
                        Uploaded by{' '}
                        {item.uploader_name}
                      </p>
                    )}

                  </div>
                </div>

              </button>
            ))}

          </div>
        ) : (
          /* Empty state */
          <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-[#D0E6FF]">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E9D5FF] text-[#6A1B9A]">
              <Camera size={28} />
            </div>

            <h3 className="mt-5 font-['Montserrat'] text-xl font-bold text-[#023570]">
              No memories found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#52667A]">
              There are currently no photos in this
              category. Try another category or check
              back after more family memories are added.
            </p>

            <button
              onClick={() => setCategory('All')}
              className="mt-6 rounded-full bg-[#023570] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2E1065]"
            >
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
                    (photo) => photo.category
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

      {showUploadForm && isAuthenticated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#023570]/75 p-4 backdrop-blur-sm">

          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            {/* Modal close button */}
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

            {/* Upload form */}
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

      {lightboxImage && lightboxIndex >= 0 && (
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
              <ChevronLeft size={26} />
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
              <ChevronRight size={26} />
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
              src={lightboxImage}
              alt={
                filtered[lightboxIndex]?.title ||
                'Family memory'
              }
              className="max-h-[75vh] max-w-full rounded-xl object-contain shadow-2xl"
            />

            {filtered[lightboxIndex] && (
              <div className="mt-4 text-center">

                <h3 className="font-['Montserrat'] text-lg font-bold text-white">
                  {filtered[lightboxIndex].title}
                </h3>

                <p className="mt-1 text-sm text-gray-300">
                  {filtered[lightboxIndex].date}
                  {' · '}
                  {filtered[lightboxIndex].category}
                </p>

                {filtered[lightboxIndex].description && (
                  <p className="mx-auto mt-2 max-w-xl text-sm text-gray-400">
                    {filtered[lightboxIndex].description}
                  </p>
                )}

                {filtered[lightboxIndex]
                  .uploader_name && (
                  <p className="mt-2 text-xs font-semibold text-[#51A2FF]">
                    Uploaded by{' '}
                    {
                      filtered[lightboxIndex]
                        .uploader_name
                    }
                  </p>
                )}

                {filtered.length > 1 && (
                  <p className="mt-3 text-xs text-gray-500">
                    {lightboxIndex + 1} of{' '}
                    {filtered.length}
                  </p>
                )}

              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================
          SHARED FOOTER
      ========================================================= */}

      <Footer />

    </div>
  );
}