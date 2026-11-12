import React, { useEffect, useRef, useState } from 'react';
import {
  Maximize2,
  Pause,
  Play,
  Upload,
  Volume2,
  VolumeX,
  Film,
  Sparkles,
} from 'lucide-react';
import { resolveVideoUrl } from '../services/videoStorage';

interface SmartVideoPlayerProps {
  videoUrl: string;
  title: string;
  category?: string;
  aspectRatio?: '16:9' | '9:16';
  customFileName?: string;
  showControlsOnHover?: boolean;
  isHeroOrShowreel?: boolean;
  onQuickUploadFile?: (file: File) => Promise<void>;
  onOpenLightbox?: () => void;
  onOpenEditModal?: () => void;
  className?: string;
}

export const SmartVideoPlayer: React.FC<SmartVideoPlayerProps> = ({
  videoUrl,
  title,
  category = 'Cinematic Edit',
  aspectRatio = '16:9',
  customFileName,
  showControlsOnHover = true,
  isHeroOrShowreel = false,
  onQuickUploadFile,
  onOpenLightbox,
  onOpenEditModal,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resolvedSrc, setResolvedSrc] = useState<string>('');
  const [hasEnteredZone, setHasEnteredZone] = useState<boolean>(isHeroOrShowreel);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Resolve IndexedDB URL or external MP4 URL
  useEffect(() => {
    let active = true;
    setHasError(false);
    setIsLoaded(false);

    if (!videoUrl) {
      setResolvedSrc('');
      return;
    }

    resolveVideoUrl(videoUrl).then((url) => {
      if (active) {
        setResolvedSrc(url);
      }
    });

    return () => {
      active = false;
    };
  }, [videoUrl]);

  // 1) Lazy-loading observer (loads video source when within 280px of viewport)
  // 2) Playback IntersectionObserver (plays ONLY when >= 30% visible in viewport, pauses outside)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const lazyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasEnteredZone(true);
          }
        });
      },
      { rootMargin: '280px 0px', threshold: 0.01 }
    );

    const playbackObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visible = entry.isIntersecting && entry.intersectionRatio >= 0.28;
          setIsVisible(visible);
        });
      },
      { threshold: [0, 0.28, 0.6] }
    );

    lazyObserver.observe(el);
    playbackObserver.observe(el);

    return () => {
      lazyObserver.disconnect();
      playbackObserver.disconnect();
    };
  }, []);

  // Control play/pause strictly based on viewport visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !resolvedSrc || hasError) return;

    if (isVisible) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Ensure muted autoplay fallback
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {
              setIsPlaying(false);
            });
          });
      }
    } else {
      if (!video.paused) {
        video.pause();
      }
      setIsPlaying(false);
    }
  }, [isVisible, resolvedSrc, hasError]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = clickX / rect.width;
    video.currentTime = ratio * video.duration;
    setProgress(ratio * 100);
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenLightbox) {
      onOpenLightbox();
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onQuickUploadFile) return;
    setIsUploading(true);
    try {
      await onQuickUploadFile(file);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/') && onQuickUploadFile) {
      setIsUploading(true);
      try {
        await onQuickUploadFile(file);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const formatTimecode = (sec: number) => {
    if (!Number.isFinite(sec) || sec < 0) return '00:00';
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const showPlaceholder = !resolvedSrc || hasError;

  return (
    <div
      ref={containerRef}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={handleDrop}
      onClick={() => {
        if (!showPlaceholder && onOpenLightbox) {
          onOpenLightbox();
        }
      }}
      className={`group relative overflow-hidden bg-[#121212] select-none ${
        isDraggingOver ? 'ring-2 ring-[#A78BFA] bg-[#A78BFA]/10' : ''
      } ${className}`}
    >
      {/* Hidden Direct MP4 File Input */}
      {onQuickUploadFile && (
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={handleFileChange}
          className="hidden"
        />
      )}

      {showPlaceholder ? (
        /* Beautiful Cinema Studio Placeholder when awaiting user's custom MP4 upload */
        <div className="relative w-full h-full min-h-[240px] flex flex-col justify-between p-6 bg-gradient-to-br from-[#121212] via-[#0d0d11] to-[#080808]">
          {/* Subtle architectural cinema frame grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 50% 35%, rgba(167, 139, 250, 0.22), transparent 65%), linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '100% 100%, 32px 32px, 32px 32px',
            }}
          />

          {/* Top Cinema Slate Header */}
          <div className="relative z-10 flex items-center justify-between text-xs font-mono text-[#999999]">
            <span>SLATE · {category.toUpperCase()}</span>
            <span>{aspectRatio} · MP4 READY</span>
          </div>

          {/* Center Interactive Upload / Awaiting Video Slate */}
          <div className="relative z-10 my-auto py-6 flex flex-col items-center text-center max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#A78BFA] mb-4 group-hover:scale-105 group-hover:border-[#A78BFA]/50 transition-all duration-200">
              <Film className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-white tracking-tight mb-1">
              {isUploading ? 'Loading MP4 into Studio Player...' : title}
            </p>
            <p className="text-xs text-[#999999] leading-relaxed mb-5">
              Drop an <span className="text-white font-mono">.mp4</span> video file here or click below to attach your master render.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {onQuickUploadFile && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#A78BFA] text-[#080808] text-xs font-semibold hover:bg-[#b9a2fb] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload MP4 Video</span>
                </button>
              )}
              {onOpenEditModal && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenEditModal();
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-medium border border-white/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Paste Video URL</span>
                </button>
              )}
            </div>
          </div>

          {/* Bottom Cinema Frame Guides */}
          <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#999999]/70">
            <span>TC 00:00:00:00</span>
            <span>AWAITING MASTER MP4</span>
          </div>
        </div>
      ) : (
        /* Real HTML5 Looping Autoplay Muted Video Player */
        <div className="relative w-full h-full flex items-center justify-center bg-[#080808]">
          {/* Elegant Loading Skeleton while video buffers */}
          {!isLoaded && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#121212] animate-pulse">
              <div className="w-10 h-10 rounded-full border-2 border-[#A78BFA]/30 border-t-[#A78BFA] animate-spin mb-3" />
              <span className="text-xs font-mono text-[#999999]">
                BUFFERING STREAM...
              </span>
            </div>
          )}

          {hasEnteredZone && (
            <video
              ref={videoRef}
              src={resolvedSrc}
              autoPlay
              muted={isMuted}
              loop
              playsInline
              preload="metadata"
              onLoadedData={() => setIsLoaded(true)}
              onLoadedMetadata={(e) => {
                setDuration(e.currentTarget.duration || 0);
                setIsLoaded(true);
              }}
              onTimeUpdate={(e) => {
                const vid = e.currentTarget;
                setCurrentTime(vid.currentTime);
                if (vid.duration > 0) {
                  setProgress((vid.currentTime / vid.duration) * 100);
                }
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={() => setHasError(true)}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.015]"
            />
          )}

          {/* Measured contrast scrim for crisp control legibility */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/35 opacity-60 group-hover:opacity-90 transition-opacity duration-200" />

          {/* Top Bar Overlay: Custom File indicator & Replace MP4 quick button */}
          <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex items-center gap-2 text-[11px] font-mono text-white/80 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 truncate max-w-[65%]">
              {customFileName ? (
                <>
                  <Sparkles className="w-3 h-3 text-[#A78BFA] shrink-0" />
                  <span className="truncate">{customFileName}</span>
                </>
              ) : (
                <span>{aspectRatio} · AUTOPLAY LOOP</span>
              )}
            </div>

            {onQuickUploadFile && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                title="Upload your own MP4 file to replace this video"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/75 hover:bg-[#A78BFA] text-white hover:text-[#080808] text-xs font-medium border border-white/15 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                <span>{isUploading ? 'Uploading...' : 'Replace MP4'}</span>
              </button>
            )}
          </div>

          {/* Modern Video Controls on Hover */}
          {showControlsOnHover && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 inset-x-0 z-20 p-3.5 pt-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200"
            >
              {/* Scrubber Timeline */}
              <div
                onClick={handleSeek}
                role="slider"
                aria-label="Seek video timeline"
                aria-valuenow={Math.round(progress)}
                tabIndex={0}
                className="group/scrub relative h-2 w-full flex items-center cursor-pointer mb-2.5"
              >
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden group-hover/scrub:h-1.5 transition-all">
                  <div
                    className="h-full bg-[#A78BFA] rounded-full transition-all duration-75"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Bottom Control Buttons Row */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause video' : 'Play video'}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#A78BFA] text-white hover:text-[#080808] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    {isPlaying ? (
                      <Pause className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    {isMuted ? (
                      <VolumeX className="w-3.5 h-3.5 text-[#999999]" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 text-[#A78BFA]" />
                    )}
                  </button>

                  <span className="text-[11px] font-mono text-white/80 ml-1 tabular-nums">
                    {formatTimecode(currentTime)}{' '}
                    <span className="text-[#999999]">/ {formatTimecode(duration)}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleFullscreen}
                    aria-label="Expand fullscreen video"
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
