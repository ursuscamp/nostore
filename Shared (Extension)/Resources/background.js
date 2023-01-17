import { generatePrivateKey, getPublicKey, signEvent } from "nostr-tools";

const storage = browser.storage.local;

browser.runtime.onMessage.addListener(async (message, _sender, sendResponse) => {
    console.log(message);

    switch (message.kind) {
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
        case 'getPrivKey':
            let privKey = await getPrivKey();
            sendResponse(privKey);
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
        default:
            break;
    }
});

async function get(item) {
    return (await storage.get(item))[item];
}

async function getOrSetDefault(key, def) {
    let val = (await storage.get(key))[key];
    if (val == null || val == undefined) {
        await storage.set({[key]: def});
        return def;
    }

    return val;
}

async function initialize() {
    await getOrSetDefault('profileIndex', 0);
    await getOrSetDefault('profiles', [{name: 'Default', privKey: generatePrivateKey(), hosts: []}]);
}

async function getPrivKey() {
    let profile = await currentProfile();
    return profile.privKey;
}

async function getPubKey() {
    let privKey = await getPrivKey();
    return getPublicKey(privKey);
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
    await storage.set({profileIndex});
}

async function getProfileIndex() {
    return await get('profileIndex');
}

async function currentProfile() {
    let index = await get('profileIndex');
    let profiles = await get('profiles');
    return profiles[index];
}

async function newProfile() {
    let profiles = await get('profiles');
    const newProfile = {name: 'New Profile', privKey: generatePrivateKey(), hosts: []};
    profiles.push(newProfile);
    await storage.set({profiles});
    return profiles.length - 1;
}

async function saveProfile(profile) {
    let index = await getProfileIndex();
    let profiles = await get('profiles');
    profiles[index] = profile;
    await storage.set({profiles});
}

async function deleteProfile() {
    let index = await getProfileIndex();
    let profiles = await get('profiles');
    profiles.splice(index, 1);
    let profileIndex = Math.max(index - 1, 0);
    await storage.set({profiles, profileIndex});
}

async function signEvent_(event) {
    event = {...event};
    let privKey = await getPrivKey();
    event.sig = signEvent(event, privKey);
    return event;
}