import Alpine from "alpinejs";
window.Alpine = Alpine;

Alpine.data('popup', () => ({
    pubKey: '',
    profiles: [],
    profileIndex: 0,
    activeProfile: {hosts: []},
    visibleKey: false,

    async init() {
        console.log("Initializing backend.");
        await browser.runtime.sendMessage({kind: 'init'});
        console.log('Getting profile list.')
        await this.getProfiles();
        console.log('Getting active profile.');
        await this.getActiveProfile();
        console.log('Getting pub key.');
        await this.getPubKey();
        console.log('profiles: ', this.profiles);
    },

    async saveKey() {},

    async setProfileByIndex(index) {
        this.profileIndex = index;
        await this.resetProfile();
    },

    async resetProfile() {
        await this.setProfileIndex();
        await this.getActiveProfile();
        await this.getPubKey();
        await this.getProfiles();
    },
    
    async getActiveProfile() {
        this.activeProfile = await browser.runtime.sendMessage({kind: 'getActiveProfile'});
    },

    async getProfiles() {
        this.profiles = await browser.runtime.sendMessage({kind: 'getProfiles'});
        this.profileIndex = await browser.runtime.sendMessage({kind: 'getProfileIndex'});
    },

    async setProfileIndex() {
        await browser.runtime.sendMessage({kind: 'setProfileIndex', payload: this.profileIndex});
    },

    async deleteSite(index) {
        let newSites = [...this.hosts];
        newSites.splice(index, 1);
        this.hosts = newSites;
    },

    async getPubKey() {
        this.pubKey = await browser.runtime.sendMessage({kind: 'getPubKey', payload: this.activeProfile.privKey});
    },

    async newProfile() {
        const newIndex = await browser.runtime.sendMessage({kind: 'newProfile'});
        await this.setProfileByIndex(newIndex);
    },

    get hasValidPubKey() {
        return typeof(this.pubKey) === 'string' && this.pubKey.length > 0;
    },

    get hosts() {
        return this.activeProfile.hosts;
    },

    set hosts(value) {
        this.activeProfile.hosts = value;
    }
}));


Alpine.start();