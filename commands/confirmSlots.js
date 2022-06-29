var fs = require("fs");

module.exports = {
  name: "%yes",
  description: "Confirm slots",
  async execute(msg, server, client) {
    server.config.scrims.forEach((scrim) => {
      if (msg.channel.id === scrim.channel_Confirmations) {
        if (msg.member.roles.cache.find(role => role.name === server.config.role_BotAdmin)) {

          let slot = parseInt(msg.content.split(" ")[1]);

          scrim.slots[slot - scrim.number_first_slot].confirm = "y";
          msg.react(server.config.reaction_correct);

          configSave(server.config);

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