module.exports = class SpotifyQueue {
    constructor() {
        this._queue = []
    }
    async enqueue(track, user) {
        this._queue.push({
            ...track,
            user
        });
    }
    getAttributionAndAdvanceQueue(activeTrack) {
        this._queue = this._queue.slice(this._queue.findIndex(track => track.uri === activeTrack.uri));
        return this._queue[0];
    }
}