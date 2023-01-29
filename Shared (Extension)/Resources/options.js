import Alpine from 'alpinejs';
import {
    clearData,
    deleteProfile,
    getProfileIndex,
    getProfileNames,
    getRelays,
    initialize,
    newProfile,
    savePrivateKey,
    saveProfileName,
    saveRelays,
    RECOMMENDED_RELAYS,
} from './utils';

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
        await initialize();

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

        // We need to refresh the names BEFORE setting the profile index, or it won't work
        // on init to set the correct profile.
        await this.getProfileNames();
        await this.getProfileIndex();
        await this.refreshProfile();
    },

    async refreshProfile() {
        await this.getProfileNames();
        await this.getProfileName();
        await this.getNsec();
        await this.getNpub();
        await this.getRelays();
        this.confirmClear = false;
        this.confirmDelete = false;
    },

    // Profile functions

    async getProfileNames() {
        this.profileNames = await getProfileNames();
    },

    async getProfileName() {
        let names = await getProfileNames();
        let name = names[this.profileIndex];
        this.profileName = name;
        this.pristineProfileName = name;
    },

    async getProfileIndex() {
        this.profileIndex = await getProfileIndex();
    },

    async newProfile() {
        let newIndex = await newProfile();
        await this.getProfileNames();
        this.profileIndex = newIndex;
    },

    async deleteProfile() {
        await deleteProfile(this.profileIndex);
        await this.init(false);
    },

    // Key functions

    async saveProfile() {
        if (!this.needsSave) return;

        await savePrivateKey(this.profileIndex, this.privKey);
        await saveProfileName(this.profileIndex, this.profileName);
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

    async getRelays() {
        this.relays = await getRelays(this.profileIndex);
    },

    async saveRelays() {
        await saveRelays(this.profileIndex, this.relays);
        await this.getRelays();
    },

    async addRelay(relayToAdd = null) {
        let newRelay = relayToAdd || this.newRelay;
        try {
            let url = new URL(newRelay);
            if (url.protocol !== 'wss:') {
                this.setUrlError('Must be a websocket url');
                return;
            }
            let urls = this.relays.map(v => v.url);
            if (urls.includes(url.href)) {
                this.setUrlError('URL already exists');
                return;
            }
            this.relays.push({ url: url.href, read: true, write: true });
            await this.saveRelays();
            this.newRelay = '';
        } catch (error) {
            this.setUrlError('Invalid websocket URL');
        }
    },

    async deleteRelay(index) {
        this.relays.splice(index, 1);
        await this.saveRelays();
    },

    setUrlError(message) {
        this.urlError = message;
        setTimeout(() => {
            this.urlError = '';
        }, 3000);
    },

    // General

    async clearData() {
        await clearData();
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
