import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Cloud,
  CloudDownload,
  CloudUpload,
  Film,
  HardDrive,
  Loader2,
  LogOut,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { GoogleSignInButton } from './GoogleSignInButton';
import {
  getAccessToken,
  getCurrentUser,
  googleSignIn,
  initAuth,
  logout,
} from '../services/googleAuth';
import {
  downloadDriveVideoAsFile,
  DriveBackupFile,
  DriveVideoFile,
  listDriveVideos,
  listPortfolioBackupsInDrive,
  loadPortfolioBackupFromDrive,
  savePortfolioBackupToDrive,
  uploadVideoToDrive,
} from '../services/googleDriveService';
import { formatBytes } from '../services/videoStorage';
import {
  ContactConfig,
  PortfolioProject,
  ShowreelConfig,
} from '../types/portfolio';

interface GoogleDrivePanelProps {
  projects: PortfolioProject[];
  showreel: ShowreelConfig;
  contact: ContactConfig;
  onImportVideoForProject: (file: File) => Promise<void>;
  onImportVideoForShowreel: (file: File) => Promise<void>;
  onRestoreBackupData: (data: {
    projects?: PortfolioProject[];
    showreel?: ShowreelConfig;
    contact?: ContactConfig;
  }) => void;
  onStatusToast: (msg: string) => void;
}

interface PendingConfirmAction {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
}

