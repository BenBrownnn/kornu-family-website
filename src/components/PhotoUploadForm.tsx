import { useEffect, useState } from 'react';
import {
  Upload,
  X,
  ImagePlus,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useStore } from '../store/useStore';

const categories = [
  'Reunions',
  'Portraits',
  'Celebrations',
  'Adventures',
  'Traditions',
];

interface PhotoUploadFormProps {
  onUploadSuccess: () => void;
  onClose: () => void;
}

export default function PhotoUploadForm({
  onUploadSuccess,
  onClose,
}: PhotoUploadFormProps) {
  const { currentUser } = useStore();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  /* ============================================================
     CLEAN UP IMAGE PREVIEW URL
  ============================================================ */
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  /* ============================================================
     FILE SELECTION
  ============================================================ */
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selected = e.target.files?.[0];

    if (!selected) return;

    if (!selected.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.');
      return;
    }

    setError('');
    setFile(selected);

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(URL.createObjectURL(selected));
  };

  /* ============================================================
     UPLOAD
  ============================================================ */
  const handleUpload = async () => {
    if (!file || !title.trim() || !currentUser) {
      setError('Please add a photo and a title.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      /* --------------------------------------------------------
         CREATE UNIQUE FILE PATH
      -------------------------------------------------------- */
      const fileExt = file.name.split('.').pop();

      const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;

      const filePath = `${fileName}`;

      /* --------------------------------------------------------
         UPLOAD TO SUPABASE STORAGE
      -------------------------------------------------------- */
      const { error: uploadError } =
        await supabase.storage
          .from('gallery-photos')
          .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      /* --------------------------------------------------------
         SAVE PHOTO METADATA
      -------------------------------------------------------- */
      const { error: dbError } =
        await supabase
          .from('gallery_photos')
          .insert({
            title: title.trim(),
            description:
              description.trim() || null,
            category,
            storage_path: filePath,
            uploaded_by: currentUser.id,
            uploader_name: currentUser.name,
          });

      if (dbError) {
        throw dbError;
      }

      /* --------------------------------------------------------
         SUCCESS
      -------------------------------------------------------- */
      onUploadSuccess();
      onClose();

    } catch (err: any) {
      setError(
        err.message ||
          'Upload failed. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  /* ============================================================
     CLOSE
  ============================================================ */
  const handleClose = () => {
    if (uploading) return;

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#023570]/70 backdrop-blur-md z-50 flex items-center justify-center p-4">

      {/* Decorative background glow */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#51A2FF]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#6A1B9A]/20 rounded-full blur-3xl pointer-events-none" />

      {/* ========================================================
          MODAL
      ========================================================= */}
      <div className="relative bg-white rounded-[2rem] max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-[0_30px_100px_rgba(2,53,112,0.3)] border border-white/80">

        {/* ======================================================
            HEADER
        ======================================================= */}
        <div className="px-6 sm:px-8 pt-6 sm:pt-8">

          <div className="flex items-start justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D0E6FF] to-[#E9D5FF] flex items-center justify-center">

                <ImagePlus
                  size={21}
                  className="text-[#023570]"
                  strokeWidth={2}
                />

              </div>

              <div>

                <div className="flex items-center gap-1.5 mb-0.5">

                  <Sparkles
                    size={11}
                    className="text-[#6A1B9A]"
                  />

                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6A1B9A]">
                    Family Gallery
                  </span>

                </div>

                <h2 className="font-montserrat text-xl font-bold text-[#102A43]">
                  Add a Photo
                </h2>

              </div>

            </div>

            <button
              onClick={handleClose}
              disabled={uploading}
              className="w-9 h-9 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#52667A] hover:text-[#023570] flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close photo upload"
            >
              <X size={18} />
            </button>

          </div>

          <p className="text-sm text-[#52667A] mt-4 leading-relaxed">
            Share a special family moment with everyone.
            Photos can be added to the private family gallery.
          </p>

        </div>

        {/* ======================================================
            FORM CONTENT
        ======================================================= */}
        <div className="px-6 sm:px-8 pb-8 pt-6">

          {/* ====================================================
              FILE PICKER
          ===================================================== */}
          <label className="block mb-6">

            <div
              className={`relative border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 ${
                preview
                  ? 'border-[#51A2FF]/40 bg-[#F8FAFC]'
                  : 'border-[#CBD8E6] bg-[#F8FAFC] hover:border-[#51A2FF] hover:bg-[#F5F9FF]'
              }`}
            >

              {preview ? (
                <div className="relative">

                  <img
                    src={preview}
                    alt="Selected photo preview"
                    className="w-full max-h-64 object-cover"
                  />

                  {/* Image overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#023570]/60 via-transparent to-transparent pointer-events-none" />

                  {/* Selected indicator */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">

                    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5">

                      <CheckCircle2
                        size={14}
                        className="text-[#023570]"
                      />

                      <span className="text-xs font-semibold text-[#102A43]">
                        Photo selected
                      </span>

                    </div>

                    <span className="bg-[#023570]/90 text-white text-[10px] font-medium rounded-full px-3 py-1.5">
                      Change photo
                    </span>

                  </div>

                </div>
              ) : (
                <div className="px-6 py-10 text-center">

                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#D0E6FF] to-[#E9D5FF] flex items-center justify-center">

                    <Upload
                      size={25}
                      className="text-[#023570]"
                    />

                  </div>

                  <p className="text-sm font-semibold text-[#102A43] mb-1">
                    Click to choose a photo
                  </p>

                  <p className="text-xs text-[#7A8A9A]">
                    JPG, PNG, WEBP or other image files
                  </p>

                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D0E6FF]/60 text-[#023570] text-[10px] font-semibold">
                    Maximum 5MB
                  </div>

                </div>
              )}

            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

          </label>

          {/* ====================================================
              FORM FIELDS
          ===================================================== */}
          <div className="space-y-5">

            {/* Title */}
            <div>

              <label className="block text-sm font-semibold text-[#102A43] mb-2">
                Photo Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="e.g. Christmas 2025"
                className="w-full bg-[#F8FAFC] border border-[#D9E4F0] text-[#102A43] placeholder:text-[#94A3B8] rounded-2xl px-4 py-3.5 outline-none transition-all focus:border-[#51A2FF] focus:ring-4 focus:ring-[#51A2FF]/10 focus:bg-white"
              />

            </div>

            {/* Category */}
            <div>

              <label className="block text-sm font-semibold text-[#102A43] mb-2">
                Category
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                className="w-full bg-[#F8FAFC] border border-[#D9E4F0] text-[#102A43] rounded-2xl px-4 py-3.5 outline-none transition-all focus:border-[#51A2FF] focus:ring-4 focus:ring-[#51A2FF]/10 focus:bg-white cursor-pointer"
              >
                {categories.map((cat) => (
                  <option
                    key={cat}
                    value={cat}
                  >
                    {cat}
                  </option>
                ))}
              </select>

            </div>

            {/* Description */}
            <div>

              <label className="block text-sm font-semibold text-[#102A43] mb-2">
                Description
                <span className="font-normal text-[#94A3B8]">
                  {' '}
                  (optional)
                </span>
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Add a short caption..."
                rows={3}
                className="w-full bg-[#F8FAFC] border border-[#D9E4F0] text-[#102A43] placeholder:text-[#94A3B8] rounded-2xl px-4 py-3.5 outline-none transition-all focus:border-[#51A2FF] focus:ring-4 focus:ring-[#51A2FF]/10 focus:bg-white resize-none"
              />

            </div>

            {/* ==================================================
                ERROR
            =================================================== */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm flex items-start gap-3">

                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">

                  <span className="text-red-500 font-bold text-xs">
                    !
                  </span>

                </div>

                <div>
                  <p className="font-semibold mb-0.5">
                    Upload error
                  </p>

                  <p className="text-red-500/90 leading-relaxed">
                    {error}
                  </p>
                </div>

              </div>
            )}

            {/* ==================================================
                UPLOAD BUTTON
            =================================================== */}
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 text-base font-semibold text-white rounded-full bg-gradient-to-r from-[#023570] via-[#0757A6] to-[#2E1065] hover:from-[#03458F] hover:via-[#0868C7] hover:to-[#3D1785] shadow-lg shadow-[#023570]/20 hover:shadow-xl hover:shadow-[#023570]/25 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >

              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />

                  <span>
                    Uploading Photo...
                  </span>
                </>
              ) : (
                <>
                  <Upload size={18} />

                  <span>
                    Upload Photo
                  </span>
                </>
              )}

            </button>

            {/* Privacy note */}
            <div className="flex items-center justify-center gap-2 text-xs text-[#7A8A9A] pt-1">

              <span className="w-1.5 h-1.5 rounded-full bg-[#51A2FF]" />

              <span>
                Shared privately with the Kornu family
              </span>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}