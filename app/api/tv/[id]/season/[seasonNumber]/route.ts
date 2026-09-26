import { NextResponse } from 'next/server';
import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; seasonNumber: string }> }
) {
  const { id, seasonNumber } = await params;

  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/tv/${id}/season/${seasonNumber}`,
      {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Gagal mengambil episod via Route Handler:', error);
    return NextResponse.json({ episodes: [] }, { status: 500 });
  }
}