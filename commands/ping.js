const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with the bot\'s ping'),
  async execute(interaction) {
    const startTimestamp = Date.now();
    const reply = await interaction.reply('Pinging...');
    const endTimestamp = Date.now();
    const latency = endTimestamp - startTimestamp;

    await reply.edit(`Bot latency: ${latency}ms | API latency: ${interaction.client.ws.ping}ms`);
  },
};
