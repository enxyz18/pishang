'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-yellow-400 transition cursor-pointer"
    >
      <ArrowLeft className="w-4 h-4" /> Kembali
    </button>
  );
}