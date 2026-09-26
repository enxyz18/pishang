'use client';

interface VideoPlayerProps {
  tmdbId: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
}

export default function VideoPlayer({
  tmdbId,
  type,
  season = 1,
  episode = 1,
}: VideoPlayerProps) {
  // Bina URL dari API video provider berdasarkan jenis kandungan
  const embedUrl =
    type === 'movie'
      ? `https://vidlink.pro/movie/${tmdbId}?player=jw&fullscreen-true`
      : `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?player=jw&fullscreen-true`;

  return (
    <div className="w-full bg-black rounded-xl overflow-hidden border border-neutral-800 shadow-2xl">
      <div className="relative aspect-video w-full">
        <iframe
          src={embedUrl}
          className="w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </div>
  );
}