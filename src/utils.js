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
