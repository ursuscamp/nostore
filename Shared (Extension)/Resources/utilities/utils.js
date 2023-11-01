const DB_VERSION = 3;
const storage = browser.storage.local;
export const RECOMMENDED_RELAYS = [
    new URL('wss://relay.damus.io'),
    new URL('wss://relay.snort.social'),
    new URL('wss://nos.lol'),
    new URL('wss://brb.io'),
    new URL('wss://nostr.orangepill.dev'),
];
// prettier-ignore
export const KINDS = [
    [0,         'Metadata',                    'https://github.com/nostr-protocol/nips/blob/master/01.md'],
    [1,         'Text',                        'https://github.com/nostr-protocol/nips/blob/master/01.md'],
    [2,         'Recommend Relay',             'https://github.com/nostr-protocol/nips/blob/master/01.md'],
    [3,         'Contacts',                    'https://github.com/nostr-protocol/nips/blob/master/02.md'],
    [4,         'Encrypted Direct Messages',   'https://github.com/nostr-protocol/nips/blob/master/04.md'],
    [5,         'Event Deletion',              'https://github.com/nostr-protocol/nips/blob/master/09.md'],
    [6,         'Repost'                       'https://github.com/nostr-protocol/nips/blob/master/18.md'],
    [7,         'Reaction',                    'https://github.com/nostr-protocol/nips/blob/master/25.md'],
    [8,         'Badge Award',                 'https://github.com/nostr-protocol/nips/blob/master/58.md'],
    [16,        'Generic Repost',              'https://github.com/nostr-protocol/nips/blob/master/18.md'],
    [40,        'Channel Creation',            'https://github.com/nostr-protocol/nips/blob/master/28.md'],
    [41,        'Channel Metadata',            'https://github.com/nostr-protocol/nips/blob/master/28.md'],
    [42,        'Channel Message',             'https://github.com/nostr-protocol/nips/blob/master/28.md'],
    [43,        'Channel Hide Message',        'https://github.com/nostr-protocol/nips/blob/master/28.md'],
    [44,        'Channel Mute User',           'https://github.com/nostr-protocol/nips/blob/master/28.md'],
    [1063,      'File Metadata',               'https://github.com/nostr-protocol/nips/blob/master/94.md'],
    [1311,      'Live Chat Message',           'https://github.com/nostr-protocol/nips/blob/master/53.md'],
    [1984,      'Reporting',                   'https://github.com/nostr-protocol/nips/blob/master/56.md'],
    [1985,      'Label',                       'https://github.com/nostr-protocol/nips/blob/master/32.md'],
    [4550,      'Community Post Approval',     'https://github.com/nostr-protocol/nips/blob/master/72.md'],
    [7000,      'Job Feedback',                'https://github.com/nostr-protocol/nips/blob/master/90.md'],
    [9041,      'Zap Goal',                    'https://github.com/nostr-protocol/nips/blob/master/75.md'],
    [9734,      'Zap Request',                 'https://github.com/nostr-protocol/nips/blob/master/57.md'],
    [9735,      'Zap',                         'https://github.com/nostr-protocol/nips/blob/master/57.md'],
    [10000,     'Mute List',                   'https://github.com/nostr-protocol/nips/blob/master/51.md'],
    [10001,     'Pin List',                    'https://github.com/nostr-protocol/nips/blob/master/51.md'],
    [10002,     'Relay List Metadata',         'https://github.com/nostr-protocol/nips/blob/master/65.md'],
    [13194,     'Wallet Info',                 'https://github.com/nostr-protocol/nips/blob/master/47.md'],
    [22242,     'Client Authentication',       'https://github.com/nostr-protocol/nips/blob/master/42.md'],
    [23194,     'Wallet Request',              'https://github.com/nostr-protocol/nips/blob/master/47.md'],
    [23195,     'Wallet Response',             'https://github.com/nostr-protocol/nips/blob/master/47.md'],
    [24133,     'Nostr Connect',               'https://github.com/nostr-protocol/nips/blob/master/46.md'],
    [27235,     'HTTP Auth',                   'https://github.com/nostr-protocol/nips/blob/master/98.md'],
    [30000,     'Categorized People List',     'https://github.com/nostr-protocol/nips/blob/master/51.md'],
    [30001,     'Categorized Bookmark List',   'https://github.com/nostr-protocol/nips/blob/master/51.md'],
    [30008,     'Profile Badges',              'https://github.com/nostr-protocol/nips/blob/master/58.md'],
    [30009,     'Badge Definition',            'https://github.com/nostr-protocol/nips/blob/master/58.md'],
    [30017,     'Create or update a stall',    'https://github.com/nostr-protocol/nips/blob/master/15.md'],
    [30018,     'Create or update a product',  'https://github.com/nostr-protocol/nips/blob/master/15.md'],
    [30023,     'Long-Form Content',           'https://github.com/nostr-protocol/nips/blob/master/23.md'],
    [30024,     'Draft Long-form Content',     'https://github.com/nostr-protocol/nips/blob/master/23.md'],
    [30078,     'Application-specific Data',   'https://github.com/nostr-protocol/nips/blob/master/78.md'],
    [30311,     'Live Event',                  'https://github.com/nostr-protocol/nips/blob/master/53.md'],
    [30315,     'User Statuses',               'https://github.com/nostr-protocol/nips/blob/master/38.md'],
    [30402,     'Classified Listing',          'https://github.com/nostr-protocol/nips/blob/master/99.md'],
    [30403,     'Draft Classified Listing',    'https://github.com/nostr-protocol/nips/blob/master/99.md'],
    [31922,     'Date-Based Calendar Event',   'https://github.com/nostr-protocol/nips/blob/master/52.md'],
    [31923,     'Time-Based Calendar Event',   'https://github.com/nostr-protocol/nips/blob/master/52.md'],
    [31924,     'Calendar',                    'https://github.com/nostr-protocol/nips/blob/master/52.md'],
    [31925,     'Calendar Event RSVP',         'https://github.com/nostr-protocol/nips/blob/master/52.md'],
    [31989,     'Handler recommendation',      'https://github.com/nostr-protocol/nips/blob/master/89.md'],
    [31990,     'Handler information',         'https://github.com/nostr-protocol/nips/blob/master/89.md'],
    [34550,     'Community Definition',        'https://github.com/nostr-protocol/nips/blob/master/72.md'],
];

