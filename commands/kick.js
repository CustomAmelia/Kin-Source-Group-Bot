const { SlashCommandBuilder } = require('@discordjs/builders');
const noblox = require('noblox.js');
const chalk = require('chalk');
const mongoose = require('mongoose');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('groupkick')
    .setDescription('Kick a user in a group.')
    .addStringOption(option =>
      option.setName('user')
        .setDescription('The ID of the user you want to kick out of the group.')
        .setRequired(true)),
  async execute(interaction) {
    try {
      const userId = interaction.options.getString('user');

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

        // Kick the user from the group using noblox.js
        await noblox.exile(groupId, userId);

        console.log(chalk.green('Attempted to kick.'));
        await interaction.reply({ content: 'Kicked out.', ephemeral: true });
      }
    } catch (error) {
      console.error(error);
    }
  },
};
