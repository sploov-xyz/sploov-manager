import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { logger } from '../utils/logger.js';
import { pingCommand } from '../commands/ping.js';
import { aboutCommand } from '../commands/about.js';
import { repoCommand } from '../commands/repo.js';

export function handleReady(client) {
  client.once('ready', async () => {
    logger.info('BOT', `Logged in as ${client.user.tag}`);

    const commands = [
      pingCommand.data,
      aboutCommand.data,
      repoCommand.data
    ];

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
      logger.info('BOT', 'Successfully registered application commands.');
    } catch (error) {
      logger.error('BOT', `Error registering commands: ${error.message}`);
    }
  });
}