export async function initialize() {
    await getOrSetDefault('profileIndex', 0);
    await getOrSetDefault('profiles', [await generateProfile()]);
    let version = (await storage.get({ version: 0 })).version;
    console.log('DB version: ', version);
    while (version < DB_VERSION) {
        version = await migrate(version, DB_VERSION);
        await storage.set({ version });
    }
}

async function migrate(version, goal) {
    if (version === 0) {
        console.log('Migrating to version 1.');
        let profiles = await getProfiles();
        profiles.forEach(profile => (profile.hosts = {}));
        await storage.set({ profiles });
        return version + 1;
    }

    if (version === 1) {
        console.log('migrating to version 2.');
        let profiles = await getProfiles();
        profiles.forEach(profile => (profile.delegate = false));
        await storage.set({ profiles });
        return version + 1;
    }

    if (version === 2) {
        console.log('Migrating to version 3.');
        let profiles = await getProfiles();
        profiles.forEach(profile => (profile.relayReminder = true));
        await storage.set({ profiles });
        return version + 1;
    }
}

export async function getProfiles() {
    let profiles = await storage.get({ profiles: [] });
    return profiles.profiles;
}

export async function getProfile(index) {
    let profiles = await getProfiles();
    return profiles[index];
}

export async function getProfileNames() {
    let profiles = await getProfiles();
    return profiles.map(p => p.name);
}

export async function getProfileIndex() {
    const index = await storage.get({ profileIndex: 0 });
    return index.profileIndex;
}

export async function setProfileIndex(profileIndex) {
    await storage.set({ profileIndex });
}

export async function deleteProfile(index) {
    let profiles = await getProfiles();
    let profileIndex = await getProfileIndex();
    profiles.splice(index, 1);
    if (profiles.length == 0) {
        await clearData(); // If we have deleted all of the profiles, let's just start fresh with all new data
        await initialize();
    } else {
        // If the index deleted was the active profile, change the active profile to the next one
        let newIndex =
            profileIndex === index ? Math.max(index - 1, 0) : this.profileIndex;
        await storage.set({ profiles, profileIndex: newIndex });
    }
}

export async function clearData() {
    let ignoreInstallHook = await storage.get({ ignoreInstallHook: false });
    await storage.clear();
    await storage.set(ignoreInstallHook);
}

