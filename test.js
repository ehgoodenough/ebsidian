const TwitchEBS = require(".")

async function test() {
    TwitchEBS.extension.id = "ub1t6tr0utja1bvqu661bt3o5w5tr8"
    // TwitchEBS.extension.secret = await secretsauce.get("dex-twitchext-secret")
    // TwitchEBS.extension.version = "0.0.1"
}

test().then((response) => {
    console.log(response || "Done!")
}).catch((error) => {
    console.log(error)
})
