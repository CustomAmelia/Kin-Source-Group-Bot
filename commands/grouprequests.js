const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const noblox = require('noblox.js');
const chalk = require('chalk');
const mongoose = require('mongoose');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('requests')
    .setDescription('Displays the group requests available.'),
  async execute(interaction) {
    try {
      const requestsPerPage = 3; // Number of requests per page

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

        const response = await noblox.getJoinRequests(groupId, "Asc")
        const joinRequests = response.data || [];
        console.log(joinRequests)

        // Calculate the total number of pages
        const totalPages = Math.ceil(joinRequests.length / requestsPerPage);

        // Function to retrieve posts for a specific page
        function getRequestsForPage(page) {
          const startIndex = (page - 1) * requestsPerPage;
          const endIndex = startIndex + requestsPerPage;
          return joinRequests.slice(startIndex, endIndex);
        }

        let currentPage = 1; // Track the current page

        // Function to generate the embed for the current page
        function generateEmbed() {
          const joinRequested = getRequestsForPage(currentPage);

          const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`Join Requests - Page ${currentPage}/${totalPages}`);

          for (const joinRequest of joinRequested) {
            embed.addFields(
              { name: "Join Request", value: `ID: ${joinRequest.requester.userId}\nUsername: ${joinRequest.requester.username}\nDisplay Name: ${joinRequest.requester.displayName}\nRequested At: ${joinRequest.created}`, inline: true }
            );
          }

          if (joinRequests.length === 0) {
            embed.setTitle('Join Requests');
            embed.setDescription('No join requests available to fetch');
          }

          return embed;
        }

        // Create the initial embed for the first page
        const embed = generateEmbed();

        console.log(chalk.green('Attempted to get requests.'));
        const reply = await interaction.reply({ embeds: [embed], ephemeral: true });

        // Set up the buttons for page navigation

        const previous = new ButtonBuilder()
        previous.setCustomId('prev')
        previous.setLabel('Previous')
        previous.setStyle(ButtonStyle.Primary)
        const next = new ButtonBuilder()
        next.setCustomId('next')
        next.setLabel('Next')
        next.setStyle(ButtonStyle.Primary)

        const row = new ActionRowBuilder()
          .addComponents(previous, next);
          if (joinRequests.length > 3) {
            await reply.edit({ embeds: [embed], components: [row] });
          }

        // Create an event collector to handle button interactions
        const collector = reply.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (button) => {
          if (button.customId === 'prev') {
            if (currentPage > 1) {
              currentPage--;
              const updatedEmbed = generateEmbed();
              await button.update({ embeds: [updatedEmbed] });
            }
          } else if (button.customId === 'next') {
            if (currentPage < totalPages) {
              currentPage++;
              const updatedEmbed = generateEmbed();
              await button.update({ embeds: [updatedEmbed] });
            }
          }
        });

        collector.on('end', () => {
          // Remove the buttons when the collector ends
          row.components.forEach(component => {
            component.setDisabled(true);
          });
          reply.edit({ components: [row] });
        });
      }
    } catch (error) {
      console.error(error);
    }
  },
};
