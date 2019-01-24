const lodash = require("lodash")
const jwt = require("jsonwebtoken")

const Urrl = require("urrl")
const FetchQuest = require("fetchquest")

const TWITCH_EXT_CHAT_URL = new Urrl("https://api.twitch.tv/extensions/{clientId}/{extensionVersion}/channels/{channelId}/chat")
const TWITCH_EXT_LIVE_CHANNELS_URL = new Urrl("https://api.twitch.tv/extensions/{clientId}/live_activated_channels")
const TWITCH_EXT_PUBSUB_URL = new Urrl("https://api.twitch.tv/extensions/message/{channelId}")

const EXPIRATION_TIME = 1000

const Ebsidian = module.exports = {
    "extension": {
        "id": undefined,
        "secret": undefined,
        "version": undefined,
    }
}

Ebsidian.generateToken = function(payload) {
    payload.exp = payload.exp || Date.now() + EXPIRATION_TIME
    payload.role = payload.role || "external"
    payload.user_id = payload.user_id || "1234567890"

    return jwt.sign(payload, Buffer.from(Ebsidian.extension.secret, "base64"))
}

// https://dev.twitch.tv/docs/extensions/reference#get-live-channels-with-extension-activated
Ebsidian.generateMockBroadcasterToken = function(payload) {
    payload.exp = payload.exp || Date.now() + EXPIRATION_TIME
    payload.role = payload.role || "external"

    return Ebsidian.generateToken({
        "role": "broadcaster",
        "user_id": "1234567890",
        "channel_id": "1234567890",
        "opaque_user_id" : "U1234567890",
        // "sub": "1234567890",
        // "iat": Math.floor(Date.now() / 1000) - 60
    })
}

Ebsidian.retrieveLiveChannels = async function() {
    let response = await fetchquest({
        "url": TWITCH_EXT_LIVE_CHANNELS_URL({"clientId": Ebsidian.extension.id}),
        "headers": {"Client-ID": Ebsidian.extension.id}
    })

    return response.channels
}

// https://dev.twitch.tv/docs/extensions/reference#send-extension-chat-message
Ebsidian.sendChatMessage = async function chat(channelId, text) {
    channelId = channelId + ""

    const token = Ebsidian.generateToken({
        "role": "broadcaster",
        "user_id": channelId,
        "channel_id": channelId,
    })

    return await new FetchQuest({
        "url": TWITCH_EXT_CHAT_URL({
            "clientId": Ebsidian.extension.id,
            "extensionVersion": Ebsidian.extension.version,
            "channelId": channelId,
        }),
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
            "Client-ID": Ebsidian.extension.id,
            "Authorization": `Bearer ${token}`,
        },
        "body": {"text": text},
    })
}

// https://dev.twitch.tv/docs/extensions/reference#send-extension-pubsub-message
Ebsidian.sendPubsubMessage = async function(channelId, target, message) {
    channelId = channelId + ""

    const token = Ebsidian.generateToken({
        "role": "external",
        "user_id": channelId,
        "channel_id": channelId,
        "pubsub_perms": {
            "send": [target]
        }
    })

    return await new FetchQuest({
        "method": "POST",
        "url": TWITCH_EXT_PUBSUB_URL({
            "channelId": channelId || "all"
        }),
        "headers": {
            "Content-Type": "application/json",
            "Client-ID": Ebsidian.extension.id,
            "Authorization": `Bearer ${token}`,
        },
        "body": {
            "targets": [target],
            "content_type": "application/json",
            "message": JSON.stringify(message),
        }
    })
}

Ebsidian.broadcastPubsubMessage = async function(channelId, message) {
    Ebsidian.sendPubsubMessage(channelId, "broadcast", message)
}

// TODO: Configuration
// https://dev.twitch.tv/docs/extensions/reference#set-extension-required-configuration
// https://dev.twitch.tv/docs/extensions/reference#set-extension-configuration-segment
// https://dev.twitch.tv/docs/extensions/reference#get-extension-channel-configuration
// https://dev.twitch.tv/docs/extensions/reference#get-extension-configuration-segment
