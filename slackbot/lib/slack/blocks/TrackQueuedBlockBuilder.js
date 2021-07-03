module.exports = track => [
    {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "New track added to the queue:"
        }
    },
    {
        "type": "divider"
    },
    {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": `*${track.name}* ${track.name !== track.album.name ? `(${track.album.name})` : ""}\n${track.artists.map(artist => artist.name).join(", ")}`
        },
        "accessory": {
            "type": "image",
            "image_url": track.album.images.filter(image => image.width >= 100).pop().url,
            "alt_text": track.album.name
        }
    },
    {
        "type": "divider"
    }
];