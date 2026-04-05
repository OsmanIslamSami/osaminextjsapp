'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useToast } from '@/lib/components/ToastContainer';
import ConfirmDialog from '@/lib/components/ConfirmDialog';
import VideoForm from '@/lib/components/admin/VideoForm';
import { EyeIcon, EyeSlashIcon, PencilIcon, TrashIcon, PlusIcon, StarIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface Video {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string | null;
  description_ar: string | null;
  youtube_url: string;
  video_id: string;
  thumbnail_url: string | null;
  published_date: string;
  is_featured: boolean;
  is_visible: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  createdByUser?: { name: string | null; email: string };
  updatedByUser?: { name: string | null; email: string };
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const { language, direction, t } = useLanguage();
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    fetchVideos();
  }, [showHidden, showDeleted, pagination.page]);

  async function fetchVideos() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        context: 'admin',
        page: String(pagination.page),
        limit: String(pagination.limit),
        includeHidden: String(showHidden),
        includeDeleted: String(showDeleted),
      });

      const response = await fetch(`/api/videos?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      setVideos(data.data || []);
      setPagination(data.pagination);
    } catch (err) {
      showError(language === 'ar' ? 'فشل تحميل الفيديوهات' : 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = () => {
    setEditingVideo(null);
    setShowForm(true);
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingVideo(null);
    fetchVideos();
  };

  const handleDelete = async (id: string) => {
    setDeletingVideoId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingVideoId) return;

    try {
      const response = await fetch(`/api/videos/${deletingVideoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete video');
      }

      showSuccess(language === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully');
      fetchVideos();
    } catch (err) {
      showError(language === 'ar' ? 'فشل الحذف' : 'Failed to delete');
    } finally {
      setShowDeleteConfirm(false);
      setDeletingVideoId(null);
    }
  };

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const response = await fetch(`/api/videos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_visible: !currentVisibility }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle visibility');
      }

      showSuccess(language === 'ar' ? 'تم التحديث' : 'Updated successfully');
      fetchVideos();
    } catch (err) {
      showError(language === 'ar' ? 'فشل التحديث' : 'Failed to update');
    }
  };

  const handleSelectAll = () => {
    if (selectedVideos.size === videos.length) {
      setSelectedVideos(new Set());
    } else {
      setSelectedVideos(new Set(videos.map(video => video.id)));
    }
  };

  const handleSelectVideo = (id: string) => {
    const newSelected = new Set(selectedVideos);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedVideos(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedVideos.size === 0) return;
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    try {
      const deletePromises = Array.from(selectedVideos).map(id =>
        fetch(`/api/videos/${id}`, { method: 'DELETE' })
      );

      const results = await Promise.all(deletePromises);
      const failedCount = results.filter(r => !r.ok).length;

      if (failedCount > 0) {
        showError(
          language === 'ar' 
            ? `فشل حذف ${failedCount} من ${selectedVideos.size} فيديو` 
            : `Failed to delete ${failedCount} of ${selectedVideos.size} videos`
        );
      } else {
        showSuccess(
          language === 'ar' 
            ? `تم حذف ${selectedVideos.size} فيديو بنجاح` 
            : `Successfully deleted ${selectedVideos.size} videos`
        );
      }

      setSelectedVideos(new Set());
      fetchVideos();
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
            {language === 'ar' ? 'إدارة الفيديوهات' : 'Manage Videos'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
            {language === 'ar' 
              ? `${pagination.total} فيديو إجمالاً` 
              : `${pagination.total} total videos`}
            {selectedVideos.size > 0 && (
              <span className="mx-2 font-semibold" style={{ color: 'var(--color-primary)' }}>
                ({language === 'ar' 
                  ? `${selectedVideos.size} محدد` 
                  : `${selectedVideos.size} selected`})
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {selectedVideos.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition-all text-sm shadow-sm"
            >
              <TrashIcon className="w-4 h-4" />
              {language === 'ar' ? `حذف المحدد (${selectedVideos.size})` : `Delete Selected (${selectedVideos.size})`}
            </button>
          )}
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-full font-medium transition-all text-sm shadow-sm"
            style={{
              backgroundColor: 'var(--color-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary)';
            }}
          >
            <PlusIcon className="w-5 h-5" />
            {language === 'ar' ? 'إضافة فيديو' : 'Add Video'}
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
      ) : videos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-zinc-800 rounded-lg">
          <p className="text-gray-600 dark:text-zinc-400">
            {language === 'ar' ? 'لا توجد فيديوهات' : 'No videos found'}
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
                    checked={selectedVideos.size === videos.length && videos.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                  {language === 'ar' ? 'الصورة المصغرة' : 'Thumbnail'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                  {language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (EN)'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                  {language === 'ar' ? 'العنوان (عربي)' : 'Title (AR)'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                  {language === 'ar' ? 'رابط YouTube' : 'YouTube URL'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                  {language === 'ar' ? 'تاريخ النشر' : 'Published'}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                  {language === 'ar' ? 'مميز' : 'Featured'}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                  {language === 'ar' ? 'مرئي' : 'Visible'}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                  {language === 'ar' ? 'إجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {videos.map((video) => (
                <tr
                  key={video.id}
                  className={`hover:bg-gray-50 dark:hover:bg-zinc-800 ${
                    video.is_deleted ? 'opacity-50 bg-red-50 dark:bg-red-900/10' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedVideos.has(video.id)}
                      onChange={() => handleSelectVideo(video.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <img
                      src={video.thumbnail_url || `https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                      alt={video.title_en}
                      className="w-24 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-zinc-100">
                    {video.title_en}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-zinc-100" dir="rtl">
                    {video.title_ar}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <a
                      href={video.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      <span className="truncate max-w-[200px]">{video.youtube_url}</span>
                      <ArrowTopRightOnSquareIcon className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-zinc-400">
                    {formatDate(video.published_date)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {video.is_featured && (
                      <StarIcon className="w-5 h-5 inline fill-current" style={{ color: 'var(--color-accent)' }} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleVisibility(video.id, video.is_visible)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded"
                      title={video.is_visible ? 'Hide' : 'Show'}
                    >
                      {video.is_visible ? (
                        <EyeIcon className="w-5 h-5 text-green-600" />
                      ) : (
                        <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(video)}
                        className="p-2 rounded transition-colors"
                        style={{ color: 'var(--color-primary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-primary-light)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        title="Edit"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      {!video.is_deleted && (
                        <button
                          onClick={() => handleDelete(video.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
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

      {/* Video Form Modal */}
      {showForm && <VideoForm video={editingVideo} onClose={handleFormClose} />}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title={language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
          message={language === 'ar' ? 'هل أنت متأكد من حذف هذا الفيديو؟ يمكن استعادته لاحقاً.' : 'Are you sure you want to delete this video? It can be restored later.'}
          confirmText={language === 'ar' ? 'حذف' : 'Delete'}
          cancelText={language === 'ar' ? 'إلغاء' : 'Cancel'}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDeletingVideoId(null);
          }}
        />
      )}

      {/* Bulk Delete Confirmation Dialog */}
      {showBulkDeleteConfirm && (
        <ConfirmDialog
          isOpen={showBulkDeleteConfirm}
          title={language === 'ar' ? 'تأكيد الحذف الجماعي' : 'Confirm Bulk Delete'}
          message={language === 'ar' 
            ? `هل أنت متأكد من حذف ${selectedVideos.size} فيديو؟ يمكن استعادتها لاحقاً.` 
            : `Are you sure you want to delete ${selectedVideos.size} videos? They can be restored later.`}
          confirmText={language === 'ar' ? 'حذف الكل' : 'Delete All'}
          cancelText={language === 'ar' ? 'إلغاء' : 'Cancel'}
          onConfirm={confirmBulkDelete}
          onCancel={() => setShowBulkDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
