const Ebsidian = require(".")
const SecretSauce = require("secretsauce")

async function test() {
    Ebsidian.extension.id = "ub1t6tr0utja1bvqu661bt3o5w5tr8"
    Ebsidian.extension.secret = await SecretSauce.get("dex-twitchext-secret")
    Ebsidian.extension.version = "0.0.1"

    // Ebsidian.broadcastPubsubMessage("88171886", {"greetings": "Hello World!!"})
    // Ebsidian.sendChatMessage("88171886", "Hello World!!")
}

test().then((response) => {
    console.log(response || "!!!")
}).catch((error) => {
    console.log(error)
})
