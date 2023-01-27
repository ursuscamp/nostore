import Alpine from 'alpinejs';

Alpine.data('options', () => ({
    msg: 'Hello world!',
    profileNames: ['Default'],
    profileIndex: 0,
    relays: [],
    newRelay: '',
    urlError: '',

    async init() {
        await browser.runtime.getBackgroundPage();
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
        this.newRelay = '';
    },

    async addRelay() {
        try {
            let url = new URL(this.newRelay);
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
}));

Alpine.start();
