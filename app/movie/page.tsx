import Link from 'next/link';
import Image from 'next/image';
import SearchInput from '@/components/SearchInput';
import BackButton from '@/components/BackButton';
import { TMDB_IMAGE_BASE_URL } from '@/lib/tmdb';
import { Star } from 'lucide-react';

interface MoviePageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function MoviesPage({ searchParams }: MoviePageProps) {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  // Mengambil senarai Trending Movies dari TMDB
  const res = await fetch(
    `https://api.themoviedb.org/3/trending/movie/day?page=${currentPage}`,
    {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}`,
      },
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) {
    throw new Error('Gagal mengambil data filem.');
  }

  const data = await res.json();
  const movies = data.results || [];
  const totalPages = Math.min(data.total_pages || 1, 500); // Max 500 pages dari TMDB

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-4 sm:p-8 space-y-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto border-b border-neutral-800 pb-4 flex items-center justify-between gap-4">
        <Link href="/">
          <h1 className="text-3xl font-extrabold text-yellow-500 tracking-wider">
            PISHANG 🍌
          </h1>
          <p className="text-neutral-400 text-xs mt-1">
           Laman Penstriman Filem & TV Show
          </p>
        </Link>
        <SearchInput />
      </header>

      <div className="max-w-6xl mx-auto space-y-6">
        <BackButton />

        <div className="border-l-4 border-yellow-500 pl-3 flex items-baseline justify-between">
          <div>
            <h1 className="text-2xl font-bold">Semua Filem</h1>
            <p className="text-xs text-neutral-400 mt-1">
              Halaman {currentPage} daripada {totalPages}
            </p>
          </div>
        </div>

        {/* Grid Filem */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {movies.map((movie: any) => (
            <Link
              key={movie.id}
              href={`/movie/${movie.id}`}
              className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 hover:scale-105 transition duration-200 shadow-md group flex flex-col"
            >
              <div className="relative aspect-[2/3] w-full bg-neutral-800">
                {movie.poster_path ? (
                  <Image
                    src={`${TMDB_IMAGE_BASE_URL}${movie.poster_path}`}
                    alt={movie.title || 'Poster'}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-neutral-500 text-xs">
                    Tiada Poster
                  </div>
                )}
                {movie.vote_average > 0 && (
                  <div className="absolute top-2 right-2 bg-black/80 text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 backdrop-blur-sm">
                    <Star className="w-3 h-3 fill-yellow-400" />
                    <span>{movie.vote_average.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <h2 className="font-semibold text-xs sm:text-sm line-clamp-1 group-hover:text-yellow-400 transition">
                  {movie.title}
                </h2>
              </div>
            </Link>
          ))}
        </div>

        {/* Kawalan Paginasi */}
        <div className="flex items-center justify-center gap-4 pt-8">
          {currentPage > 1 ? (
            <Link
              href={`/movie?page=${currentPage - 1}`}
              className="bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 px-4 py-2 rounded-lg text-xs font-semibold transition"
            >
              &larr; Sebelumnya
            </Link>
          ) : (
            <span className="bg-neutral-900/50 text-neutral-600 border border-neutral-900 px-4 py-2 rounded-lg text-xs font-semibold cursor-not-allowed">
              &larr; Sebelumnya
            </span>
          )}

          <span className="text-xs font-bold text-yellow-500 bg-neutral-900 px-3.5 py-2 rounded-lg border border-neutral-800">
            {currentPage}
          </span>

          {currentPage < totalPages && (
            <Link
              href={`/movie?page=${currentPage + 1}`}
              className="bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 px-4 py-2 rounded-lg text-xs font-semibold transition"
            >
              Seterusnya &rarr;
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}