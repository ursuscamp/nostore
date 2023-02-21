import Alpine from 'alpinejs';
import { deleteDB } from 'idb';
import jsonFormatHighlight from 'json-format-highlight';
import { downloadAllContents, getHosts, sortByIndex } from '../utilities/db';
import { getProfiles, KINDS } from '../utilities/utils';

const TOMORROW = new Date();
TOMORROW.setDate(TOMORROW.getDate() + 1);

Alpine.data('eventLog', () => ({
    kinds: KINDS,
    events: [],
    view: 'created_at',
    max: 100,
    sort: 'asc',
    allHosts: [],
    host: '',
    allProfiles: [],
    profile: '',
    pubkey: '',
    selected: null,
    copied: false,

    // date view
    fromCreatedAt: '2008-10-31',
    toCreatedAt: TOMORROW.toISOString().split('T')[0],

    // kind view
    quickKind: '',
    fromKind: 0,
    toKind: 50000,

    async init() {
        await this.reload();
    },

    async reload() {
        let events = await sortByIndex(
            this.view,
            this.keyRange,
            this.sort === 'asc',
            this.max
        );
        this.events = events.map(e => ({ ...e, copied: false }));
        getHosts().then(hosts => (this.allHosts = hosts));
        const profiles = await getProfiles();
        console.log(profiles);
        this.allProfiles = await Promise.all(
            profiles.map(async profile => ({
                name: profile.name,
                pubkey: await browser.runtime.sendMessage({
                    kind: 'calcPubKey',
                    payload: profile.privKey,
                }),
            }))
        );
    },

    async saveAll() {
        const file = await downloadAllContents();
        browser.tabs.create({
            url: URL.createObjectURL(file),
            active: true,
        });
    },

    async deleteAll() {
        if (confirm('Are you sure you want to delete ALL events?')) {
            await deleteDB('events');
            await this.reload();
        }
    },

    quickKindSelect() {
        if (this.quickKind === '') return;
        const i = parseInt(this.quickKind);
        this.fromKind = i;
        this.toKind = i;
        this.reload();
    },

    pkFromProfile() {
        this.pubkey = this.allProfiles.find(
            ({ name }) => name === this.profile
        ).pubkey;
        this.reload();
    },

    highlight(event) {
        return jsonFormatHighlight(event);
    },

    formatDate(epochSeconds) {
        return new Date(epochSeconds * 1000).toUTCString();
    },

    formatKind(kind) {
        const k = KINDS.find(([kNum, _]) => kNum === kind);
        return k ? `${k[1]} (${kind})` : `Unknown (${kind})`;
    },

    async copyEvent(index) {
        let event = JSON.stringify(this.events[index]);
        this.copied = true;
        setTimeout(() => (this.copied = false), 1000);
        await navigator.clipboard.writeText(event);
    },

    // Properties

    get fromTime() {
        let dt = new Date(this.fromCreatedAt);
        return Math.floor(dt.getTime() / 1000);
    },

    get toTime() {
        let dt = new Date(this.toCreatedAt);
        return Math.floor(dt.getTime() / 1000);
    },

    get profileNames() {
        return this.allProfiles.map(p => p.name);
    },

    get keyRange() {
        switch (this.view) {
            case 'created_at':
                return IDBKeyRange.bound(this.fromTime, this.toTime);

            case 'kind':
                return IDBKeyRange.bound(this.fromKind, this.toKind);

            case 'host':
                if (this.host.length === 0) return null;
                return IDBKeyRange.only(this.host);

            case 'pubkey':
                if (this.pubkey.length === 0) return null;
                return IDBKeyRange.only(this.pubkey);

            default:
                return null;
        }
    },
}));

Alpine.start();
