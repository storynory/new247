// src/routes/feed.rss/+server.ts
import { getAllPodcasts } from '$lib/server/content';
import type { RequestHandler } from './$types';

export const prerender = true; // generate a static feed at build time

export const GET: RequestHandler = () => {
	const site = 'https://www.philosophy247.org';
	const title = 'Philosophy 24/7';
  const podhost ='http://traffic.libsyn.com/philosophy247/'
	const description =
		'Concise interviews with leading philosophers about moral, political and social issues.';

	const items = getAllPodcasts()
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.map((p) => {
			const link = `${site}/podcasts/${p.slug}`;
			const audioUrl = p.mp3 ? `${podhost}${p.mp3}` : '';

			return `
      <item>
        <title><![CDATA[${p.title}]]></title>
        <link>${link}</link>
        <guid isPermaLink="true">${link}</guid>
        <pubDate>${new Date(p.date).toUTCString()}</pubDate>

        <description><![CDATA[${
					p.description || p.bodyHtml || ''
				}]]></description>

        ${
					audioUrl
						? `<enclosure url="${audioUrl}" length="${p.length || 0}" type="audio/mpeg" />`
						: ''
				}

        ${p.duration ? `<itunes:duration>${p.duration}</itunes:duration>` : ''}
        ${p.thumb ? `<itunes:image href="${site}${p.thumb}" />` : ''}

        ${
					p.with && p.with.length > 0
						? `<itunes:author>${p.with.join(', ')}</itunes:author>`
						: ''
				}
      </item>`;
		})
		.join('');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss
  version="2.0"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
>
  <channel>
    <title>${title}</title>
    <link>${site}</link>
    <description>${description}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>

    <!-- Apple Podcasts requirements -->
    <itunes:author>David Edmonds</itunes:author>
    <itunes:explicit>false</itunes:explicit>

    <itunes:category text="Society & Culture">
      <itunes:category text="Philosophy" />
    </itunes:category>

    <image>
      <url>${site}/itunes247.jpg</url>
      <title>${title}</title>
      <link>${site}</link>
    </image>

    ${items}
  </channel>
</rss>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};

