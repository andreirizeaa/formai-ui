import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system';

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let bufferLength = base64.length * 0.75;
  if (base64[base64.length - 1] === '=') bufferLength--;
  if (base64[base64.length - 2] === '=') bufferLength--;

  const bytes = new Uint8Array(bufferLength);
  let p = 0;

  for (let i = 0; i < base64.length; i += 4) {
    const encoded1 = base64Chars.indexOf(base64[i]);
    const encoded2 = base64Chars.indexOf(base64[i + 1]);
    const encoded3 = base64Chars.indexOf(base64[i + 2]);
    const encoded4 = base64Chars.indexOf(base64[i + 3]);

    const triplet = (encoded1 << 18) | (encoded2 << 12) | ((encoded3 & 63) << 6) | (encoded4 & 63);

    if (encoded3 === 64) {
      bytes[p++] = (triplet >> 16) & 0xff;
    } else if (encoded4 === 64) {
      bytes[p++] = (triplet >> 16) & 0xff;
      bytes[p++] = (triplet >> 8) & 0xff;
    } else {
      bytes[p++] = (triplet >> 16) & 0xff;
      bytes[p++] = (triplet >> 8) & 0xff;
      bytes[p++] = triplet & 0xff;
    }
  }

  return bytes.buffer;
}

function inferExtensionFromUri(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.mp4')) return 'mp4';
  if (lower.endsWith('.mov')) return 'mov';
  if (lower.endsWith('.m4v')) return 'm4v';
  return 'mp4';
}

function contentTypeForExt(ext: string): string {
  switch (ext) {
    case 'mp4':
      return 'video/mp4';
    case 'mov':
      return 'video/quicktime';
    case 'm4v':
      return 'video/x-m4v';
    default:
      return 'application/octet-stream';
  }
}

function inferImageExtensionFromUri(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'jpg';
  if (lower.endsWith('.png')) return 'png';
  if (lower.startsWith('data:image/png')) return 'png';
  if (lower.startsWith('data:image/jpeg')) return 'jpg';
  return 'jpg';
}

function contentTypeForImageExt(ext: string): string {
  switch (ext) {
    case 'jpg':
      return 'image/jpeg';
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    default:
      return 'application/octet-stream';
  }
}

export async function uploadLiftVideo(userId: string, fileUri: string, assetId?: string): Promise<{ publicUrl: string; path: string }> {
  const ext = inferExtensionFromUri(fileUri);
  const contentType = contentTypeForExt(ext);
  
  // Use assetId as filename if provided, otherwise fallback to timestamp
  const fileName = assetId ? `${assetId}.${ext}` : `${Date.now()}.${ext}`;
  const path = `${userId}/videos/${fileName}`;

  // Read local file reliably in React Native (Expo)
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const arrayBuffer = base64ToArrayBuffer(base64);

  const { error } = await supabase.storage.from('lifts').upload(path, arrayBuffer, {
    contentType,
    upsert: true,
  });

  if (error) throw error;

  const { data } = supabase.storage.from('lifts').getPublicUrl(path);
  return { publicUrl: data.publicUrl, path };
}

export async function uploadLiftThumbnail(userId: string, fileUri: string): Promise<{ publicUrl: string; path: string }> {
  const ext = inferImageExtensionFromUri(fileUri);
  const contentType = contentTypeForImageExt(ext);
  const fileName = `${Date.now()}.${ext}`;
  const path = `${userId}/thumbnails/${fileName}`;

  // Read local file
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const arrayBuffer = base64ToArrayBuffer(base64);

  const { error } = await supabase.storage.from('lifts').upload(path, arrayBuffer, {
    contentType,
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from('lifts').getPublicUrl(path);
  return { publicUrl: data.publicUrl, path };
}

export async function listUserVideoPaths(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase.storage
      .from('lifts')
      .list(`${userId}/videos`, {
        limit: 1000, // Adjust limit as needed
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('Error listing video paths:', error);
      return [];
    }

    // Return assetIds (filename without extension) for comparison
    return data?.map(file => {
      // Remove file extension to get the assetId
      const lastDotIndex = file.name.lastIndexOf('.');
      return lastDotIndex > 0 ? file.name.substring(0, lastDotIndex) : file.name;
    }) || [];
  } catch (error) {
    console.error('Error listing user video paths:', error);
    return [];
  }
}


