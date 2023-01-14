import Alpine from "alpinejs";
window.Alpine = Alpine;

Alpine.data('popup', () => ({
    privKey: '',
    profiles: [],
    profile: '',
    visibleKey: false,
    allowedSites: [],

    async init() {
        await this.getProfiles();
        await this.getPrivKeyForProfile();
        await this.getAllowedSites();
    },

    saveKey() {
        console.log(`Saving key ${this.privKey}`);
    },

    async getProfiles() {
        this.profiles = ['Default', 'Extra'];
        this.profile = 'Default';
    },

    async getPrivKeyForProfile() {
        this.privKey = this.profile;
    },

    async getAllowedSites() {
        this.allowedSites = [
            {site: 'yosupp.app', allowed: true},
            {site: 'iris.to', allowed: false},
        ];
    },

    async deleteSite(index) {
        let newSites = [...this.allowedSites];
        newSites.splice(index, 1);
        this.allowedSites = newSites;
    }
}));


Alpine.start();