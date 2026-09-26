'use client';

import { use, useState, useEffect } from 'react';
import { getMovieDetailsWithDetails, TMDB_IMAGE_BASE_URL, getTrailerKey } from '@/lib/tmdb';
import { DetailedMedia } from '@/types/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Clock, Calendar, Play, Film } from 'lucide-react';
import SearchInput from '@/components/SearchInput';
import BackButton from '@/components/BackButton';
import VideoPlayer from '@/components/VideoPlayer';
import TrailerModal from '@/components/TrailerModal';

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [movie, setMovie] = useState<DetailedMedia | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  const handleOpenTrailer = async () => {
    if (!trailerKey) {
      const key = await getTrailerKey('movie', id);
      setTrailerKey(key);
    }
    setShowTrailer(true);
  };

  useEffect(() => {
    getMovieDetailsWithDetails(id).then(setMovie);
  }, [id]);

  if (!movie) {
    return <div className="min-h-screen bg-neutral-950 text-white p-8">Loading...</div>;
  }

  const releaseYear = movie.release_date?.split('-')[0] || 'N/A';
  const runtimeText = movie.runtime ? `${movie.runtime} m` : 'N/A';
  const topCast = movie.credits?.cast.slice(0, 6) || [];
  const recommendations = movie.recommendations?.results.slice(0, 5) || [];

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-4 sm:p-8 space-y-8">
      <header className="max-w-6xl mx-auto border-b border-neutral-800 pb-4 flex items-center justify-between gap-4">
        <Link href="/">
          <h1 className="text-3xl font-extrabold text-yellow-500 tracking-wider">
            PISHANG 🍌
          </h1>
        </Link>
        <SearchInput />
      </header>

      <div className="max-w-6xl mx-auto space-y-8">
        <BackButton />

        {/* Pemain Video (Akan muncul apabila Watch Now diklik) */}
        {isPlaying && (
          <div className="space-y-3">
            <VideoPlayer tmdbId={id} type="movie" />
          </div>
        )}

        {/* Layout Utama */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="relative aspect-[2/3] w-full max-w-sm mx-auto md:mx-0 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-lg">
            {movie.poster_path ? (
              <Image
                src={`${TMDB_IMAGE_BASE_URL}${movie.poster_path}`}
                alt={movie.title || 'Poster'}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-500 text-xs">
                Tiada Poster
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-5">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                {movie.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-300 mt-3">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-yellow-500" />
                  <span>{releaseYear}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span>{runtimeText}</span>
                </div>
                <div className="flex items-center gap-1 text-yellow-500 font-semibold">
                  <Star className="w-4 h-4 fill-yellow-500" />
                  <span>{movie.vote_average.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                Ringkasan
              </h2>
              <p className="text-neutral-300 text-sm leading-relaxed">
                {movie.overview || 'Tiada deskripsi disediakan.'}
              </p>
            </div>

            {topCast.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  Pelakon Utama
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {topCast.map((cast) => (
                    <div
                      key={cast.id}
                      className="bg-neutral-900 border border-neutral-800 rounded-lg p-1.5 flex items-center gap-2.5"
                    >
                      <div className="relative w-8 h-8 rounded-full overflow-hidden bg-neutral-800 shrink-0">
                        {cast.profile_path ? (
                          <Image
                            src={`${TMDB_IMAGE_BASE_URL}${cast.profile_path}`}
                            alt={cast.name}
                            fill
                            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 12vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-neutral-500">
                            N/A
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-white truncate">{cast.name}</p>
                        <p className="text-[10px] text-neutral-400 truncate">{cast.character}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Butang Watch Now */}
            <div className="pt-2 flex flex-row items-center gap-3">
              <button
                onClick={() => {
                  setIsPlaying(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2.5 rounded-xl transition duration-200 shadow-md text-sm cursor-pointer"
              >
                <Play className="w-4 h-4 fill-black" /> Watch Now
              </button>

              {/* Butang Trailer */}
              <button
                onClick={handleOpenTrailer}
                className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold px-5 py-2.5 rounded-xl border border-neutral-700 transition duration-200 text-sm cursor-pointer"
              >
                <Film className="w-4 h-4 text-yellow-500" /> Trailer
              </button>
            </div>

            {/* Pop-up Modal Trailer */}
            {showTrailer && (
              trailerKey ? (
                <TrailerModal youtubeKey={trailerKey} onClose={() => setShowTrailer(false)} />
              ) : (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
                  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl text-center space-y-4 max-w-sm">
                    <p className="text-sm text-neutral-300">Maaf, tiada trailer ditemui untuk tajuk ini.</p>
                    <button
                      onClick={() => setShowTrailer(false)}
                      className="bg-yellow-500 text-black font-bold text-xs px-4 py-2 rounded-lg"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-neutral-900">
            <h2 className="text-base font-bold border-l-4 border-yellow-500 pl-3">
              Mungkin Anda Berminat
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {recommendations.map((rec) => (
                <Link
                  key={rec.id}
                  href={`/movie/${rec.id}`}
                  className="bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800 hover:scale-105 transition duration-200 shadow-sm group"
                >
                  <div className="relative aspect-[2/3] w-full bg-neutral-800">
                    {rec.poster_path ? (
                      <Image
                        src={`${TMDB_IMAGE_BASE_URL}${rec.poster_path}`}
                        alt={rec.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-[10px] text-neutral-500">
                        Tiada Poster
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="font-medium text-xs line-clamp-1 group-hover:text-yellow-400 transition">
                      {rec.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}