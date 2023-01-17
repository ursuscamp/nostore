window.nostr = {
    requests: {},

    getPublicKey() {
        let reqId = Math.random().toString();
        return new Promise((resolve, _reject) => {
            this.requests[reqId] = resolve;
            console.log(`Event ${reqId}: Requesting public key.`);
            window.postMessage({kind: 'getPublicKey', reqId}, '*');
        });
    },
    
    async signEvent(event) {
        console.log("Signing event");
        console.log(event);
        return "signed event";
    }
}

window.addEventListener('message', (message) => {
    let {kind, reqId, payload} = message.data;

    if (kind !== 'publicKey')
        return;
    
    console.log(`Event ${reqId}: Received public key ${payload}.`);
    window.nostr.requests[reqId](payload);
    delete window.nostr.requests[reqId];
});