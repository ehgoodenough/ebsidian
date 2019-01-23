# Twitch EBS #

An easy-to-use library for the Twitch Extension HTTP APIs.

### How to Use ###

#### TwitchEBS.retrieveSecret ####

```js
TwitchEBS.extension.id = "1234567890"
TwitchEBS.extension.secret = // do not commit your secret to your codebase!
TwitchEBS.extension.version = "0.0.1"
let channelId = "000000000"
await TwitchEBS.sendChatMessage(channelId, "Hello World!")
```

```js
TwitchEBS.extension.id = "1234567890"
const channels = await TwitchEBS.retrieveLiveChannels()
```

```js
TwitchEBS.extension.id = "1234567890"
TwitchEBS.extension.secret = // do not commit your secret to your codebase!
let channelId = "000000000"
await TwitchEBS.broadcastPubsubMessage(channelId, {"text": "Hello World!!"})
```
