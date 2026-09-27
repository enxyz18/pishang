import { getTrendingMovies, getTrendingTVShows, TMDB_IMAGE_BASE_URL } from '@/lib/tmdb';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';
import { Movie } from '@/types/tmdb';
import SearchInput from '@/components/SearchInput';

export default async function HomePage() {
  const [movies, tvShows] = await Promise.all([
    getTrendingMovies(),
    getTrendingTVShows(),
  ]);

  const renderGrid = (items: Movie[], mediaType: 'movie' | 'tv') => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      {/* 10 Kad Tajuk Filem / TV */}
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/${mediaType}/${item.id}`}
          className="bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800 hover:scale-105 transition duration-200 shadow-sm group flex flex-col cursor-pointer"
        >
          {/* Poster Filem/TV */}
          <div className="relative aspect-[2/3] w-full bg-neutral-800">
            {item.poster_path ? (
              <Image
                src={`${TMDB_IMAGE_BASE_URL}${item.poster_path}`}
                alt={item.title}
                fill
                priority
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                className="object-cover group-hover:opacity-90 transition"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-[10px] text-neutral-500 p-2 text-center">
                Tiada Poster
              </div>
            )}
          </div>

          {/* Info Ringkas */}
          <div className="p-2.5 flex flex-col justify-between flex-1">
            <h3 className="font-medium text-xs line-clamp-1 group-hover:text-yellow-400 transition text-neutral-200">
              {item.title}
            </h3>
            <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1.5">
              <span>{item.release_date?.split('-')[0] || 'N/A'}</span>
              <div className="flex items-center gap-0.5 text-yellow-500 font-semibold">
                <Star className="w-3 h-3 fill-yellow-500" />
                <span>{item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}

      {/* Kad 'See More' di Akhir Grid */}
      <Link
        href={`/${mediaType}`}
        className="bg-neutral-900/60 hover:bg-neutral-800/80 rounded-lg border border-dashed border-neutral-700 hover:border-yellow-500/80 transition duration-200 flex flex-col items-center justify-center gap-2 p-4 text-neutral-400 hover:text-yellow-400 group min-h-[180px] sm:min-h-[220px]"
      >
        <div className="p-2.5 rounded-full bg-neutral-800 group-hover:bg-yellow-500/20 group-hover:scale-110 transition duration-200">
          <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-yellow-400" />
        </div>
        <span className="text-xs font-semibold tracking-wide">See More</span>
      </Link>
    </div>
  );

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-4 sm:p-8 space-y-10">
      {/* Header / Brand (Diselaraskan juga ke tengah) */}
      <header className="max-w-6xl mx-auto border-b border-neutral-800 pb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-yellow-500 tracking-wider">
            PISHANG 🍌
         </h1>
          <p className="text-neutral-400 text-xs mt-1">
           <s>Laman</s> Lanun Penstriman Filem & TV Show
          </p>
        </div>

        {/* Kotak Carian Header */}
        <div className="shrink-0">
          <SearchInput />
        </div>              
      </header>

      {/* Section 0: Notis */}
      <section className="max-w-6xl mx-auto space-y-0">
        <div><center>
          <p> "Barang siapa yang melayari Pishang dengan menggunakan browser Brave, maka tiadalah dia terganggu dengan iklan bodoh."
            </p>- Hj Maikel
            </center>
        </div>
      </section>  
      {/* Section 1: Trending Movies */}
      <section className="max-w-6xl mx-auto space-y-4">
        <div className="border-l-4 border-yellow-500 pl-3">
          <h2 className="text-lg sm:text-xl font-bold tracking-wide">
            Trending Movies
          </h2>
        </div>

        {movies.length === 0 ? (
          <p className="text-xs text-neutral-500">Tiada kandungan ditemui.</p>
        ) : (
          renderGrid(movies, 'movie')
        )}
      </section>

      {/* Section 2: Trending TV Shows */}
      <section className="max-w-6xl mx-auto space-y-4">
        <div className="border-l-4 border-yellow-500 pl-3">
          <h2 className="text-lg sm:text-xl font-bold tracking-wide">
            Trending TV Shows
          </h2>
        </div>

        {tvShows.length === 0 ? (
          <p className="text-xs text-neutral-500">Tiada kandungan ditemui.</p>
        ) : (
          renderGrid(tvShows, 'tv')
        )}
      </section>
    </main>
  );
}