import { generatePrivateKey, getPublicKey } from "nostr-tools";

let profiles = [
    {name: 'Default', privKey: generatePrivateKey(), hosts: [
        {host: 'yosup.app', allowed: true},
        {host: 'iris.to', allowed: false},
    ]},
    {name: 'Extra', privKey: generatePrivateKey(), hosts: []},
];

let activeProfile = 0;

browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    console.log(message);
    if (message.kind === 'getPubKey') {
        const privKey = getPublicKey(message.payload);
        sendResponse(privKey);
    } else if (message.kind === 'newKey') {
        const privKey = generatePrivateKey();
        sendResponse(privKey);
    } else if (message.kind === 'getProfiles') {
        sendResponse(profiles);
    } else if (message.kind === 'getActiveProfile') {
        sendResponse(activeProfile);
    }
});
