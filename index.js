const lodash = require("lodash")
const jwt = require("jsonwebtoken")
const fetchquest = require("fetchquest")
const secretsauce = require("secretsauce")

const Urrl = require("urrl")

const TwitchEBS = module.exports = {
    "extension": {
        "id": undefined,
        "secret": undefined,
        "version": undefined,
    }
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

const EXPIRATION_TIME = 1000

const TWITCH_EXT_CHAT_URL = new Urrl("https://api.twitch.tv/extensions/{clientId}/{extensionVersion}/channels/{channelId}/chat")
const TWITCH_EXT_LIVE_CHANNELS_URL = new Urrl("https://api.twitch.tv/extensions/{clientId}/live_activated_channels")

module.exports.sendChatMessage = async function chat(channelId, text) {
    channelId = channelId + ""

    let url = TWITCH_EXT_CHAT_URL({
        "clientId": TwitchEBS.extension.id,
        "extensionVersion": TwitchEBS.extension.version,
        "channelId": channelId,
    })

    let user = {
        "role": "broadcaster",
        "user_id": channelId,
        "exp": Date.now() + EXPIRATION_TIME,
        "channel_id": channelId,
    }

    let secret = Buffer.from(TwitchEBS.extension.secret, "base64")
    let authorization = jwt.sign(user, secret)

    return await fetchquest({
        "url": url,
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
            "Client-ID": TwitchEBS.extension.id,
            "Authorization": `Bearer ${authorization}`,
        },
        "body": {"text": text},
    })
}

module.exports.retrieveLiveChannels = async function() {
    let response = await fetchquest({
        "url": TWITCH_EXT_LIVE_CHANNELS_URL({"clientId": TwitchEBS.extension.id}),
        "headers": {"Client-ID": TwitchEBS.extension.id}
    })

    return response.channels
}
