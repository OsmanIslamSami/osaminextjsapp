'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useToast } from '@/lib/components/ToastContainer';
import ConfirmDialog from '@/lib/components/ConfirmDialog';
import PartnerForm from '@/lib/components/admin/PartnerForm';
import { EyeIcon, EyeSlashIcon, PencilIcon, TrashIcon, PlusIcon, StarIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface Partner {
  id: string;
  title_en: string;
  title_ar: string;
  image_url: string;
  url: string;
  storage_type: string;
  is_featured: boolean;
  is_visible: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  createdByUser?: { name: string | null; email: string };
  updatedByUser?: { name: string | null; email: string };
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingPartnerId, setDeletingPartnerId] = useState<string | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedPartners, setSelectedPartners] = useState<Set<string>>(new Set());
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
    fetchPartners();
  }, [showHidden, showDeleted, pagination.page]);

  async function fetchPartners() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        context: 'admin',
        page: String(pagination.page),
        limit: String(pagination.limit),
        includeHidden: String(showHidden),
        includeDeleted: String(showDeleted),
      });

      const response = await fetch(`/api/partners?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch partners');
      }

      const data = await response.json();
      setPartners(data.data || []);
      setPagination(data.pagination);
    } catch (err) {
      showError(language === 'ar' ? 'فشل تحميل الشركاء' : 'Failed to load partners');
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = () => {
    setEditingPartner(null);
    setShowForm(true);
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPartner(null);
    fetchPartners();
  };

  const handleDelete = async (id: string) => {
    setDeletingPartnerId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingPartnerId) return;

    try {
      const response = await fetch(`/api/partners/${deletingPartnerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete partner');
      }

      showSuccess(language === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully');
      fetchPartners();
    } catch (err) {
      showError(language === 'ar' ? 'فشل الحذف' : 'Failed to delete');
    } finally {
      setShowDeleteConfirm(false);
      setDeletingPartnerId(null);
    }
  };

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const response = await fetch(`/api/partners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_visible: !currentVisibility }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle visibility');
      }

      showSuccess(language === 'ar' ? 'تم التحديث' : 'Updated successfully');
      fetchPartners();
    } catch (err) {
      showError(language === 'ar' ? 'فشل التحديث' : 'Failed to update');
    }
  };

  const handleSelectAll = () => {
    if (selectedPartners.size === partners.length) {
      setSelectedPartners(new Set());
    } else {
      setSelectedPartners(new Set(partners.map(partner => partner.id)));
    }
  };

  const handleSelectPartner = (id: string) => {
    const newSelected = new Set(selectedPartners);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPartners(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedPartners.size === 0) return;
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    try {
      const deletePromises = Array.from(selectedPartners).map(id =>
        fetch(`/api/partners/${id}`, { method: 'DELETE' })
      );

      const results = await Promise.all(deletePromises);
      const failedCount = results.filter(r => !r.ok).length;

      if (failedCount > 0) {
        showError(
          language === 'ar' 
            ? `فشل حذف ${failedCount} من ${selectedPartners.size} شريك` 
            : `Failed to delete ${failedCount} of ${selectedPartners.size} partners`
        );
      } else {
        showSuccess(
          language === 'ar' 
            ? `تم حذف ${selectedPartners.size} شريك بنجاح` 
            : `Successfully deleted ${selectedPartners.size} partners`
        );
      }

      setSelectedPartners(new Set());
      fetchPartners();
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
            {language === 'ar' ? 'إدارة الشركاء' : 'Manage Partners'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
            {language === 'ar' 
              ? `${pagination.total} شريك إجمالاً` 
              : `${pagination.total} total partners`}
            {selectedPartners.size > 0 && (
              <span className="mx-2 text-blue-600 dark:text-blue-400 font-semibold">
                ({language === 'ar' 
                  ? `${selectedPartners.size} محدد` 
                  : `${selectedPartners.size} selected`})
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {selectedPartners.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition-all text-sm shadow-sm"
            >
              <TrashIcon className="w-4 h-4" />
              {language === 'ar' ? `حذف المحدد (${selectedPartners.size})` : `Delete Selected (${selectedPartners.size})`}
            </button>
          )}
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-full font-medium transition-all text-sm shadow-sm"
          >
            <PlusIcon className="w-4 h-4" />
            {language === 'ar' ? 'إضافة شريك' : 'Add Partner'}
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
      ) : partners.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-zinc-800 rounded-lg">
          <p className="text-gray-600 dark:text-zinc-400">
            {language === 'ar' ? 'لا يوجد شركاء' : 'No partners found'}
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
                    checked={selectedPartners.size === partners.length && partners.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                  {language === 'ar' ? 'الشعار' : 'Logo'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                  {language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (EN)'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                  {language === 'ar' ? 'الاسم (عربي)' : 'Name (AR)'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                  {language === 'ar' ? 'رابط الموقع' : 'Website URL'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                  {language === 'ar' ? 'تاريخ الإنشاء' : 'Created'}
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
              {partners.map((partner) => (
                <tr
                  key={partner.id}
                  className={`hover:bg-gray-50 dark:hover:bg-zinc-800 ${
                    partner.is_deleted ? 'opacity-50 bg-red-50 dark:bg-red-900/10' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedPartners.has(partner.id)}
                      onChange={() => handleSelectPartner(partner.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <img
                      src={partner.image_url}
                      alt={partner.title_en}
                      className="w-16 h-16 object-contain"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-zinc-100">
                    {partner.title_en}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-zinc-100" dir="rtl">
                    {partner.title_ar}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <a
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <span className="truncate max-w-[200px]">{partner.url}</span>
                      <ArrowTopRightOnSquareIcon className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-zinc-400">
                    {formatDate(partner.created_at)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {partner.is_featured && (
                      <StarIcon className="w-5 h-5 inline fill-current" style={{ color: 'var(--color-accent)' }} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleVisibility(partner.id, partner.is_visible)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded"
                      title={partner.is_visible ? 'Hide' : 'Show'}
                    >
                      {partner.is_visible ? (
                        <EyeIcon className="w-5 h-5 text-green-600" />
                      ) : (
                        <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(partner)}
                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded text-blue-600 dark:text-blue-400"
                        title="Edit"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      {!partner.is_deleted && (
                        <button
                          onClick={() => handleDelete(partner.id)}
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

      {/* Partner Form Modal */}
      {showForm && <PartnerForm partner={editingPartner} onClose={handleFormClose} />}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title={language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
          message={language === 'ar' ? 'هل أنت متأكد من حذف هذا الشريك؟ يمكن استعادته لاحقاً.' : 'Are you sure you want to delete this partner? It can be restored later.'}
          confirmText={language === 'ar' ? 'حذف' : 'Delete'}
          cancelText={language === 'ar' ? 'إلغاء' : 'Cancel'}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDeletingPartnerId(null);
          }}
        />
      )}

      {/* Bulk Delete Confirmation Dialog */}
      {showBulkDeleteConfirm && (
        <ConfirmDialog
          isOpen={showBulkDeleteConfirm}
          title={language === 'ar' ? 'تأكيد الحذف الجماعي' : 'Confirm Bulk Delete'}
          message={language === 'ar' 
            ? `هل أنت متأكد من حذف ${selectedPartners.size} شريك؟ يمكن استعادتهم لاحقاً.` 
            : `Are you sure you want to delete ${selectedPartners.size} partners? They can be restored later.`}
          confirmText={language === 'ar' ? 'حذف الكل' : 'Delete All'}
          cancelText={language === 'ar' ? 'إلغاء' : 'Cancel'}
          onConfirm={confirmBulkDelete}
          onCancel={() => setShowBulkDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
