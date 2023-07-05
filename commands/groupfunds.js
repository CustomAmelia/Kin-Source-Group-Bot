const { SlashCommandBuilder } = require('@discordjs/builders');
const noblox = require('noblox.js');
const mongoose = require('mongoose');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('funds')
    .setDescription('Grabs Group Funds!'),
  async execute(interaction) {
    // Define a schema for the guild info data
    const Schema = mongoose.Schema;
    const mySchema = new Schema({
      guildid: Number,
      guildname: String,
      groupid: Number,
      cookie: String,
    });

    // Create a model based on the schema
    const GuildInfo = mongoose.models.GuildInfo || mongoose.model('GuildInfo', mySchema);

    const guildId = interaction.guild.id;
    const guildInfo = await GuildInfo.findOne({ guildid: guildId }).exec();

    if (guildInfo) {
      const groupId = guildInfo.groupid;

      // Retrieve group funds using noblox.js
      const groupFunds = await noblox.getGroupFunds(groupId);

      // Reply with the fetched funds
      await interaction.reply({ content: `Fetched Funds: ${groupFunds}`, ephemeral: true });
    } else {
      await interaction.reply('Guild not found in the database.');
    }
  },
};
