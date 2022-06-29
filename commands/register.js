//TODO: remove duplicates
var fs = require("fs");

module.exports = {
    name: "%register",
    description: "Registrations",
    execute(msg, server, client) {
        server.config.scrims.forEach((scrim) => {
            if (
                (msg.channel.id === scrim.channel_Registrations &&
                    scrim.is_open_Registrations === true) ||
                (msg.channel.id === scrim.channel_Waitlist && scrim.is_open_Waitlist === true)
            ) {
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

                let alreadyRegistered = false;

                scrim.slots.forEach((team, index) => {
                    if (
                        team.teamName === teamName
                    ) {
                        msg.channel.send("You already registered team: **" + teamName + "**\nYour slot is: **" + (index + 3) + "**");
                        msg.react(server.config.reaction_incorrect);
                        alreadyRegistered = true;
                        return;
                    }

                    if (
                        scrim.allowed_multiple_tags == false && team.teamTag === teamTag
                    ) {
                        msg.react(server.config.reaction_incorrect);
                        msg.channel.send("Team with tag **" + teamTag + "** is already registered!");
                        alreadyRegistered = true;
                        return;
                    }
                });

                if (alreadyRegistered == true) {
                    return;
                }

                if (
                    (scrim.is_open_Registrations === true && scrim.number_of_teams === scrim.max_number_of_teams) ||
                    (scrim.is_open_Waitlist === true &&
                        scrim.number_of_teams < scrim.max_number_of_teams &&
                        msg.channel.id === scrim.channel_Registrations) ||
                    (scrim.is_open_Waitlist === true &&
                        scrim.number_of_teams === scrim.max_number_of_teams &&
                        msg.channel.id === scrim.channel_Waitlist)
                ) {
                    msg.react(server.config.reaction_waitlist);
                    const role = msg.guild.roles.cache.find(
                        role => role.name === scrim.role_Waitlist
                    );

                    let members = msg.guild.members.cache.array();

                    for (let member of members) {
                        if (member.id == msg.mentions.users.first().id) {
                            scrim.is_open_Waitlist = true;
                            configSave(server.config);
                            member.roles.add(role);
                            syncAll(msg, server, client);
                            return;
                        }
                    }

                    return;
                }

                let registered = false;

                scrim.slots.forEach(team => {
                    if (
                        team.teamTag === "" &&
                        team.teamName === "" &&
                        team.teamManager === "" &&
                        registered === false
                    ) {
                        team.teamTag = teamTag;
                        team.teamName = teamName;
                        team.teamManager = teamManager;
                        registered = true;
                    }
                });

                scrim.number_of_teams++;

                if (scrim.number_of_teams == scrim.max_number_of_teams) {
                    msg.channel.send("⬇️ __**WAITLIST**__ ⬇️");
                }

                configSave(server.config);

                const rol = msg.guild.roles.cache.find(
                    role => role.name === scrim.role_IDPW
                );

                for (let member of members) {
                    if (member.id == msg.mentions.users.first().id) {
                        member.roles.add(rol);
                    }
                }

                msg.react(server.config.reaction_correct);

                syncAll(msg, server, client);

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

function syncAll(msg, server, client) {
    server.config.scrims.forEach((scrim) => {
        client.channels.fetch(scrim.channel_Waitlist).then(channel => {
            let waitlistSize = msg.guild.roles.cache.find(r => r.name === scrim.role_Waitlist).members.map(m => m.user.tag).length;

            channel.messages.fetch(scrim.msg_Waitlist).then(message => {
                var currentdate = new Date();
                var datetime = "_Last updated: **" + currentdate.getDate() + "."
                    + (currentdate.getMonth() + 1) + "."
                    + currentdate.getFullYear() + ".** at **"
                    + (currentdate.getHours() < 10 ? "0" + currentdate.getHours() : currentdate.getHours()) + ":"
                    + (currentdate.getMinutes() < 10 ? "0" + currentdate.getMinutes() : currentdate.getMinutes()) + " CEST**_";

                message.edit("FREE SLOTS: " + (scrim.max_number_of_teams - scrim.number_of_teams) + "\n\nTeams on waitlist: " + waitlistSize + "\n\n" + datetime);
            }).catch(err => {
                console.error(err);
            });
        });
    });

    client.commands.get('%slots').execute(msg, server, client);

}