const DB_VERSION = 2;
const storage = browser.storage.local;
export const RECOMMENDED_RELAYS = [
    new URL('wss://relay.damus.io'),
    new URL('wss://eden.nostr.land'),
    new URL('wss://nostr-relay.derekross.me'),
    new URL('wss://relay.snort.social'),
];
// prettier-ignore
export const KINDS = [
    [0,  'Metadata',                    'https://github.com/nostr-protocol/nips/blob/master/01.md'],
    [1,  'Text',                        'https://github.com/nostr-protocol/nips/blob/master/01.md'],
    [2,  'Recommend Relay',             'https://github.com/nostr-protocol/nips/blob/master/01.md'],
    [3,  'Contacts',                    'https://github.com/nostr-protocol/nips/blob/master/02.md'],
    [4,  'Encrypted Direct Messages',   'https://github.com/nostr-protocol/nips/blob/master/04.md'],
    [5,  'Event Deletion',              'https://github.com/nostr-protocol/nips/blob/master/09.md'],
    [7,  'Reaction',                    'https://github.com/nostr-protocol/nips/blob/master/25.md'],
    [40, 'Channel Creation',            'https://github.com/nostr-protocol/nips/blob/master/28.md'],
    [41, 'Channel Metadata',            'https://github.com/nostr-protocol/nips/blob/master/28.md'],
    [42, 'Channel Message',             'https://github.com/nostr-protocol/nips/blob/master/28.md'],
    [43, 'Channel Hide Message',        'https://github.com/nostr-protocol/nips/blob/master/28.md'],
    [44, 'Channel Mute User',           'https://github.com/nostr-protocol/nips/blob/master/28.md'],
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
