import Alpine from 'alpinejs';
import { generateProfile, getProfiles, validateKey } from './utils';
import { getPublicKey, nip26, nip19 } from 'nostr-tools';

const storage = browser.storage.local;

Alpine.data('delegated', () => ({
    privKey: '',
    duration: 7,
    profile: {},

    async init() {
        this.profile = await generateProfile('New Delegate');
        this.profile.delegate = true;
    },

    openNip(event) {
        browser.tabs.create({ url: event.target.href, active: true });
    },

    goBack() {
        window.location = browser.runtime.getURL('options.html');
    },

    async save() {
        let profiles = await getProfiles();

        // We need to jankify this Alpine proxy object so it's in the right format
        // when we save it to storage
        let profile = JSON.parse(JSON.stringify(this.profile));
        profile.delegator = getPublicKey(this.decodedPrivKey);
        profile.delegation = this.getDelegation();

        profiles.push(profile);
        let profileIndex = profiles.length - 1;
        await storage.set({ profiles, profileIndex });

        window.location = `${browser.runtime.getURL(
            'options.html'
        )}?index=${profileIndex}`;
    },

    getDelegation() {
        let pubkey = getPublicKey(this.profile.privKey);

        let delegation = nip26.createDelegation(this.decodedPrivKey, {
            pubkey,
            until: this.until,
            since: Math.round(Date.now() / 1000) - 1,
        });
        console.log(delegation);
        return delegation;
    },

    // Properties

    get isKeyValid() {
        return validateKey(this.privKey);
    },

    get validKeyClass() {
        return this.isKeyValid
            ? ''
            : 'ring-2 ring-rose-500 focus:ring-2 focus:ring-rose-500 border-transparent focus:border-transparent';
    },

    get until() {
        return Math.round(Date.now() / 1000) + 60 * 60 * 24 * this.duration;
    },

    get decodedPrivKey() {
        if (!this.isKeyValid) {
            return null;
        }
        if (this.privKey.startsWith('nsec')) {
            return nip19.decode(this.privKey).data;
        }
        return this.privKey;
    },
}));

Alpine.start();
