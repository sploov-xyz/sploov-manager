import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import config from '../config/config.js';

export const aboutCommand = {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('Shows information about Sploov'),

  execute: async (interaction) => {
    const embed = new EmbedBuilder()
      .setTitle(`About ${config.branding.name}`)
      .setDescription(config.branding.description)
      .addFields(
        { name: 'GitHub', value: config.branding.githubOrg, inline: true },
        { name: 'Discord', value: config.branding.discordInvite, inline: true }
      )
      .setColor(0x0099ff);

    await interaction.reply({ embeds: [embed] });
  }
};