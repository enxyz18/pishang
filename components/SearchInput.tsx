'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

function SearchInputContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full sm:w-64">
      <input
        type="text"
        placeholder="Cari filem, TV, pelakon..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-neutral-900 text-xs text-white placeholder-neutral-500 rounded-full pl-9 pr-4 py-2 border border-neutral-800 focus:outline-none focus:border-yellow-500 transition"
      />
      <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
    </form>
  );
}

export default function SearchInput() {
  return (
    <Suspense
      fallback={
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Cari filem, TV, pelakon..."
            disabled
            className="w-full bg-neutral-900 text-xs text-neutral-600 rounded-full pl-9 pr-4 py-2 border border-neutral-800 cursor-not-allowed opacity-60"
          />
          <Search className="w-4 h-4 text-neutral-600 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      }
    >
      <SearchInputContent />
    </Suspense>
  );
}