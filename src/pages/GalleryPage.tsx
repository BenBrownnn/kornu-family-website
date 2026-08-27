import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { galleryItems } from '../data/familyData';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import PhotoUploadForm from '../components/PhotoUploadForm';
import { supabase } from '../lib/supabaseClient';

const categories = ['All', 'Reunions', 'Portraits', 'Celebrations', 'Adventures', 'Traditions'];

// Extended gallery — all images now served locally from /public/images/gallery/
const extendedGallery = [
  ...galleryItems,
  {
    id: '7', src: '/images/gallery/family-game-night.jpg',
    title: 'Family Game Night', date: 'November 2023', category: 'Traditions', description: 'Saturday game nights are sacred'
  },
  {
    id: '8', src: '/images/family-gathering.jpg',
    title: 'Summer Picnic', date: 'July 2023', category: 'Adventures', description: 'Annual family picnic by the river'
  },
  {
    id: '9', src: '/images/gallery/graduation-day.jpg',
    title: 'Graduation Day', date: 'June 2023', category: 'Celebrations', description: 'Akua graduates with honors'
  },
  {
    id: '10', src: '/images/gallery/new-year-2024.jpg',
    title: 'New Year 2024', date: 'January 2024', category: 'Celebrations', description: 'Welcoming 2024 as a family'
  },
  {
    id: '11', src: '/images/gallery/grandfather-story-time.jpg',
    title: 'Grandfather\'s Story Time', date: 'October 2023', category: 'Traditions', description: 'Elder Kweku shares family wisdom'
  },
  {
    id: '12', src: '/images/gallery/family-portrait-2023.jpg',
    title: 'Family Portrait 2023', date: 'December 2023', category: 'Portraits', description: 'Our annual family portrait session'
  },
];

type UploadedPhoto = {
  id: string;
  src: string;
  title: string;
  date: string;
  category: string;
  description: string;
  uploader_name?: string;
};

export default function GalleryPage() {
  const { lightboxImage, setLightboxImage, setCurrentPage, isAuthenticated } = useStore();
  const [category, setCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);

  const fetchUploadedPhotos = async () => {
    const { data, error } = await supabase
      .from('gallery_photos')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const withUrls = data.map((photo) => ({
        id: photo.id,
        src: supabase.storage.from('gallery-photos').getPublicUrl(photo.storage_path).data.publicUrl,
        title: photo.title,
        date: new Date(photo.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
        category: photo.category,
        description: photo.description || '',
        uploader_name: photo.uploader_name,
      }));
      setUploadedPhotos(withUrls);
    }
  };

  useEffect(() => {
    fetchUploadedPhotos();
  }, []);

  const fullGallery = [...uploadedPhotos, ...extendedGallery];

  const filtered = fullGallery.filter(
    (g) => category === 'All' || g.category === category
  );

  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxImage(filtered[idx].src);
  };

  const closeLightbox = () => {
    setLightboxIndex(-1);
    setLightboxImage(null);
  };

  const prevImage = () => {
    const newIdx = (lightboxIndex - 1 + filtered.length) % filtered.length;
    setLightboxIndex(newIdx);
    setLightboxImage(filtered[newIdx].src);
  };

  const nextImage = () => {
    const newIdx = (lightboxIndex + 1) % filtered.length;
    setLightboxIndex(newIdx);
    setLightboxImage(filtered[newIdx].src);
  };

  // Uses the same client-side page state as the rest of the app (see FamilyPage's
  // setCurrentPage('portal')) instead of a hard window.location.href redirect,
  // which was navigating to a URL path with no matching server route and
  // falling back to home.
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="pt-24 pb-12 bg-gradient-to-r from-gray-900 via-gray-800 to-pink-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img src="/images/gallery1.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-pink-500/20 text-pink-300 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Camera size={14} />
            Photo Album
          </div>
          <h1 className="font-['Montserrat'] text-5xl font-bold text-white mb-4">Our Family Gallery</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            A visual journey through our most cherished moments, milestones, and memories.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Add Photo Button */}
        {isAuthenticated && (
          <div className="text-center mb-8">
            <button
              onClick={() => setShowUploadForm(true)}
              className="btn-primary inline-flex"
            >
              <Camera size={18} />
              Add a Photo
            </button>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex gap-3 flex-wrap justify-center mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500'
              }`}
            >
              {cat}
              {cat !== 'All' && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({fullGallery.filter(g => g.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Masonry-style Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-0">
          {filtered.map((item, idx) => (
            <div
              key={item.id}
              className="gallery-item mb-4 break-inside-avoid cursor-pointer"
              onClick={() => openLightbox(idx)}
            >
              <img
                src={item.src}
                alt={item.title}
                className={`w-full object-cover ${idx % 5 === 0 ? 'h-72' : idx % 3 === 0 ? 'h-48' : 'h-60'}`}
                loading="lazy"
                onError={(e) => {
                  const t = e.target as HTMLImageElement;
                  t.src = '/images/placeholder.jpg';
                }}
              />
              <div className="gallery-overlay">
                <div>
                  <p className="text-white font-bold text-sm font-montserrat">{item.title}</p>
                  <p className="text-white/70 text-xs mt-0.5">{item.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Camera size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400 text-lg">No photos in this category yet</p>
          </div>
        )}

        {/* Stats */}
       <div className="mt-16 bg-gray-900 rounded-3xl p-8 text-white">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { value: `${fullGallery.length}+`, label: 'Photos' },
              { value: '6', label: 'Categories' },
              { value: '1960–2026', label: 'Years Covered' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-3xl font-black font-montserrat">{value}</div>
                <div className="text-white/80 text-sm font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <PhotoUploadForm
          onClose={() => setShowUploadForm(false)}
          onUploadSuccess={fetchUploadedPhotos}
        />
      )}

      {/* Lightbox */}
      {lightboxImage && lightboxIndex >= 0 && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10"
          >
            <X size={20} />
          </button>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 text-white bg-white/10 hover:bg-white/20 w-12 h-12 rounded-full flex items-center justify-center transition-colors z-10"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Image */}
          <div
            className="max-w-4xl max-h-[85vh] px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage}
              alt={filtered[lightboxIndex]?.title}
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
            />
            <div className="text-center mt-4">
              <p className="text-white font-semibold font-montserrat text-lg">{filtered[lightboxIndex]?.title}</p>
              <p className="text-gray-400 text-sm">{filtered[lightboxIndex]?.date} · {filtered[lightboxIndex]?.description}</p>
              <p className="text-gray-600 text-xs mt-1">{lightboxIndex + 1} / {filtered.length}</p>
            </div>
          </div>

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 text-white bg-white/10 hover:bg-white/20 w-12 h-12 rounded-full flex items-center justify-center transition-colors z-10"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}

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