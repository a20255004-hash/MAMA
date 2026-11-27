/* Modo sin conexión de Illari Central: guarda solo la carcasa de la app, nunca datos de pedidos. */
const VERSION = "illari-central-v1";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.add(new Request("./", { cache: "reload" }))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin) return; // la base de datos (otro origen) nunca pasa por aquí

  // Archivos de la página con nombre único: primero lo guardado, luego la red.
  if (u.pathname.includes("/_next/static/")) {
    e.respondWith(
      caches.match(r).then(
        (g) =>
          g ||
          fetch(r).then((res) => {
            const copia = res.clone();
            caches.open(VERSION).then((c) => c.put(r, copia));
            return res;
          }),
      ),
    );
    return;
  }

  // Pantallas: primero la red (siempre lo más nuevo); si no hay internet, la última que se vio.
  if (r.mode === "navigate") {
    e.respondWith(
      fetch(r)
        .then((res) => {
          const copia = res.clone();
          caches.open(VERSION).then((c) => c.put(r, copia));
          return res;
        })
        .catch(() => caches.match(r).then((g) => g || caches.match("./"))),
    );
  }
});
