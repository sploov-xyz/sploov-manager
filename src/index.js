import 'dotenv/config';
import express from 'express';
import { createClient } from './client.js';
import config from './config/config.js';
import { logger } from './utils/logger.js';
import { handleReady } from './events/ready.js';
import { handleGuildMemberAdd } from './events/guildMemberAdd.js';
import { handleInteractionCreate } from './events/interactionCreate.js';
import { handleGitHubWebhook } from './services/githubWebhook.js';

function validateConfig() {
  const required = ['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID', 'WELCOME_CHANNEL_ID', 'ANNOUNCEMENT_CHANNEL_ID', 'GITHUB_WEBHOOK_SECRET'];
  for (const env of required) {
    if (!process.env[env]) {
      logger.error('SYSTEM', `Missing required environment variable: ${env}`);
      process.exit(1);
    }
  }
  logger.info('SYSTEM', 'Configuration validated successfully');
}

validateConfig();

const app = express();
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  })
);

app.post('/github/webhook', (req, res) => handleGitHubWebhook(req, res, client));

const port = process.env.PORT || 3000;
app.listen(port, () => logger.info('SYSTEM', `Webhook server listening on port ${port}`));

const client = createClient();

handleReady(client);
handleGuildMemberAdd(client);
handleInteractionCreate(client);

process.on('unhandledRejection', (reason, promise) => {
  logger.error('SYSTEM', `Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

process.on('uncaughtException', (error) => {
  logger.error('SYSTEM', `Uncaught Exception: ${error.message}`);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  logger.info('SYSTEM', 'Received SIGTERM, shutting down gracefully...');
  if (client) {
    await client.destroy();
  }
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN).catch((error) => {
  logger.error('BOT', `Failed to login: ${error.message}`);
  process.exit(1);
});
