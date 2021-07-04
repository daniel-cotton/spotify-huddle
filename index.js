require('dotenv').config();
require('./playback-client');

const PuppeteerClient = require('./puppeteer-bot');

require('./slackbot')(PuppeteerClient.onAuthenticated);
