const SpotifyWebApi = require('spotify-web-api-node');
const { v4 : uuid } = require('uuid');
const fs = require('fs').promises

const SpotifyQueue = require('./SpotifyQueue');

module.exports = class SpotifyConnectionManager {
    constructor({ clientId, clientSecret, onAuthenticated, redirectUri }) {
        this._queue = new SpotifyQueue();
        this._uninitialisedClient = new SpotifyWebApi({
            clientId: clientId,
            clientSecret: clientSecret,
            redirectUri: redirectUri + '/callback'
        });
        this.onAuthenticated = onAuthenticated;
        this._wakeAuthenticate();
    }
    async _wakeAuthenticate() {
        try {
            const potentialJSON = await fs.readFile('.auth.json');
            const { access_token, refresh_token } = JSON.parse(potentialJSON);
            if (access_token && refresh_token) {
                this._uninitialisedClient.setAccessToken(access_token);
                this._uninitialisedClient.setRefreshToken(refresh_token);
                await this.refresh(this._uninitialisedClient);
                this._spotifyClient = this._uninitialisedClient;
                this._uninitialisedClient = null;
                console.log("success wake authenticate")
                this.onAuthenticated && this.onAuthenticated(access_token, refresh_token);
            }
        } catch (e) {
            console.error("failed wake authenticate..... ", e)
            // do nothing for now.
        }
    }
    setDeviceId(id) {
        this.deviceID = id;
    }
    isAuthenticated() {
        if (!this._spotifyClient) {
            return false;
        } else {
            return true;
        }
    }
    createAuthenticationURL() {
        const scopes = [
            'user-read-playback-state',
            'user-modify-playback-state',
            'user-read-currently-playing',
            'app-remote-control',
            "user-read-email", 
            "user-read-private",
            'streaming',
        ];
        this._authState = uuid();

        const authorizeURL = this._uninitialisedClient.createAuthorizeURL(scopes, this._authState);

        return authorizeURL;
    }
    authenticateWithCode(code) {
        const now = Date.now();
        return this._uninitialisedClient.authorizationCodeGrant(code).then(
            async (data) => {
                this._tokenExpiry = new Date(now + (Number(data.body['expires_in']) * 1000));
                console.log('The token expires in ' + data.body['expires_in']);
                console.log('The token expires at ' + this._tokenExpiry);
                console.log('The access token is ' + data.body['access_token']);
                console.log('The refresh token is ' + data.body['refresh_token']);
            
                // Set the access token on the API object to use it in later calls
                this._uninitialisedClient.setAccessToken(data.body['access_token']);
                this._uninitialisedClient.setRefreshToken(data.body['refresh_token']);
                this._spotifyClient = this._uninitialisedClient;
                this._uninitialisedClient = null;
                this._tokens = {
                    access_token: data.body['access_token'],
                    refresh_token: data.body['refresh_token']
                };

                await fs.writeFile('.auth.json', JSON.stringify(this._tokens));
                this.onAuthenticated && this.onAuthenticated(this._tokens.access_token, this._tokens.refresh_token);
            },
            function(err) {
                console.log('Something went wrong!', err);
            }
        );
    }
    refreshIfNeeded() {
        if (this._tokenExpiry < Date.now() - 1000 * 10 * 60) {
            return this.refresh(this._spotifyClient);     
        }
    }
    async getToken() {
        try {
            await this.refreshIfNeeded();
            return this._tokens && this._tokens.access_token;
        } catch {
            return null;
        }
    }
    refresh(client) {
        const now = Date.now();
        return client.refreshAccessToken().then(
            async (data) => {
                console.log('The access token has been refreshed!');
            
                this._tokenExpiry = new Date(now + (Number(data.body['expires_in']) * 1000));
                console.log('The token expires in ' + data.body['expires_in']);
                console.log('The token expires at ' + this._tokenExpiry);
                // Save the access token so that it's used in future calls
                client.setAccessToken(data.body['access_token']);
                this._tokens = {
                    ...(this._tokens || {}),
                    access_token: data.body['access_token']
                }
                await fs.writeFile('.auth.json', JSON.stringify(this._tokens));
            },
            function(err) {
                console.log('Could not refresh access token', err);
            }
        );
    }
    getClient() {
        try {
            this.refreshIfNeeded();
        } catch {
            // [TODO] add token refresh error handling?
        }
        return this._spotifyClient;
    }
    getQueue() {
        return this._queue;
    }
}