var fs = require("fs");

module.exports = {
    name: "%lockwait",
    description: "Locks waitlist",
    execute(msg, server) {
        server.config.scrims.forEach((scrim) => {
            if (msg.channel.id === scrim.channel_Waitlist) {
                if (msg.member.roles.cache.find(role => role.name === server.config.role_BotAdmin)) {

                    msg.channel.updateOverwrite(msg.guild.roles.cache.find(role => role.name === scrim.role_Waitlist), { VIEW_MESSAGES: true, SEND_MESSAGES: false });

                    scrim.is_open_Registrations = false;
                    scrim.is_open_Waitlist = true;

                    configSave(server.config);

                    msg.channel.send(scrim.text_lock_waitlist);
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