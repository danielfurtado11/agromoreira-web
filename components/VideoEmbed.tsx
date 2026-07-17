import {
  facebookVideoEmbedUrl,
  getEmbedProvider,
  getYouTubeId,
  youTubeEmbedUrl,
} from "@/lib/embeds";

/**
 * Renders a video URL stored by an admin: an inline player for YouTube and
 * Facebook, or a link out for Instagram (which cannot be embedded without an
 * API key). Renders nothing for a URL from anywhere else.
 *
 * The player is not autoplaying: on a page you arrived at to read, a video
 * that starts by itself (with sound) is hostile. The carousel is the
 * exception, because there the visitor pressed play.
 */
export function VideoEmbed({
  url,
  title,
  linkLabel = "Ver vídeo no Instagram",
  className = "",
}: {
  url: string;
  /** Used as the iframe's accessible name. */
  title: string;
  linkLabel?: string;
  className?: string;
}) {
  const provider = getEmbedProvider(url);

  if (provider === "youtube") {
    const videoId = getYouTubeId(url);
    if (videoId) {
      return (
        <VideoFrame
          src={youTubeEmbedUrl(videoId)}
          title={title}
          className={className}
        />
      );
    }
  }

  if (provider === "facebook") {
    return (
      <VideoFrame
        src={facebookVideoEmbedUrl(url)}
        title={title}
        className={className}
      />
    );
  }

  if (provider === "instagram") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center justify-center rounded-2xl border border-line bg-mist px-6 py-10 text-sm font-semibold text-primary transition hover:border-primary ${className}`}
      >
        {linkLabel}
      </a>
    );
  }

  return null;
}

function VideoFrame({
  src,
  title,
  className,
}: {
  src: string;
  title: string;
  className: string;
}) {
  return (
    <div
      className={`relative aspect-video overflow-hidden rounded-2xl bg-mist ${className}`}
    >
      <iframe
        src={src}
        title={title}
        allow="encrypted-media; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
