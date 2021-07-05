const TrackQueuedBlockBuilder = require('../../lib/slack/blocks/TrackQueuedBlockBuilder.js');

module.exports = (boltApp, expressRouter, spotifyConnectionManager) => {

    const enqueueTrack = (track, user) => {
        
        try {
            const spotifyClient = spotifyConnectionManager.getClient();
            const queue = spotifyConnectionManager.getQueue();
            if (spotifyClient) {
                await spotifyClient.addToQueue(track.uri);
                queue.enqueue(track, user);
                return track;
            }
        } catch (e) {
            try {
                const spotifyClient = spotifyConnectionManager.getClient();
                const queue = spotifyConnectionManager.getQueue();
                if (spotifyClient) {
                    await spotifyClient.play({
                        device_id: spotifyConnectionManager.deviceID,
                        uris: [track.uri]
                    })
                    queue.enqueue(track, user);

                    return track;
                }
            } catch (e) {
                console.error(e);
                return null;
            }
        }
    }
    
    boltApp.action('queue_track', async ({ action, ack, client, body }) => {
        // Acknowledge command request
        await ack();
        const { value } = action;
        const spotifyClient = spotifyConnectionManager.getClient();
        const user = body.user ? body.user : {
            username: body.user_name,
        };
        if (spotifyClient) {
            const track = await spotifyClient.getTrack(value.split(":").pop());
            
            const enqueuedTrack = enqueueTrack(track.body, user);
            if (enqueuedTrack) {
                const blocks = TrackQueuedBlockBuilder(track.body, user);
                client.chat.update({
                    channel: body.channel.id,
                    ts: body.message.ts,
                    blocks,
                    text: `Added ${track.body.name} to the queue.`
                });
            } else {
                await say({
                    text: `Something went wrong, please retry later.`
                });
            }
        }
    });

    boltApp.command('/play', async ({ ack, say, command, body }) => {
        if (command.text) {
            // Acknowledge command request
            await ack();

            const user = {
                username: body.user_name
            };

            try {
                const spotifyClient = spotifyConnectionManager.getClient();
                if (spotifyClient) {
                    const data = await spotifyClient.searchTracks(command.text);
                    const tracks = data.body.tracks.items;
        
                    const track = tracks[0];
                    const enqueuedTrack = enqueueTrack(track, user);
                    if (enqueuedTrack) {
                        const blocks = TrackQueuedBlockBuilder(track, user);
                        await say({
                            blocks,
                            text: `Added ${track.name} to the queue.`
                        });
                    } else {
                        await say({
                            text: `Something went wrong, please retry later.`
                        });
                    }
                }
            } catch (e) {
                await say({
                    text: `I couldn't find any tracks with that name, maybe try another?`
                });
            }
        }
    });
}
