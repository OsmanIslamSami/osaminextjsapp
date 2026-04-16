'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/lib/components/ToastContainer';
import { useTranslation } from '@/lib/i18n/useTranslation';
import ConfirmDialog from '@/lib/components/ConfirmDialog';
import PhotoForm from '@/lib/components/admin/PhotoForm';
import { EyeIcon, EyeSlashIcon, PencilIcon, TrashIcon, PlusIcon, StarIcon } from '@heroicons/react/24/outline';

interface Photo {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string | null;
  description_ar: string | null;
  image_url: string;
  storage_type: string;
  published_date: string;
  is_featured: boolean;
  is_visible: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  createdByUser?: { name: string | null; email: string };
  updatedByUser?: { name: string | null; email: string };
}

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const { t, language, direction } = useTranslation();
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    fetchPhotos();
  }, [showHidden, showDeleted, pagination.page]);

  async function fetchPhotos() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        context: 'admin',
        page: String(pagination.page),
        limit: String(pagination.limit),
        includeHidden: String(showHidden),
        includeDeleted: String(showDeleted),
      });

      const response = await fetch(`/api/photos?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch photos');
      }

      const data = await response.json();
      setPhotos(data.data || []);
      setPagination(data.pagination);
    } catch (err) {
      showError(t('admin.media.loadFailed'));
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = () => {
    setEditingPhoto(null);
    setShowForm(true);
  };

  const handleEdit = (photo: Photo) => {
    setEditingPhoto(photo);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPhoto(null);
    fetchPhotos();
  };

  const handleDelete = async (id: string) => {
    setDeletingPhotoId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingPhotoId) return;

    try {
      const response = await fetch(`/api/photos/${deletingPhotoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }

      showSuccess(language === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully');
      fetchPhotos();
    } catch (err) {
      showError(language === 'ar' ? 'فشل الحذف' : 'Failed to delete');
    } finally {
      setShowDeleteConfirm(false);
      setDeletingPhotoId(null);
    }
  };

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const response = await fetch(`/api/photos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_visible: !currentVisibility }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle visibility');
      }

      showSuccess(language === 'ar' ? 'تم التحديث' : 'Updated successfully');
      fetchPhotos();
    } catch (err) {
      showError(language === 'ar' ? 'فشل التحديث' : 'Failed to update');
    }
  };

  const handleSelectAll = () => {
    if (selectedPhotos.size === photos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(photos.map(photo => photo.id)));
    }
  };

  const handleSelectPhoto = (id: string) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPhotos(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedPhotos.size === 0) return;
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    try {
      const deletePromises = Array.from(selectedPhotos).map(id =>
        fetch(`/api/photos/${id}`, { method: 'DELETE' })
      );

      const results = await Promise.all(deletePromises);
      const failedCount = results.filter(r => !r.ok).length;

      if (failedCount > 0) {
        showError(
          language === 'ar' 
            ? `فشل حذف ${failedCount} من ${selectedPhotos.size} صورة` 
            : `Failed to delete ${failedCount} of ${selectedPhotos.size} photos`
        );
      } else {
        showSuccess(
          language === 'ar' 
            ? `تم حذف ${selectedPhotos.size} صورة بنجاح` 
            : `Successfully deleted ${selectedPhotos.size} photos`
        );
      }

      setSelectedPhotos(new Set());
      fetchPhotos();
    } catch (err) {
      showError(language === 'ar' ? 'فشل الحذف الجماعي' : 'Failed to bulk delete');
    } finally {
      setShowBulkDeleteConfirm(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === 'ar' ? 'ar-SA' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );
  };

  return (
    <div className="space-y-6" dir={direction}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
            {language === 'ar' ? 'إدارة الصور' : 'Manage Photos'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
            {language === 'ar' 
              ? `${pagination.total} صورة إجمالاً` 
              : `${pagination.total} total photos`}
            {selectedPhotos.size > 0 && (
              <span className="mx-2 text-blue-600 dark:text-blue-400 font-semibold">
                ({language === 'ar' 
                  ? `${selectedPhotos.size} محدد` 
                  : `${selectedPhotos.size} selected`})
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {selectedPhotos.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition-all text-sm shadow-sm"
            >
              <TrashIcon className="w-4 h-4" />
              {language === 'ar' ? `حذف المحدد (${selectedPhotos.size})` : `Delete Selected (${selectedPhotos.size})`}
            </button>
          )}
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-full font-medium transition-all text-sm shadow-sm"
          >
            <PlusIcon className="w-4 h-4" />
            {language === 'ar' ? 'إضافة صورة' : 'Add Photo'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showHidden}
            onChange={(e) => setShowHidden(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-700 dark:text-zinc-300">
            {language === 'ar' ? 'عرض المخفي' : 'Show Hidden'}
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => setShowDeleted(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-700 dark:text-zinc-300">
            {language === 'ar' ? 'عرض المحذوف' : 'Show Deleted'}
          </span>
        </label>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-zinc-800 rounded-lg">
          <p className="text-gray-600 dark:text-zinc-400">
            {language === 'ar' ? 'لا توجد صور' : 'No photos found'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-zinc-900 rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
              <tr>
                <th className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedPhotos.size === photos.length && photos.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                  {language === 'ar' ? 'الصورة' : 'Image'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                  {language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (EN)'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                  {language === 'ar' ? 'العنوان (عربي)' : 'Title (AR)'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                  {language === 'ar' ? 'تاريخ النشر' : 'Published'}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                  {language === 'ar' ? 'التخزين' : 'Storage'}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                  {language === 'ar' ? 'مميز' : 'Featured'}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                  {language === 'ar' ? 'إجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {photos.map((photo) => (
                <tr
                  key={photo.id}
                  className={`hover:bg-gray-50 dark:hover:bg-zinc-800 ${
                    photo.is_deleted ? 'opacity-50 bg-red-50 dark:bg-red-900/10' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedPhotos.has(photo.id)}
                      onChange={() => handleSelectPhoto(photo.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <img
                      src={photo.image_url}
                      alt={photo.title_en}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-zinc-100">
                    {photo.title_en}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-zinc-100" dir="rtl">
                    {photo.title_ar}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-zinc-400">
                    {formatDate(photo.published_date)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={
                      `text-xs px-2 py-1 rounded font-semibold ${
                        photo.storage_type === 'blob'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200' 
                          : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                      }`
                    }>
                      {photo.storage_type === 'blob' 
                        ? (language === 'ar' ? 'مكتبة' : 'Library') 
                        : (language === 'ar' ? 'محلي' : 'Local')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {photo.is_featured && (
                      <StarIcon className="w-5 h-5 inline fill-current" style={{ color: 'var(--color-accent)' }} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleToggleVisibility(photo.id, photo.is_visible)}
                        className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full text-sm font-medium hover:border-gray-400 dark:hover:border-zinc-500 transition-all inline-flex items-center justify-center"
                        aria-label={photo.is_visible ? (language === 'ar' ? 'إخفاء' : 'Hide') : (language === 'ar' ? 'إظهار' : 'Show')}
                        title={photo.is_visible ? (language === 'ar' ? 'إخفاء' : 'Hide') : (language === 'ar' ? 'إظهار' : 'Show')}
                      >
                        {photo.is_visible ? (
                          <EyeIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <EyeSlashIcon className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(photo)}
                        className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full text-sm font-medium hover:border-gray-400 dark:hover:border-zinc-500 transition-all inline-flex items-center justify-center"
                        aria-label={language === 'ar' ? 'تعديل' : 'Edit'}
                        title={language === 'ar' ? 'تعديل' : 'Edit'}
                      >
                        <PencilIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </button>
                      {!photo.is_deleted && (
                        <button
                          onClick={() => handleDelete(photo.id)}
                          className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full text-sm font-medium hover:border-gray-400 dark:hover:border-zinc-500 transition-all inline-flex items-center justify-center"
                          aria-label={language === 'ar' ? 'حذف' : 'Delete'}
                          title={language === 'ar' ? 'حذف' : 'Delete'}
                        >
                          <TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col gap-4">
          {/* All pagination elements */}
          <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:justify-center md:gap-2">
            {/* First Row: First and Previous */}
            <div className="flex items-center justify-center gap-2 md:contents">
              <button
                onClick={() => setPagination({ ...pagination, page: 1 })}
                disabled={pagination.page === 1}
                className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-zinc-300 font-medium transition-all text-sm"
              >
                {language === 'ar' ? 'الأولى' : 'First'}
              </button>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-zinc-300 font-medium transition-all text-sm"
              >
                {language === 'ar' ? 'السابق' : 'Previous'}
              </button>
            </div>

            {/* Third Row: Next and Last */}
            <div className="flex items-center justify-center gap-2 md:contents">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-zinc-300 font-medium transition-all text-sm"
              >
                {language === 'ar' ? 'التالي' : 'Next'}
              </button>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.totalPages })}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-gray-400 dark:hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-zinc-300 font-medium transition-all text-sm"
              >
                {language === 'ar' ? 'الأخيرة' : 'Last'}
              </button>
            </div>

            {/* Showing count info */}
            <div className="flex items-center justify-center md:contents">
              <span className="text-sm text-gray-600 dark:text-zinc-400">
                {language === 'ar'
                  ? `عرض ${(pagination.page - 1) * pagination.limit + 1} - ${Math.min(pagination.page * pagination.limit, pagination.total)} من ${pagination.total}`
                  : `Showing ${(pagination.page - 1) * pagination.limit + 1} - ${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total}`
                }
              </span>
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center justify-center gap-2 md:contents">
              <label className="text-sm text-gray-600 dark:text-zinc-400">
                {language === 'ar' ? 'عرض:' : 'Show:'}
              </label>
              <select
                value={pagination.limit}
                onChange={(e) => setPagination({ ...pagination, limit: Number(e.target.value), page: 1 })}
                className="px-3 py-1.5 border-2 border-gray-300 dark:border-zinc-600 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all cursor-pointer"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="500">500</option>
              </select>
            </div>
          </div>
      </div>

      {/* Photo Form Modal */}
      {showForm && <PhotoForm photo={editingPhoto} onClose={handleFormClose} />}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title={language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
          message={language === 'ar' ? 'هل أنت متأكد من حذف هذه الصورة؟ يمكن استعادتها لاحقاً.' : 'Are you sure you want to delete this photo? It can be restored later.'}
          confirmText={language === 'ar' ? 'حذف' : 'Delete'}
          cancelText={language === 'ar' ? 'إلغاء' : 'Cancel'}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDeletingPhotoId(null);
          }}
        />
      )}

      {/* Bulk Delete Confirmation Dialog */}
      {showBulkDeleteConfirm && (
        <ConfirmDialog
          isOpen={showBulkDeleteConfirm}
          title={language === 'ar' ? 'تأكيد الحذف الجماعي' : 'Confirm Bulk Delete'}
          message={language === 'ar' 
            ? `هل أنت متأكد من حذف ${selectedPhotos.size} صورة؟ يمكن استعادتها لاحقاً.` 
            : `Are you sure you want to delete ${selectedPhotos.size} photos? They can be restored later.`}
          confirmText={language === 'ar' ? 'حذف الكل' : 'Delete All'}
          cancelText={language === 'ar' ? 'إلغاء' : 'Cancel'}
          onConfirm={confirmBulkDelete}
          onCancel={() => setShowBulkDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
