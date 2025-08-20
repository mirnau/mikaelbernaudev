import { XMLParser } from "fast-xml-parser";
import { mkdir, writeFile } from "node:fs/promises";

// add near top
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
const toArray = (x) => (Array.isArray(x) ? x : x ? [x] : []);

function resolveUrl(base, u) {
   if (!u) return null;
   try {
      if (u.startsWith("//")) return new URL("https:" + u).href;
      if (/^https?:\/\//i.test(u)) return u;
      return new URL(u, base).href; // handles /relative and ./relative
   } catch {
      return null;
   }
}

function pickFromSrcset(srcset) {
   if (!srcset) return null;
   // "url1 320w, url2 640w ..." → take the first URL token
   const first = srcset.split(",")[0]?.trim();
   if (!first) return null;
   return first.split(/\s+/)[0];
}

function extractFirstImage(html = "", base = "") {
   if (!html) return { cleaned: html, img: null };
   // match <img ...> and capture src / data-src / data-image / srcset
   const rx =
      /<img\b[^>]*?(?:src\s*=\s*["']([^"']+)["'])?[^>]*?(?:data-src\s*=\s*["']([^"']+)["'])?[^>]*?(?:data-image\s*=\s*["']([^"']+)["'])?[^>]*?(?:srcset\s*=\s*["']([^"']+)["'])?[^>]*>/i;
   const m = html.match(rx);
   if (!m) return { cleaned: html, img: null };
   const [, src, dataSrc, dataImage, srcset] = m;
   const candidate = src || dataSrc || dataImage || pickFromSrcset(srcset);
   const abs = resolveUrl(base, candidate);
   const cleaned = html.replace(m[0], "");
   return { cleaned, img: abs };
}

function extractYouTubeIdFromHtml(html = "") {
   return (
      html.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/)?.[1] ??
      html.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/)?.[1] ??
      html.match(/[?&]v=([a-zA-Z0-9_-]{6,})/)?.[1] ??
      null
   );
}

function extractYouTubeIdFromItem(it) {
   const html = it?.description ?? it?.["content:encoded"] ?? "";
   const url = it?.["media:content"]?.["@_url"] ?? it?.enclosure?.["@_url"] ?? "";
   return extractYouTubeIdFromHtml(html) || extractYouTubeIdFromHtml(url) || null;
}

function normalize(feedUrl, raw) {
   const chan = raw?.rss?.channel;
   if (!chan) throw new Error("Unexpected feed format: missing rss.channel");
   // base for resolving relative paths (prefer channel.link, fallback to feed URL)
   const base = resolveUrl(feedUrl, chan?.link ?? feedUrl);

   const items = toArray(chan.item).map((it) => {
      const guid = (it?.guid && (it.guid["#text"] ?? it.guid)) || it?.link || it?.title || String(Math.random());

      const rawHtml = it?.description ?? it?.["content:encoded"] ?? "";
      const { cleaned, img: htmlImg } = extractFirstImage(rawHtml, base);

      const mediaUrl =
         resolveUrl(base, it?.["media:content"]?.["@_url"]) ||
         resolveUrl(base, it?.["media:thumbnail"]?.["@_url"]) ||
         (it?.enclosure?.["@_type"]?.startsWith?.("image/") ? resolveUrl(base, it?.enclosure?.["@_url"]) : null) ||
         null;

      const image = mediaUrl || htmlImg || null;

      const ytId = extractYouTubeIdFromItem(it);
      const video = ytId
         ? {
              provider: "youtube",
              id: ytId,
              embed: `https://www.youtube-nocookie.com/embed/${ytId}`,
              thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
           }
         : null;

      return {
         title: it?.title ?? "",
         link: resolveUrl(base, it?.link) ?? "",
         descriptionHtml: cleaned || rawHtml || "",
         date: it?.pubDate ?? "",
         guid,
         image,
         video,
      };
   });

   return {
      title: chan?.title ?? "",
      link: resolveUrl(base, chan?.link) ?? "",
      description: chan?.description ?? "",
      items,
      fetchedAt: new Date().toISOString(),
      source: feedUrl,
   };
}
