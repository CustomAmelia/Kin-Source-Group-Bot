const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const noblox = require('noblox.js');
const mongoose = require('mongoose');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('request')
    .setDescription('Get details about a join request that is pending')
    .addStringOption(option =>
        option.setName('id')
          .setDescription('The id of the user you want to view the join request of')
          .setRequired(true)),
  async execute(interaction) {
    try {
    const id = interaction.options.getString('id');
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
        const joinRequest = await noblox.getJoinRequest(groupId, id)

        console.log(joinRequest)

        if (joinRequest === null) {
            const embed1 = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(id + " Join Request")
            .setDescription('No Join Request Available')
          await interaction.reply({ embeds: [embed1], ephemeral: true });
        } else {
        // Create an embed to display the group details
        const embed = new EmbedBuilder()
          .setColor(0x0099FF)
          .setTitle(id + " Join Request")
          embed.addFields(
            { name: "Join Request", value: `ID: ${joinRequest.requester.userId}\nUsername: ${joinRequest.requester.username}\nDisplay Name: ${joinRequest.requester.displayName}\nRequested At: ${joinRequest.created}`, inline: true }
          );

          const reply = await interaction.reply({ embeds: [embed], ephemeral: true });
          
          const accept = new ButtonBuilder()
          accept.setCustomId('acc')
          accept.setLabel('Accept')
          accept.setStyle(ButtonStyle.Success)
          const deny = new ButtonBuilder()
          deny.setCustomId('den')
          deny.setLabel('Deny')
          deny.setStyle(ButtonStyle.Danger)
  
          const row = new ActionRowBuilder()
            .addComponents(accept, deny);
            await reply.edit({ embeds: [embed], components: [row] });
        // Create an event collector to handle button interactions
        const collector = reply.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (button) => {
          if (button.customId === 'den') {
            const censorEmoji = '\ud83d\udc13';
            noblox.handleJoinRequest(groupId, id, false)
            embed.setTitle(`${censorEmoji} Denied Join Request`)
            await reply.edit({ embeds: [embed], ephemeral: true });
          } else if (button.customId === 'acc') {
            const tickEmoji = '\u2705'; // Unicode representation for tick emoji
            noblox.handleJoinRequest(groupId, id, true)
            embed.setTitle(`${tickEmoji} Accepted Join Request`)
            await reply.edit({ embeds: [embed], ephemeral: true });
          }
        });
        collector.on('end', () => {
            // Remove the buttons when the collector ends
            row.components.forEach(component => {
              component.setDisabled(true);
            });
            reply.edit({ components: [row] });
          });
      }} else {
        await interaction.reply('Guild not found in the database.');
      }
    } catch (error) {
      console.error(error);
    }
  },
};
