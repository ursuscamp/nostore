import Alpine from 'alpinejs';

Alpine.data('options', () => ({
    msg: 'Hello world!',
    profileNames: ['Default'],
    profileIndex: 0,

    async init() {
        await this.getProfileNames();
    },

    async getProfileNames() {
        this.profileNames = await browser.runtime.sendMessage({
            kind: 'getProfileNames',
        });
    },
}));

Alpine.start();
