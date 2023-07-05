const { SlashCommandBuilder } = require('@discordjs/builders');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const noblox = require('noblox.js');
const mongoose = require('mongoose');

// Define a schema for your data
const Schema = mongoose.Schema;
const mySchema = new Schema({
  guildid: Number,
  guildname: String,
  groupid: Number,
  cookie: String,
});

// Check if the model has already been compiled
const GuildInfo = mongoose.models.GuildInfo || mongoose.model('GuildInfo', mySchema);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Setup the bot, required for all commands.')
    .addIntegerOption(option =>
      option.setName('groupid')
        .setDescription('The ID of the group you want to control.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('cookie')
        .setDescription('The cookie of the control user.')
        .setRequired(true)),
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const guildInfo = await GuildInfo.findOne({ guildid: guildId }).exec();

    if (guildInfo) {
      // Update existing guild info
      const cookie = interaction.options.getString('cookie');
      const groupid = interaction.options.getInteger('groupid');

      try {
        await noblox.setCookie(cookie);
        console.log('Cookie set successfully');
      } catch (error) {
        console.error('Error setting cookie:', error);
      }

      // Update group ID and cookie in the database
      guildInfo.groupid = groupid;
      guildInfo.cookie = cookie;

      try {
        await guildInfo.save();
        console.log('Details updated successfully');
        interaction.reply('Details updated successfully');
      } catch (err) {
        console.error('Failed to update details:', err);
      }
    } else {
      // Save new guild info
      const guild = interaction.guild;
      const groupid = interaction.options.getInteger('groupid');
      const cookie = interaction.options.getString('cookie');

      const guildAdding = new GuildInfo({
        guildid: guild.id,
        guildname: guild.name,
        groupid: groupid,
        cookie: cookie,
      });

      try {
        await guildAdding.save();
        console.log('Details saved successfully');
        interaction.reply('Details saved successfully');
      } catch (err) {
        console.error('Failed to save details:', err);
      }
    }
  },
};
