const { SlashCommandBuilder } = require('@discordjs/builders');
const noblox = require('noblox.js');
const chalk = require('chalk');
const mongoose = require('mongoose');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setrank')
    .setDescription('Set a rank of user in a group to a certain role id or name.')
    .addIntegerOption(option =>
      option.setName('user')
        .setDescription('The ID of the user you want to pay.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('role')
        .setDescription('Name of the Role.')
        .setRequired(true)),
  async execute(interaction) {
    try {
      const userId = interaction.options.getInteger('user');
      const role = interaction.options.getString('role');

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

        // Set Rank Of the User
        await noblox.setRank(groupId, userId, role)

        console.log(chalk.green(`Set rank of ${userId} to ${role} successfuly.`));
        await interaction.reply({ content: `Set rank of ${userId} to ${role} successfuly.`, ephemeral: true });
      } else {
        await interaction.reply('Guild not found in the database.');
      }
    } catch (error) {
      console.error(error);
    }
  },
};
