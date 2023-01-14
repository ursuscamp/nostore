import Alpine from "alpinejs";
window.Alpine = Alpine;

Alpine.data('popup', () => ({
    privKey: '',
    profiles: [],
    profile: '',
    visibleKey: false,

    async init() {
        await this.getProfiles();
        await this.getPrivKeyForProfile();
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
    }
}));


Alpine.start();