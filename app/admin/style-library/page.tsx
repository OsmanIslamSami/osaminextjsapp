'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  FolderIcon,
  FolderOpenIcon,
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ArrowUpTrayIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  FolderPlusIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  path: string;
  description: string | null;
  _count: {
    files: number;
    children: number;
  };
  children?: Folder[];
}

interface File {
  id: string;
  folder_id: string | null;
  name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  description: string | null;
  tags: string[];
  created_at: string;
  folder?: {
    id: string;
    name: string;
    path: string;
  };
}

export default function StyleLibraryPage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [totalFileCount, setTotalFileCount] = useState(0);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // Multi-select state
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);
  
  // Modals
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFileDetailsModal, setShowFileDetailsModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch folders
  const fetchFolders = useCallback(async () => {
    try {
      const response = await fetch('/api/style-library/folders');
      if (!response.ok) throw new Error('Failed to fetch folders');
      const data = await response.json();
      setFolders(data.folders || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  }, []);

  // File selection handlers
  const toggleFileSelection = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedFileIds);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFileIds(newSelected);
  };

  const selectAllFiles = () => {
    if (selectedFileIds.size === files.length) {
      setSelectedFileIds(new Set());
    } else {
      setSelectedFileIds(new Set(files.map(f => f.id)));
    }
  };

  const copyFilePath = async (fileUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(fileUrl);
      alert('File URL copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy URL');
    }
  };

  const handleDeleteFile = async (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFilesToDelete([fileId]);
    setShowDeleteConfirm(true);
  };

  const handleBulkDelete = () => {
    setFilesToDelete(Array.from(selectedFileIds));
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      for (const fileId of filesToDelete) {
        const response = await fetch('/api/style-library/files/' + fileId, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete file');
        }
      }
      setShowDeleteConfirm(false);
      setFilesToDelete([]);
      setSelectedFileIds(new Set());
      fetchFiles();
    } catch (error) {
      console.error('Error deleting files:', error);
      alert('Failed to delete some files');
    }
  };

  // Fetch files
  const fetchFiles = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedFolderId) {
        params.append('folder_id', selectedFolderId);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/style-library/files?${params}`);
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      setFiles(data.files || []);
      
      // Also fetch total count if we're filtering
      if (selectedFolderId || searchQuery) {
        const totalResponse = await fetch('/api/style-library/files');
        if (totalResponse.ok) {
          const totalData = await totalResponse.json();
          setTotalFileCount(totalData.files?.length || 0);
        }
      } else {
        setTotalFileCount(data.files?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  }, [selectedFolderId, searchQuery]);

  useEffect(() => {
    Promise.all([fetchFolders(), fetchFiles()]).finally(() => setLoading(false));
  }, [fetchFolders, fetchFiles]);

  // Build folder hierarchy
  const buildFolderTree = (folders: Folder[]): Folder[] => {
    const folderMap = new Map<string, Folder>();
    const rootFolders: Folder[] = [];

    folders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [] });
    });

    folders.forEach(folder => {
      const folderNode = folderMap.get(folder.id)!;
      if (folder.parent_id) {
        const parent = folderMap.get(folder.parent_id);
        if (parent) {
          parent.children!.push(folderNode);
        }
      } else {
        rootFolders.push(folderNode);
      }
    });

    return rootFolders;
  };

  const folderTree = buildFolderTree(folders);

  // Toggle folder expansion
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  // Render folder tree recursively
  const renderFolderTree = (folders: Folder[], level = 0): React.ReactElement[] => {
    return folders.map(folder => {
      const isExpanded = expandedFolders.has(folder.id);
      const isSelected = selectedFolderId === folder.id;
      const hasChildren = folder.children && folder.children.length > 0;

      return (
        <div key={folder.id}>
          <div
            className={`flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-gray-100 rounded ${
              isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''
            }`}
            style={{ paddingLeft: `${level * 20 + 12}px` }}
            onClick={() => setSelectedFolderId(folder.id)}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(folder.id);
                }}
                className="p-0.5"
              >
                {isExpanded ? (
                  <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                )}
              </button>
            )}
            {!hasChildren && <span className="w-5" />}
            
            {isExpanded ? (
              <FolderOpenIcon className="w-5 h-5 text-blue-600" />
            ) : (
              <FolderIcon className="w-5 h-5 text-blue-600" />
            )}
            
            <span className="text-sm font-medium text-gray-900 flex-1">
              {folder.name}
            </span>
            
            <span className="text-xs text-gray-500">
              {folder._count.files}
            </span>
          </div>
          
          {isExpanded && hasChildren && (
            <div>{renderFolderTree(folder.children!, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  // Get file icon
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <PhotoIcon className="w-6 h-6 text-blue-600" />;
    } else if (fileType.startsWith('video/')) {
      return <VideoCameraIcon className="w-6 h-6 text-purple-600" />;
    } else {
      return <DocumentIcon className="w-6 h-6 text-gray-600" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Style Library</h1>
              <p className="text-sm text-gray-600 mt-1">
                Centralized asset management for your website
              </p>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowNewFolderModal(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-h-[44px]"
              >
                <FolderPlusIcon className="w-5 h-5" />
                <span className="hidden sm:inline">New Folder</span>
              </button>
              
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px]"
              >
                <ArrowUpTrayIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Upload Files</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row h-auto md:h-[calc(100vh-200px)] min-h-[600px]">
        {/* Sidebar - Folder Tree */}
        <div className="w-full md:w-80 bg-white border-b md:border-r md:border-b-0 overflow-y-auto max-h-64 md:max-h-full">
          <div className="p-4 border-b">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Folders</h2>
            
            <button
              onClick={() => setSelectedFolderId(null)}
              className={`w-full flex items-center gap-2 py-2 px-3 rounded hover:bg-gray-100 ${
                selectedFolderId === null ? 'bg-blue-50 border-l-4 border-blue-600' : ''
              }`}
            >
              <FolderIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">All Files</span>
              <span className="ml-auto text-xs text-gray-500">{totalFileCount}</span>
            </button>
          </div>
          
          <div className="p-2">
            {renderFolderTree(folderTree)}
          </div>
        </div>

        {/* Main Content - File List */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 md:p-6">
            {/* Search and View Controls */}
            <div className="mb-6 flex items-center gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Bulk Actions */}
              {selectedFileIds.size > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedFileIds.size} selected
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedFileIds(new Set())}
                    className="p-1 hover:bg-blue-100 rounded"
                  >
                    <XMarkIcon className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              )}
              
              <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={'px-3 py-1 rounded ' + (viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600')}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={'px-3 py-1 rounded ' + (viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600')}
                >
                  List
                </button>
              </div>
            </div>

            {/* File Grid */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {files.map(file => (
                  <div
                    key={file.id}
                    className={'bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer group relative ' + (selectedFileIds.has(file.id) ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200')}
                    onClick={() => {
                      setSelectedFile(file);
                      setShowFileDetailsModal(true);
                    }}
                  >
                    {/* Checkbox in top-left */}
                    <div className="absolute top-2 left-2 z-10">
                      <button
                        onClick={(e) => toggleFileSelection(file.id, e)}
                        className={'w-4 h-4 min-h-0 rounded-sm flex items-center justify-center transition-all shadow-sm flex-shrink-0 ' + (selectedFileIds.has(file.id) ? 'bg-blue-600 border border-blue-600 scale-110' : 'bg-white border border-gray-300 group-hover:border-blue-500 group-hover:shadow-md')}
                        style={{ minHeight: '16px', minWidth: '16px' }}
                      >
                        {selectedFileIds.has(file.id) && (
                          <CheckIcon className="w-3 h-3 text-white stroke-2" />
                        )}
                      </button>
                    </div>

                    {/* Action buttons in top-right */}
                    <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => copyFilePath(file.file_url, e)}
                        className="w-7 h-7 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 shadow-sm"
                        title="Copy URL"
                      >
                        <ClipboardDocumentIcon className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteFile(file.id, e)}
                        className="w-7 h-7 bg-white border border-red-300 rounded flex items-center justify-center hover:bg-red-50 shadow-sm"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4 text-red-600" />
                      </button>
                    </div>

                    {file.file_type.startsWith('image/') ? (
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                        <img
                          src={file.file_url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : file.file_type.startsWith('video/') ? (
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                        <VideoCameraIcon className="w-12 h-12 text-purple-600" />
                      </div>
                    ) : (
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                        <DocumentIcon className="w-12 h-12 text-gray-600" />
                      </div>
                    )}
                    
                    <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
                      {file.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.file_size)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* File List */}
            {viewMode === 'list' && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 w-12">
                        <button
                          onClick={selectAllFiles}
                          className={'w-4 h-4 min-h-0 rounded-sm flex items-center justify-center transition-all shadow-sm flex-shrink-0 ' + (selectedFileIds.size === files.length && files.length > 0 ? 'bg-blue-600 border border-blue-600' : 'bg-white border border-gray-300 hover:border-blue-500')}
                          style={{ minHeight: '16px', minWidth: '16px' }}
                        >
                          {selectedFileIds.size === files.length && files.length > 0 && (
                            <CheckIcon className="w-2.5 h-2.5 text-white stroke-2" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Folder
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Uploaded
                      </th>
                      <th className="px-4 py-2 w-24 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {files.map(file => (
                      <tr
                        key={file.id}
                        className={'hover:bg-gray-50 cursor-pointer transition-colors ' + (selectedFileIds.has(file.id) ? 'bg-blue-50' : '')}
                        onClick={() => {
                          setSelectedFile(file);
                          setShowFileDetailsModal(true);
                        }}
                      >
                        <td className="px-4 py-2.5">
                          <button
                            onClick={(e) => toggleFileSelection(file.id, e)}
                            className={'w-4 h-4 min-h-0 rounded-sm flex items-center justify-center transition-all shadow-sm flex-shrink-0 ' + (selectedFileIds.has(file.id) ? 'bg-blue-600 border border-blue-600' : 'bg-white border border-gray-300 hover:border-blue-500')}
                            style={{ minHeight: '16px', minWidth: '16px' }}
                          >
                            {selectedFileIds.has(file.id) && (
                              <CheckIcon className="w-2.5 h-2.5 text-white stroke-2" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            {getFileIcon(file.file_type)}
                            <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {file.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-sm text-gray-600 capitalize">
                          {file.file_type.split('/')[0]}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-gray-600">
                          {formatFileSize(file.file_size)}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-gray-600">
                          {file.folder?.name || 'Root'}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-gray-600">
                          {new Date(file.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => copyFilePath(file.file_url, e)}
                              className="p-1.5 hover:bg-blue-50 rounded transition-colors"
                              title="Copy URL"
                            >
                              <ClipboardDocumentIcon className="w-4 h-4 text-gray-500 hover:text-blue-600" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteFile(file.id, e)}
                              className="p-1.5 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <TrashIcon className="w-4 h-4 text-gray-500 hover:text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {files.length === 0 && (
              <div className="text-center py-12">
                <FolderIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'Upload files to get started'}
                </p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <ArrowUpTrayIcon className="w-5 h-5" />
                  Upload Files
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showNewFolderModal && (
        <NewFolderModal
          currentFolderId={selectedFolderId}
          onClose={() => setShowNewFolderModal(false)}
          onSuccess={() => {
            fetchFolders();
            setShowNewFolderModal(false);
          }}
        />
      )}

      {showUploadModal && (
        <UploadFileModal
          folderId={selectedFolderId}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            fetchFiles();
            setShowUploadModal(false);
          }}
        />
      )}

      {showFileDetailsModal && selectedFile && (
        <FileDetailsModal
          file={selectedFile}
          onClose={() => {
            setShowFileDetailsModal(false);
            setSelectedFile(null);
          }}
          onUpdate={() => {
            fetchFiles();
          }}
          onDelete={() => {
            fetchFiles();
            setShowFileDetailsModal(false);
            setSelectedFile(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <TrashIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete {filesToDelete.length === 1 ? 'File' : 'Files'}
                </h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete {filesToDelete.length === 1 ? 'this file' : filesToDelete.length + ' files'}? This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setFilesToDelete([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// New Folder Modal Component
function NewFolderModal({
  currentFolderId,
  onClose,
  onSuccess,
}: {
  currentFolderId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/style-library/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          parent_id: currentFolderId,
          description: description || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create folder');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Folder</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Folder Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Slider Images"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Optional description"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Upload File Modal Component
function UploadFileModal({
  folderId,
  onClose,
  onSuccess,
}: {
  folderId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingReplaceFile, setPendingReplaceFile] = useState<{
    file: globalThis.File;
    existingFile: any;
  } | null>(null);

  const uploadFile = async (fileToUpload: globalThis.File, replaceExisting = false): Promise<
    { isDuplicate: false } | { isDuplicate: true; existingFile: any; file: globalThis.File }
  > => {
    const formData = new FormData();
    formData.append('file', fileToUpload);
    if (folderId) formData.append('folder_id', folderId);
    if (description) formData.append('description', description);
    if (tags) formData.append('tags', tags);
    if (replaceExisting) formData.append('replace_existing', 'true');

    const response = await fetch('/api/style-library/files', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      
      // Check if it's a duplicate file error
      if (response.status === 409 && data.error === 'FILE_EXISTS') {
        return { isDuplicate: true, existingFile: data.existingFile, file: fileToUpload };
      }
      
      throw new Error(data.error || 'Failed to upload ' + fileToUpload.name);
    }

    return { isDuplicate: false };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setError('');
    setLoading(true);
    setProgress(0);

    try {
      const totalFiles = selectedFiles.length;
      let uploaded = 0;

      for (const file of Array.from(selectedFiles)) {
        const result = await uploadFile(file);
        
        if (result.isDuplicate) {
          // Show confirmation dialog for this file
          setPendingReplaceFile({ file: result.file, existingFile: result.existingFile });
          setShowConfirmDialog(true);
          setLoading(false);
          return; // Stop processing and wait for user confirmation
        }

        uploaded++;
        setProgress(Math.round((uploaded / totalFiles) * 100));
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReplace = async () => {
    if (!pendingReplaceFile) return;

    setShowConfirmDialog(false);
    setLoading(true);
    setError('');

    try {
      // Upload with replace flag
      await uploadFile(pendingReplaceFile.file, true);
      setPendingReplaceFile(null);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReplace = () => {
    setShowConfirmDialog(false);
    setPendingReplaceFile(null);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Files</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Files *
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => setSelectedFiles(e.target.files)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              accept="image/*,video/*,.pdf"
            />
            {selectedFiles && (
              <p className="text-sm text-gray-600 mt-2">
                {selectedFiles.length} file(s) selected
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={2}
              placeholder="Optional description for all files"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., banner, promotional, 2026"
            />
          </div>

          {loading && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Uploading... {progress}%
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {showConfirmDialog && pendingReplaceFile && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ File Already Exists</h3>
              <p className="text-sm text-yellow-800 mb-3">
                A file named <strong>{pendingReplaceFile.file.name}</strong> already exists in this folder.
              </p>
              <div className="text-xs text-yellow-700 mb-4 bg-yellow-100 p-2 rounded border border-yellow-200">
                <div><strong>Existing file:</strong></div>
                <div>Name: {pendingReplaceFile.existingFile.name}</div>
                <div>Uploaded: {new Date(pendingReplaceFile.existingFile.created_at).toLocaleString()}</div>
                <div>Size: {pendingReplaceFile.existingFile.file_size ? Math.round(pendingReplaceFile.existingFile.file_size / 1024) + ' KB' : 'Unknown'}</div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleConfirmReplace}
                  className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
                >
                  Replace Existing File
                </button>
                <button
                  type="button"
                  onClick={handleCancelReplace}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                >
                  Cancel Upload
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// File Details Modal Component
function FileDetailsModal({
  file,
  onClose,
  onUpdate,
  onDelete,
}: {
  file: File;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/style-library/files/${file.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      onDelete();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('URL copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">File Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {file.file_type.startsWith('image/') && (
          <div className="mb-4 bg-gray-100 rounded-lg p-4">
            <img
              src={file.file_url}
              alt={file.name}
              className="max-w-full max-h-96 mx-auto rounded"
            />
          </div>
        )}

        {file.file_type.startsWith('video/') && (
          <div className="mb-4 bg-gray-100 rounded-lg p-4">
            <video
              src={file.file_url}
              controls
              className="max-w-full max-h-96 mx-auto rounded"
            />
          </div>
        )}

        <div className="space-y-3 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File Name
            </label>
            <p className="text-sm text-gray-900">{file.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={file.file_url}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={() => copyToClipboard(file.file_url)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <p className="text-sm text-gray-900">{file.file_type}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size
              </label>
              <p className="text-sm text-gray-900">
                {(file.file_size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          {(file.width || file.height) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dimensions
              </label>
              <p className="text-sm text-gray-900">
                {file.width} × {file.height} px
              </p>
            </div>
          )}

          {file.folder && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Folder
              </label>
              <p className="text-sm text-gray-900">{file.folder.path}</p>
            </div>
          )}

          {file.description && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <p className="text-sm text-gray-900">{file.description}</p>
            </div>
          )}

          {file.tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {file.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end border-t pt-4">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete File'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
