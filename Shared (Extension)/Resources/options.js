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
    getPermissions,
    setPermission,
    KINDS,
    humanPermission,
    validateKey,
} from './utils';

const log = console.log;

Alpine.data('options', () => ({
    profileNames: ['---'],
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
    permissions: {},
    host: '',
    permHosts: [],
    hostPerms: [],
    setPermission,

    async init(watch = true) {
        log('Initialize backend.');
        await initialize();

        if (watch) {
            this.$watch('profileIndex', async () => {
                await this.refreshProfile();
                this.host = '';
            });

            this.$watch('host', () => {
                this.calcHostPerms();
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
        await this.getPermissions();
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
        if (
            confirm(
                'This will delete this profile and all associated data. Are you sure you wish to continue?'
            )
        ) {
            await deleteProfile(this.profileIndex);
            await this.init(false);
        }
    },

    // Key functions

    async saveProfile() {
        if (!this.needsSave) return;

        console.log('saving private key');
        await savePrivateKey(this.profileIndex, this.privKey);
        console.log('saving profile name');
        await saveProfileName(this.profileIndex, this.profileName);
        console.log('getting profile name');
        await this.getProfileNames();
        console.log('refreshing profile');
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

    // Permissions

    async getPermissions() {
        this.permissions = await getPermissions(this.profileIndex);

        // Set the convenience variables
        this.calcPermHosts();
        this.calcHostPerms();
    },

    calcPermHosts() {
        let hosts = Object.keys(this.permissions);
        hosts.sort();
        this.permHosts = hosts;
    },

    calcHostPerms() {
        let hp = this.permissions[this.host] || {};
        let keys = Object.keys(hp);
        keys.sort();
        this.hostPerms = keys.map(k => [k, humanPermission(k), hp[k]]);
        console.log(this.hostPerms);
    },

    permTypes(hostPerms) {
        let k = Object.keys(hostPerms);
        k = Object.keys.sort();
        k = k.map(p => {
            let e = [p, hostPerms[p]];
            if (p.startsWith('signEvent')) {
                let n = parseInt(p.split(':')[1]);
                let name =
                    KINDS.find(kind => kind[0] === n) || `Unknown (Kind ${n})`;
                e = [name, hostPerms[p]];
            }
            return e;
        });
        return k;
    },

    // General

    async clearData() {
        if (
            confirm(
                'This will remove your private keys and all associated data. Are you sure you wish to continue?'
            )
        ) {
            await clearData();
            await this.init(false);
        }
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

    get validKey() {
        return validateKey(this.privKey);
    },

    get validKeyClass() {
        return this.validKey
            ? ''
            : 'ring-2 ring-rose-500 focus:ring-2 focus:ring-rose-500 border-transparent focus:border-transparent';
    },
}));

Alpine.start();
