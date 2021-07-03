const TrackSearchResultsBlockBuilder = require('../../lib/slack/blocks/TrackSearchResultsBlockBuilder');

module.exports = (boltApp, expressRouter, spotifyConnectionManager) => {
    
    boltApp.command('/search-spotify', async ({ command, ack, say }) => {
        // Acknowledge command request
        await ack();
        const spotifyClient = spotifyConnectionManager.getClient();
        if (spotifyClient) {
            const data = await spotifyClient.searchTracks(command.text);
            const tracks = data.body.tracks.items;
            
            return say({
                blocks: TrackSearchResultsBlockBuilder(tracks.slice(0, 5)),
                text: "Here are your spotify search results"
            });
        }
        await say(`${command.text}`);
    });

}
