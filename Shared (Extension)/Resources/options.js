import Alpine from 'alpinejs';

Alpine.data('options', () => ({
    msg: 'Hello world!',
    profileNames: ['Default'],
    profileIndex: 0,
    relays: [],
    newRelay: '',

    async init() {
        await this.getProfileNames();
        await this.getRelaysForProfile();

        this.$watch('profileIndex', async () => {
            await this.getRelaysForProfile();
        });
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
    },

    async addRelay() {
        this.relays.push({ url: this.newRelay, read: true, write: true });
        await this.saveRelaysForProfile();
    },

    async deleteRelay(index) {
        this.relays.splice(index, 1);
        await this.saveRelaysForProfile();
    },
}));

Alpine.start();
