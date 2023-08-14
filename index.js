const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const noblox = require('noblox.js');

// Connect to the MongoDB database
mongoose.connect('mongodb+srv://maxdugdale87alt:caniver123@cluster0.qbmvkbe.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Check if the connection is successful
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Failed to connect to MongoDB:', err);
});

dotenv.config();

let GuildInfo;

try {
  // Check if the model is already compiled
  if (mongoose.models.GuildInfo) {
    GuildInfo = mongoose.model('GuildInfo');
  } else {
    // Define a schema for your data
    const Schema = mongoose.Schema;
    const mySchema = new Schema({
      guildid: Number,
      guildname: String,
      groupid: Number,
      cookie: String,
    });

    // Create a model based on the schema
    GuildInfo = mongoose.model('GuildInfo', mySchema);
  }
} catch (error) {
  console.error('Error defining GuildInfo model:', error);
}

client.commands = new Collection();

// Set up commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

console.log(commandFiles); // List the command files

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.on('guildCreate', async (guild) => {
  const channel = client.channels.cache.get(guild.systemChannelId.toString());
  const embed = new EmbedBuilder();
  embed.setColor('7f11e0');
  embed.setTitle('Kin Setup Bot');
  embed.setDescription('Thank you for using Kin for your Group Managment.');
  embed.setURL("https://discord.com/api/oauth2/authorize?client_id=1096862990143340586&permissions=8&scope=bot")
  embed.setTimestamp(new Date());
  embed.setFooter('Kin')
  embed.setAuthor('Amelia')
  embed.setFields(
    [
      {
        "name": "Step 1",
        "value": "Create a new Roblox Account to Manage your Group, this is so you do not need to input your own Roblox Cookie."
      },
      {
        "name": "Step 2",
        "value": "Add EditThisCookie to your browser engine, once added navigate to Roblox.com and click the Cookie Icon from the extension, logged in as your new Roblox Account select the .ROBLOSECURITY and copy the value."
      },
      {
        "name": "Step 3",
        "value": "Join your group with your new Roblox Account and then log back into your main account and give the new Roblox Account high permissions to allow it to access the group and manage it. You can now run /setup and follow the instructions."
      },
      {
        "name": "Support",
        "value": "If you need any help, feel free to reach out at amelia.#9866",
        "inline": true
      }
    ]
  )
  if (channel) {
    channel.send({ embeds: [embed] });
  } else {
    let owner = guild.fetchOwner.id
    owner.send({ embeds: [embed] });
    return;
  }
});


client.once('ready', async () => {
  client.user.setPresence({ activities: [{ name: 'trolling' }], status: 'idle' });
  console.log('Ready!');

  const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log('Started refreshing application (/) commands.');

    // Register the application (/) commands
    await rest.put(Routes.applicationCommands(client.user.id), { body: client.commands.map(command => command.data.toJSON()) });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    const guildId = interaction.guild.id;

    if (command.data.name === 'setup') {
      // Execute the setup command directly without checking the guild database
      await command.execute(interaction);
    } else {
      // Check if the guild id is in the database
      const guildInfo = await GuildInfo.findOne({ guildid: guildId }).exec();
      if (guildInfo) {
        const cookie = guildInfo.cookie;
        await noblox.setCookie(cookie);
        await command.execute(interaction);
      } else {
        await interaction.reply({ content: 'Guild not found in the database.', ephemeral: true });
      }
    }
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

client.login(process.env.DISCORD_TOKEN);