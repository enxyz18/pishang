import { NextResponse } from 'next/server';
import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await params; // type = 'movie' atau 'tv'

  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/${type}/${id}/videos`,
      {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}`,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Gagal mengambil video dari TMDB:', error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}