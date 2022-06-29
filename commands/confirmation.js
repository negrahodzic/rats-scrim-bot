
var fs = require("fs");

module.exports = {
    name: "%confirm",
    description: "Creates confirmation message",
    async execute(msg, server) {
        server.config.scrims.forEach(async (scrim) => {

            if (msg.channel.id === scrim.channel_Confirmations) {
                const reactionMessage = await msg.channel.send(scrim.text_confirmation);

                if (scrim.just_unconfirm != true) {
                    await reactionMessage.react(server.config.reaction_correct);
                }

                await reactionMessage.react(server.config.reaction_incorrect);

                scrim.msg_Confirmation = reactionMessage.id;

                configSave(server.config);
            }
            
        });
    }
}

function configSave(config) {

    fs.writeFile("./Config_" + config.ID + ".json", JSON.stringify(config, null, 2), err => {
        if (err) {
            console.log(`Error writing file: ${err}`);
        }
    });

}