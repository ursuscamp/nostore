let script = document.createElement('script');
script.setAttribute('src', browser.runtime.getURL('nostr.build.js'));
document.body.appendChild(script);

window.addEventListener('message', async (message) => {
  let {kind, reqId} = message.data;
  if (kind !== 'getPublicKey')
    return;
  
  console.log(`Event ${reqId}: Content script received message kind ${kind}`);
  let publicKey = await browser.runtime.sendMessage({kind: 'getPubKey'});
  console.log(`Event ${reqId}: Public key retrieved; ${publicKey}`);

  window.postMessage({kind: 'publicKey', reqId, payload: publicKey}, '*');
});