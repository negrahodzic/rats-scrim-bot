var fs = require("fs");

module.exports = {
    name: "%open",
    description: "Opens channel for registrations",
    execute(msg, server) {
        server.config.scrims.forEach((scrim) => {

            if (msg.channel.id === scrim.channel_Registrations) {
                if (
                    msg.member.roles.cache.find(role => role.name === server.config.role_BotAdmin)
                ) {

                    msg.channel.updateOverwrite(msg.guild.roles.cache.find(role => role.name === scrim.role_Registrations), { VIEW_MESSAGES: true, SEND_MESSAGES: true });

                    scrim.is_open_Registrations = true;
                    scrim.is_open_Waitlist = false;
                    configSave(server.config);

                    msg.channel.send(scrim.text_open_regs);

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