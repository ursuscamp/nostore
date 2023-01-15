import { generatePrivateKey, getPublicKey } from "nostr-tools";

const storage = browser.storage.local;

let profiles = [
    {name: 'Default', privKey: generatePrivateKey(), hosts: [
        {host: 'yosup.app', allowed: true},
        {host: 'iris.to', allowed: false},
    ]},
    {name: 'Extra', privKey: generatePrivateKey(), hosts: []},
];

let profileIndex = 0;

browser.runtime.onMessage.addListener(async (message, _sender, sendResponse) => {
    console.log(message);
    if (message.kind === 'getPubKey') {
        const privKey = getPublicKey(message.payload);
        sendResponse(privKey);
    } else if (message.kind === 'newKey') {
        const privKey = generatePrivateKey();
        sendResponse(privKey);
    } else if (message.kind === 'getProfiles') {
        sendResponse(profiles);
    } else if (message.kind === 'getProfileIndex') {
        sendResponse(await getProfileIndex());
    } else if (message.kind === 'setProfileIndex') {
        await setProfileIndex(message.payload);
    }
});

async function getProfileIndex() {
    return await storage.get('profileIndex').profileIndex;
}

async function setProfileIndex(profileIndex) {
    await storage.set({profileIndex});
}