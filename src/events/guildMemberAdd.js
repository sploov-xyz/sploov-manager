import { EmbedBuilder } from 'discord.js';
import config from '../config/config.js';
import { logger } from '../utils/logger.js';

const welcomed = new Set();

export function handleGuildMemberAdd(client) {
  client.on('guildMemberAdd', async (member) => {
    if (welcomed.has(member.id)) return;
    welcomed.add(member.id);

    // Clear old entries periodically (simple in-memory, not persistent)
    if (welcomed.size > 1000) welcomed.clear();

    try {
      const channel = member.guild.channels.cache.get(config.welcome.channelId);
      if (!channel) {
        logger.warn('WELCOME', 'Welcome channel not found');
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`Welcome to ${config.branding.name}, ${member.user.username}!`)
        .setDescription(`${config.branding.description}\n\n**Links:**\n• [GitHub Organization](${config.branding.githubOrg})\n• [Documentation](${config.branding.docs})\n\n**Getting Started:**\n• Ask for help in #help\n• Introduce yourself in #introductions`)
        .setColor(0x00ff00)
        .setTimestamp()
        .setFooter({ text: config.branding.footer });

      await channel.send({ embeds: [embed] });

      if (config.welcome.dmEnabled) {
        try {
          const dmEmbed = new EmbedBuilder()
            .setTitle(`Welcome to ${config.branding.name}!`)
            .setDescription(`Thanks for joining! Check out our [Discord server](${config.branding.discordInvite}).`)
            .setColor(0x00ff00);
          await member.send({ embeds: [dmEmbed] });
        } catch (error) {
          logger.warn('WELCOME', `Could not DM ${member.user.username}: ${error.message}`);
        }
      }

      if (config.welcome.threadEnabled && config.welcome.introductionsChannelId) {
        const introChannel = member.guild.channels.cache.get(config.welcome.introductionsChannelId);
        if (introChannel) {
          try {
            const thread = await introChannel.threads.create({
              name: `Introduce ${member.user.username}`,
              autoArchiveDuration: 1440
            });
            await thread.send(`${member}, feel free to introduce yourself here!`);
          } catch (error) {
            logger.warn('WELCOME', `Could not create thread for ${member.user.username}: ${error.message}`);
          }
        }
      }
    } catch (error) {
      logger.error('WELCOME', `Error in guildMemberAdd: ${error.message}`);
    }
  });
}