import { generatePrivateKey , getPublicKey } from "nostr-tools";

const storage = browser.storage.local;

browser.runtime.onMessage.addListener(async (message, _sender, sendResponse) => {
    console.log(message);

    switch (message.kind) {
        case 'init':
            await initialize();
            break;
        case 'getProfiles':
            let names = await getProfileNames();
            sendResponse(names);
            break;
        case 'getProfileIndex':
            sendResponse(await getProfileIndex());
            break;
        case 'setProfileIndex':
            await setProfileIndex(message.payload);
            break;
        case 'getActiveProfile':
            let ap = await currentProfile();
            sendResponse(ap);
            break;
        case 'newKey':
            sendResponse(generatePrivateKey());
            break;
        case 'newProfile':
            sendResponse(await newProfile());
            break;
        default:
            break;
    }
});

async function get(item) {
    return (await storage.get(item))[item];
}

async function getOrSetDefault(key, def) {
    let val = storage.get(key)[key];
    if (!val) {
        await storage.set({[key]: def});
        return def;
    }

    return val;
}

async function initialize() {
    await getOrSetDefault('profileIndex', 0);
    await getOrSetDefault('profiles', [{name: 'Default', privKey: generatePrivateKey(), hosts: []}]);
}

async function getProfileIndex() {
    return (await storage.get('profileIndex')).profileIndex;
}

async function setProfileIndex(profileIndex) {
    await storage.set({profileIndex});
}

async function currentProfile() {
    let index = (await storage.get('profileIndex')).profileIndex;
    let profiles = (await storage.get('profiles')).profiles;

    if (!profiles || !profiles[index]) {
        let newProfile = {name: 'Default', privKey: generatePrivateKey(), hosts: []};
        await storage.set({profileIndex: 0});
        await storage.set({profiles: [newProfile]});
        return newProfile;
    }

    return profiles[index];
}

async function getProfileNames() {
    let profiles = (await storage.get({profiles: []})).profiles;
    console.log('Profiles: ', profiles);
    return profiles.map(p => p.name);
}

async function newProfile() {
    let profiles = await get('profiles');
    const newProfile = {name: 'New Profile', privKey: generatePrivateKey(), hosts: []};
    profiles.push(newProfile);
    await storage.set({profiles});
    return profiles.index - 1;
}