export function cleanImageUrl(url) {
  if (!url) return null;

  let cleanUrl = url.replaceAll("//", "/").replace("https:/", "https://");

  if (!cleanUrl.includes("/public/")) {
    cleanUrl = cleanUrl.replace("/storage/", "/public/storage/");
  }

  if (!cleanUrl.startsWith("http")) {
    cleanUrl = `https://www.gogenericpharma.com${cleanUrl}`;
  }

  return cleanUrl;
}

export function adjustColor(hex, percent, lighter = false) {
  let r = parseInt(hex.slice(1,3),16);
  let g = parseInt(hex.slice(3,5),16);
  let b = parseInt(hex.slice(5,7),16);

  if (lighter) {
    r = Math.min(255, Math.floor(r + (255 - r) * (percent/100)));
    g = Math.min(255, Math.floor(g + (255 - g) * (percent/100)));
    b = Math.min(255, Math.floor(b + (255 - b) * (percent/100)));
  } else {
    r = Math.max(0, Math.floor(r * (1 - percent/100)));
    g = Math.max(0, Math.floor(g * (1 - percent/100)));
    b = Math.max(0, Math.floor(b * (1 - percent/100)));
  }

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Black ya white text choose karne ke liye (contrast)
export function getContrastColor(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 125 ? "#0F1717" : "#f0f8f5"; // dark ya light
}