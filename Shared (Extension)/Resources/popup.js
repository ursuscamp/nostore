import Alpine from "alpinejs";
window.Alpine = Alpine;

Alpine.data('popup', () => ({
    privKey: '',
    pubKey: '',
    pristinePrivKey: '',
    hosts: [],
    name: '',
    pristineName: '',
    profileNames: ['Default'],
    profileIndex: 0,
    visibleKey: false,
    confirmClear: false,
    confirmDelete: false,

    async init() {
        console.log("Initializing backend.");
        await browser.runtime.sendMessage({kind: 'init'});

        this.$watch('profileIndex', async () => {
            await this.setProfileIndex();
            await this.refreshProfile();
            this.confirmClear = false;
            this.confirmDelete = false;
        });

        // Even though getProfileIndex will immediately trigger a profile refresh, we still
        // need to do an initial profile refresh first. This will pull the latest data from
        // the background scripts. Specifically, this pulls the list of profile names,
        // otherwise it generates a rendering error where it may not show the correct selected
        // profile when first loading the popup.
        await this.refreshProfile();
        await this.getProfileIndex();
    },

    async refreshProfile() {
        await this.getNsecKey();
        await this.getNpubKey();
        await this.getHosts();
        await this.getName();
        await this.getProfileNames();
    },

    async setProfileIndex() {
        // Becauset the popup state resets every time it open, we use null as a guard. That way
        // whenever the user opens the popup, it doesn't automatically reset the current profile
        if (this.profileIndex !== null) {
            await browser.runtime.sendMessage({kind: 'setProfileIndex', payload: this.profileIndex});
        }
    },

    async getNsecKey() {
        this.privKey = await browser.runtime.sendMessage({kind: 'getNsecKey'});
        this.pristinePrivKey = this.privKey;
    },
    
    async getNpubKey() {
        this.pubKey = await browser.runtime.sendMessage({kind: 'getNpubKey'});
    },

    async getHosts() {
        this.hosts = await browser.runtime.sendMessage({kind: 'getHosts'});
    },

    async getProfileNames() {
        this.profileNames = await browser.runtime.sendMessage({kind: 'getProfileNames'});
    },

    async getName() {
        this.name = await browser.runtime.sendMessage({kind: 'getName'});
        this.pristineName = this.name;
    },

    async getProfileIndex() {
        this.profileIndex = await browser.runtime.sendMessage({kind: 'getProfileIndex'});
    },

    async newProfile() {
        let newIndex = await browser.runtime.sendMessage({kind: 'newProfile'});
        await this.refreshProfile();
        this.profileIndex = newIndex;
    },

    async saveProfile() {
        let {name, privKey, hosts} = this;
        let profile = {name, privKey, hosts};
        await browser.runtime.sendMessage({kind: 'saveProfile', payload: profile});
        await this.refreshProfile();
    },

    async clearData() {
        await browser.runtime.sendMessage({kind: 'clearData'});
        await this.init(); // Re-initialize after clearing
        this.confirmClear = false;
    },

    async deleteProfile() {
        await browser.runtime.sendMessage({kind: 'deleteProfile'});
        await this.init();
        this.confirmDelete = false;
    },

    // Properties

    get hasValidPubKey() {
        return typeof(this.pubKey) === 'string' && this.pubKey.length > 0;
    },

    get needsSaving() {
        return (this.privKey !== this.pristinePrivKey || this.name !== this.pristineName);
    }
}));


Alpine.start();
