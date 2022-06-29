var fs = require("fs");

module.exports = {
  name: "%clear",
  description: "Cancels slot or resets all slots",
  execute(msg, server, client) {
    server.config.scrims.forEach((scrim) => {

      if (msg.channel.id === scrim.channel_Confirmations) {
        if (msg.member.roles.cache.find(role => role.name === server.config.role_BotAdmin)) {

          let slot =
            msg.content.split(" ")[1] == "all"
              ? "all"
              : parseInt(msg.content.split(" ")[1]);

          if (slot === "all") {

            client.channels.fetch(scrim.channel_Confirmations).then(channel => {
              channel.messages.fetch(scrim.msg_Slots).then(message => {
                client.channels.fetch(server.config.channel_Logs).then(channel => {
                  channel.send("Saving slots for records:\n\n" + message.content);
                }).catch(err => {
                  console.error(err);
                });
              }).catch(err => {
                console.error(err);
              });
            }).catch(err => {
              console.error(err);
            });

            scrim.slots.forEach((team, index) => {
              if (index < scrim.max_number_of_teams) {
                team.teamTag = "";
                team.teamName = "";
                team.teamManager = "";
                team.confirm = "";
              } else {
                team.teamTag = "VIP";
                team.teamName = "VIP";
                team.teamManager = "";
                team.confirm = "";
              }
            });

            scrim.number_of_teams = 0;

            // remove all IDPW roles
            const roleIDPW = msg.guild.roles.cache.find(
              roleIDPW => roleIDPW.name === scrim.role_IDPW
            );

            let membersIDPW = roleIDPW.members.size;

            roleIDPW.members.forEach(async (member) => {
              await member.roles.remove(roleIDPW);
            });

            client.channels.fetch(server.config.channel_Logs).then(channel => {

              channel.send("Removing **__" + scrim.role_IDPW + "__** from all members, please wait **" + roleIDPW.members.size + "** secs.");

              setTimeout(() => {
                channel.send("Removed **__" + scrim.role_IDPW + "__** from **" + membersIDPW + "** members.");
              }, roleIDPW.members.size * 1000);
            });

            //remove all WAIT roles
            const roleWAIT = msg.guild.roles.cache.find(
              roleWAIT => roleWAIT.name === scrim.role_Waitlist
            );

            let membersWAIT = roleWAIT.members.size;

            roleWAIT.members.forEach(async (member) => {
              await member.roles.remove(roleWAIT);
            });

            client.channels.fetch(server.config.channel_Logs).then(channel => {

              channel.send("Removing **__" + scrim.role_Waitlist + "__** from all members, please wait **" + roleWAIT.members.size + "** secs.");

              setTimeout(() => {
                channel.send("Removed **__" + scrim.role_Waitlist + "__** from **" + membersWAIT + "** members.");
              }, roleWAIT.members.size * 1000);
            });
          } else {
            if (slot >= (scrim.max_number_of_teams + scrim.number_first_slot)) {
              scrim.slots[slot - scrim.number_first_slot].teamTag = "VIP";
              scrim.slots[slot - scrim.number_first_slot].teamName = "VIP";
              scrim.slots[slot - scrim.number_first_slot].teamManager = "";
              scrim.slots[slot - scrim.number_first_slot].confirm = "";
            } else {
              const role = msg.guild.roles.cache.find(
                role => role.name === scrim.role_IDPW
              );
              let members = msg.guild.members.cache.array();

              for (let member of members) {
                if (member.id == scrim.slots[slot - 3].teamManager.replace(/[\\<>@#&!]/g, "")) {
                  member.roles.remove(role);
                }
              }

              scrim.slots[slot - scrim.number_first_slot].teamTag = "";
              scrim.slots[slot - scrim.number_first_slot].teamName = "";
              scrim.slots[slot - scrim.number_first_slot].teamManager = "";
              scrim.slots[slot - scrim.number_first_slot].confirm = "";

              scrim.number_of_teams = scrim.number_of_teams - 1;
            }
          }

          configSave(server.config);

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

          msg.react(server.config.reaction_correct);

          client.commands.get('%slots').execute(msg, server, client);

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