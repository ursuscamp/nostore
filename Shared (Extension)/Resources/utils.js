const storage = browser.storage.local;

export async function bglog(msg, module = null) {
    await browser.runtime.sendMessage({
        kind: 'log',
        payload: { msg, module },
    });
}

export async function getProfiles() {
    let profiles = await storage.get({ profiles: [] });
    return profiles.profiles;
}

async function getProfile(index) {
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

export async function initialize() {
    await getOrSetDefault('profileIndex', 0);
    await getOrSetDefault('profiles', [await generateProfile()]);
}

export async function generateProfile() {
    return {
        name: 'Default',
        privKey: await generatePrivateKey(),
        hosts: [],
        relays: [],
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

export async function newProfile() {
    let profiles = await getProfiles();
    const newProfile = await generateProfile('New Profile');
    profiles.push(newProfile);
    await storage.set({ profiles });
    return profiles.length - 1;
}
