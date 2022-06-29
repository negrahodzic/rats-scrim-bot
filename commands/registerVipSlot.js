var fs = require("fs");

module.exports = {
    name: "%registerVIP",
    description: "Registers VIP slots",
    execute(msg, server, client) {
        server.config.scrims.forEach((scrim) => {
            if (
                msg.channel.id === scrim.channel_Registrations
            ) {

                if (msg.member.roles.cache.find(role => role.name === server.config.role_BotAdmin)) {
                    if (msg.mentions.users.first() == undefined) {
                        msg.react(server.config.reaction_incorrect);
                        return;
                    }

                    let registration = msg.content.split("\n");
                    let teamName = registration[1].includes(":")
                        ? registration[1].substr(registration[1].indexOf(":") + 1).trim()
                        : registration[1];
                    let teamTag = registration[2].includes(":")
                        ? registration[2].substr(registration[2].indexOf(":") + 1).trim()
                        : registration[2];
                    let teamManager = msg.mentions.users.first()
                        ? "<@" + msg.mentions.users.first().id + ">"
                        : "";

                    // reacts with ban hammer if sender of msg has ban role
                    if (msg.member.roles.cache.find(role => role.name === scrim.role_Banned)) {
                        msg.react(server.config.reaction_banned);
                        return;
                    }

                    let members = msg.guild.members.cache.array();
                    let role = msg.guild.roles.cache.find(r => r.name === scrim.role_Banned);

                    for (let member of members) {
                        if (msg.mentions.users.first() != undefined) {
                            if (
                                member.roles.cache.has(role.id) &&
                                member.id == msg.mentions.users.first().id
                            ) {
                                msg.react(server.config.reaction_banned);
                                return;
                            }
                        }
                    }

                    if (
                        registration.length < 4 ||
                        !teamManager ||
                        teamManager === "" ||
                        !teamName ||
                        teamName === "" ||
                        !teamTag ||
                        teamTag === ""
                    ) {
                        msg.react(server.config.reaction_incorrect);
                        return;
                    }

                    let registered = false;

                    for (number = 0; number < scrim.number_of_VIP_slots; number++) {
                        if (scrim.slots[scrim.max_number_of_teams + number].teamTag == "VIP") {
                            scrim.slots[scrim.max_number_of_teams + number].teamTag = teamTag;
                            scrim.slots[scrim.max_number_of_teams + number].teamName = teamName;
                            scrim.slots[scrim.max_number_of_teams + number].teamManager = teamManager;
                            registered = true;
                            msg.react(server.config.reaction_correct);
                            break;
                        }
                    }

                    if (registered == false) {
                        msg.channel.send("All VIP slots are taken.");
                        msg.react(server.config.reaction_incorrect);
                    } else {
                        configSave(server.config);

                        const rol = msg.guild.roles.cache.find(
                            role => role.name === scrim.role_IDPW
                        );

                        for (let member of members) {
                            if (member.id == msg.mentions.users.first().id) {
                                member.roles.add(rol);
                            }
                        }

                        client.commands.get('%slots').execute(msg, server, client);
                    }

                } else {
                    msg.reply("only bot admins can use this command.");
                }
            }
        });
    }
};

function configSave(config) {

    fs.writeFile("./Config_" + config.ID + ".json", JSON.stringify(config, null, 2), err => {
        if (err) {
            console.log(`Error writing file: ${err}`);
        }
    });

}