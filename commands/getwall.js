const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const noblox = require('noblox.js');
const chalk = require('chalk');
const mongoose = require('mongoose');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wall')
    .setDescription('Get the wall of a group.'),
  async execute(interaction) {
    try {
      const postsPerPage = 9; // Number of posts per page

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

        const response = await noblox.getWall(groupId);
        const wallPosts = response.data || [];

        // Calculate the total number of pages
        const totalPages = Math.ceil(wallPosts.length / postsPerPage);

        // Function to retrieve posts for a specific page
        function getPostsForPage(page) {
          const startIndex = (page - 1) * postsPerPage;
          const endIndex = startIndex + postsPerPage;
          return wallPosts.slice(startIndex, endIndex);
        }

        let currentPage = 1; // Track the current page

        // Function to generate the embed for the current page
        function generateEmbed() {
          const requestedPosts = getPostsForPage(currentPage);

          const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`Wall Posts - Page ${currentPage}/${totalPages}`);

          for (const wallPost of requestedPosts) {
            embed.addFields(
              { name: "Post", value: `ID: ${wallPost.id}\nBody: ${wallPost.body}\nPoster: ${wallPost.poster.user.username}\nPoster ID: ${wallPost.poster.user.userId}`, inline: true }
            );
          }

          if (wallPosts.length === 0) {
            embed.setTitle('Wall Posts');
            embed.setDescription('No posts available to fetch');
          }

          return embed;
        }

        // Create the initial embed for the first page
        const embed = generateEmbed();

        console.log(chalk.green('Attempted to get wall.'));
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
          if (wallPosts.length > 9) {
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
