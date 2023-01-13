async function savePrivateKey(event) {
    event.preventDefault();
    let privKey = document.getElementById('priv-key');
    browser.storage.local.set({ "priv-key": privKey.value });
    console.log('setting private key');
    await browser.runtime.sendMessage({greeting: 'hello'});
}

async function getPrivateKey() {
    let key = await browser.storage.local.get("priv-key");
    return key["priv-key"];
}

async function setPrivKeyInput() {
    let privKey = await getPrivateKey();

    if (privKey) {
        document.getElementById("priv-key").value = privKey;
    }
}

document.getElementById("priv-key-form").addEventListener("submit", savePrivateKey);
setPrivKeyInput();
