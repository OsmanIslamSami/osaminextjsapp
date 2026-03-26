'use client';
import { useEffect, useState } from 'react';
import { SocialMediaLink } from '@/lib/types';
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface FormData {
  platform: string;
  url: string;
  icon_path: string;
  display_order: number;
}

export default function AdminSocialPage() {
  const [links, setLinks] = useState<SocialMediaLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    platform: '',
    url: '',
    icon_path: '',
    display_order: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/social-media');
      if (response.ok) {
        const data = await response.json();
        setLinks(data);
      }
    } catch (error) {
      console.error('Error fetching social media links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddForm = () => {
    setEditingId(null);
    setFormData({
      platform: '',
      url: '',
      icon_path: '',
      display_order: links.length,
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setShowForm(true);
  };

  const handleOpenEditForm = (link: SocialMediaLink) => {
    setEditingId(link.id);
    setFormData({
      platform: link.platform,
      url: link.url,
      icon_path: link.icon_path,
      display_order: link.display_order,
    });
    setSelectedFile(null);
    setPreviewUrl(link.icon_path);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      platform: '',
      url: '',
      icon_path: '',
      display_order: 0,
    });
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (SVG, PNG, JPG, or WebP)');
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload-icon', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload file');
    }

    const data = await response.json();
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!editingId && !selectedFile) {
      alert('Please upload an icon file');
      return;
    }
    
    setSubmitting(true);
    setUploadingFile(true);

    try {
      let iconPath = formData.icon_path;

      // Upload file if a new one is selected
      if (selectedFile) {
        iconPath = await uploadFile(selectedFile);
      }

      setUploadingFile(false);

      const url = editingId 
        ? `/api/social-media/${editingId}` 
        : '/api/social-media';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          icon_path: iconPath,
        }),
      });

      if (response.ok) {
        await fetchLinks();
        handleCloseForm();
      } else {
        const error = await response.json();
        alert(error.error || `Failed to ${editingId ? 'update' : 'create'} link`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Failed to ${editingId ? 'update' : 'create'} link`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this social media link?')) {
      return;
    }

    try {
      const response = await fetch(`/api/social-media/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchLinks();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete link');
      }
    } catch (error) {
      console.error('Error deleting link:', error);
      alert('Failed to delete link');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-zinc-100"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-2">
            Social Media Links
          </h2>
          <p className="text-gray-600 dark:text-zinc-400">
            Manage footer social media links
          </p>
        </div>
        <button
          onClick={handleOpenAddForm}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Add New Link
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="mb-6 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
              {editingId ? 'Edit' : 'Add New'} Social Media Link
            </h3>
            <button
              onClick={handleCloseForm}
              className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-zinc-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Platform Name *
              </label>
              <input
                type="text"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                required
                placeholder="e.g., Facebook, Twitter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                URL *
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                required
                placeholder="https://facebook.com/yourpage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                Icon {!editingId && '*'}
              </label>
              
              <div className="space-y-3">
                {/* File Upload Input */}
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/svg+xml,image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="px-4 py-2 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-zinc-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-sm font-medium">
                          {selectedFile ? 'Change Icon' : editingId ? 'Upload New Icon' : 'Upload Icon'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                        SVG, PNG, JPG, or WebP (max 2MB)
                      </p>
                    </div>
                  </label>
                </div>

                {/* Preview */}
                {previewUrl && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
                    <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-zinc-900 rounded p-2 border border-gray-200 dark:border-zinc-700">
                      <img 
                        src={previewUrl} 
                        alt="Icon preview" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">
                        {selectedFile ? selectedFile.name : 'Current Icon'}
                      </p>
                      {selectedFile && (
                        <p className="text-xs text-gray-500 dark:text-zinc-400">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      )}
                    </div>
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(editingId ? formData.icon_path : '');
                        }}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}

                {editingId && !selectedFile && (
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    Leave empty to keep the current icon
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                min="0"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                Lower numbers appear first
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
              >
                {uploadingFile ? 'Uploading Icon...' : submitting ? 'Saving...' : editingId ? 'Update Link' : 'Add Link'}
              </button>
              <button
                type="button"
                onClick={handleCloseForm}
                className="px-4 py-2 border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Links Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
          <thead className="bg-gray-50 dark:bg-zinc-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Platform
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Icon
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
            {links.map((link) => (
              <tr key={link.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-zinc-100">
                    {link.platform}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <a 
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 break-all"
                  >
                    {link.url}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center bg-gray-50 dark:bg-zinc-800 rounded p-1">
                      <img 
                        src={link.icon_path} 
                        alt={link.platform}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-zinc-400 max-w-xs truncate">
                      {link.icon_path.length > 30 ? '...' + link.icon_path.slice(-27) : link.icon_path}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-zinc-400">
                    {link.display_order}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                  <button
                    onClick={() => handleOpenEditForm(link)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center gap-1"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 inline-flex items-center gap-1"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {links.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800">
          <p className="text-gray-500 dark:text-zinc-400 mb-4">No social media links found</p>
          <button
            onClick={handleOpenAddForm}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Add Your First Link
          </button>
        </div>
      )}
    </div>
  );
}
