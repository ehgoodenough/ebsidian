const TwitchEBS = require(".")
const Secretsauce = require("secretsauce")

async function test() {
    TwitchEBS.extension.id = "ub1t6tr0utja1bvqu661bt3o5w5tr8"
    TwitchEBS.extension.secret = await Secretsauce.get("dex-twitchext-secret")
    TwitchEBS.extension.version = "0.0.1"

    // TwitchEBS.broadcastPubsubMessage("88171886", {
    //     "greetings": "Hello World!!"
    // })
    // TwitchEBS.sendChatMessage("88171886", "Hello World!!")
}

test().then((response) => {
    console.log(response || "!!!")
}).catch((error) => {
    console.log(error)
})
