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
    console.log('logging event', event);
    let db = await openEventsDb();
    return db.put('events', event);
}
