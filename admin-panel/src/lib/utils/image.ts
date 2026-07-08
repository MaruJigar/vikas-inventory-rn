export function getImageUrl(url?: string | null): string {
  if (!url) {
    return '/placeholder-image.png'; // Assuming we have a placeholder or Next.js handles it gracefully
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  // Strip version suffix like '/v1' from the API URL since static files are served at the root
  const baseUrl = apiUrl.replace(/\/v\d+\/?$/, '');

  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}
