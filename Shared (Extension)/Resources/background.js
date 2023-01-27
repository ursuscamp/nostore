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
            case 'log':
                console.log(
                    message.payload.module ? `${module}: ` : '',
                    message.payload.msg
                );
                break;
            case 'init':
                await initialize();
                break;
            case 'setProfileIndex':
                await setProfileIndex(message.payload);
                break;
            case 'getProfileIndex':
                let profileIndex = await getProfileIndex();
                sendResponse(profileIndex);
                break;
            case 'getNsecKey':
                let nsecKey = await getNsecKey();
                sendResponse(nsecKey);
                break;
            case 'getNpubKey':
                let npubKey = await getNpubKey();
                sendResponse(npubKey);
                break;
            case 'getPubKey':
                let pubKey = await getPubKey();
                sendResponse(pubKey);
                break;
            case 'getHosts':
                let hosts = await getHosts();
                sendResponse(hosts);
                break;
            case 'getName':
                let name = await getName();
                sendResponse(name);
                break;
            case 'getProfileNames':
                let profileNames = await getProfileNames();
                sendResponse(profileNames);
                break;
            case 'newProfile':
                let newIndex = await newProfile();
                sendResponse(newIndex);
                break;
            case 'saveProfile':
                await saveProfile(message.payload);
                break;
            case 'clearData':
                await browser.storage.local.clear();
                break;
            case 'deleteProfile':
                await deleteProfile();
                break;
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
            case 'getPubKeyForProfile':
                let pubKeyForProfile = await getNpubKey(message.payload);
                sendResponse(pubKeyForProfile);
                break;
            case 'getPrivKeyForProfile':
                let privKeyForProfile = await getNsecKey(message.payload);
                sendResponse(privKeyForProfile);
                break;
            default:
                break;
        }
        return false;
    }
);

async function get(item) {
    return (await storage.get(item))[item];
}

async function getOrSetDefault(key, def) {
    let val = (await storage.get(key))[key];
    if (val == null || val == undefined) {
        await storage.set({ [key]: def });
        return def;
    }

    return val;
}

async function initialize() {
    await getOrSetDefault('profileIndex', 0);
    await getOrSetDefault('profiles', [
        {
            name: 'Default',
            privKey: generatePrivateKey(),
            hosts: [],
            relays: [],
        },
    ]);
}

async function getProfile(index) {
    let profiles = await get('profiles');
    return profiles[index];
}

async function getNsecKey(index) {
    let profile = await getProfile(index);
    let nsecKey = nip19.nsecEncode(profile.privKey);
    return nsecKey;
}

async function getNpubKey(index) {
    let profile = await getProfile(index);
    let pubKey = getPublicKey(profile.privKey);
    let npubKey = nip19.npubEncode(pubKey);
    return npubKey;
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

async function getHosts() {
    let profile = await currentProfile();
    return profile.hosts;
}

async function getName() {
    let profile = await currentProfile();
    return profile.name;
}

async function getProfileNames() {
    let profiles = await get('profiles');
    return profiles.map(p => p.name);
}

async function setProfileIndex(profileIndex) {
    await storage.set({ profileIndex });
}

async function getProfileIndex() {
    return await get('profileIndex');
}

async function currentProfile() {
    let index = await get('profileIndex');
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
    };
    profiles.push(newProfile);
    await storage.set({ profiles });
    return profiles.length - 1;
}

async function saveProfile(profile) {
    if (profile.privKey.startsWith('nsec')) {
        profile.privKey = nip19.decode(profile.privKey).data;
    }
    let index = await getProfileIndex();
    let profiles = await get('profiles');
    profiles[index] = profile;
    await storage.set({ profiles });
}

async function deleteProfile() {
    let index = await getProfileIndex();
    let profiles = await get('profiles');
    profiles.splice(index, 1);
    let profileIndex = Math.max(index - 1, 0);
    await storage.set({ profiles, profileIndex });
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
