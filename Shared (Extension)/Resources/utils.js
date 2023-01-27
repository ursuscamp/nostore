const storage = browser.storage.local;

export async function bglog(msg, module = null) {
    await browser.runtime.sendMessage({
        kind: 'log',
        payload: { msg, module },
    });
}

export async function getProfileNames() {
    let profiles = await storage.get({ profiles: [] });
    return profiles.profiles.map(p => p.name);
}

export async function getProfileIndex() {
    const index = await storage.get({ profileIndex: 0 });
    return index.profileIndex;
}

export async function setProfileIndex(profileIndex) {
    await storage.set({ profileIndex });
}
