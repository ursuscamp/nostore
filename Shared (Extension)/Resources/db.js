import { openDB } from 'idb';

async function openEventsDb() {
    return await openDB('events', 1, {
        upgrade(db) {
            const events = db.createObjectStore('events', {
                keyPath: 'event.id',
            });
            events.createIndex('pubkey', 'event.pubkey');
            events.createIndex('created_at', 'event.created_at');
            events.createIndex('kind', 'event.kind');
            events.createIndex('host', 'metadata.host');
        },
    });
}

export async function saveEvent(event) {
    let db = await openEventsDb();
    return db.put('events', event);
}

export async function sortByIndex(index, query, asc, max) {
    let db = await openEventsDb();
    let events = [];
    let cursor = await db
        .transaction('events')
        .store.index(index)
        .openCursor(query, asc ? 'next' : 'prev');
    while (cursor) {
        events.push(cursor.value);
        if (cursor.length >= max) {
            break;
        }
        cursor = await cursor.continue();
    }
    return events;
}
