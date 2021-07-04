const SlackTab = require('./tabs/slack');
const PlaybackTab = require('./tabs/playback');

module.exports = new (class PuppeteerClient {

    constructor() {
        this._slackReady = SlackTab.open();
    }

    onAuthenticated() {
        // open playback tab
        await this._slackReady;
        this._playbackReady = PlaybackTab.open();
    }
})();