import { SlashCommandBuilder } from 'discord.js';
import config from '../config/config.js';

export const repoCommand = {
  data: new SlashCommandBuilder()
    .setName('repo')
    .setDescription('Provides the GitHub organization link'),

  execute: async (interaction) => {
    await interaction.reply(`Check out our GitHub organization: ${config.branding.githubOrg}`);
  }
};