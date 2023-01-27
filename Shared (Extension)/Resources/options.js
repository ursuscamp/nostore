import Alpine from 'alpinejs';

const RECOMMENDED_RELAYS = [
    new URL('wss://relay.damus.io'),
    new URL('wss://eden.nostr.land'),
    new URL('wss://nostr-relay.derekross.me'),
    new URL('wss://relay.snort.social'),
];

Alpine.data('options', () => ({
    profileNames: ['Default'],
    profileIndex: 0,
    profileName: '',
    pristineProfileName: '',
    privKey: '',
    pristinePrivKey: '',
    pubKey: '',
    relays: [],
    newRelay: '',
    urlError: '',
    recommendedRelay: '',

    async init() {
        await this.refreshInfo();

        this.$watch('profileIndex', async () => {
            await this.refreshInfo();
        });

        this.$watch('recommendedRelay', async () => {
            if (this.recommendedRelay.length == 0) return;
            await this.addRelay(this.recommendedRelay);
            this.recommendedRelay = '';
        });
    },

    async refreshInfo() {
        await this.getProfileNames();
        await this.getNameForProfile();
        await this.getPrivKeyForProfile();
        await this.getPubKeyForProfile();
        await this.getRelaysForProfile();
    },

    async getProfileNames() {
        this.profileNames = await browser.runtime.sendMessage({
            kind: 'getProfileNames',
        });
    },

    async getRelaysForProfile() {
        this.relays = await browser.runtime.sendMessage({
            kind: 'getRelaysForProfile',
            payload: this.profileIndex,
        });
    },

    async saveRelaysForProfile() {
        await browser.runtime.sendMessage({
            kind: 'saveRelaysForProfile',
            payload: [this.profileIndex, this.relays],
        });
        await this.getRelaysForProfile();
        this.newRelay = '';
    },

    async addRelay(relayToAdd = null) {
        let newRelay = relayToAdd || this.newRelay;
        try {
            let url = new URL(newRelay);
            if (url.protocol !== 'wss:') {
                this.setUrlError('Must be a websocket url');
            }
            let urls = this.relays.map(v => v.url);
            if (urls.includes(url.href)) {
                this.setUrlError('URL already exists');
                return;
            }
            this.relays.push({ url: url.href, read: true, write: true });
            await this.saveRelaysForProfile();
        } catch (error) {
            this.setUrlError('Invalid websocket URL');
        }
    },

    async deleteRelay(index) {
        this.relays.splice(index, 1);
        await this.saveRelaysForProfile();
    },

    setUrlError(message) {
        this.urlError = message;
        setTimeout(() => {
            this.urlError = '';
        }, 3000);
    },

    async getNameForProfile() {
        this.profileName = await browser.runtime.sendMessage({
            kind: 'getNameForProfile',
            payload: this.profileIndex,
        });
        this.pristineProfileName = this.profileName;
    },

    async getPubKeyForProfile() {
        this.pubKey = await browser.runtime.sendMessage({
            kind: 'getPubKeyForProfile',
            payload: this.profileIndex,
        });
    },

    async getPrivKeyForProfile() {
        this.privKey = await browser.runtime.sendMessage({
            kind: 'getPrivKeyForProfile',
            payload: this.profileIndex,
        });
        this.pristinePrivKey = this.privKey;
    },

    // Properties

    get recommendedRelays() {
        let relays = this.relays.map(r => new URL(r.url)).map(r => r.href);
        return RECOMMENDED_RELAYS.filter(r => !relays.includes(r.href)).map(
            r => r.href
        );
    },

    get hasRelays() {
        return this.relays.length > 0;
    },

    get hasRecommendedRelays() {
        return this.recommendedRelays.length > 0;
    },

    get needsSave() {
        return (
            this.privKey !== this.pristinePrivKey ||
            this.profileName !== this.pristineProfileName
        );
    },
}));

Alpine.start();
