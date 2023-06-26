# Nostore

This is a [NIP-07][nip07] compatible extension for signing nostr events.

## Features

* Login with nostr (`getPublicKey`).
* Post nostr event (`signEvent`).
* Encrypted direct messages (`nip04.encrypt` and `nip04.decrypt`).
* Multiple profiles.

## Installation

Available at the official [Mac App Store](https://apps.apple.com/us/app/nostore/id1666553677).

<p align="center">
  <a href="">
    <img src="https://github.com/ursuscamp/nostore/assets/954902/f009b6c4-5b54-4ee4-bcd9-9b4daf70588f" alt="App Store Download" />
  </a>
</p>

## Usage

Click the Nostore extension icon in the Safari toolbar, there should be a default profile with a new, random private key.

Feel free to change the name and edit the key with your personal nostr key. Create additional profiles as desired. Whichever key profile is selected under Profile is the currently "active" profile for nostr events.

## Acknowledgements

Thanks to fiatjiaf for envisioning nostr, but also for creating [nostr-tools][nostr-tools] and the [nos2x][nos2x] extension, which I referenced liberally when stumped during development of this extension.

## Privacy

This extension does not collect any user data, or transmit any data over a network connection. All private key data is sequestered in the extension's separate browser storage.

## Development

1. Open the project in XCode.
2. Open project folder in terminal.
3. Run `npm install` to install the dependencies.
4. Run `npm run watch` to watch and build the necessary extension files.
5. Run `npm run watch-tailwind` to watch and build the pages with tailwinds CSS.
6. After every rebuild, execute Run in XCode to deploy the latest changes to Safari.

If you do not see the Nostore extension in your Safari toolbar, you need to activate unsigned extensions and Nostore:

1. Safari menu -> Settings -> Advanced -> Show Develop menu in menu bar.
2. In Develop menu, select Allow Unsigned Extension.
3. Click Extension tab in Settings, activate Nostore.

[nip07]: https://github.com/nostr-protocol/nips/blob/master/07.md
[nostr-tools]: https://github.com/nbd-wtf/nostr-tools
[nos2x]: https://github.com/fiatjaf/nos2x
