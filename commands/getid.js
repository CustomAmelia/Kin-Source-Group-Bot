const { SlashCommandBuilder } = require('@discordjs/builders');
const noblox = require('noblox.js');
const mongoose = require('mongoose');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('getid')
    .setDescription('Grabs ID from username for other command uses.')
    .addStringOption(option =>
        option.setName('username')
          .setDescription('The full username of the user you want to lookup the id for.')
          .setRequired(true)),
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
      const username = interaction.options.getString('username');

      // Retrieve ID
      const userid = await noblox.getIdFromUsername(username)

      // Reply
      await interaction.reply({ content: `User ID: ${userid}`, ephemeral: true });
    } else {
      await interaction.reply('Guild not found in the database.');
    }
  },
};
