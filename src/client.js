import { Client, GatewayIntentBits } from 'discord.js';
import { logger } from './utils/logger.js';

export function createClient() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers
    ]
  });

  client.on('error', (error) => logger.error('BOT', `Client error: ${error.message}`));

  return client;
}