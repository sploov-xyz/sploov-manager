import 'dotenv/config';

export default {
  welcome: {
    channelId: process.env.WELCOME_CHANNEL_ID,
    dmEnabled: process.env.WELCOME_DM_ENABLED === 'true',
    threadEnabled: process.env.WELCOME_THREAD_ENABLED === 'true',
    introductionsChannelId: process.env.INTRODUCTIONS_CHANNEL_ID
  },
  github: {
    secret: process.env.GITHUB_WEBHOOK_SECRET,
    repositories: {
      // 'repo/name': { channelId: 'channelId', events: ['release', 'push', 'pull_request'] }
      'sploov/manager-bot': { channelId: process.env.ANNOUNCEMENT_CHANNEL_ID, events: ['release', 'push', 'pull_request'] }
    }
  },
  branding: {
    name: 'Sploov',
    description: 'An open-source organization dedicated to building innovative software solutions.',
    githubOrg: 'https://github.com/sploov',
    docs: 'https://docs.sploov.org', // Placeholder
    discordInvite: 'https://discord.gg/sploov',
    footer: 'Powered by Sploov'
  }
};