exports.config = {
  // The address of a running selenium server.
  seleniumAddress: 'http://127.0.0.1:4444/wd/hub',

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome'
  },
  chromeOnly: false,
    multiCapabilities: [{
      'browserName': 'chrome',
    }],
  frameworks: ['ng-scenario','jasmine'],
  // Spec patterns are relative to the configuration file location passed
  // to protractor (in this example conf.js).
  // They may include glob patterns.

  specs: ['storyProtractorTest.js'],
  // Options to be passed to Jasmine-node.

  jasmineNodeOpts: {
    showColors: true, // Use colors in the command line report.
  }
};
