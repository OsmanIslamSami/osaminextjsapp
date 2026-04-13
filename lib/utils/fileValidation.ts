/**
 * File Validation Utilities
 * 
 * Provides validation functions for file uploads with format and size checks.
 */

// Allowed image formats
export const ALLOWED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// Allowed PDF format
export const ALLOWED_PDF_FORMAT = 'application/pdf';
export const ALLOWED_PDF_EXTENSION = '.pdf';

// Size limits (in bytes)
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_PDF_SIZE = 50 * 1024 * 1024;   // 50MB

/**
 * Validate if a file is an allowed image format
 */
export function isValidImageFormat(file: File): boolean {
  const mimeType = file.type;
  const fileName = file.name.toLowerCase();
  
  // Check MIME type
  if (ALLOWED_IMAGE_FORMATS.includes(mimeType)) {
    return true;
  }
  
  // Fallback: check file extension
  return ALLOWED_IMAGE_EXTENSIONS.some(ext => fileName.endsWith(ext));
}

/**
 * Validate if a file is a valid PDF format
 */
export function isValidPDFFormat(file: File): boolean {
  const mimeType = file.type;
  const fileName = file.name.toLowerCase();
  
  // Check MIME type
  if (mimeType === ALLOWED_PDF_FORMAT) {
    return true;
  }
  
  // Fallback: check file extension
  return fileName.endsWith(ALLOWED_PDF_EXTENSION);
}

/**
 * Validate image file size
 */
export function isValidImageSize(file: File): boolean {
  return file.size <= MAX_IMAGE_SIZE;
}

/**
 * Validate PDF file size
 */
export function isValidPDFSize(file: File): boolean {
  return file.size <= MAX_PDF_SIZE;
}

/**
 * Comprehensive image validation
 * Returns { valid: boolean, error?: string }
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  if (!isValidImageFormat(file)) {
    return {
      valid: false,
      error: `Invalid image format. Allowed formats: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`
    };
  }
  
  if (!isValidImageSize(file)) {
    return {
      valid: false,
      error: `Image size exceeds ${MAX_IMAGE_SIZE / (1024 * 1024)}MB limit`
    };
  }
  
  return { valid: true };
}

/**
 * Comprehensive PDF validation
 * Returns { valid: boolean, error?: string }
 */
export function validatePDF(file: File): { valid: boolean; error?: string } {
  if (!isValidPDFFormat(file)) {
    return {
      valid: false,
      error: 'Invalid file format. Only PDF files are allowed'
    };
  }
  
  if (!isValidPDFSize(file)) {
    return {
      valid: false,
      error: `PDF size exceeds ${MAX_PDF_SIZE / (1024 * 1024)}MB limit`
    };
  }
  
  return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
