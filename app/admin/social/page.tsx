'use client';
import { useEffect, useState } from 'react';
import { SocialMediaLink } from '@/lib/types';
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import FilePicker from '@/lib/components/FilePicker';
import { useToast } from '@/lib/components/ToastContainer';
import ConfirmDialog from '@/lib/components/ConfirmDialog';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface FormData {
  platform: string;
  url: string;
  icon_path: string;
  display_order: number;
}

export default function AdminSocialPage() {
  const { showError, showSuccess } = useToast();
  const { t, language } = useTranslation();
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
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);

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
        showError('Please select a valid image file (SVG, PNG, JPG, or WebP)');
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        showError('File size must be less than 2MB');
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
    
    // Validation - check if icon is provided (either file upload or from library)
    if (!editingId && !selectedFile && !formData.icon_path) {
      showError('Please upload an icon file or select one from the library');
      return;
    }
    
    setSubmitting(true);

    try {
      let iconPath = formData.icon_path;

      // Upload file only if a new file is selected (not from library)
      if (selectedFile) {
        setUploadingFile(true);
        iconPath = await uploadFile(selectedFile);
        setUploadingFile(false);
      }

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
        showError(error.error || `Failed to ${editingId ? 'update' : 'create'} link`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showError(`Failed to ${editingId ? 'update' : 'create'} link`);
    } finally {
      setSubmitting(false);
      setUploadingFile(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingLinkId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingLinkId) return;

    try {
      const response = await fetch(`/api/social-media/${deletingLinkId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchLinks();
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to delete link');
      }
    } catch (error) {
      console.error('Error deleting link:', error);
      showError('Failed to delete link');
    } finally {
      setShowDeleteConfirm(false);
      setDeletingLinkId(null);
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
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-2">
            {t('admin.social.title')}
          </h1>
          <p className="text-gray-600 dark:text-zinc-400">
            {t('admin.social.subtitle')}
          </p>
        </div>
        <button
          onClick={handleOpenAddForm}
          className="flex items-center justify-center gap-2 px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-full font-medium transition-all text-sm min-h-[44px]"
        >
          <PlusIcon className="w-4 h-4" />
          {t('admin.social.addNewLink')}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="mb-6 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
              {editingId ? t('admin.social.editLink') : t('admin.social.addNew')} {t('admin.social.socialMediaLink')}
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
                {t('admin.social.platformName')} *
              </label>
              <input
                type="text"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                required
                placeholder={t('admin.social.platformPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                {t('admin.social.urlLabel')} *
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                required
                placeholder={t('admin.social.urlPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                {t('admin.social.iconLabel')} {!editingId && '*'}
              </label>
              
              <div className="space-y-3">
                {/* File Upload and Library Picker */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setShowFilePicker(true)}
                    className="px-4 py-3 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                  >
                    <div className="flex flex-col items-center gap-2 text-blue-600 dark:text-blue-400">
                      <PhotoIcon className="w-6 h-6" />
                      <span className="text-sm font-medium">
                        {t('admin.social.chooseFromLibrary')}
                      </span>
                    </div>
                  </button>
                  
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/svg+xml,image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="px-4 py-3 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg hover:border-gray-400 dark:hover:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors h-full">
                      <div className="flex flex-col items-center gap-2 text-gray-600 dark:text-zinc-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-sm font-medium">
                          {t('admin.social.uploadNew')}
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
                
                <p className="text-xs text-gray-500 dark:text-zinc-500 text-center">
                  {t('admin.social.iconFileTypes')}
                </p>

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
                        {selectedFile ? selectedFile.name : t('admin.social.selectedIcon')}
                      </p>
                      {selectedFile && (
                        <p className="text-xs text-gray-500 dark:text-zinc-400">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(editingId ? formData.icon_path : '');
                        setFormData({ ...formData, icon_path: editingId ? formData.icon_path : '' });
                      }}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {editingId && !selectedFile && !previewUrl && (
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    {t('admin.social.keepCurrentIcon')}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                {t('admin.social.displayOrder')}
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                min="0"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                {t('admin.social.lowerNumbersFirst')}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-full font-medium transition-all text-sm disabled:opacity-50"
              >
                {uploadingFile ? t('admin.social.uploadingIcon') : submitting ? t('admin.social.saving') : editingId ? t('admin.social.updateLink') : t('admin.social.addLink')}
              </button>
              <button
                type="button"
                onClick={handleCloseForm}
                className="px-5 py-2 rounded-full border-2 border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 text-gray-700 dark:text-zinc-300 bg-transparent transition-all font-medium text-sm"
              >
                {t('admin.social.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Links Table - Desktop */}
      <div className="hidden md:block bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
          <thead className="bg-gray-50 dark:bg-zinc-800">
            <tr>
              <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {t('admin.social.table.platform')}
              </th>
              <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {t('admin.social.table.url')}
              </th>
              <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {t('admin.social.table.icon')}
              </th>
              <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {t('admin.social.table.order')}
              </th>
              <th className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {t('admin.social.table.actions')}
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEditForm(link)}
                      className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full text-sm font-medium hover:border-gray-400 dark:hover:border-zinc-500 transition-all inline-flex items-center justify-center"
                      aria-label={t('common.edit')}
                      title={t('common.edit')}
                    >
                      <PencilIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full text-sm font-medium hover:border-gray-400 dark:hover:border-zinc-500 transition-all inline-flex items-center justify-center"
                      aria-label={t('common.delete')}
                      title={t('common.delete')}
                    >
                      <TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Links Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {links.map((link) => (
          <div
            key={link.id}
            className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-4"
          >
            {/* Platform and Icon */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 flex items-center justify-center bg-gray-50 dark:bg-zinc-800 rounded p-2">
                <img 
                  src={link.icon_path} 
                  alt={link.platform}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-zinc-100">
                  {link.platform}
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  {t('admin.social.table.order')}: {link.display_order}
                </p>
              </div>
            </div>

            {/* URL */}
            <div className="mb-3">
              <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                {t('admin.social.table.url')}
              </label>
              <a 
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 break-all mt-1"
              >
                {link.url}
              </a>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-zinc-800">
              <button
                onClick={() => handleOpenEditForm(link)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full text-sm font-medium hover:border-gray-400 dark:hover:border-zinc-500 transition-all inline-flex items-center justify-center"
                aria-label={t('common.edit')}
                title={t('common.edit')}
              >
                <PencilIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </button>
              <button
                onClick={() => handleDelete(link.id)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full text-sm font-medium hover:border-gray-400 dark:hover:border-zinc-500 transition-all inline-flex items-center justify-center"
                aria-label={t('common.delete')}
                title={t('common.delete')}
              >
                <TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {links.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800">
          <p className="text-gray-500 dark:text-zinc-400 mb-4">No social media links found</p>
          <button
            onClick={handleOpenAddForm}
            className="inline-flex items-center gap-2 px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-full font-medium transition-all text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Add Your First Link
          </button>
        </div>
      )}

      {/* File Picker Modal */}
      <FilePicker
        isOpen={showFilePicker}
        onClose={() => setShowFilePicker(false)}
        onSelect={(file) => {
          setFormData({ ...formData, icon_path: file.file_url });
          setPreviewUrl(file.file_url);
          setSelectedFile(null); // Clear the local file since we're using a library file
        }}
        fileType="image"
        title="Select Icon from Library"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Social Media Link"
        message={
          <>
            Are you sure you want to delete this social media link?
            <br />
            <span className="text-sm text-gray-600 dark:text-zinc-400 mt-2 block">
              This action cannot be undone.
            </span>
          </>
        }
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeletingLinkId(null);
        }}
        onConfirm={confirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 focus:ring-red-500"
      />
    </div>
  );
}
