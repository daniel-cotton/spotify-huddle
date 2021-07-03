const formatMillisecondsAsPlayback = ms => {
    const seconds = Math.round((ms / 1000) % 60);
    const minutes = Math.floor(ms / 1000 / 60);
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`
}

module.exports = (track, playbackState) => [
    {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "*Now Playing*"
        }
    },
    {
        "type": "divider"
    },
    {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": `*${track.name}* ${track.name !== track.album.name ? `(${track.album.name})` : ""}\n${track.artists.map(artist => artist.name).join(", ")}\n\n\n*${playbackState.is_playing ? "Playing" : "Paused"}*: ${formatMillisecondsAsPlayback(playbackState.progress_ms)} / ${formatMillisecondsAsPlayback(track.duration_ms)}`
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