export const GoogleDrivePanel: React.FC<GoogleDrivePanelProps> = ({
  projects,
  showreel,
  contact,
  onImportVideoForProject,
  onImportVideoForShowreel,
  onRestoreBackupData,
  onStatusToast,
}) => {
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(() => getCurrentUser());
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const [driveVideos, setDriveVideos] = useState<DriveVideoFile[]>([]);
  const [backups, setBackups] = useState<DriveBackupFile[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Explicit Confirmation Modal State before updating existing backup file
  const [pendingConfirm, setPendingConfirm] =
    useState<PendingConfirmAction | null>(null);
  const [isExecutingConfirm, setIsExecutingConfirm] = useState<boolean>(false);

  const uploadToDriveInputRef = useRef<HTMLInputElement>(null);

  const fetchDriveContents = useCallback(async (query = '') => {
    const token = await getAccessToken();
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    setIsLoadingFiles(true);
    setErrorMessage(null);
    try {
      const [videos, backupList] = await Promise.all([
        listDriveVideos(query),
        listPortfolioBackupsInDrive(),
      ]);
      setDriveVideos(videos);
      setBackups(backupList);
      setNeedsAuth(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg === 'AUTH_REQUIRED') {
        setNeedsAuth(true);
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsLoadingFiles(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = initAuth(
      (authedUser) => {
        setUser(authedUser);
        setNeedsAuth(false);
        fetchDriveContents();
      },
      () => {
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, [fetchDriveContents]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
        await fetchDriveContents(searchQuery);
        onStatusToast('Connected to Google Drive');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google Sign-In failed';
      setErrorMessage(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setNeedsAuth(true);
    setDriveVideos([]);
    setBackups([]);
    onStatusToast('Disconnected from Google Drive');
  };

  const handleImportToProject = async (video: DriveVideoFile) => {
    setActiveActionId(`proj_${video.id}`);
    setErrorMessage(null);
    try {
      const file = await downloadDriveVideoAsFile(video);
      await onImportVideoForProject(file);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to import video';
      if (msg === 'AUTH_REQUIRED') setNeedsAuth(true);
      else setErrorMessage(msg);
    } finally {
      setActiveActionId(null);
    }
  };

  const handleImportToShowreel = async (video: DriveVideoFile) => {
    setActiveActionId(`reel_${video.id}`);
    setErrorMessage(null);
    try {
      const file = await downloadDriveVideoAsFile(video);
      await onImportVideoForShowreel(file);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to import showreel video';
      if (msg === 'AUTH_REQUIRED') setNeedsAuth(true);
      else setErrorMessage(msg);
    } finally {
      setActiveActionId(null);
    }
  };

  const handleUploadNewVideoToDrive = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setActiveActionId('uploading_drive');
    setErrorMessage(null);
    try {
      const created = await uploadVideoToDrive(file);
      onStatusToast(`Uploaded "${created.name}" to Google Drive`);
      await fetchDriveContents(searchQuery);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to upload video to Drive';
      if (msg === 'AUTH_REQUIRED') setNeedsAuth(true);
      else setErrorMessage(msg);
    } finally {
      setActiveActionId(null);
      if (uploadToDriveInputRef.current) {
        uploadToDriveInputRef.current.value = '';
      }
    }
  };

  // Save or Overwrite Portfolio Backup in Google Drive (with confirmation when updating existing file)
  const handleBackupPortfolioClick = () => {
    const existing = backups[0];
    const payload = {
      exportedAt: new Date().toISOString(),
      projects,
      showreel,
      contact,
    };

    if (existing) {
      setPendingConfirm({
        title: `Update existing backup "${existing.name}" in Google Drive?`,
        description: `This will update your portfolio configuration file "${existing.name}" in Google Drive with your current ${projects.length} projects, showreel settings, and contact links. None of your video files will be removed.`,
        confirmLabel: 'Confirm Update in Drive',
        onConfirm: async () => {
          await savePortfolioBackupToDrive(payload, existing.id);
          await fetchDriveContents(searchQuery);
          onStatusToast('Updated portfolio backup in Google Drive');
        },
      });
    } else {
      (async () => {
        setActiveActionId('saving_backup');
        try {
          await savePortfolioBackupToDrive(payload);
          await fetchDriveContents(searchQuery);
          onStatusToast('Saved portfolio backup to Google Drive');
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Backup failed';
          if (msg === 'AUTH_REQUIRED') setNeedsAuth(true);
          else setErrorMessage(msg);
        } finally {
          setActiveActionId(null);
        }
      })();
    }
  };

  const handleRestoreBackupFromDrive = async (backup: DriveBackupFile) => {
    setActiveActionId(`restore_${backup.id}`);
    setErrorMessage(null);
    try {
      const data = await loadPortfolioBackupFromDrive<{
        projects?: PortfolioProject[];
        showreel?: ShowreelConfig;
        contact?: ContactConfig;
      }>(backup.id);
      onRestoreBackupData(data);
      onStatusToast('Restored portfolio configuration from Google Drive');
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to restore backup';
      if (msg === 'AUTH_REQUIRED') setNeedsAuth(true);
      else setErrorMessage(msg);
    } finally {
      setActiveActionId(null);
    }
  };

  const executeConfirmedAction = async () => {
    if (!pendingConfirm) return;
    setIsExecutingConfirm(true);
    setErrorMessage(null);
    try {
      await pendingConfirm.onConfirm();
      setPendingConfirm(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Operation failed';
      if (msg === 'AUTH_REQUIRED') setNeedsAuth(true);
      else setErrorMessage(msg);
    } finally {
      setIsExecutingConfirm(false);
    }
  };

  if (needsAuth) {
    return (
      <div className="p-8 rounded-2xl bg-[#080808] border border-white/10 text-center max-w-xl mx-auto my-4">
        <div className="w-12 h-12 rounded-2xl bg-[#A78BFA]/15 border border-[#A78BFA]/30 flex items-center justify-center text-[#A78BFA] mx-auto mb-4">
          <HardDrive className="w-6 h-6" />
        </div>
        <h3 className="font-display text-xl font-bold text-white mb-2">
          Connect Your Google Drive Video Library
        </h3>
        <p className="text-xs sm:text-sm text-[#999999] leading-relaxed mb-6">
          Sign in with Google to browse and import your MP4 video renders directly from Google
          Drive into your portfolio projects or master showreel. Your existing videos in Google
          Drive and on your portfolio are never removed.
        </p>

        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-200">
            {errorMessage}
          </div>
        )}

        <div className="flex justify-center">
          <GoogleSignInButton
            onClick={handleLogin}
            disabled={isLoggingIn}
            label={
              isLoggingIn
                ? 'Connecting to Google Drive...'
                : 'Sign in with Google'
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Explicit User Confirmation Modal before updating backup */}
      {pendingConfirm && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="drive-confirm-title"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-[#121212] border border-white/15 p-6 shadow-2xl">
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#A78BFA]/15 text-[#A78BFA] border border-[#A78BFA]/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4
                  id="drive-confirm-title"
                  className="font-display text-base font-bold text-white"
                >
                  {pendingConfirm.title}
                </h4>
                <p className="text-xs text-[#999999] leading-relaxed mt-1.5">
                  {pendingConfirm.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/[0.08]">
              <button
                type="button"
                disabled={isExecutingConfirm}
                onClick={() => setPendingConfirm(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isExecutingConfirm}
                onClick={executeConfirmedAction}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#A78BFA] hover:bg-[#b9a2fb] text-[#080808] text-xs font-bold transition-colors cursor-pointer"
              >
                {isExecutingConfirm && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                <span>{pendingConfirm.confirmLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connected Google Account Bar + Cloud Actions */}
      <div className="p-4 rounded-xl bg-[#080808] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#A78BFA]/15 border border-[#A78BFA]/30 flex items-center justify-center text-[#A78BFA] shrink-0">
            <Cloud className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              Connected to Google Drive
              {user?.email ? ` · ${user.email}` : ''}
            </div>
            <div className="text-[11px] text-[#999999]">
              Safe Import Mode · Videos in your Drive and portfolio are never removed
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <input
            ref={uploadToDriveInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleUploadNewVideoToDrive}
            className="hidden"
          />

          <button
            type="button"
            disabled={activeActionId === 'uploading_drive'}
            onClick={() => uploadToDriveInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#A78BFA] hover:bg-[#b9a2fb] text-[#080808] text-xs font-bold transition-colors cursor-pointer"
          >
            {activeActionId === 'uploading_drive' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CloudUpload className="w-3.5 h-3.5" />
            )}
            <span>Upload MP4 to Drive</span>
          </button>

          <button
            type="button"
            disabled={activeActionId === 'saving_backup'}
            onClick={handleBackupPortfolioClick}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-medium border border-white/10 transition-colors cursor-pointer"
          >
            {activeActionId === 'saving_backup' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#A78BFA]" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
            )}
            <span>Backup Config to Drive</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            title="Sign out of Google Drive"
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-[#999999] hover:text-white text-xs transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-200 flex items-center justify-between gap-3">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-white/80 hover:text-white font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Refresh Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#999999] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                fetchDriveContents(searchQuery);
              }
            }}
            placeholder="Search MP4 / video files in your Google Drive..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080808] border border-white/10 focus:border-[#A78BFA] focus:outline-none text-xs text-white"
          />
        </div>

        <button
          type="button"
          onClick={() => fetchDriveContents(searchQuery)}
          disabled={isLoadingFiles}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-white border border-white/10 transition-colors cursor-pointer"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${
              isLoadingFiles ? 'animate-spin text-[#A78BFA]' : ''
            }`}
          />
          <span>Refresh</span>
        </button>
      </div>

      {/* Drive Video Files List */}
      <div>
        <div className="flex items-center justify-between text-xs font-mono text-[#999999] mb-3">
          <span>GOOGLE DRIVE VIDEO FILES ({driveVideos.length})</span>
          <span>CLICK TO ADD TO PORTFOLIO OR SET AS SHOWREEL</span>
        </div>

        {isLoadingFiles ? (
          <div className="p-10 rounded-xl bg-[#080808] border border-white/[0.08] flex flex-col items-center justify-center text-center">
            <Loader2 className="w-6 h-6 text-[#A78BFA] animate-spin mb-2" />
            <span className="text-xs font-mono text-[#999999]">
              LOADING VIDEOS FROM GOOGLE DRIVE...
            </span>
          </div>
        ) : driveVideos.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#080808] border border-white/[0.08] text-center">
            <Film className="w-7 h-7 text-[#999999] mx-auto mb-2" />
            <p className="text-sm font-semibold text-white mb-1">
              No video files found in your Google Drive
            </p>
            <p className="text-xs text-[#999999]">
              Click &ldquo;Upload MP4 to Drive&rdquo; above to upload a video render to your Google
              Drive.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {driveVideos.map((video) => {
              const isImportingProj = activeActionId === `proj_${video.id}`;
              const isImportingReel = activeActionId === `reel_${video.id}`;

              return (
                <div
                  key={video.id}
                  className="p-3.5 rounded-xl bg-[#080808] border border-white/[0.08] hover:border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#121212] border border-white/10 flex items-center justify-center text-[#A78BFA] shrink-0 overflow-hidden">
                      {video.thumbnailLink ? (
                        <img
                          src={video.thumbnailLink}
                          alt={video.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Film className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {video.name}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#999999]">
                        <span>{video.mimeType}</span>
                        {video.size && (
                          <>
                            <span>·</span>
                            <span>{formatBytes(Number(video.size))}</span>
                          </>
                        )}
                        {video.modifiedTime && (
                          <>
                            <span>·</span>
                            <span>
                              {new Date(video.modifiedTime).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={Boolean(activeActionId)}
                      onClick={() => handleImportToProject(video)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#A78BFA] hover:bg-[#b9a2fb] text-[#080808] text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {isImportingProj ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CloudDownload className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {isImportingProj ? 'Importing...' : 'Add to Portfolio'}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={Boolean(activeActionId)}
                      onClick={() => handleImportToShowreel(video)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-medium border border-white/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {isImportingReel ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#A78BFA]" />
                      ) : null}
                      <span>
                        {isImportingReel ? 'Setting...' : 'Set as Showreel'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Saved Cloud Backups in Google Drive */}
      {backups.length > 0 && (
        <div className="pt-4 border-t border-white/[0.08]">
          <div className="text-xs font-mono text-[#999999] mb-2.5">
            PORTFOLIO CLOUD BACKUPS IN GOOGLE DRIVE
          </div>
          <div className="space-y-2">
            {backups.map((b) => (
              <div
                key={b.id}
                className="p-3 rounded-xl bg-[#080808] border border-white/[0.08] flex items-center justify-between gap-3"
              >
                <div className="text-xs text-white/90 font-mono truncate">
                  {b.name}{' '}
                  {b.modifiedTime && (
                    <span className="text-[#999999]">
                      · Last synced {new Date(b.modifiedTime).toLocaleString()}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  disabled={activeActionId === `restore_${b.id}`}
                  onClick={() => handleRestoreBackupFromDrive(b)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-[#A78BFA] text-white hover:text-[#080808] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {activeActionId === `restore_${b.id}` ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CloudDownload className="w-3.5 h-3.5" />
                  )}
                  <span>Restore Backup</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
