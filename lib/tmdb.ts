import axios from 'axios';
import { Movie, TMDBResponse, SearchResultItem, DetailedMedia, Episode } from '@/types/tmdb';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}`,
  },
});

// Helper untuk dapatkan tarikh 14 hari lepas (YYYY-MM-DD)
const getTwoWeeksAgoDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 14);
  return date.toISOString().split('T')[0];
};

// Ambil Trending Movies (Tapis > 2 minggu release & limit 10)
export const getTrendingMovies = async (): Promise<Movie[]> => {
  try {
    const response = await tmdbClient.get<TMDBResponse<Movie>>('/trending/movie/day');
    const twoWeeksAgo = getTwoWeeksAgoDate();

    return response.data.results
      .filter((item) => item.release_date && item.release_date <= twoWeeksAgo)
      .slice(0, 10);
  } catch (error) {
    console.error('Gagal mengambil data trending movies:', error);
    return [];
  }
};

// Ambil Trending TV Shows (Tapis > 2 minggu release & limit 10)
export const getTrendingTVShows = async (): Promise<Movie[]> => {
  try {
    const response = await tmdbClient.get<TMDBResponse<Movie>>('/trending/tv/day');
    const twoWeeksAgo = getTwoWeeksAgoDate();

    return response.data.results
      .filter((item) => {
        const airDate = item.first_air_date || item.release_date;
        return airDate && airDate <= twoWeeksAgo;
      })
      .map((item) => ({
        ...item,
        title: item.name || item.title, // TV Shows guna field 'name'
        release_date: item.first_air_date || item.release_date,
      }))
      .slice(0, 10);
  } catch (error) {
    console.error('Gagal mengambil data trending tv shows:', error);
    return [];
  }
};

// Fungsi carian multi TMDB
export const searchMulti = async (
  query: string,
  page: number = 1,
  sortBy: 'latest' | 'top_rated' = 'latest'
) => {
  if (!query) return { results: [], total_pages: 0 };

  try {
    // 1. Carian Utama (Tajuk Filem/TV)
    const multiRes = await axios.get(`${TMDB_BASE_URL}/search/multi`, {
      params: { query, page: 1 }, // Ambil data penuh untuk ditapis & disusun
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}`,
      },
    });

    // 2. Carian Pelakon (Person)
    const personRes = await axios.get(`${TMDB_BASE_URL}/search/person`, {
      params: { query },
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}`,
      },
    });

    let actorCredits: any[] = [];
    const persons = personRes.data.results;

    if (persons && persons.length > 0) {
      const topPerson = persons[0];

      const creditsRes = await axios.get(
        `${TMDB_BASE_URL}/person/${topPerson.id}/combined_credits`,
        {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}`,
          },
        }
      );

      const rawCast = creditsRes.data.cast || [];

      // Tapis pelakon tetap sahaja (TV >= 3 episod)
      const filteredCast = rawCast.filter((item: any) => {
        if (item.media_type === 'movie') return true;
        if (item.media_type === 'tv') return item.episode_count && item.episode_count >= 3;
        return false;
      });

      actorCredits = filteredCast.map((item: any) => ({
        id: item.id,
        media_type: item.media_type,
        title: item.title || item.name,
        poster_path: item.poster_path,
        release_date: item.release_date || item.first_air_date || '',
        vote_average: item.vote_average || 0,
        popularity: item.popularity || 0,
      }));
    }

    // Normalisasikan carian biasa
    const multiResults = (multiRes.data.results || [])
      .filter((item: any) => item.media_type !== 'person')
      .map((item: any) => ({
        id: item.id,
        media_type: item.media_type,
        title: item.title || item.name,
        poster_path: item.poster_path,
        release_date: item.release_date || item.first_air_date || '',
        vote_average: item.vote_average || 0,
        popularity: item.popularity || 0,
      }));

    // Gabungkan hasil carian (nyahduplikasi)
    const combinedMap = new Map();

    actorCredits.forEach((item) => {
      if (item.poster_path) combinedMap.set(`${item.media_type}-${item.id}`, item);
    });

    multiResults.forEach((item: any) => {
      if (item.poster_path) combinedMap.set(`${item.media_type}-${item.id}`, item);
    });

    const combinedList = Array.from(combinedMap.values());

    // --- TAPISAN TARIKH (Mesti sudah ditayangkan, selewat-lewatnya 2 minggu dari hari ini) ---
    const now = new Date();
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const releasedList = combinedList.filter((item) => {
      if (!item.release_date) return false;
      const releaseDate = new Date(item.release_date);
      // Memastikan tarikh wujud dan tidak melebihi 2 minggu akan datang
      return !isNaN(releaseDate.getTime()) && releaseDate <= twoWeeksFromNow;
    });

    // --- SUSUNAN (SORTING) ---
    releasedList.sort((a, b) => {
      if (sortBy === 'top_rated') {
        return b.vote_average - a.vote_average;
      }
      // Default: 'latest' (paling terkini ke terdahulu)
      const dateA = new Date(a.release_date).getTime() || 0;
      const dateB = new Date(b.release_date).getTime() || 0;
      return dateB - dateA;
    });

    // Pagination manual
    const itemsPerPage = 20;
    const startIndex = (page - 1) * itemsPerPage;
    const paginatedResults = releasedList.slice(startIndex, startIndex + itemsPerPage);
    const calculatedTotalPages = Math.ceil(releasedList.length / itemsPerPage) || 1;

    return {
      results: paginatedResults,
      total_pages: calculatedTotalPages,
    };
  } catch (error) {
    console.error('Gagal menjalankan carian multi:', error);
    return { results: [], total_pages: 0 };
  }
};

// fungsi movie/tv detail page
export const getMovieDetailsWithDetails = async (
  id: string
): Promise<DetailedMedia | null> => {
  try {
    // Panggil internal API Route Next.js
    const response = await axios.get<DetailedMedia>(`/api/movie/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Gagal mengambil detail filem ${id}:`, error);
    return null;
  }
};

export const getTVDetailsWithDetails = async (
  id: string
): Promise<DetailedMedia | null> => {
  try {
    // Panggil API Route Proxy buatan kita
    const response = await axios.get<DetailedMedia>(`/api/tv/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Gagal mengambil detail TV ${id}:`, error);
    return null;
  }
};

// dapatkan tv season episod
export const getTVSeasonEpisodes = async (
  tvId: string,
  seasonNumber: number
): Promise<Episode[]> => {
  try {
    // Panggil internal API Route Next.js
    const response = await axios.get<{ episodes: Episode[] }>(
      `/api/tv/${tvId}/season/${seasonNumber}`
    );
    return response.data.episodes || [];
  } catch (error) {
    console.error(`Gagal mengambil episod Season ${seasonNumber}:`, error);
    return [];
  }
};

export interface TMDBVideo {
  id: string;
  key: string; // YouTube Video Key
  name: string;
  site: string; // e.g. "YouTube"
  type: string; // e.g. "Trailer", "Teaser"
}

export const getTrailerKey = async (
  type: 'movie' | 'tv',
  id: string
): Promise<string | null> => {
  try {
    const response = await axios.get<{ results: TMDBVideo[] }>(
      `/api/videos/${type}/${id}`
    );
    
    // Cari video bertipe "Trailer" dari YouTube
    const trailer = response.data.results.find(
      (v) => v.site === 'YouTube' && v.type === 'Trailer'
    ) || response.data.results.find((v) => v.site === 'YouTube');

    return trailer ? trailer.key : null;
  } catch (error) {
    console.error('Gagal mendapatkan trailer key:', error);
    return null;
  }
};