export const SEARCH_ENGINES = {
  google: "https://www.google.com/search?q=%s",
  duckduckgo: "https://duckduckgo.com/?q=%s",
  bing: "https://www.bing.com/search?q=%s",
  brave: "https://search.brave.com/search?q=%s",
  startpage: "https://www.startpage.com/do/search?q=%s",
};

const SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i;
const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;

export function isLikelyUrl(input) {
  const value = (input || "").trim();
  if (!value || /\s/.test(value)) return false;
  if (SCHEME.test(value)) return true;
  const host = value.split(/[/?#]/)[0].replace(/:\d+$/, "");
  if (host === "localhost" || IPV4.test(host)) return true;
  const labels = host.split(".");
  if (labels.length < 2 || labels.some((l) => !l)) return false;
  return /^[a-z]{2,}$/i.test(labels[labels.length - 1]);
}

export function toTarget(input, template = SEARCH_ENGINES.google) {
  const value = (input || "").trim();
  if (SCHEME.test(value)) return value;
  if (isLikelyUrl(value)) return "https://" + value;
  return template.replace("%s", encodeURIComponent(value));
}

export function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
