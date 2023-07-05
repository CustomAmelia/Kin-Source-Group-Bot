const { SlashCommandBuilder } = require('@discordjs/builders');
const noblox = require('noblox.js');
const chalk = require('chalk');
const mongoose = require('mongoose');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shout')
    .setDescription('Create a shout in the Roblox group')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message content of the shout')
        .setRequired(true)),
  async execute(interaction) {
    try {
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
        const messageContent = interaction.options.getString('message');

        // Send the shout using noblox.js
        await noblox.shout(groupId, messageContent);

        console.log("Successfully sent shout.");
        await interaction.reply({ content: 'Shout sent successfully!', ephemeral: true });
      } else {
        await interaction.reply('Guild not found in the database.');
      }
    } catch (error) {
      console.error(error);
    }
  },
};
