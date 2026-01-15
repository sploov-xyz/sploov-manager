import crypto from 'crypto';
import { EmbedBuilder } from 'discord.js';
import config from '../config/config.js';
import { logger } from '../utils/logger.js';

const eventHandlers = {
  release: handleRelease,
  push: handlePush,
  pull_request: handlePullRequest
};

export async function handleGitHubWebhook(req, res, client) {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) {
    logger.warn('GITHUB', 'GitHub webhook: No signature provided');
    return res.status(401).send('No signature');
  }

  const hmac = crypto.createHmac('sha256', config.github.secret);
  hmac.update(JSON.stringify(req.body));
  const expected = 'sha256=' + hmac.digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    logger.warn('GITHUB', 'GitHub webhook: Invalid signature');
    return res.status(401).send('Invalid signature');
  }

  const event = req.headers['x-github-event'];
  const payload = req.body;
  const repoName = payload.repository.full_name;

  const repoConfig = config.github.repositories[repoName];
  if (!repoConfig || !repoConfig.events.includes(event)) {
    return res.status(200).send('Repo or event not configured');
  }

  const channel = client.channels.cache.get(repoConfig.channelId);
  if (!channel) {
    logger.error('GITHUB', `Channel not found for repo ${repoName}`);
    return res.status(500).send('Channel not found');
  }

  try {
    const handler = eventHandlers[event];
    if (handler) {
      await handler(payload, channel, repoName);
    }
  } catch (error) {
    logger.error('GITHUB', `Error handling GitHub webhook: ${error.message}`);
    return res.status(500).send('Internal error');
  }

  res.status(200).send('OK');
}

async function handleRelease(payload, channel, repoName) {
  const release = payload.release;
  let color = 0x00ff00; // stable
  let type = 'Stable Release';
  if (release.draft) {
    color = 0xffff00;
    type = 'Draft Release';
  } else if (release.prerelease) {
    color = 0xffa500;
    type = 'Prerelease';
  }

  const embed = new EmbedBuilder()
    .setTitle(`${type}: ${release.tag_name}`)
    .setDescription(release.body || 'No description')
    .setURL(release.html_url)
    .setColor(color)
    .setTimestamp()
    .setFooter({ text: config.branding.footer });

  await channel.send({ embeds: [embed] });
}

async function handlePush(payload, channel, repoName) {
  if (payload.ref !== 'refs/heads/main') return;

  const commits = payload.commits;
  let description = '';
  const maxCommits = 3;
  for (let i = 0; i < Math.min(commits.length, maxCommits); i++) {
    description += `• ${commits[i].message.split('\n')[0]}\n`;
  }
  if (commits.length > maxCommits) {
    description += `+${commits.length - maxCommits} more commits`;
  }

  const embed = new EmbedBuilder()
    .setTitle(`Push to ${repoName}`)
    .setDescription(description)
    .setURL(payload.compare)
    .setColor(0x808080)
    .setTimestamp()
    .setFooter({ text: config.branding.footer });

  await channel.send({ embeds: [embed] });
}

async function handlePullRequest(payload, channel, repoName) {
  const pr = payload.pull_request;
  const action = payload.action;
  if (!['opened', 'closed'].includes(action)) return;

  let title, color, description;
  if (action === 'opened') {
    title = `PR Opened: #${pr.number}`;
    color = 0x0000ff;
    description = pr.title;
  } else if (action === 'closed') {
    if (pr.merged) {
      title = `PR Merged: #${pr.number}`;
      color = 0x00ff00;
    } else {
      title = `PR Closed: #${pr.number}`;
      color = 0xff0000;
    }
    description = pr.title;
  }

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setURL(pr.html_url)
    .addFields({ name: 'Author', value: pr.user.login, inline: true })
    .setColor(color)
    .setTimestamp()
    .setFooter({ text: config.branding.footer });

  await channel.send({ embeds: [embed] });
}