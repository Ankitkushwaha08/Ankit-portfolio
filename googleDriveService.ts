import { getAccessToken } from './googleAuth';

export interface DriveVideoFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  thumbnailLink?: string;
  webViewLink?: string;
  webContentLink?: string;
}

export interface DriveBackupFile {
  id: string;
  name: string;
  modifiedTime?: string;
  size?: string;
}

async function requireToken(): Promise<string> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('AUTH_REQUIRED');
  }
  return token;
}

/**
 * Lists MP4 / video files from the user's Google Drive.
 */
export async function listDriveVideos(searchQuery = ''): Promise<DriveVideoFile[]> {
  const token = await requireToken();
  const sanitized = searchQuery.trim().replace(/'/g, "\\'");
  const qParts = ["mimeType contains 'video/'", 'trashed = false'];
  if (sanitized) {
    qParts.push(`name contains '${sanitized}'`);
  }
  const q = encodeURIComponent(qParts.join(' and '));
  const fields = encodeURIComponent(
    'files(id,name,mimeType,size,modifiedTime,thumbnailLink,webViewLink,webContentLink)'
  );

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&orderBy=modifiedTime desc&pageSize=30`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (res.status === 401 || res.status === 403) {
    throw new Error('AUTH_REQUIRED');
  }
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to list Google Drive videos: ${errText}`);
  }

  const data = await res.json();
  return (data.files || []) as DriveVideoFile[];
}

/**
 * Downloads a video file from Google Drive and returns it as a File object
 * so it can be played smoothly in the HTML5 <video> element and cached in IndexedDB.
 */
export async function downloadDriveVideoAsFile(
  driveFile: DriveVideoFile
): Promise<File> {
  const token = await requireToken();
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
      driveFile.id
    )}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (res.status === 401 || res.status === 403) {
    throw new Error('AUTH_REQUIRED');
  }
  if (!res.ok) {
    throw new Error(`Failed to download video "${driveFile.name}" from Google Drive.`);
  }

  const blob = await res.blob();
  return new File([blob], driveFile.name, {
    type: driveFile.mimeType || 'video/mp4',
  });
}

/**
 * Uploads a local video file to the user's Google Drive.
 */
export async function uploadVideoToDrive(file: File): Promise<DriveVideoFile> {
  const token = await requireToken();

  const metadata = {
    name: file.name,
    mimeType: file.type || 'video/mp4',
    description: 'Uploaded from Ankit Video Portfolio Studio',
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', file);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    }
  );

  if (res.status === 401 || res.status === 403) {
    throw new Error('AUTH_REQUIRED');
  }
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to upload video to Google Drive: ${errText}`);
  }

  return (await res.json()) as DriveVideoFile;
}

const BACKUP_FILENAME = 'ankit-portfolio-studio-backup.json';

/**
 * Finds existing portfolio configuration backup files in Google Drive.
 */
export async function listPortfolioBackupsInDrive(): Promise<DriveBackupFile[]> {
  const token = await requireToken();
  const q = encodeURIComponent(
    `name = '${BACKUP_FILENAME}' and trashed = false`
  );
  const fields = encodeURIComponent('files(id,name,modifiedTime,size)');

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&orderBy=modifiedTime desc&pageSize=10`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (res.status === 401 || res.status === 403) {
    throw new Error('AUTH_REQUIRED');
  }
  if (!res.ok) {
    throw new Error('Failed to search backups in Google Drive.');
  }

  const data = await res.json();
  return (data.files || []) as DriveBackupFile[];
}

/**
 * Saves or updates the portfolio metadata backup JSON in Google Drive.
 * IMPORTANT: If updating/overwriting an existing file, callers MUST show user confirmation first.
 */
export async function savePortfolioBackupToDrive(
  payload: unknown,
  existingFileId?: string
): Promise<DriveBackupFile> {
  const token = await requireToken();
  const metadata = {
    name: BACKUP_FILENAME,
    mimeType: 'application/json',
    description: 'Ankit Portfolio Studio configuration backup',
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append(
    'file',
    new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  );

  const url = existingFileId
    ? `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(
        existingFileId
      )}?uploadType=multipart&fields=id,name,modifiedTime,size`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime,size';

  const res = await fetch(url, {
    method: existingFileId ? 'PATCH' : 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error('AUTH_REQUIRED');
  }
  if (!res.ok) {
    throw new Error('Failed to save portfolio backup to Google Drive.');
  }

  return (await res.json()) as DriveBackupFile;
}

/**
 * Downloads and parses a portfolio backup JSON file from Google Drive.
 */
export async function loadPortfolioBackupFromDrive<T>(fileId: string): Promise<T> {
  const token = await requireToken();
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
      fileId
    )}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (res.status === 401 || res.status === 403) {
    throw new Error('AUTH_REQUIRED');
  }
  if (!res.ok) {
    throw new Error('Failed to read backup file from Google Drive.');
  }

  return (await res.json()) as T;
}
