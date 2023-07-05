const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('debug')
    .setDescription('debug poruposes'),
  async execute(interaction) {
    const channel = interaction.client.channels.cache.get(interaction.guild.systemChannelId.toString());
    function debugEmbed() {
      const embed = new EmbedBuilder();
      embed.setColor('7f11e0');
      embed.setTitle('Kin Setup Bot');
      embed.setDescription('Thank you for using Kin for your Group Managment.');
      embed.setURL("https://discord.com/api/oauth2/authorize?client_id=1096862990143340586&permissions=8&scope=bot");
      embed.setTimestamp(new Date());
      embed.setFooter({ text: "Kin" });
      embed.setAuthor({ name: 'Amelia' });
      embed.setFields([
        {
          "name": "Step 1",
          "value": "Create a new Roblox Account to Manage your Group, this is so you do not need to input your own Roblox Cookie."
        },
        {
          "name": "Step 2",
          "value": "Add EditThisCookie to your browser engine, once added navigate to Roblox.com and click the Cookie Icon from the extension, logged in as your new Roblox Account select the .ROBLOSECURITY and copy the value."
        },
        {
          "name": "Step 3",
          "value": "Join your group with your new Roblox Account and then log back into your main account and give the new Roblox Account high permissions to allow it to access the group and manage it. You can now run /setup and follow the instructions."
        },
        {
          "name": "Support",
          "value": "If you need any help, feel free to reach out at amelia.#9866",
          "inline": true
        }
      ]);
    
      channel.send({ embeds: [embed] });
    }

    debugEmbed()
  },
};
