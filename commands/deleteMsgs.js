var fs = require("fs");

module.exports = {
  name: "%del",
  description: "Deletes 100 msgs that are not pinned in channel",
  execute(msg, server) {

    if (msg.member.roles.cache.find(role => role.name === server.config.role_BotAdmin)) {
      deleteAllMsgs(msg);
    } else {
      msg.reply("only bot admins can use this command.");
    }

  }

};

async function deleteAllMsgs(msg) {
  try {
    const fetched = await msg.channel.messages.fetch({ limit: 100 });
    const notPinned = fetched.filter(fetchedMsg => !fetchedMsg.pinned);

    await msg.channel.bulkDelete(notPinned, true);
  } catch (err) {
    console.error(err);
  }
}
