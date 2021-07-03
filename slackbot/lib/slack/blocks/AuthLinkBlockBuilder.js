module.exports = (oauthURL) => [
    {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "*Login to Spotify*"
        }
    },
    {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "Time to DJ, but to do that, we're going to need you to login!"
        }
    },
    {
        "type": "actions",
        "elements": [
            {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "Sign In with Spotify",
                    "emoji": true
                },
                "action_id": "auth_button",
                "url": oauthURL
            }
        ]
    },
    {
        "type": "divider"
    }
];