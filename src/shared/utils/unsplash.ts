export function unsplashUrl(photo: string, w = 800): string {
  return `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${w}&q=80`
}
