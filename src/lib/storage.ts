import { supabase } from './supabase';

if (!supabase) {
  throw new Error('Supabase client not initialized');
}

export interface FileUploadOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface UploadResult {
  url: string;
  path: string;
  size: number;
}

/**
 * Validates and resizes an image file
 */
export async function validateAndResizeImage(
  file: File,
  options: FileUploadOptions = {}
): Promise<File> {
  const {
    maxSizeBytes = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    quality = 0.8,
    maxWidth = 1024,
    maxHeight = 1024,
  } = options;

  // Validate file type
  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
    );
  }

  // Validate file size
  if (file.size > maxSizeBytes) {
    throw new Error(
      `File too large. Maximum size: ${Math.round(maxSizeBytes / 1024 / 1024)}MB`
    );
  }

  // Create canvas for resizing
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas not supported'));
      return;
    }

    img.onload = () => {
      try {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File(
                [blob],
                file.name,
                { type: file.type }
              );
              resolve(resizedFile);
            } else {
              reject(new Error('Failed to resize image'));
            }
          },
          file.type,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Invalid image file'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Upload avatar to Supabase Storage
 */
export async function uploadAvatar(
  userId: string,
  file: File,
  options: FileUploadOptions = {}
): Promise<UploadResult> {
  try {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    // Validate and resize image
    const processedFile = await validateAndResizeImage(file, options);
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `avatar-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${userId}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('user-uploads')
      .upload(filePath, processedFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-uploads')
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: data.path,
      size: processedFile.size,
    };
  } catch (error) {
    console.error('Upload avatar error:', error);
    throw error;
  }
}

/**
 * Delete avatar from Supabase Storage
 */
export async function deleteAvatar(avatarUrl: string): Promise<void> {
  try {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    // Extract path from URL
    const url = new URL(avatarUrl);
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/user-uploads\/(.+)$/);
    
    if (!pathMatch) {
      throw new Error('Invalid avatar URL');
    }

    const filePath = pathMatch[1];

    const { error } = await supabase.storage
      .from('user-uploads')
      .remove([filePath]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Delete avatar error:', error);
    throw error;
  }
}

/**
 * Upload document to Supabase Storage
 */
export async function uploadDocument(
  userId: string,
  file: File,
  category: string = 'general'
): Promise<UploadResult> {
  try {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB for documents
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ];

    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size: 10MB');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `documents/${userId}/${category}/${timestamp}-${sanitizedName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('user-uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-uploads')
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: data.path,
      size: file.size,
    };
  } catch (error) {
    console.error('Upload document error:', error);
    throw error;
  }
}

/**
 * Get file info from storage URL
 */
export function parseStorageUrl(url: string): { bucket: string; path: string } | null {
  try {
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    
    if (pathMatch) {
      return {
        bucket: pathMatch[1],
        path: pathMatch[2],
      };
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if user owns a file in storage
 */
export function isUserFile(userId: string, fileUrl: string): boolean {
  const info = parseStorageUrl(fileUrl);
  if (!info) return false;
  
  // Check if path starts with user's folder
  return info.path.startsWith(`avatars/${userId}/`) || 
         info.path.startsWith(`documents/${userId}/`);
}

/**
 * Create storage bucket if it doesn't exist (for development)
 */
export async function ensureBucket(bucketName: string): Promise<void> {
  try {
    if (!supabase) {
      console.warn('Supabase client not available for bucket check');
      return;
    }
    const { data: buckets } = await supabase.storage.listBuckets();
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/webp',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        fileSizeLimit: 10485760, // 10MB
      });

      if (error && error.message !== 'The resource already exists') {
        console.warn('Failed to create bucket:', error);
      }
    }
  } catch (error) {
    console.warn('Bucket check failed:', error);
  }
}