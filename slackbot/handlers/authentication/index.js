const AuthLinkBlockBuilder = require('../../lib/slack/blocks/AuthLinkBlockBuilder');

module.exports = (boltApp, expressRouter, spotifyConnectionManager) => {
    
    // Other web requests are methods on receiver.router
    expressRouter.get('/callback', (req, res) => {
        // You're working with an express req and res now.
        const { code } = req.query;
        try {
            spotifyConnectionManager.authenticateWithCode(code);
            res.send('Signed in, please re-open slack.');
        } catch (e) {
            res.send('Something went wrong, you may already be logged in.');
        }
    });

    boltApp.command('/spotify-login', async ({ ack, say }) => {
        // Acknowledge command request
        await ack();
        if (!spotifyConnectionManager.isAuthenticated()) {
            const oauthURL = await spotifyConnectionManager.createAuthenticationURL();
            return say({
                blocks: AuthLinkBlockBuilder(oauthURL),
                text: `Please authenticate with spotify at: ${oauthURL}`
            })
        } else {
            return say({
                text: "Spotify is already connected :)"
            })
        }
    });

    boltApp.action('auth_button', async ({ ack, client, body }) => {
        // Acknowledge command request
        await ack();

        return new Promise((resolve) => {
            setTimeout(async () => {
                try {
                    const spotifyClient = spotifyConnectionManager.getClient();
                    if (spotifyClient) {
                        client.chat.update({
                            channel: body.channel.id,
                            ts: body.message.ts,
                            text: `Authenticated successfully with Spotify`
                        });
                    }
                    resolve();
                } catch (e) {
                    console.error(e);
                    resolve();
                }
            }, 4000)
        })
    });
}