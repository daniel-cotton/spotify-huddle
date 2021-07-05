# Spotify Huddle

This is a kinda monorepo for Spotify Huddle, a remote-work Spotify streaming bot for Slack's Huddles feature.

It consists of 3 core components:

 - _playback-client_ - A super basic node server for a HTML file which does the actual playback via Spotify's Web Player SDK

 - _puppeteer-bot_ - A basic puppeteer-managed instance that launches the *playback-client* and launches *Slack*, joining/leaving huddles as needed.

 - _slackbot_ - A Slack Bolt Framework app for controling the Spotify Instance + managing playback, backed by the Spotify REST API.

### Disclaimer
This isn't the most polished codebase in the world, it was put together in around a day with the intent of demonstrating an idea, and as such isn't the best code and has little documentation.

But it works well for it's intended purpose!

## Getting Started

### Environment Setup.
You're going to need somewhere to run the bot, this is pretty entirely up to you.

In my case, I deployed a Linux (Ubuntu) VM onto Google Cloud Platform via Google Compute Engine, following the steps here to give me a mechanism of remotely accessing the UI for debugging purposes
 https://cloud.google.com/architecture/chrome-desktop-remote-on-compute-engine

I also installed Google Chrome, Node.JS and Yarn.

#### Audio Routing
Wherever you deploy the bot, you're going to need some form of virtual audio interface. In my case, I use *pulseaudio*.

My setup was fairly simple:
 - Install alsa-plugins or equivalent package for your linux distribution
 - Tell chrome to launch using pulseaudio (e.g. https://www.reddit.com/r/linuxaudio/comments/a8igm3/how_to_disable_alsa_and_force_chromium_to_use/)
 - Create a virtual audio device as an input (and optionally as an output or sink) and set them as default.

#### Pulseaudio Setup

I wrote this basic audio startup script that would initialise pulseaudio with the virtual devices I needed.

Worth noting that as I'd installed Chrome Remote Desktop on the instance, I noticed that it was always the default audio output, no matter what I tried. So I made the best of this situation and used it, rather than creating my own virtual output.

My script simply:
 - Creates a new monitor of the remote-desktop audio output (sink)
 - Creates a virtual audio source from this monitor
 - Sets the remote-desktop output as the default
 - Sets the virtual source as the default

The bash script is as follows
```
pacmd set-default-source chrome_remote_desktop_session.monitor

pacmd load-module module-virtual-source source_name=chrome_remote_desktop_session

pacmd set-default-sink chrome_remote_desktop_session

pacmd set-default-source chrome_remote_desktop_session.monitor
```

### Dependencies

All dependencies are managed through Yarn, a 'yarn' in the root will install all necessary dependencies.

### Configuration

This repo includes a `template.env` file which details the required credentials/information needed.

You will need to:
 - Create an 'App' in the Slack Developer Dashboard and register it to your 'workspace' that supports huddles
 - Create an 'App' in the Spotify Developer Dashboard

In the instance of chrome that the bot will be using, you need to log-into a Slack user that the bot can use to join the huddles. 

In my case, I created a single-channel guest account for the bot such that it wouldn't have access to any other channels.

You will need to expose a public endpoint for the app, once this is available, plug into the PUBLIC_EP env variable & add to the Slack app config. As we're using bolt, any request urls need to be added as `https://{endpoint}/slack/events`.

### Running it

One command brings the entire app up, simply run the following

`EXECUTABLE=/usr/bin/google-chrome yarn start`

Feel free to swap that path for your google chrome instance.

## Usage

### Authentication

The bot will now let you sign into a spotify account, just launch the slack channel the bot is added to and run `/spotify-login` - it'll return a button that you can click to authorize access to use your spotify subscription.

### Commands

Slack slash commands are as follows:
 - */play* _{song name here}_
 - */search-spotify* _{song name here}_
 - */play*
 - */pause*
 - */now-playing*
 - */skip*


## Contributing

I'm open to pull-requests on this repo, equally please feel-free to fork/remix this as much as you'd like. 

I'm not really sure where this is going, but eager to share early in spite of it not being the most polished codebase!