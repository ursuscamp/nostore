let script = document.createElement('script');
script.setAttribute('src', browser.runtime.getURL('nostr.build.js'));
document.body.appendChild(script);

window.addEventListener('message', async (message) => {
  let {kind, reqId, payload} = message.data;
  if (kind !== 'getPubKey' && kind !== 'signEvent')
    return;
  
  console.log(`Event ${reqId}: Content script received message kind ${kind}, payload: `, payload);
  payload = await browser.runtime.sendMessage({kind, payload});

  kind = `return_${kind}`;

  window.postMessage({kind, reqId, payload}, '*');
});