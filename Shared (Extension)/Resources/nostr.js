window.nostr = {
    requests: {},

    async getPublicKey() {
        return await this.broadcast('getPubKey');
    },
    
    async signEvent(event) {
        return await this.broadcast('signEvent', event);
    },

    broadcast(kind, payload) {
        let reqId = Math.random().toString();
        return new Promise((resolve, _reject) => {
            this.requests[reqId] = resolve;
            console.log(`Event ${reqId}: ${kind}, payload: `, payload);
            window.postMessage({kind, reqId, payload}, '*');
        });
    }
}

window.addEventListener('message', (message) => {
    let {kind, reqId, payload} = message.data;

    if (kind !== 'return_getPubKey' && kind !== 'return_signEvent')
        return;
    
    console.log(`Event ${reqId}: Received payload:`, payload);
    window.nostr.requests[reqId](payload);
    delete window.nostr.requests[reqId];
});