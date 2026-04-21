'use client';

import { useState, useEffect } from 'react';
import {
  FolderIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/lib/components/ui/LoadingSpinner';
import { logger } from '@/lib/utils/logger';

interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  path: string;
  _count: {
    files: number;
  };
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
  thumbnail_url: string | null;
  folder?: {
    id: string;
    name: string;
    path: string;
  };
}

interface FilePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (file: File) => void;
  fileType?: 'image' | 'video' | 'all'; // Filter by file type
  title?: string;
}

export default function FilePicker({
  isOpen,
  onClose,
  onSelect,
  fileType = 'all',
  title = 'Select a File'
}: FilePickerProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchFolders();
      fetchFiles();
    }
  }, [isOpen, selectedFolderId, searchQuery, fileType]);

  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/style-library/folders');
      if (!response.ok) throw new Error('Failed to fetch folders');
      const data = await response.json();
      setFolders(data.folders || []);
    } catch (error) {
      logger.error('Error fetching folders:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedFolderId) {
        params.append('folder_id', selectedFolderId);
      }
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (fileType !== 'all') {
        params.append('file_type', fileType);
      }

      const response = await fetch(`/api/style-library/files?${params}`);
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      logger.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (file: File) => {
    onSelect(file);
    onClose();
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <PhotoIcon className="w-5 h-5 text-blue-600" />;
    } else if (fileType.startsWith('video/')) {
      return <VideoCameraIcon className="w-5 h-5 text-purple-600" />;
    } else {
      return <DocumentIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col m-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sidebar - Folders */}
          <div className="w-full md:w-1/4 border-b md:border-b-0 md:border-r overflow-y-auto bg-gray-50 max-h-48 md:max-h-none flex-shrink-0">
            <div className="p-3">
              <button
                onClick={() => setSelectedFolderId(null)}
                className={`w-full flex items-center gap-2 py-2 px-3 rounded hover:bg-gray-100 ${
                  selectedFolderId === null ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                }`}
              >
                <FolderIcon className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">All Files</span>
              </button>

              <div className="mt-2 space-y-1">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`w-full flex items-center gap-2 py-2 px-3 rounded hover:bg-gray-100 ${
                      selectedFolderId === folder.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <FolderIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm truncate flex-1 text-left">{folder.name}</span>
                    <span className="text-xs text-gray-500">{folder._count.files}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800 mb-2">
                  Need to upload new files?
                </p>
                <a
                  href="/admin/style-library"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
                >
                  Open Style Library
                  <ChevronRightIcon className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Main Content - File Grid */}
          <div className="flex-1 overflow-y-auto overflow-x-auto p-4 md:p-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner size="md" />
              </div>
            ) : files.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <FolderIcon className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'Upload files to get started'}
                </p>
                <a
                  href="/admin/style-library"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-full font-medium transition-all text-sm"
                >
                  Open Style Library
                  <ChevronRightIcon className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 min-w-min">
                {files.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => handleSelect(file)}
                    className="bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-blue-500 hover:shadow-lg transition-all group"
                  >
                    {file.file_type.startsWith('image/') ? (
                      <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">
                        <img
                          src={file.file_url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : file.file_type.startsWith('video/') ? (
                      <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                        <VideoCameraIcon className="w-12 h-12 text-purple-600" />
                      </div>
                    ) : (
                      <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                        <DocumentIcon className="w-12 h-12 text-gray-600" />
                      </div>
                    )}
                    
                    <h3 className="text-xs font-medium text-gray-900 truncate mb-1">
                      {file.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.file_size)}
                    </p>
                    
                    {file.width && file.height && (
                      <p className="text-xs text-gray-400 mt-1">
                        {file.width} × {file.height}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-sm text-gray-600">
            {files.length} file{files.length !== 1 ? 's' : ''} available
          </p>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
