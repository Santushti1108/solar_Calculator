export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

export function formatLatitude(lat: number): string {
  return `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}`
}

export function formatLongitude(long: number): string {
  return `${Math.abs(long).toFixed(4)}° ${long >= 0 ? "E" : "W"}`
}