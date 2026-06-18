import { NextRequest } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return Response.json({ error: 'URL is required' }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return Response.json({ error: 'Invalid URL provided' }, { status: 400 });
  }

  let html: string;
  try {
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OGChecker/1.0; +https://ogchecker.local)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return Response.json(
        { error: `Target URL returned ${response.status} ${response.statusText}` },
        { status: 400 }
      );
    }

    html = await response.text();
  } catch {
    return Response.json({ error: 'Failed to reach the URL' }, { status: 400 });
  }

  const $ = cheerio.load(html);

  const getOg = (property: string) =>
    $(`meta[property="og:${property}"]`).attr('content') ??
    $(`meta[name="og:${property}"]`).attr('content') ??
    null;

  const rawImage = getOg('image');
  let resolvedImage: string | null = null;
  if (rawImage) {
    try {
      resolvedImage = rawImage.startsWith('http')
        ? rawImage
        : new URL(rawImage, parsedUrl.origin).toString();
    } catch {
      resolvedImage = rawImage;
    }
  }

  const metadata = {
    title: getOg('title') ?? ($('title').text().trim() || null),
    description:
      getOg('description') ??
      $('meta[name="description"]').attr('content') ??
      null,
    image: resolvedImage,
    imageWidth: getOg('image:width'),
    imageHeight: getOg('image:height'),
    imageAlt: getOg('image:alt'),
    url: getOg('url') ?? url,
    type: getOg('type'),
    siteName: getOg('site_name'),
  };

  return Response.json({ metadata });
}
