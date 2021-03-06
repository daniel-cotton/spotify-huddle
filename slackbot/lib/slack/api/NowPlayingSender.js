const NowPlayingBlockBuilder = require('../blocks/NowPlayingBlockBuilder.js');

module.exports = class NowPlayingSender {
    _lastNowPlayingMessage = null;
    _isPlaying = false;
    _spotifyConnectionManager = null;

    constructor(spotifyConnectionManager) {
        this._spotifyConnectionManager = spotifyConnectionManager;
        setInterval(() => {
            this.update();
        }, 5000);
    }

    async getMessage() {
        try {
            const spotifyClient = this._spotifyConnectionManager.getClient();
            if (spotifyClient) {
                const playbackStateData = await spotifyClient.getMyCurrentPlaybackState();
                const track = playbackStateData.body.item;
                const playbackState = playbackStateData.body;
    
                this._isPlaying = playbackState.is_playing;
                console.log(track);
                const attributedTrack = this._spotifyConnectionManager.getQueue().getAttributionAndAdvanceQueue(track);
    
                if (!attributedTrack) {
                    return {
                        text: "No currently playing tracks, why not add one?"
                    }
                }
    
                return {
                    blocks: NowPlayingBlockBuilder(attributedTrack, playbackState),
                    text: `Now playing: ${attributedTrack.name}`
                };
            }
        } catch (e) {
            // We tried....
            console.error("Error getting playback state message", e, JSON.stringify(e, null, 2));
        }
    }

    async checkState() {
        const spotifyClient = this._spotifyConnectionManager.getClient();
        if (spotifyClient) {
            const playbackStateData = await spotifyClient.getMyCurrentPlaybackState();
            const playbackState = playbackStateData.body;

            this._isPlaying = playbackState.is_playing;
        }
    }

    async sendNowPlayingMessage(say, client) {
        this._slackClient = client;

        const message = await this.getMessage();
        if (message) {
            const { channel, ts } = await say(message);

            await this.clear();
            this._lastNowPlayingMessage = {
                channel,
                ts,
            };
        }
    }

    async clear() {
        if (this._lastNowPlayingMessage && this._slackClient) {    
            try {
                await this._slackClient.chat.delete({
                    ...this._lastNowPlayingMessage,
                });
            } catch {
                // do nothing for now...
            }

        }
    }

    async update() {
        if (this._lastNowPlayingMessage && this._slackClient && this._isPlaying) {
            const message = await this.getMessage();
            if (message) {
                try {
                    await this._slackClient.chat.update({
                        ...this._lastNowPlayingMessage,
                        ...message
                    });
                } catch {
                    // do nothing for now...
                }
            }
        }
    }
}