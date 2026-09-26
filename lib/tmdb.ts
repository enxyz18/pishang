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
export const searchMulti = async (query: string, page: number = 1) => {
  if (!query) return { results: [], total_pages: 0, page: 1 };

  try {
    const response = await tmdbClient.get<TMDBResponse<SearchResultItem>>('/search/multi', {
      params: {
        query,
        page,
        include_adult: false,
      },
    });

    // Proses data hasil carian
    const formattedResults: SearchResultItem[] = [];

    response.data.results.forEach((item) => {
      if (item.media_type === 'movie' || item.media_type === 'tv') {
        formattedResults.push({
          ...item,
          title: item.title || item.name,
          release_date: item.release_date || item.first_air_date,
        });
      } else if (item.media_type === 'person' && item.known_for) {
        // Jika carian jumpa nama pelakon, masukkan filem/tv lakonan beliau
        item.known_for.forEach((known) => {
          if (known.media_type === 'movie' || known.media_type === 'tv') {
            formattedResults.push({
              ...known,
              title: known.title || known.name,
              release_date: known.release_date || known.first_air_date,
            });
          }
        });
      }
    });

    // Buang item bertindih (duplicate ID)
    const uniqueResults = Array.from(
      new Map(formattedResults.map((m) => [m.id, m])).values()
    );

    return {
      results: uniqueResults,
      total_pages: response.data.total_pages,
      page: response.data.page,
    };
  } catch (error) {
    console.error('Gagal membuat carian:', error);
    return { results: [], total_pages: 0, page: 1 };
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