const { App, ExpressReceiver } = require('@slack/bolt');
const express = require('express');

const SpotifyConnectionManager = require('./lib/spotify/SpotifyConnectionManager');

const NowPlayingSender = require('./lib/slack/api/NowPlayingSender');

const AuthenticationHandler = require('./handlers/authentication');
const SearchHandler = require('./handlers/search');
const QueueingHandler = require('./handlers/queueing');
const PlaybackHandler = require('./handlers/playback');

module.exports = onAuthenticated => {
  
  const connectionManager = new SpotifyConnectionManager({
    redirectUri: null,
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    onAuthenticated
  });

  // Create a Bolt Receiver
  const receiver = new ExpressReceiver({ signingSecret: process.env.SLACK_SIGNING_SECRET });

  // Initializes your app with your bot token and signing secret
  const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    receiver
  });

  const slackHelpers = {
    NowPlayingSender: new NowPlayingSender(connectionManager)
  }

  AuthenticationHandler(app, receiver.router, connectionManager, slackHelpers);
  SearchHandler(app, receiver.router, connectionManager, slackHelpers);
  QueueingHandler(app, receiver.router, connectionManager, slackHelpers);
  PlaybackHandler(app, receiver.router, connectionManager, slackHelpers);

  (async () => {
    // Start your app
    await app.start(process.env.PORT || 3000);

    console.log('⚡️ Bolt app is running!');
  })();

  const expApp = express();
  
  expApp.get('/token', async (req, res) => {
    const token = await connectionManager.getToken();
    res.json({ token });
  });
  expApp.listen(8081);
}
