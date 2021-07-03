module.exports = (boltApp, expressRouter, spotifyConnectionManager, slackHelpers) => {
    

    boltApp.command('/now-playing', async ({ ack, say, client }) => {
        // Acknowledge command request
        await ack();
        return slackHelpers.NowPlayingSender.sendNowPlayingMessage(say, client);
    });
    

    boltApp.command('/play', async ({ ack, say, command, client }) => {
        if (!command.text) {
            // Acknowledge command request
            await ack();
            const spotifyClient = spotifyConnectionManager.getClient();
            if (spotifyClient) {
                await spotifyClient.play();
                slackHelpers.NowPlayingSender.checkState();
                return slackHelpers.NowPlayingSender.sendNowPlayingMessage(say, client);
            }
        }
    });
    

    boltApp.command('/pause', async ({ ack, say, command, client }) => {
        // Acknowledge command request
        await ack();
        const spotifyClient = spotifyConnectionManager.getClient();
        if (spotifyClient) {
            await spotifyClient.pause();
            return say({
                text: `Paused.`
            })
        }
    });
    
    boltApp.command('/skip', async ({ ack, say }) => {
        // Acknowledge command request
        await ack();
        const spotifyClient = spotifyConnectionManager.getClient();
        if (spotifyClient) {
            await spotifyClient.skipToNext();
            const playbackStateData = await spotifyClient.getMyCurrentPlaybackState();
            const track = playbackStateData.body.item;

            await say({
                text: `Skipped to next track: \t\t*${track.name}* - ${track.artists.map(a => a.name).join(", ")}`
            });

        }
    });
}
