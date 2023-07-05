const { SlashCommandBuilder } = require('@discordjs/builders');
const noblox = require('noblox.js');
const mongoose = require('mongoose');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deletepost')
    .setDescription('Delete Group Wall Post ID.')
    .addIntegerOption(option =>
        option.setName('post')
          .setDescription('The ID of the post you want to delete.')
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
      const groupId = guildInfo.groupid;
      const post = interaction.options.getInteger('post');

      noblox.deleteWallPost(groupId, post)

      await interaction.reply({ content: `Deleted Wall Post`, ephemeral: true });
    } else {
      await interaction.reply('Guild not found in the database.');
    }
  },
};
