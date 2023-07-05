const { SlashCommandBuilder } = require('@discordjs/builders');
const noblox = require('noblox.js');
const { EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roles')
    .setDescription('Grabs Group Roles.'),
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

      // Retrieve group roles using noblox.js
      const roles = await noblox.getRoles(groupId);

      // Set up the Embed
      const embed = new EmbedBuilder();
      embed.setColor(0x0099FF);
      embed.setTitle('Group Roles');

      // Add a new field for each role
      for (const role of roles) {
        embed.addFields(
          { name: role.name, value: `ID: ${role.id}\nMember Count: ${role.memberCount || 'N/A'}\nRank: ${role.rank}`, inline: true }
        );
      }

      // Reply with the fetched roles
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      await interaction.reply('Guild not found in the database.');
    }
  },
};
