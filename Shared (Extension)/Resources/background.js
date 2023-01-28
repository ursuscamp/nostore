import {
    generatePrivateKey,
    getPublicKey,
    signEvent,
    nip04,
    nip19,
} from 'nostr-tools';

const storage = browser.storage.local;
const log = msg => console.log('Background: ', msg);

browser.runtime.onInstalled.addListener(async ({ reason }) => {
    // I would like to be able to skip this for development purposes
    let ignoreHook = (await storage.get({ ignoreInstallHook: false }))
        .ignoreInstallHook;
    if (ignoreHook === true) {
        return;
    }
    if (['install'].includes(reason)) {
        browser.tabs.create({
            url: 'https://ursus.camp/nostore',
        });
    }
});

browser.runtime.onMessage.addListener(
    async (message, _sender, sendResponse) => {
        log(message);

        switch (message.kind) {
            // General
            case 'log':
                console.log(
                    message.payload.module ? `${module}: ` : '',
                    message.payload.msg
                );
                break;
            case 'generatePrivateKey':
                sendResponse(generatePrivateKey());
                break;

            // Options page
            case 'newProfile':
                let newIndex = await newProfile();
                sendResponse(newIndex);
                break;
            case 'savePrivateKey':
                await savePrivateKey(message.payload);
                break;
            case 'saveProfileName':
                await saveProfileName(message.payload);
                break;
            case 'getNpub':
                let npub = await getNpub(message.payload);
                sendResponse(npub);
                break;
            case 'getNsec':
                let nsec = await getNsec(message.payload);
                sendResponse(nsec);
                break;

            case 'getPubKey':
                let pubKey = await getPubKey();
                sendResponse(pubKey);
                break;
            case 'getHosts':
                let hosts = await getHosts();
                sendResponse(hosts);
                break;
            case 'clearData':
                await clearData();
                break;
            case 'deleteProfile':
                await deleteProfile(message.payload);
                break;
            case 'getRelaysForProfile':
                let profileRelays = await getRelaysForProfile(message.payload);
                sendResponse(profileRelays);
                break;
            case 'saveRelaysForProfile':
                let [srfpIndex, srfpRelays] = message.payload;
                await saveRelaysForProfile(srfpIndex, srfpRelays);
                break;
            case 'getNameForProfile':
                let nameForProfile = await getNameForProfile(message.payload);
                sendResponse(nameForProfile);
                break;

            // window.nostr
            case 'signEvent':
                let event = await signEvent_(message.payload);
                sendResponse(event);
                break;
            case 'nip04.encrypt':
                let cipherText = await nip04Encrypt(message.payload);
                sendResponse(cipherText);
                break;
            case 'nip04.decrypt':
                let plainText = await nip04Decrypt(message.payload);
                sendResponse(plainText);
                break;
            case 'getRelays':
                let relays = await getRelays();
                sendResponse(relays);
                break;

            default:
                break;
        }
        return false;
    }
);

// Options
async function clearData() {
    let ignoreInstallHook = await storage.get({ ignoreInstallHook: false });
    await storage.clear();
    await storage.set(ignoreInstallHook);
}

async function savePrivateKey([index, privKey]) {
    if (privKey.startsWith('nsec')) {
        privKey = nip19.decode(privKey).data;
    }
    let profiles = await get('profiles');
    profiles[index].privKey = privKey;
    await storage.set({ profiles });
}

async function saveProfileName([index, profileName]) {
    let profiles = await get('profiles');
    profiles[index].name = profileName;
    await storage.set({ profiles });
}

async function getNsec(index) {
    let profile = await getProfile(index);
    let nsec = nip19.nsecEncode(profile.privKey);
    return nsec;
}

async function getNpub(index) {
    let profile = await getProfile(index);
    let pubKey = getPublicKey(profile.privKey);
    let npub = nip19.npubEncode(pubKey);
    return npub;
}

async function getPrivKey() {
    let profile = await currentProfile();
    return profile.privKey;
}

async function getPubKey() {
    let privKey = await getPrivKey();
    let pubKey = getPublicKey(privKey);
    return pubKey;
}

async function currentProfile() {
    let index = await getProfileIndex();
    let profiles = await get('profiles');
    let currentProfile = profiles[index];
    currentProfile.nsecKey = nip19.nsecEncode(currentProfile.privKey);
    return profiles[index];
}

async function newProfile() {
    let profiles = await get('profiles');
    const newProfile = {
        name: 'New Profile',
        privKey: generatePrivateKey(),
        hosts: [],
        relays: [],
    };
    profiles.push(newProfile);
    await storage.set({ profiles });
    return profiles.length - 1;
}

async function signEvent_(event) {
    event = { ...event };
    let privKey = await getPrivKey();
    event.sig = signEvent(event, privKey);
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
    let relays = {};
    let profileRelays = profile.relays || [];
    profileRelays.forEach(relay => {
        relays[relay.url] = { read: relay.read, write: relay.write };
    });
    return relays;
}

async function getRelaysForProfile(profileIndex) {
    let profiles = await get('profiles');
    let profile = profiles[profileIndex];
    return profile.relays || [];
}

async function saveRelaysForProfile(profileIndex, relays) {
    let profiles = await get('profiles');
    let profile = profiles[profileIndex];
    profile.relays = relays;
    await storage.set({ profiles });
}

async function getNameForProfile(profileIndex) {
    let profiles = await get('profiles');
    let profile = profiles[profileIndex];
    return profile.name;
}

// Utilities

async function get(item) {
    return (await storage.get(item))[item];
}

async function getProfile(index) {
    let profiles = await get('profiles');
    return profiles[index];
}
