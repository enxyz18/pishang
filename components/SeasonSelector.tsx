'use client';

import { useState, useEffect } from 'react';
import { Season, Episode } from '@/types/tmdb';
import { getTVSeasonEpisodes, TMDB_IMAGE_BASE_URL } from '@/lib/tmdb';
import Image from 'next/image';
import { Play, Calendar, Star } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

interface SeasonSelectorProps {
  tvId: string;
  seasons: Season[];
}

export default function SeasonSelector({ tvId, seasons }: SeasonSelectorProps) {
  const validSeasons = seasons.filter((s) => s.season_number > 0);
  const [selectedSeason, setSelectedSeason] = useState<number>(
    validSeasons[0]?.season_number || 1
  );
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // State Episod yang sedang dimainkan (Default: Episod 1)
  const [activeEpisode, setActiveEpisode] = useState<number | null>(null);

  useEffect(() => {
    async function fetchEpisodes() {
      setLoading(true);
      const data = await getTVSeasonEpisodes(tvId, selectedSeason);
      setEpisodes(data);
      setLoading(false);
    }
    fetchEpisodes();
  }, [tvId, selectedSeason]);

  // Fungsi format tarikh (Contoh: 2024-03-21 -> 21 Mar 2024)
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Akan Datang / N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('ms-MY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };
  
  const handlePlayEpisode = (episodeNumber: number) => {
    setActiveEpisode(episodeNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Video Player (Akan terpapar sekiranya episod diklik) */}
      {activeEpisode !== null && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-yellow-500 font-bold">
            <span>SEDANG DIMAINKAN: SEASON {selectedSeason} - EPISOD {activeEpisode}</span>
          </div>
          <VideoPlayer
            tmdbId={tvId}
            type="tv"
            season={selectedSeason}
            episode={activeEpisode}
          />
        </div>
      )}

      {/* Header & Dropdown Select */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-yellow-500 pl-3">
        <h2 className="text-lg font-bold tracking-wide">Senarai Episod</h2>
        
        <select
          value={selectedSeason}
          onChange={(e) => {
            setSelectedSeason(Number(e.target.value));
            setActiveEpisode(null); // Reset episod bila season bertukar
          }}
          className="bg-neutral-900 text-white text-xs font-semibold px-4 py-2 rounded-lg border border-neutral-800 focus:outline-none focus:border-yellow-500 cursor-pointer"
        >
          {validSeasons.map((season) => (
            <option key={season.id} value={season.season_number}>
              {season.name} ({season.episode_count} Episod)
            </option>
          ))}
        </select>
      </div>

      {/* Grid Episod */}
      {loading ? (
        <p className="text-xs text-neutral-400 animate-pulse">Memuat turun episod...</p>
      ) : episodes.length === 0 ? (
        <p className="text-xs text-neutral-500">Tiada episod ditemui untuk season ini.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {episodes.map((ep) => (
            <div
              key={ep.id}
              onClick={() => handlePlayEpisode(ep.episode_number)}
              className={`bg-neutral-900 border rounded-lg overflow-hidden group transition cursor-pointer flex flex-col ${
                activeEpisode === ep.episode_number
                  ? 'border-yellow-500 ring-1 ring-yellow-500'
                  : 'border-neutral-800 hover:border-yellow-500/50'
              }`}
            >
              <div className="relative aspect-video w-full bg-neutral-800">
                {ep.still_path ? (
                  <Image
                    src={`${TMDB_IMAGE_BASE_URL}${ep.still_path}`}
                    alt={ep.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-[10px] text-neutral-500">
                    Tiada Gambar
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <Play className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                </div>
                <span className="absolute bottom-2 left-2 bg-black/80 text-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded">
                  Episode {ep.episode_number}
                </span>
              </div>

              <div className="p-3 flex flex-col justify-between flex-1 space-y-1">
                <h3 className="font-semibold text-xs text-white group-hover:text-yellow-400 transition line-clamp-1">
                  {ep.episode_number}. {ep.name}
                </h3>
                <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                  {ep.overview || 'Tiada ringkasan episod.'}
                </p>

                {/* INFO RELEASE DATE / TARIKH TAYANGAN */}
                <p className="flex items-center gap-1.5 text-neutral-400 text-xs mt-1">
                  <Calendar className="w-3.5 h-3.5 text-yellow-500" />
                    <span>{formatDate(ep.air_date)}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}