module.exports = {
  src_folders: ['tests'],
  
  webdriver: {
    start_process: true,
    server_path: require('chromedriver').path,
    port: 9515
  },
  
  test_settings: {
    default: {
      desiredCapabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          args: ['--headless', '--no-sandbox'],
          w3c: true
        }
      }
    },
    
    firefox: {
      webdriver: {
        start_process: true,
        server_path: '',  // geckodriver path - would need to be installed
        port: 4444
      },
      desiredCapabilities: {
        browserName: 'firefox',
        alwaysMatch: {
          'moz:firefoxOptions': {
            args: ['--headless']
          }
        }
      }
    }
  }
};