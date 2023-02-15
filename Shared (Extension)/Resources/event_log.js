import Alpine from 'alpinejs';
import { getHosts, sortByIndex } from './db';
import { KINDS } from './utils';

Alpine.data('eventLog', () => ({
    kinds: KINDS,
    events: [],
    view: 'created_at',
    max: 100,
    sort: 'asc',
    allHosts: [],
    host: '',

    // date view
    fromCreatedAt: '2008-10-31',
    toCreatedAt: new Date().toISOString().split('T')[0],

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
        this.events = events;
        getHosts().then(hosts => (this.allHosts = hosts));
    },

    quickKindSelect() {
        if (this.quickKind === '') return;
        const i = parseInt(this.quickKind);
        this.fromKind = i;
        this.toKind = i;
        this.reload();
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

    get keyRange() {
        switch (this.view) {
            case 'created_at':
                return IDBKeyRange.bound(this.fromTime, this.toTime);

            case 'kind':
                return IDBKeyRange.bound(this.fromKind, this.toKind);

            case 'host':
                if (this.host.length === 0) return null;
                return IDBKeyRange.only(this.host);
            default:
                return null;
        }
    },
}));

Alpine.start();
