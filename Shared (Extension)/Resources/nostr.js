window.nostr = {
    async getPublicKey() {
        console.log("getting public key!");
        return "285d4ca25cbe209832aa15a4b94353b877a2fe6c3b94dee1a4c8bc36770304db";
    },
    
    async signEvent(event) {
        console.log("Signing event");
        console.log(event);
        return "signed event";
    }
}
