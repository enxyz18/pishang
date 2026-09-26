export interface Movie {
  id: number;
  title: string;
  name?: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  first_air_date?: string;
  vote_average: number;
  media_type?: string;
}

export interface SearchResultItem {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  overview?: string;
  poster_path?: string | null;
  profile_path?: string | null; // Untuk pelakon
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  media_type: 'movie' | 'tv' | 'person';
  known_for?: SearchResultItem[]; // Kandungan terkenal bawah pelakon
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path: string | null;
  air_date: string | null;
}

export interface DetailedMedia {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  runtime?: number; // Untuk Movie (minit)
  episode_run_time?: number[]; // Untuk TV
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: Season[];
  credits?: {
    cast: Cast[];
  };
  recommendations?: {
    results: Movie[];
  };
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  still_path: string | null;
  air_date: string | null;
}