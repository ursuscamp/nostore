#!/usr/bin/env node

let watch =
    process.argv[2] === 'watch'
        ? {
              onRebuild(error, result) {
                  if (error) console.error('watch rebuild failed: ', error);
                  else console.log('watch rebuild succeeded: ', result);
              },
          }
        : false;

require('esbuild')
    .build({
        entryPoints: {
            'background.build': './Shared (Extension)/Resources/background.js',
            'content.build': './Shared (Extension)/Resources/content.js',
            'nostr.build': './Shared (Extension)/Resources/nostr.js',
            'popup.build': './Shared (Extension)/Resources/popup.js',
            'options.build': './Shared (Extension)/Resources/options.js',
            'permission/permission.build':
                './Shared (Extension)/Resources/permission/permission.js',
            'experimental/experimental.build':
                './Shared (Extension)/Resources/experimental/experimental.js',
            'wizards/delegation/delegation.build':
                './Shared (Extension)/Resources/wizards/delegation/delegation.js',
            'event_history/event_history.build':
                './Shared (Extension)/Resources/event_history/event_history.js',
        },
        outdir: './Shared (Extension)/Resources',
        sourcemap: 'inline',
        bundle: true,
        // minify: true,
        watch,
    })
    .catch(() => process.exit(1));
