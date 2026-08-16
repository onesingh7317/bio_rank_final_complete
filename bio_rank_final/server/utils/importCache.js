const crypto = require('crypto');

/* ============================================================
   importCache — short-lived, in-memory store for validated CSV preview
   results, keyed by importId. The confirm endpoint looks up the id
   instead of the client re-sending all row data.

   NOT persisted across server restarts — acceptable for this workflow
   (an admin previews and confirms within the same session, not days
   apart). If that assumption changes, this should move to a real
   collection (e.g. a PendingImport model) instead of a Map.

   Entries expire after TTL_MS so an abandoned preview doesn't leak
   memory forever.
   ============================================================ */
const TTL_MS = 30 * 60 * 1000; // 30 minutes
const store = new Map();

function put(data) {
  const importId = crypto.randomUUID();
  const entry = { data, expiresAt: Date.now() + TTL_MS };
  store.set(importId, entry);
  return importId;
}

function get(importId) {
  const entry = store.get(importId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(importId);
    return null;
  }
  return entry.data;
}

function remove(importId) {
  store.delete(importId);
}

// Lazy sweep of expired entries on every put — good enough at this scale,
// no need for a separate interval timer.
function sweep() {
  const now = Date.now();
  for (const [id, entry] of store.entries()) {
    if (now > entry.expiresAt) store.delete(id);
  }
}

module.exports = {
  put: (data) => {
    sweep();
    return put(data);
  },
  get,
  remove,
};
