import { generatePrivateKey } from "nostr-tools";

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('generating a key!');
    console.log(generatePrivateKey());
    console.log("Received request: ", request);

    if (request.greeting === "hello")
        sendResponse({ farewell: "goodbye" });
});
