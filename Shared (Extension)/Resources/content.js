let script = document.createElement('script');
script.setAttribute('src', browser.runtime.getURL('nostr.build.js'));
document.body.appendChild(script);

window.addEventListener('message', async message => {
    const validEvents = [
        'getPubKey',
        'signEvent',
        'getRelays',
        'nip04.encrypt',
        'nip04.decrypt',
    ];
    let { kind, reqId, payload } = message.data;
    if (!validEvents.includes(kind)) return;

    payload = await browser.runtime.sendMessage({ kind, payload });

    kind = `return_${kind}`;

    window.postMessage({ kind, reqId, payload }, '*');
});
