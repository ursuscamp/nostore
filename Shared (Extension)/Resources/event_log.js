import Alpine from 'alpinejs';
import { sortByIndex } from './db';

Alpine.data('eventLog', () => ({
    events: [],
    view: 'created_at',
    max: 100,
    ascending: false,

    async init() {
        await this.reload();
    },

    async reload() {
        let events = await sortByIndex(this.view, this.ascending, this.max);
        this.events = events;
    },
}));

Alpine.start();
