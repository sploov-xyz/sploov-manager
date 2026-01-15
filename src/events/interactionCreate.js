import { pingCommand } from '../commands/ping.js';
import { aboutCommand } from '../commands/about.js';
import { repoCommand } from '../commands/repo.js';
import { logger } from '../utils/logger.js';

export function handleInteractionCreate(client) {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    try {
      switch (commandName) {
        case 'ping':
          await pingCommand.execute(interaction);
          break;
        case 'about':
          await aboutCommand.execute(interaction);
          break;
        case 'repo':
          await repoCommand.execute(interaction);
          break;
        default:
          await interaction.reply({ content: 'Unknown command.', ephemeral: true });
      }
    } catch (error) {
      logger.error('BOT', `Error handling command ${commandName}: ${error.message}`);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error executing this command.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
      }
    }
  });
}