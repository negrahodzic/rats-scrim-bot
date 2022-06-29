module.exports = {
    name: "%slots",
    description: "Updates slot list",
    async execute(msg, server, client) {
        server.config.scrims.forEach((scrim) => {
            if (msg.channel.id === scrim.channel_Confirmations
                || msg.channel.id === scrim.channel_IDPW
                || msg.channel.id === scrim.channel_Registrations
                || msg.channel.id === scrim.channel_Waitlist) {
                let text = scrim.text_slots;
                let i = 1;
                let slot = [];
                for (number = scrim.number_first_slot; number < scrim.max_number_of_teams + scrim.number_first_slot + scrim.number_of_VIP_slots; number++) {
                    slot.push(number < 10 ? "0" + number : "" + number);
                }

                if (scrim.slots.length > 0) {
                    scrim.slots.forEach(team => {
                        text =
                            text +
                            "**" + slot[i - 1] + ".**" +
                            (team.confirm == "y" ? " `[" + team.teamTag.trim() + "]` __**" + team.teamName.trim() + "**__" :
                                (team.confirm == "n" ? "~~`[" + team.teamTag.trim() + "]` " + team.teamName.trim() + "~~" :
                                    " `[" + team.teamTag.trim() + "]` " + team.teamName.trim())
                            ) + " " + team.teamManager.trim() + "\n";
                        i++;
                    });
                }

                try {

                    client.channels.fetch(scrim.channel_IDPW).then(channel => {
                        channel.messages.fetch(scrim.msg_IDPW).then(message => {

                            var currentdate = new Date();
                            var datetime = "_Last updated: **" + currentdate.getDate() + "."
                                + (currentdate.getMonth() + 1) + "."
                                + currentdate.getFullYear() + ".** at **"
                                + ((currentdate.getHours() + 2) < 10 ? "0" + (currentdate.getHours() + 2) : currentdate.getHours() + 2) + ":"
                                + (currentdate.getMinutes() < 10 ? "0" + currentdate.getMinutes() : currentdate.getMinutes()) + " CEST**_";

                            message.edit(text + "\n" + datetime);

                        }).catch(err => {
                            console.error(err);
                        });
                    });

                    client.channels.fetch(scrim.channel_Confirmations).then(channel => {
                        channel.messages.fetch(scrim.msg_Slots).then(message => {
                            var currentdate = new Date();
                            var datetime = "_Last updated: **" + currentdate.getDate() + "."
                                + (currentdate.getMonth() + 1) + "."
                                + currentdate.getFullYear() + ".** at **"
                                + ((currentdate.getHours() + 2) < 10 ? "0" + (currentdate.getHours() + 2) : currentdate.getHours() + 2) + ":"
                                + (currentdate.getMinutes() < 10 ? "0" + currentdate.getMinutes() : currentdate.getMinutes()) + " CEST**_";

                            message.edit(text + "\n" + datetime);
                        }).catch(err => {
                            console.error(err);
                        });
                    });

                    client.channels.fetch(scrim.channel_Waitlist).then(channel => {

                        let waitlistSize = msg.guild.roles.cache.find(r => r.name === scrim.role_Waitlist).members.map(m => m.user.tag).length;

                        channel.messages.fetch(scrim.msg_Waitlist).then(message => {

                            var currentdate = new Date();
                            var datetime = "_Last updated: **" + currentdate.getDate() + "."
                                + (currentdate.getMonth() + 1) + "."
                                + currentdate.getFullYear() + ".** at **"
                                + ((currentdate.getHours() + 2) < 10 ? "0" + (currentdate.getHours() + 2) : currentdate.getHours() + 2) + ":"
                                + (currentdate.getMinutes() < 10 ? "0" + currentdate.getMinutes() : currentdate.getMinutes()) + " CEST**_";

                            message.edit("FREE SLOTS: " + (scrim.max_number_of_teams - scrim.number_of_teams) + "\n\nTeams on waitlist: " + waitlistSize + "\n\n" + datetime);
                        }).catch(err => {
                            console.error(err);
                        });
                    });

                } catch (error) {
                    console.error(error);
                }
            }
        });
    }
};
