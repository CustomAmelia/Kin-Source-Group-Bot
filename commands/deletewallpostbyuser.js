const { SlashCommandBuilder } = require('@discordjs/builders');
const noblox = require('noblox.js');
const mongoose = require('mongoose');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deleteuserposts')
    .setDescription('Delete All Users Group Wall Posts.')
    .addIntegerOption(option =>
        option.setName('user')
          .setDescription('The ID of the user you want to remove posts of.')
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
      const userid = interaction.options.getInteger('user');

      noblox.deleteWallPostsByUser(groupId, userid)

      await interaction.reply({ content: `Deleted Users Posts`, ephemeral: true });
    } else {
      await interaction.reply('Guild not found in the database.');
    }
  },
};
