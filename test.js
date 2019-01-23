async function test() {
    TwitchEBS.extension.id = "ub1t6tr0utja1bvqu661bt3o5w5tr8"
    TwitchEBS.extension.secret = await secretsauce.get("dex-twitchext-secret")
    TwitchEBS.extension.version = "0.0.1"

    await TwitchEBS.sendChatMessage("88171886", "Hello World!")
}

test().then(() => {
    console.log("Done!")
}).catch((error) => {
    console.log(error)
})
