import { openDB } from 'idb';
// export function openDb() {
//     let openRequest = indexedDB.open('db', 1);

//     openRequest.onupgradeneeded = reqEvent => {
//         let db = reqEvent.target.result;
//         db.createObjectStore('events', { keyPath: 'id' });
//     };

//     return openRequest;
// }

async function openEventsDb() {
    return await openDB('events', 1, {
        upgrade(db) {
            db.createObjectStore('events', { keyPath: 'id' });
        },
    });
}

export async function saveEvent(event) {
    let db = await openEventsDb();
    return db.put('events', event);
}

// export function saveEvent(event) {
//     let openRequest = openDb();

//     openRequest.onsuccess = reqEvent => {
//         let db = reqEvent.target.result;
//         let transaction = db.transaction('events', 'readwrite');
//         let events = transaction.objectStore('events');
//         events.put(event);
//     };
// }
