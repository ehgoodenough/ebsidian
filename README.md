# Twitch EBS #

An easy-to-use library for your Twitch Extension EBS.

### How to Use ###

#### Ebsidian.retrieveSecret ####

```js
Ebsidian.extension.id = "1234567890"
Ebsidian.extension.secret = // do not commit your secret to your codebase!
Ebsidian.extension.version = "0.0.1"
let channelId = "000000000"
await Ebsidian.sendChatMessage(channelId, "Hello World!")
```

```js
Ebsidian.extension.id = "1234567890"
const channels = await Ebsidian.retrieveLiveChannels()
```

```js
Ebsidian.extension.id = "1234567890"
Ebsidian.extension.secret = // do not commit your secret to your codebase!
let channelId = "000000000"
await Ebsidian.broadcastPubsubMessage(channelId, {"text": "Hello World!!"})
```
