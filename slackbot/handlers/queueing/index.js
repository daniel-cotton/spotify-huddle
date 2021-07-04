const TrackQueuedBlockBuilder = require('../../lib/slack/blocks/TrackQueuedBlockBuilder.js');

module.exports = (boltApp, expressRouter, spotifyConnectionManager) => {
    
    boltApp.action('queue_track', async ({ action, ack, client, body }) => {
        // Acknowledge command request
        await ack();
        const { value } = action;
        const spotifyClient = spotifyConnectionManager.getClient();
        if (spotifyClient) {
            const track = await spotifyClient.getTrack(value.split(":").pop());
            await spotifyClient.addToQueue(value);

            const blocks = TrackQueuedBlockBuilder(track.body);
            client.chat.update({
                channel: body.channel.id,
                ts: body.message.ts,
                blocks,
                text: `Added ${track.body.name} to the queue.`
            });
        }
    });

    boltApp.command('/play', async ({ ack, say, command }) => {
        if (command.text) {
            // Acknowledge command request
            await ack();
            try {
                const spotifyClient = spotifyConnectionManager.getClient();
                if (spotifyClient) {
                    const data = await spotifyClient.searchTracks(command.text);
                    const tracks = data.body.tracks.items;
        
                    const track = tracks[0];
                    await spotifyClient.addToQueue(track.uri);
        
                    const blocks = TrackQueuedBlockBuilder(track);
                    await say({
                        blocks,
                        text: `Added ${track.name} to the queue.`
                    });
    
                }
            } catch (e) {
                try {
                    const spotifyClient = spotifyConnectionManager.getClient();
                    if (spotifyClient) {
                        const data = await spotifyClient.searchTracks(command.text);
                        const tracks = data.body.tracks.items;
            
                        const track = tracks[0];
            
                        await spotifyClient.play({
                            device_id: spotifyConnectionManager.deviceID,
                            uris: [track.uri]
                        })
    
                        const blocks = TrackQueuedBlockBuilder(track);
                        await say({
                            blocks,
                            text: `Added ${track.name} to the queue.`
                        });
        
                    }
                } catch (e) {
                    await say({
                        text: `Something went wrong, please retry later.`
                    });
                }
            }
        }
    });
}
