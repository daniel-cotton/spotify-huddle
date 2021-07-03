const numberBlocks = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
]

const numberToEmoji = number => `${number}`
    .split("")
    .map(digit => numberBlocks[Number(digit)])
    .map(emojiName => `:${emojiName}:`)
    .join("");

module.exports = tracks => [
    {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "Okay, this is what Spotify found..."
        }
    },
    {
        "type": "divider"
    },
    ...(tracks.map((track, index) => ({
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": `${numberToEmoji(index + 1)}\t\t*${track.name}* ${track.name !== track.album.name ? `(${track.album.name})` : ""}\n\t\t\t ${track.artists.map(artist => artist.name).join(", ")}`
        },
        "accessory": {
            "type": "button",
            "text": {
                "type": "plain_text",
                "emoji": true,
                "text": "Play"
            },
            "action_id": "queue_track",
            "value": track.uri
        }
    }))),
    {
        "type": "divider"
    }
];