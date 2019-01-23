const lodash = require("lodash")
const jwt = require("jsonwebtoken")

const Urrl = require("urrl")
const FetchQuest = require("fetchquest")

const TWITCH_EXT_CHAT_URL = new Urrl("https://api.twitch.tv/extensions/{clientId}/{extensionVersion}/channels/{channelId}/chat")
const TWITCH_EXT_LIVE_CHANNELS_URL = new Urrl("https://api.twitch.tv/extensions/{clientId}/live_activated_channels")
const TWITCH_EXT_PUBSUB_URL = new Urrl("https://api.twitch.tv/extensions/message/{channelId}")

const EXPIRATION_TIME = 1000

const TwitchEBS = module.exports = {
    "extension": {
        "id": undefined,
        "secret": undefined,
        "version": undefined,
    }
}

TwitchEBS.generateToken = function(payload) {
    payload.exp = payload.exp || Date.now() + EXPIRATION_TIME
    payload.role = payload.role || "external"
    payload.user_id = payload.user_id || "1234567890"

    return jwt.sign(payload, Buffer.from(TwitchEBS.extension.secret, "base64"))
}

// https://dev.twitch.tv/docs/extensions/reference#get-live-channels-with-extension-activated
TwitchEBS.generateMockBroadcasterToken = function(payload) {
    payload.exp = payload.exp || Date.now() + EXPIRATION_TIME
    payload.role = payload.role || "external"

    return TwitchEBS.generateToken({
        "role": "broadcaster",
        "user_id": "1234567890",
        "channel_id": "1234567890",
        "opaque_user_id" : "U1234567890",
        // "sub": "1234567890",
        // "iat": Math.floor(Date.now() / 1000) - 60
    })
}

TwitchEBS.retrieveLiveChannels = async function() {
    let response = await fetchquest({
        "url": TWITCH_EXT_LIVE_CHANNELS_URL({"clientId": TwitchEBS.extension.id}),
        "headers": {"Client-ID": TwitchEBS.extension.id}
    })

    return response.channels
}

// https://dev.twitch.tv/docs/extensions/reference#send-extension-chat-message
TwitchEBS.sendChatMessage = async function chat(channelId, text) {
    channelId = channelId + ""

    const token = TwitchEBS.generateToken({
        "role": "broadcaster",
        "user_id": channelId,
        "channel_id": channelId,
    })

    return await new FetchQuest({
        "url": TWITCH_EXT_CHAT_URL({
            "clientId": TwitchEBS.extension.id,
            "extensionVersion": TwitchEBS.extension.version,
            "channelId": channelId,
        }),
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
            "Client-ID": TwitchEBS.extension.id,
            "Authorization": `Bearer ${token}`,
        },
        "body": {"text": text},
    })
}

// https://dev.twitch.tv/docs/extensions/reference#send-extension-pubsub-message
TwitchEBS.sendPubsubMessage = async function(channelId, target, message) {
    channelId = channelId + ""

    const token = TwitchEBS.generateToken({
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
            "Client-ID": TwitchEBS.extension.id,
            "Authorization": `Bearer ${token}`,
        },
        "body": {
            "targets": [target],
            "content_type": "application/json",
            "message": JSON.stringify(message),
        }
    })
}

TwitchEBS.broadcastPubsubMessage = async function(channelId, message) {
    TwitchEBS.sendPubsubMessage(channelId, "broadcast", message)
}

// TODO:
// https://dev.twitch.tv/docs/extensions/reference#set-extension-required-configuration
// https://dev.twitch.tv/docs/extensions/reference#set-extension-configuration-segment
// https://dev.twitch.tv/docs/extensions/reference#get-extension-channel-configuration
// https://dev.twitch.tv/docs/extensions/reference#get-extension-configuration-segment
