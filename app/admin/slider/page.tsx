'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { TrashIcon, PencilIcon, ArrowUpIcon, ArrowDownIcon, EyeIcon, EyeSlashIcon, PhotoIcon } from '@heroicons/react/24/outline';
import FilePicker from '@/lib/components/FilePicker';

interface Slide {
  id: string;
  media_url: string;
  media_type: 'image' | 'video' | 'gif';
  title_en: string | null;
  title_ar: string | null;
  button_text_en: string | null;
  button_text_ar: string | null;
  button_url: string | null;
  show_button: boolean;
  display_order: number;
  is_visible: boolean;
}

export default function AdminSliderPage() {
  const { t } = useTranslation();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showFilePicker, setShowFilePicker] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    media_url: '',
    media_type: 'image' as 'image' | 'video' | 'gif',
    title_en: '',
    title_ar: '',
    button_text_en: '',
    button_text_ar: '',
    button_url: '',
    show_button: false,
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      // Use admin endpoint to see all slides (including hidden ones)
      const response = await fetch('/api/slider/admin');
      if (response.ok) {
        const data = await response.json();
        setSlides(data.slides || []);
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('File too large. Maximum size is 10MB.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Allowed: JPG, PNG, GIF, MP4, WebM');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress (you can use XMLHttpRequest for real progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/slider/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ 
          ...prev, 
          media_url: data.url,
          media_type: file.type.startsWith('video/') ? 'video' : file.type === 'image/gif' ? 'gif' : 'image'
        }));
        alert('File uploaded successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.media_url) {
      alert('Please upload a media file first');
      return;
    }

    try {
      const url = editingSlide ? `/api/slider/${editingSlide.id}` : '/api/slider';
      const method = editingSlide ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert(editingSlide ? 'Slide updated!' : 'Slide created!');
        resetForm();
        fetchSlides();
      } else {
        const error = await response.json();
        alert(error.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving slide:', error);
      alert('Save failed');
    }
  };

  const handleEdit = (slide: Slide) => {
    setEditingSlide(slide);
    setFormData({
      media_url: slide.media_url,
      media_type: slide.media_type,
      title_en: slide.title_en || '',
      title_ar: slide.title_ar || '',
      button_text_en: slide.button_text_en || '',
      button_text_ar: slide.button_text_ar || '',
      button_url: slide.button_url || '',
      show_button: slide.show_button,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;

    try {
      const response = await fetch(`/api/slider/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchSlides();
      } else {
        const error = await response.json();
        alert(error.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting slide:', error);
      alert('Delete failed');
    }
  };

  const handleToggleVisible = async (id: string) => {
    try {
      const response = await fetch(`/api/slider/${id}/toggle`, { method: 'PUT' });
      if (response.ok) {
        fetchSlides();
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === slides.length - 1)
    ) {
      return;
    }

    const newSlides = [...slides];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newSlides[index], newSlides[swapIndex]] = [newSlides[swapIndex], newSlides[index]];

    // Update display_order
    const updates = newSlides.map((slide, idx) => ({
      id: slide.id,
      display_order: idx,
    }));

    try {
      const response = await fetch('/api/slider/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides: updates }),
      });

      if (response.ok) {
        setSlides(newSlides);
      }
    } catch (error) {
      console.error('Error reordering slides:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      media_url: '',
      media_type: 'image',
      title_en: '',
      title_ar: '',
      button_text_en: '',
      button_text_ar: '',
      button_url: '',
      show_button: false,
    });
    setEditingSlide(null);
    setShowAddForm(false);
  };

  if (loading) {
    return <div className="p-8">Loading slides...</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Slider Management</h1>
          {slides.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {slides.filter(s => s.is_visible).length} visible • {slides.filter(s => !s.is_visible).length} hidden • {slides.length} total
            </p>
          )}
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 min-h-[44px]"
        >
          {showAddForm ? 'Cancel' : 'Add New Slide'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            {editingSlide ? 'Edit Slide' : 'Add New Slide'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Media File *</label>
              
              <div className="flex gap-3 mb-2">
                <button
                  type="button"
                  onClick={() => setShowFilePicker(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <PhotoIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">
                    Choose from Style Library
                  </span>
                </button>
                
                <div className="flex-1">
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,video/mp4,video/webm"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    <span className="text-sm font-medium text-gray-600">
                      Or Upload New File
                    </span>
                  </label>
                </div>
              </div>
              
              {uploading && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{uploadProgress}% uploaded</p>
                </div>
              )}
              {formData.media_url && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600">✓ File ready</p>
                  <p className="text-xs text-gray-600 mt-1 truncate">{formData.media_url}</p>
                </div>
              )}
            </div>

            {/* Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title (English)</label>
                <input
                  type="text"
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title (Arabic)</label>
                <input
                  type="text"
                  value={formData.title_ar}
                  onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 min-h-[44px]"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Button */}
            <div>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={formData.show_button}
                  onChange={(e) => setFormData({ ...formData, show_button: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium">Show CTA Button</span>
              </label>
            </div>

            {formData.show_button && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Button Text (English)</label>
                    <input
                      type="text"
                      value={formData.button_text_en}
                      onChange={(e) => setFormData({ ...formData, button_text_en: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Button Text (Arabic)</label>
                    <input
                      type="text"
                      value={formData.button_text_ar}
                      onChange={(e) => setFormData({ ...formData, button_text_ar: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 min-h-[44px]"
                      dir="rtl"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Button URL</label>
                  <input
                    type="url"
                    value={formData.button_url}
                    onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full border border-gray-300 rounded-lg p-2 min-h-[44px]"
                  />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={uploading || !formData.media_url}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 min-h-[44px]"
              >
                {editingSlide ? 'Update Slide' : 'Create Slide'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-100 min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Slides List */}
      <div className="space-y-4">
        {slides.length === 0 ? (
          <p className="text-gray-600 text-center py-12">No slides yet. Add one to get started!</p>
        ) : (
          slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`rounded-lg p-4 shadow-sm flex flex-col md:flex-row gap-4 ${
                slide.is_visible 
                  ? 'bg-white border-2 border-gray-200' 
                  : 'bg-gray-50 border-2 border-gray-300 border-dashed'
              }`}
            >
              {/* Preview */}
              <div className="w-full md:w-48 h-32 flex-shrink-0 relative">
                {slide.media_type === 'video' ? (
                  <video src={slide.media_url} className="w-full h-full object-cover rounded" />
                ) : (
                  <img src={slide.media_url} alt="Slide" className="w-full h-full object-cover rounded" />
                )}
                {/* Hidden overlay indicator */}
                {!slide.is_visible && (
                  <div className="absolute inset-0 bg-gray-900 bg-opacity-40 rounded flex items-center justify-center">
                    <EyeSlashIcon className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">
                    {slide.title_en || slide.title_ar || 'Untitled Slide'}
                  </h3>
                  {/* Status Badge */}
                  {slide.is_visible ? (
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                      Visible on Homepage
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                      Hidden from Homepage
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Type: {slide.media_type} | Order: {index + 1}
                </p>
                {slide.show_button && slide.button_url && (
                  <p className="text-sm text-blue-600 mt-1">CTA: {slide.button_url}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex md:flex-col gap-2 items-center">
                <button
                  onClick={() => handleToggleVisible(slide.id)}
                  className="p-2 rounded hover:bg-gray-100 min-h-[44px] min-w-[44px]"
                  title={slide.is_visible ? 'Hide from homepage' : 'Show on homepage'}
                >
                  {slide.is_visible ? (
                    <EyeIcon className="w-5 h-5 text-green-600" />
                  ) : (
                    <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => handleReorder(index, 'up')}
                  disabled={index === 0}
                  className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 min-h-[44px] min-w-[44px]"
                  title="Move up"
                >
                  <ArrowUpIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleReorder(index, 'down')}
                  disabled={index === slides.length - 1}
                  className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 min-h-[44px] min-w-[44px]"
                  title="Move down"
                >
                  <ArrowDownIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleEdit(slide)}
                  className="p-2 rounded hover:bg-gray-100 min-h-[44px] min-w-[44px]"
                  title="Edit"
                >
                  <PencilIcon className="w-5 h-5 text-blue-600" />
                </button>
                <button
                  onClick={() => handleDelete(slide.id)}
                  className="p-2 rounded hover:bg-gray-100 min-h-[44px] min-w-[44px]"
                  title="Delete"
                >
                  <TrashIcon className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* File Picker Modal */}
      <FilePicker
        isOpen={showFilePicker}
        onClose={() => setShowFilePicker(false)}
        onSelect={(file) => {
          setFormData({
            ...formData,
            media_url: file.file_url,
            media_type: file.file_type.startsWith('video/') ? 'video' : file.file_type === 'image/gif' ? 'gif' : 'image'
          });
        }}
        fileType="all"
        title="Select Media for Slider"
      />
    </div>
  );
}
