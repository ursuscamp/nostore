import Alpine from "alpinejs";
window.Alpine = Alpine;

Alpine.data('popup', () => ({
    pubKey: '',
    profiles: [{name: 'Default', privKey: '', hosts: []}],
    activeProfile: 0,
    visibleKey: false,

    async init() {
        await this.getProfiles();
        await this.getPrivKeyForProfile();
    },

    async saveKey() {
        await this.getPubKey();
    },

    async getProfiles() {
        this.profiles = await browser.runtime.sendMessage({kind: 'getProfiles'});
        this.activeProfile = await browser.runtime.sendMessage({kind: 'getActiveProfile'});
    },

    async getPrivKeyForProfile() {
        await this.getPubKey();
    },

    async deleteSite(index) {
        confirm("hello");
        let newSites = [...this.hosts];
        newSites.splice(index, 1);
        this.hosts = newSites;
    },

    async getPubKey() {
        this.pubKey = await browser.runtime.sendMessage({kind: 'getPubKey', payload: this.profile.privKey});
        console.log('Pub key: ', this.pubKey);
    },

    async newProfile() {
        let newKey = await browser.runtime.sendMessage({kind: 'newKey'});
        const newProfile = {name: 'New Profile', privKey: newKey};
        this.profiles.push(newProfile);
        this.activeProfile = this.profiles.length - 1;
    },

    get hasValidPubKey() {
        return typeof(this.pubKey) === 'string' && this.pubKey.length > 0;
    },

    get profile() {
        return this.profiles[this.activeProfile];
    },

    get hosts() {
        return this.profile.hosts;
    },

    set hosts(value) {
        this.profiles[this.activeProfile].hosts = value;
    }
}));


Alpine.start();