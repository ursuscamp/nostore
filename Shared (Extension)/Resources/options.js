import Alpine from 'alpinejs';

const RECOMMENDED_RELAYS = [
    new URL('wss://relay.damus.io'),
    new URL('wss://eden.nostr.land'),
    new URL('wss://nostr-relay.derekross.me'),
    new URL('wss://relay.snort.social'),
];

const log = console.log;

Alpine.data('options', () => ({
    profileNames: ['Poop'],
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
    confirmDelete: false,
    confirmClear: false,

    async init(watch = true) {
        log('Initialize backend.');
        await browser.runtime.sendMessage({ kind: 'init' });

        if (watch) {
            this.$watch('profileIndex', async () => {
                await this.refreshProfile();
            });

            this.$watch('recommendedRelay', async () => {
                if (this.recommendedRelay.length == 0) return;
                await this.addRelay(this.recommendedRelay);
                this.recommendedRelay = '';
            });
        }

        log('Setting active index.');
        await this.getActiveIndex();
        await this.refreshProfile();
    },

    async refreshProfile() {
        await this.getProfileNames();
        await this.getProfileName();
        await this.getNsec();
        await this.getNpub();
        this.confirmClear = false;
        this.confirmDelete = false;
    },

    // Profile functions

    async getProfileNames() {
        this.profileNames = await browser.runtime.sendMessage({
            kind: 'getProfileNames',
        });
    },

    async getProfileName() {
        this.profileName = await browser.runtime.sendMessage({
            kind: 'getNameForProfile',
            payload: this.profileIndex,
        });
        this.pristineProfileName = this.profileName;
    },

    async getActiveIndex() {
        this.profileIndex = await browser.runtime.sendMessage({
            kind: 'getProfileIndex',
        });
    },

    async newProfile() {
        let newIndex = await browser.runtime.sendMessage({
            kind: 'newProfile',
        });
        await this.getProfileNames();
        this.profileIndex = newIndex;
    },

    async deleteProfile() {
        await browser.runtime.sendMessage({
            kind: 'deleteProfile',
            payload: this.profileIndex,
        });
        await this.init(false);
    },

    // Key functions

    async saveProfile() {
        if (!this.needsSave) return;

        await browser.runtime.sendMessage({
            kind: 'savePrivateKey',
            payload: [this.profileIndex, this.privKey],
        });
        await browser.runtime.sendMessage({
            kind: 'saveProfileName',
            payload: [this.profileIndex, this.profileName],
        });
        await this.getProfileNames();
        await this.refreshProfile();
    },

    async getNpub() {
        this.pubKey = await browser.runtime.sendMessage({
            kind: 'getNpub',
            payload: this.profileIndex,
        });
    },

    async getNsec() {
        this.privKey = await browser.runtime.sendMessage({
            kind: 'getNsec',
            payload: this.profileIndex,
        });
        this.pristinePrivKey = this.privKey;
    },

    // Relay functions

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

    async clearData() {
        await browser.runtime.sendMessage({ kind: 'clearData' });
        await this.init(false);
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
