export function getImageUrl(url?: string | string[] | null): string {
  if (!url) {
    return '/placeholder-image.png'; // Assuming we have a placeholder or Next.js handles it gracefully
  }

  let firstUrl = '';
  if (Array.isArray(url)) {
    firstUrl = url[0] || '';
  } else {
    firstUrl = url.split(',')[0]?.trim() || '';
  }

  if (!firstUrl) {
    return '/placeholder-image.png';
  }

  if (firstUrl.startsWith('http://') || firstUrl.startsWith('https://')) {
    return firstUrl;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  // Strip version suffix like '/v1' from the API URL since static files are served at the root
  const baseUrl = apiUrl.replace(/\/v\d+\/?$/, '');

  return `${baseUrl}${firstUrl.startsWith('/') ? '' : '/'}${firstUrl}`;
}
