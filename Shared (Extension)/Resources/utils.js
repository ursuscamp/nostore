export async function bglog(msg, module = null) {
    await browser.runtime.sendMessage({
        kind: 'log',
        payload: { msg, module },
    });
}
