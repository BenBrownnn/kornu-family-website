import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useStore } from '../store/useStore';

const categories = ['Reunions', 'Portraits', 'Celebrations', 'Adventures', 'Traditions'];

interface PhotoUploadFormProps {
  onUploadSuccess: () => void;
  onClose: () => void;
}

export default function PhotoUploadForm({ onUploadSuccess, onClose }: PhotoUploadFormProps) {
  const { currentUser } = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file || !title.trim() || !currentUser) {
      setError('Please add a photo and a title.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('gallery-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save metadata to the database
      const { error: dbError } = await supabase.from('gallery_photos').insert({
        title: title.trim(),
        description: description.trim() || null,
        category,
        storage_path: filePath,
        uploaded_by: currentUser.id,
        uploader_name: currentUser.name,
      });

      if (dbError) throw dbError;

      onUploadSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-montserrat text-xl font-bold text-gray-900">Add a Photo</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* File picker */}
        <label className="block mb-4">
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-orange-300 transition-colors">
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl object-cover" />
            ) : (
              <div className="text-gray-400">
                <Upload size={28} className="mx-auto mb-2" />
                <p className="text-sm">Click to choose a photo</p>
              </div>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Christmas 2025"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short caption..."
              className="input-field"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full btn-primary justify-center disabled:opacity-60"
          >
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </button>
        </div>
      </div>
    </div>
  );
}