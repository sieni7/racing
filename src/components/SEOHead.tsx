import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedAt?: string;
  author?: string;
  jsonLd?: Record<string, unknown>;
}

const SITE_NAME = 'Racing Club de Bingerville';
const BASE_URL = 'https://racingclub.ci';
const DEFAULT_IMAGE = 'https://racingclub.ci/og-image.jpg';
const DEFAULT_DESC = 'Site officiel du Racing Club de Bingerville — actualités, matchs, effectif, galerie et classement.';

export default function SEOHead({ title, description, image, url, type = 'website', publishedAt, author, jsonLd }: SEOHeadProps) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const pageUrl = url ? `${BASE_URL}${url}` : BASE_URL;
  const pageImage = image || DEFAULT_IMAGE;
  const pageDesc = description || DEFAULT_DESC;

  useEffect(() => {
    const tags: { el: HTMLElement; cleanup: () => void }[] = [];

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
      tags.push({ el, cleanup: () => el?.remove() });
    };

    // Title
    document.title = pageTitle;

    // Standard meta
    setMeta('description', pageDesc);
    setMeta('keywords', 'Racing Club de Bingerville, football, Côte d\'Ivoire, club, matchs, actualités');

    // Open Graph
    setMeta('og:title', pageTitle, true);
    setMeta('og:description', pageDesc, true);
    setMeta('og:image', pageImage, true);
    setMeta('og:url', pageUrl, true);
    setMeta('og:type', type, true);
    setMeta('og:site_name', SITE_NAME, true);

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', pageTitle);
    setMeta('twitter:description', pageDesc);
    setMeta('twitter:image', pageImage);

    // Article meta
    if (type === 'article' && publishedAt) {
      setMeta('article:published_time', publishedAt, true);
      if (author) setMeta('article:author', author, true);
    }

    // JSON-LD
    if (jsonLd) {
      let script = document.querySelector('#json-ld') as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = 'json-ld';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
      tags.push({ el: script, cleanup: () => script?.remove() });
    }

    return () => {
      tags.forEach(t => t.cleanup());
    };
  }, [pageTitle, pageDesc, pageImage, pageUrl, type, publishedAt, author, jsonLd]);

  return null;
}

// Structured data helpers
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: 'Racing Club de Bingerville',
    alternateName: 'RC Bingerville',
    url: BASE_URL,
    logo: `${BASE_URL}/icon-512.png`,
    foundingDate: '1950',
    location: { '@type': 'Place', name: 'Bingerville, Côte d\'Ivoire' },
    sport: 'Football',
    sameAs: ['https://facebook.com/rcbingerville', 'https://instagram.com/rcbingerville', 'https://twitter.com/rcbingerville'],
  };
}

export function articleJsonLd(title: string, desc: string, url: string, image: string, publishedAt: string, author: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: desc,
    image,
    url: `${BASE_URL}${url}`,
    datePublished: publishedAt,
    author: { '@type': 'Person', name: author },
    publisher: { '@type': 'Organization', name: SITE_NAME, logo: `${BASE_URL}/icon-512.png` },
  };
}

export function eventJsonLd(name: string, date: string, location: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name,
    startDate: date,
    location: { '@type': 'Place', name: location },
    organizer: { '@type': 'SportsOrganization', name: SITE_NAME },
  };
}
