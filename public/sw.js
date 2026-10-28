const CACHE = "tracker-v1";
const BASE = new URL(self.registration.scope).pathname;
const ROUTES = ["", "habits/", "progress/", "calendar/", "meditation/", "profile/"];
const FILES = [
  "manifest.webmanifest",
  "logo.svg",
  "icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
];
const ASSET = /(?:src|href)="([^"]*\/_next\/static\/[^"]+)"/g;

const precache = async () => {
  const cache = await caches.open(CACHE);
  const assets = new Set();
  await Promise.all(
    ROUTES.map(async (route) => {
      const url = BASE + route;
      const response = await fetch(url, { cache: "no-cache" });
      if (!response.ok) return;
      const html = await response.clone().text();
      await cache.put(url, response);
      for (const match of html.matchAll(ASSET)) assets.add(match[1]);
      const rsc = await fetch(url + "index.txt").catch(() => null);
      if (rsc && rsc.ok) await cache.put(url + "index.txt", rsc);
    }),
  );
  await Promise.all(
    [...assets, ...FILES.map((file) => BASE + file)].map((url) =>
      cache.add(url).catch(() => {}),
    ),
  );
};

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);

const networkFirst = async (request) => {
  const cache = await caches.open(CACHE);
  try {
    const response = await withTimeout(fetch(request), 4000);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached =
      (await cache.match(request, { ignoreSearch: true })) ||
      (request.mode === "navigate" && (await cache.match(BASE + "progress/")));
    if (cached) return cached;
    throw new Error("offline");
  }
};

const cacheFirst = async (request) => {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
};

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(BASE)) return;
  if (url.pathname.includes("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }
  event.respondWith(networkFirst(request));
});