async function generatePrivateKey() {
    return await browser.runtime.sendMessage({ kind: 'generatePrivateKey' });
}

export async function generateProfile(name = 'Default') {
    return {
        name,
        privKey: await generatePrivateKey(),
        hosts: {},
        relays: [],
        delegate: false,
        relayReminder: true,
    };
}

async function getOrSetDefault(key, def) {
    let val = (await storage.get(key))[key];
    if (val == null || val == undefined) {
        await storage.set({ [key]: def });
        return def;
    }

    return val;
}

export async function saveProfileName(index, profileName) {
    let profiles = await getProfiles();
    profiles[index].name = profileName;
    await storage.set({ profiles });
}

export async function savePrivateKey(index, privateKey) {
    await browser.runtime.sendMessage({
        kind: 'savePrivateKey',
        payload: [index, privateKey],
    });
}

export async function newProfile() {
    let profiles = await getProfiles();
    const newProfile = await generateProfile('New Profile');
    profiles.push(newProfile);
    await storage.set({ profiles });
    return profiles.length - 1;
}

export async function getRelays(profileIndex) {
    let profile = await getProfile(profileIndex);
    return profile.relays || [];
}

export async function saveRelays(profileIndex, relays) {
    // Having an Alpine proxy object as a sub-object does not serialize correctly in storage,
    // so we are pre-serializing here before assigning it to the profile, so the proxy
    // obj doesn't bug out.
    let fixedRelays = JSON.parse(JSON.stringify(relays));
    let profiles = await getProfiles();
    let profile = profiles[profileIndex];
    profile.relays = fixedRelays;
    await storage.set({ profiles });
}

export async function get(item) {
    return (await storage.get(item))[item];
}

export async function getPermissions(index = null) {
    if (!index) {
        index = await getProfileIndex();
    }
    let profile = await getProfile(index);
    let hosts = await profile.hosts;
    return hosts;
}

export async function getPermission(host, action) {
    let index = await getProfileIndex();
    let profile = await getProfile(index);
    console.log(host, action);
    console.log('profile: ', profile);
    return profile.hosts?.[host]?.[action] || 'ask';
}

export async function setPermission(host, action, perm, index = null) {
    let profiles = await getProfiles();
    if (!index) {
        index = await getProfileIndex();
    }
    let profile = profiles[index];
    let newPerms = profile.hosts[host] || {};
    newPerms = { ...newPerms, [action]: perm };
    profile.hosts[host] = newPerms;
    profiles[index] = profile;
    await storage.set({ profiles });
}

export function humanPermission(p) {
    // Handle special case where event signing includes a kind number
    if (p.startsWith('signEvent:')) {
        let [e, n] = p.split(':');
        n = parseInt(n);
        let nname = KINDS.find(k => k[0] === n)?.[1] || `Unknown (Kind ${n})`;
        return `Sign event: ${nname}`;
    }

    switch (p) {
        case 'getPubKey':
            return 'Read public key';
        case 'signEvent':
            return 'Sign event';
        case 'getRelays':
            return 'Read relay list';
        case 'nip04.encrypt':
            return 'Encrypt private message';
        case 'nip04.decrypt':
            return 'Decrypt private message';
        default:
            return 'Unknown';
    }
}

export function validateKey(key) {
    const hexMatch = /^[\da-f]{64}$/i.test(key);
    const b32Match = /^nsec1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{58}$/.test(key);

    return hexMatch || b32Match;
}

export async function feature(name) {
    let fname = `feature:${name}`;
    let f = await browser.storage.local.get({ [fname]: false });
    return f[fname];
}

export async function relayReminder() {
    let index = await getProfileIndex();
    let profile = await getProfile(index);
    return profile.relayReminder;
}

export async function toggleRelayReminder() {
    let index = await getProfileIndex();
    let profiles = await getProfiles();
    profiles[index].relayReminder = false;
    await storage.set({ profiles });
}

export async function getDelegator(index) {
    let profiles = await getProfiles();
    let profile = profiles[index];
    console.log(profile);
    return [profile.delegate, profile.delegator];
}

export async function getNpub() {
    let index = await getProfileIndex();
    return await browser.runtime.sendMessage({
        kind: 'getNpub',
        payload: index,
    });
}
