import { SlashCommandBuilder } from 'discord.js';

export const pingCommand = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Shows bot latency and uptime'),

  execute: async (interaction) => {
    const sent = Date.now();
    await interaction.deferReply();
    const latency = Date.now() - sent;
    const uptime = Math.floor(process.uptime());
    await interaction.editReply(`Pong! Latency: ${latency}ms, Uptime: ${uptime}s`);
  }
};