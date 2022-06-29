var fs = require("fs");

module.exports = {
    name: "%reactConfirmation",
    description: "Confirms or cancels based on reactions",
    execute(reaction, user, server, client) {
        server.config.scrims.forEach((scrim) => {

            if (reaction.message.id == scrim.msg_Confirmation) {
                if (reaction.emoji.id == server.config.reaction_correct) {
                    scrim.slots.forEach(team => {
                        if (team.teamManager.replace(/[\\<>@#&!]/g, "") == user.id) {
                            team.confirm = "y";
                            configSave(server.config);
                        }
                    });
                }

                if (reaction.emoji.id == server.config.reaction_incorrect) {
                    scrim.slots.forEach(team => {
                        if (team.teamManager.replace(/[\\<>@#&!]/g, "") == user.id) {
                            team.confirm = "n";
                            configSave(server.config);
                        }
                    });
                }

                client.commands.get('%slots').execute(reaction.message, server, client);
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