import {
    nip04,
    nip19,
    generateSecretKey,
    getPublicKey,
    finalizeEvent,
} from 'nostr-tools';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { Mutex } from 'async-mutex';
import {
    getProfileIndex,
    get,
    getProfile,
    getPermission,
    setPermission,
} from './utilities/utils';
import { saveEvent } from './utilities/db';

const storage = browser.storage.local;
const log = msg => console.log('Background: ', msg);
const validations = {};
let prompt = { mutex: new Mutex(), release: null, tabId: null };

browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    log(message);
    let uuid = crypto.randomUUID();
    let sr;

    switch (message.kind) {
        // General
        case 'closePrompt':
            prompt.release?.();
            return Promise.resolve(true);
        case 'allowed':
            complete(message);
            return Promise.resolve(true);
        case 'denied':
            deny(message);
            return Promise.resolve(true);
        case 'generatePrivateKey':
            return Promise.resolve(generatePrivateKey_());
        case 'savePrivateKey':
            return savePrivateKey(message.payload);
        case 'getNpub':
            return getNpub(message.payload);
        case 'getNsec':
            return getNsec(message.payload);
        case 'calcPubKey':
            return Promise.resolve(getPublicKey(message.payload));
        case 'npubEncode':
            return Promise.resolve(nip19.npubEncode(message.payload));
        case 'copy':
            return navigator.clipboard.writeText(message.payload);

        // window.nostr
        case 'getPubKey':
        case 'signEvent':
        case 'nip04.encrypt':
        case 'nip04.decrypt':
        case 'getRelays':
            validations[uuid] = sendResponse;
            ask(uuid, message);
            setTimeout(() => {
                prompt.release?.();
            }, 10_000);
            return true;
        default:
            return Promise.resolve();
    }
});

async function forceRelease() {
    if (prompt.tabId !== null) {
        try {
            // If the previous prompt is still open, then this won't do anything.
            // If it's not open, it will throw an error and get caught.
            await browser.tabs.get(prompt.tabId);
        } catch (error) {
            // If the tab is closed, but somehow escaped our event handling, we can clean it up here
            // before attempting to open the next tab.
            prompt.release?.();
            prompt.tabId = null;
        }
    }
}

async function generatePrivateKey_() {
    const sk = generateSecretKey();
    return bytesToHex(sk);
}

async function ask(uuid, { kind, host, payload }) {
    await forceRelease(); // Clean up previous tab if it closed without cleaning itself up
    prompt.release = await prompt.mutex.acquire();

    let mKind = kind === 'signEvent' ? `signEvent:${payload.kind}` : kind;
    let permission = await getPermission(host, mKind);
    if (permission === 'allow') {
        complete({
            payload: uuid,
            origKind: kind,
            event: payload,
            remember: false,
            host,
        });
        prompt.release();
        return;
    }

    if (permission === 'deny') {
        deny({ payload: uuid, origKind: kind, host });
        prompt.release();
        return;
    }

    let qs = new URLSearchParams({
        uuid,
        kind,
        host,
        payload: JSON.stringify(payload || false),
    });
    let tab = await browser.tabs.getCurrent();
    let p = await browser.tabs.create({
        url: `/permission/permission.html?${qs.toString()}`,
        openerTabId: tab.id,
    });
    prompt.tabId = p.id;
    return true;
}

function complete({ payload, origKind, event, remember, host }) {
    sendResponse = validations[payload];

    if (remember) {
        let mKind =
            origKind === 'signEvent' ? `signEvent:${event.kind}` : origKind;
        setPermission(host, mKind, 'allow');
    }

    if (sendResponse) {
        switch (origKind) {
            case 'getPubKey':
                getPubKey().then(pk => {
                    sendResponse(pk);
                });
                break;
            case 'signEvent':
                signEvent_(event, host).then(e => sendResponse(e));
                break;
            case 'nip04.encrypt':
                nip04Encrypt(event).then(e => sendResponse(e));
                break;
            case 'nip04.decrypt':
                nip04Decrypt(event).then(e => sendResponse(e));
                break;
            case 'getRelays':
                getRelays().then(e => sendResponse(e));
                break;
        }
    }
}

function deny({ origKind, host, payload, remember, event }) {
    sendResponse = validations[payload];

    if (remember) {
        let mKind =
            origKind === 'signEvent' ? `signEvent:${event.kind}` : origKind;
        setPermission(host, mKind, 'deny');
    }

    sendResponse?.(undefined);
    return false;
}

// Options
async function savePrivateKey([index, privKey]) {
    if (privKey.startsWith('nsec')) {
        privKey = nip19.decode(privKey).data;
    }
    let profiles = await get('profiles');
    profiles[index].privKey = bytesToHex(privKey);
    await storage.set({ profiles });
    return true;
}

async function getNsec(index) {
    let profile = await getProfile(index);
    let nsec = nip19.nsecEncode(hexToBytes(profile.privKey));
    return nsec;
}

async function getNpub(index) {
    let profile = await getProfile(index);
    let pubKey = getPublicKey(hexToBytes(profile.privKey));
    let npub = nip19.npubEncode(pubKey);
    return npub;
}

async function getPrivKey() {
    let profile = await currentProfile();
    return hexToBytes(profile.privKey);
}

async function getPubKey() {
    let pi = await getProfileIndex();
    let profile = await getProfile(pi);
    let privKey = await getPrivKey();
    let pubKey = getPublicKey(privKey);
    return pubKey;
}

async function currentProfile() {
    let index = await getProfileIndex();
    let profiles = await get('profiles');
    return profiles[index];
}

async function signEvent_(event, host) {
    event = JSON.parse(JSON.stringify(event));
    let sk = await getPrivKey();
    event = finalizeEvent(event, sk);
    saveEvent({
        event,
        metadata: { host, signed_at: Math.round(Date.now() / 1000) },
    });
    return event;
}

async function nip04Encrypt({ pubKey, plainText }) {
    let privKey = await getPrivKey();
    return nip04.encrypt(privKey, pubKey, plainText);
}

async function nip04Decrypt({ pubKey, cipherText }) {
    let privKey = await getPrivKey();
    return nip04.decrypt(privKey, pubKey, cipherText);
}

async function getRelays() {
    let profile = await currentProfile();
    let relays = profile.relays;
    let relayObj = {};
    // The getRelays call expects this to be returned as an object, not array
    relays.forEach(relay => {
        let { url, read, write } = relay;
        relayObj[url] = { read, write };
    });
    return relayObj;
}
