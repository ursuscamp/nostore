export async function bglog(msg) {
    await browser.runtime.sendMessage({ kind: 'log', payload: msg });
}
