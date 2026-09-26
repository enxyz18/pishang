import { searchMulti, TMDB_IMAGE_BASE_URL } from '@/lib/tmdb';
import SearchInput from '@/components/SearchInput';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import BackButton from '@/components/BackButton';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: query = '', page = '1' } = await searchParams;
  const currentPage = parseInt(page, 10) || 1;

  const { results, total_pages } = await searchMulti(query, currentPage);

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-4 sm:p-8 space-y-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto border-b border-neutral-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/">
            <h1 className="text-3xl font-extrabold text-yellow-500 tracking-wider cursor-pointer">
              PISHANG 🍌
            </h1>
          </Link>
          <p className="text-neutral-400 text-xs mt-1">
            Hasil Carian Kandungan
          </p>
        </div>
        <SearchInput />
      </header>
      
      <section className="max-w-6xl mx-auto space-y-6">
        <BackButton />
        <div className="border-l-4 border-yellow-500 pl-3">
          <h2 className="text-lg sm:text-xl font-bold tracking-wide">
            Hasil carian untuk: <span className="text-yellow-400">"{query}"</span>
          </h2>
        </div>

        {results.length === 0 ? (
          <p className="text-sm text-neutral-400 py-10">
            Tiada kandungan atau pelakon ditemui bagi kata kunci ini.
          </p>
        ) : (
          <>
            {/* Grid Hasil Carian */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {results.map((item) => (
                <Link
                  key={`${item.media_type}-${item.id}`}
                  href={`/${item.media_type}/${item.id}`}
                  className="bg-neutral-900 rounded-lg overflow-hidden border border-neutral-800 hover:scale-105 transition duration-200 shadow-sm group flex flex-col cursor-pointer"
                >
                  <div className="relative aspect-[2/3] w-full bg-neutral-800">
                    {item.poster_path ? (
                      <Image
                        src={`${TMDB_IMAGE_BASE_URL}${item.poster_path}`}
                        alt={item.title || 'Poster'}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                        className="object-cover group-hover:opacity-90 transition"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-[10px] text-neutral-500 p-2 text-center">
                        Tiada Poster
                      </div>
                    )}
                    <span className="absolute top-2 left-2 bg-black/70 text-yellow-400 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded backdrop-blur-sm">
                      {item.media_type}
                    </span>
                  </div>

                  <div className="p-2.5 flex flex-col justify-between flex-1">
                    <h3 className="font-medium text-xs line-clamp-1 group-hover:text-yellow-400 transition text-neutral-200">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1.5">
                      <span>{item.release_date?.split('-')[0] || 'N/A'}</span>
                      <div className="flex items-center gap-0.5 text-yellow-500 font-semibold">
                        <Star className="w-3 h-3 fill-yellow-500" />
                        <span>
                          {item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {total_pages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-8">
                {currentPage > 1 ? (
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}&page=${currentPage - 1}`}
                    className="flex items-center gap-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </Link>
                ) : (
                  <div className="opacity-30 cursor-not-allowed flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg text-xs font-medium text-white">
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </div>
                )}

                <span className="text-xs text-neutral-400">
                  Halaman <span className="text-white font-bold">{currentPage}</span> dari{' '}
                  <span className="text-white font-bold">{total_pages}</span>
                </span>

                {currentPage < total_pages ? (
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}&page=${currentPage + 1}`}
                    className="flex items-center gap-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="opacity-30 cursor-not-allowed flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg text-xs font-medium text-white">
                    Next <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}