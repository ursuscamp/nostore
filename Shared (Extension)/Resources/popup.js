import Alpine from "alpinejs";
window.Alpine = Alpine;

Alpine.data('popup', () => ({
    pubKey: '',
    profiles: [{name: 'Default', privKey: '', hosts: []}],
    profileIndex: 0,
    visibleKey: false,

    async init() {
        await this.getProfiles();
        await this.getPubKey();
    },

    async saveKey() {
        await this.getPubKey();
    },

    async getProfiles() {
        this.profiles = await browser.runtime.sendMessage({kind: 'getProfiles'});
        this.profileIndex = await browser.runtime.sendMessage({kind: 'getProfileIndex'});
    },

    async setProfileIndex() {
        await browser.runtime.sendMessage({kind: 'setProfileIndex', payload: this.profileIndex});
        await this.getPubKey();
    },

    async deleteSite(index) {
        let newSites = [...this.hosts];
        newSites.splice(index, 1);
        this.hosts = newSites;
    },

    async getPubKey() {
        this.pubKey = await browser.runtime.sendMessage({kind: 'getPubKey', payload: this.profile.privKey});
    },

    async newProfile() {
        let newKey = await browser.runtime.sendMessage({kind: 'newKey'});
        const newProfile = {name: 'New Profile', privKey: newKey};
        this.profiles.push(newProfile);
        this.profileIndex = this.profiles.length - 1;
        await this.setProfileIndex();
    },

    get hasValidPubKey() {
        return typeof(this.pubKey) === 'string' && this.pubKey.length > 0;
    },

    get profile() {
        return this.profiles[this.profileIndex];
    },

    get hosts() {
        return this.profile.hosts;
    },

    set hosts(value) {
        this.profiles[this.profileIndex].hosts = value;
    }
}));


Alpine.start();