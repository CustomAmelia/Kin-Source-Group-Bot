const { SlashCommandBuilder } = require('@discordjs/builders');
const noblox = require('noblox.js');
const chalk = require('chalk');
const mongoose = require('mongoose');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('payout')
    .setDescription('Payout a user in a group a certain amount.')
    .addIntegerOption(option =>
      option.setName('user')
        .setDescription('The ID of the user you want to pay.')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('The amount to pay the user.')
        .setRequired(true)),
  async execute(interaction) {
    try {
      const userId = interaction.options.getInteger('user');
      const amount = interaction.options.getInteger('amount');

      // Retrieve group funds using noblox.js
      const groupFunds = await noblox.getGroupFunds(groupId);

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

        // Payout the user in the group
        await noblox.groupPayout(groupId, userId, amount);

        console.log(chalk.green(`Payout of ${amount} to user ${userId} successful.`));
        await interaction.reply({ content: 'Payout successful! New Group Fund Amount: ' + groupFunds, ephemeral: true });
      } else {
        await interaction.reply('Guild not found in the database.');
      }
    } catch (error) {
      console.error(error);
    }
  },
};
