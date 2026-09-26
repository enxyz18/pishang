'use client';

import { useState, useEffect, use } from 'react';
import { getTVDetailsWithDetails, TMDB_IMAGE_BASE_URL, getTrailerKey } from '@/lib/tmdb';
import { DetailedMedia } from '@/types/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Calendar, Tv, Film } from 'lucide-react';
import SearchInput from '@/components/SearchInput';
import BackButton from '@/components/BackButton';
import SeasonSelector from '@/components/SeasonSelector';
import TrailerModal from '@/components/TrailerModal';
import { notFound } from 'next/navigation';

export default function TVDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tv, setTv] = useState<DetailedMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    getTVDetailsWithDetails(id).then((data) => {
      setTv(data);
      setLoading(false);
    });
  }, [id]);

  const handleOpenTrailer = async () => {
    if (!trailerKey) {
      const key = await getTrailerKey('tv', id);
      setTrailerKey(key);
    }
    setShowTrailer(true);
  };

  if (loading) {
    return <div className="min-h-screen bg-neutral-950 text-white p-8">Memuat turun...</div>;
  }

  if (!tv) notFound();

  const releaseYear = tv.first_air_date?.split('-')[0] || 'N/A';
  const topCast = tv.credits?.cast.slice(0, 6) || [];

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-4 sm:p-8 space-y-8">
      {/* Header */}
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

        {/* Layout Utama: Poster & Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Poster */}
          <div className="relative aspect-[2/3] w-full max-w-sm mx-auto md:mx-0 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-lg">
            {tv.poster_path ? (
              <Image
                src={`${TMDB_IMAGE_BASE_URL}${tv.poster_path}`}
                alt={tv.name || 'Poster'}
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

          {/* Kolum Info & Pelakon */}
          <div className="md:col-span-2 space-y-5">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                {tv.name}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-300 mt-3">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-yellow-500" />
                  <span>{releaseYear}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Tv className="w-4 h-4 text-yellow-500" />
                  <span>{tv.number_of_seasons || 0} Season(s)</span>
                </div>
                <div className="flex items-center gap-1 text-yellow-500 font-semibold">
                  <Star className="w-4 h-4 fill-yellow-500" />
                  <span>{tv.vote_average.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Ringkasan */}
            <div>
              <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                Ringkasan
              </h2>
              <p className="text-neutral-300 text-sm leading-relaxed">
                {tv.overview || 'Tiada deskripsi disediakan.'}
              </p>
            </div>

            {/* Senarai Pelakon */}
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

            {/* Butang Action (Trailer) */}
            <div className="pt-2 flex flex-row items-center gap-3">
              <button
                onClick={handleOpenTrailer}
                className="flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold px-5 py-2.5 rounded-xl border border-neutral-800 transition duration-200 text-sm cursor-pointer"
              >
                <Film className="w-4 h-4 text-yellow-500" /> Trailer
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Season & Senarai Episod */}
        {tv.seasons && tv.seasons.length > 0 && (
          <div className="pt-4 border-t border-neutral-900">
            <SeasonSelector tvId={id} seasons={tv.seasons} />
          </div>
        )}
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
                className="bg-yellow-500 text-black font-bold text-xs px-4 py-2 rounded-lg cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )
      )}
    </main>
  );
}