const lodash = require("lodash")
const jwt = require("jsonwebtoken")

const Urrl = require("urrl")
const FetchQuest = require("fetchquest")

const TwitchEBS = module.exports = {
    "extension": {
        "id": undefined,
        "secret": undefined,
        "version": undefined,
    }
}

const EXPIRATION_TIME = 1000

const TWITCH_EXT_CHAT_URL = new Urrl("https://api.twitch.tv/extensions/{clientId}/{extensionVersion}/channels/{channelId}/chat")
const TWITCH_EXT_LIVE_CHANNELS_URL = new Urrl("https://api.twitch.tv/extensions/{clientId}/live_activated_channels")
const TWITCH_EXT_PUBSUB_URL = new Urrl("https://api.twitch.tv/extensions/message/{channelId}")

TwitchEBS.generateToken = function(payload) {
    payload.exp = payload.exp || Date.now() + EXPIRATION_TIME
    payload.role = payload.role || "external"

    return jwt.sign(payload, Buffer.from(TwitchEBS.extension.secret, "base64"))
}

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

TwitchEBS.retrieveLiveChannels = async function() {
    let response = await fetchquest({
        "url": TWITCH_EXT_LIVE_CHANNELS_URL({"clientId": TwitchEBS.extension.id}),
        "headers": {"Client-ID": TwitchEBS.extension.id}
    })

    return response.channels
}



// , {"expiresIn": "24h"}
// const DEFAULT_PAYLOAD = {
//     "sub": "1234567890",
//     "name": "John Doe",
//     "channel_id": "1234567890",
//     "opaque_user_id" : "U1234567890",
//     "role": "broadcaster",
//     "iat": Math.floor(Date.now() / 1000) - 60
// }

// TwitchEBS.generateToken = function(payload) {
//     payload = lodash.merge(payload, DEFAULT_PAYLOAD)
//     return jwt.sign(payload, TwitchEBS.extension.secret)
// }

// async function authorize(payload) {
//     let secret = await retrieveSecret("extension")
//     secret = Buffer.from(secret, "base64")
//     return "Bearer " + JWT.sign(payload, secret, {"expiresIn": "24h"})
// }
//
// const PAYLOAD = {
//     "sub": "1234567890",
//     "name": "John Doe",
//     "channel_id": "1234567890",
//     "opaque_user_id" : "U1234567890",
//     "role": "broadcaster",
//     "iat": Math.floor(Date.now() / 1000) - 60
// }
