import { NextResponse } from 'next/server';
import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    // 1. Cari pelakon mengikut nama
    const personRes = await axios.get(`${TMDB_BASE_URL}/search/person`, {
      params: { query },
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}`,
      },
    });

    const persons = personRes.data.results;

    if (!persons || persons.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // Ambil pelakon pertama yang paling padan
    const personId = persons[0].id;

    // 2. Ambil semua filem & TV show lakonan pelakon tersebut (combined_credits)
    const creditsRes = await axios.get(
      `${TMDB_BASE_URL}/person/${personId}/combined_credits`,
      {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}`,
        },
      }
    );

    // Ambil senarai cast dan susun mengikut populariti / tarikh
    const castMedia = creditsRes.data.cast || [];

    // Tapis media yang mempunyai poster dan susun mengikut populariti
    const sortedMedia = castMedia
      .filter((item: any) => item.poster_path)
      .sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0));

    return NextResponse.json({
      person: persons[0],
      results: sortedMedia,
    });
  } catch (error) {
    console.error('Gagal mengambil filmografi pelakon:', error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}