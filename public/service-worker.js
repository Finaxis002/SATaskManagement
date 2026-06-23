const SHARE_DB_NAME = "sataskmanagement-share-target";
const SHARE_STORE_NAME = "shares";
const SHARE_DB_VERSION = 1;

function openShareDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(SHARE_DB_NAME, SHARE_DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(SHARE_STORE_NAME)) {
        db.createObjectStore(SHARE_STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveSharedPayload(payload) {
  const db = await openShareDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SHARE_STORE_NAME, "readwrite");
    transaction.objectStore(SHARE_STORE_NAME).add(payload);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (event.request.method === "POST" && url.pathname === "/inbox/share-target") {
    event.respondWith(
      (async () => {
        const formData = await event.request.formData();
        const files = formData
          .getAll("files")
          .filter((item) => item instanceof File && item.size > 0);

        await saveSharedPayload({
          createdAt: Date.now(),
          title: formData.get("title") || "",
          text: formData.get("text") || "",
          url: formData.get("url") || "",
          files,
        });

        return Response.redirect("/inbox?shared=1", 303);
      })()
    );
  }

  // Normal app requests are intentionally not intercepted.
});
