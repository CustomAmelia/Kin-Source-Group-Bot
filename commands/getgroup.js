const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const noblox = require('noblox.js');
const mongoose = require('mongoose');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('details')
    .setDescription('Get details about the Roblox group'),
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

        // Get group information from Roblox using noblox.js
        const groupInfo = await noblox.getGroup(groupId);

        // Extract relevant details from the groupInfo object
        const id = groupInfo.id.toString();
        const owner = groupInfo.owner.username.toString();
        const membercount = groupInfo.memberCount.toString();

        // Create an embed to display the group details
        const embed = new EmbedBuilder()
          .setColor(0x0099FF)
          .setTitle('Group Details')
          .addFields(
            { name: 'Group ID', value: id },
            { name: 'Group Owner', value: owner, inline: false },
            { name: 'Member Count', value: membercount, inline: false }
          );

        if (groupInfo.shout) {
          const groupshout = groupInfo.shout.body.toString();
          const groupshoutposter = groupInfo.shout.poster.username.toString();

          embed.addFields(
            { name: 'Group Shout', value: groupshout, inline: false },
            { name: 'Group Shout Poster', value: groupshoutposter, inline: false }
          );
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
      } else {
        await interaction.reply('Guild not found in the database.');
      }
    } catch (error) {
      console.error(error);
    }
  },
};
