const SlackTab = require('./tabs/slack');
const PlaybackTab = require('./tabs/playback');

module.exports = new (class PuppeteerClient {

    constructor() {
        this._slackReady = SlackTab.open();
        process.on('SIGINT', function () {
            console.log('Got SIGINT.  Press Control-D to exit.');
            SlackTab.close();
            PlaybackTab.close();
        });
          
    }

    async onAuthenticated(token) {
        // open playback tab
        await this._slackReady;
        this._playbackReady = PlaybackTab.open(token);
    }
})();