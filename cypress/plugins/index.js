const path = require('path');
const fs = require('fs');

module.exports = (on, config) => {
  on('before:browser:launch', (browser = {}, launchOptions) => {
    if (browser.name === 'chrome' || browser.name === 'chromium' || browser.name === 'canary') {
      const extensionPath = path.resolve('/Users/parasraghav/Documents/Test Folder/polkassembly/cypress/extensions/polkadot-js-extension.crx');
      launchOptions.args.push(`--load-extension=${extensionPath}`);
    }
    return launchOptions;
  });
};
