export function getImageUrl(url?: string | null): string {
  if (!url) {
    return '/placeholder-image.png'; // Assuming we have a placeholder or Next.js handles it gracefully
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`;
}
