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
  try {
    const signature = req.headers['x-hub-signature-256'];
    if (!signature) {
      logger.warn('GITHUB', 'No signature provided');
      return res.status(401).send('No signature');
    }

    // IMPORTANT: use rawBody (Railway + GitHub requirement)
    const hmac = crypto.createHmac('sha256', config.github.secret);
    hmac.update(req.rawBody);
    const expected = `sha256=${hmac.digest('hex')}`;

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expected)
      )
    ) {
      logger.warn('GITHUB', 'Invalid signature');
      return res.status(401).send('Invalid signature');
    }

    const event = req.headers['x-github-event'];
    const payload = req.body;

    if (!payload?.repository?.full_name) {
      logger.warn('GITHUB', 'Invalid payload structure');
      return res.status(400).send('Invalid payload');
    }

    const repoName = payload.repository.full_name;
    const repoConfig = config.github.repositories[repoName];

    if (!repoConfig || !repoConfig.events.includes(event)) {
      return res.status(200).send('Repo or event not configured');
    }

    if (!client.isReady()) {
      logger.warn('GITHUB', 'Discord client not ready');
      return res.status(200).send('Client not ready');
    }

    // ✅ FIX: fetch channel instead of cache
    const channel = await client.channels.fetch(repoConfig.channelId);
    if (!channel) {
      logger.error('GITHUB', `Channel not found for repo ${repoName}`);
      return res.status(500).send('Channel not found');
    }

    const handler = eventHandlers[event];
    if (handler) {
      await handler(payload, channel, repoName);
    }

    return res.status(200).send('OK');
  } catch (error) {
    logger.error('GITHUB', `Webhook error: ${error.stack || error.message}`);
    return res.status(500).send('Internal error');
  }
}

async function handleRelease(payload, channel, repoName) {
  const release = payload.release;
  if (!release) return;

  let color = 0x00ff00;
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

  const commits = payload.commits || [];
  const maxCommits = 3;

  let description = commits
    .slice(0, maxCommits)
    .map(c => `• ${c.message.split('\n')[0]}`)
    .join('\n');

  if (commits.length > maxCommits) {
    description += `\n+${commits.length - maxCommits} more commits`;
  }

  const embed = new EmbedBuilder()
    .setTitle(`Push to ${repoName}`)
    .setDescription(description || 'New commits pushed')
    .setURL(payload.compare)
    .setColor(0x808080)
    .setTimestamp()
    .setFooter({ text: config.branding.footer });

  await channel.send({ embeds: [embed] });
}

async function handlePullRequest(payload, channel, repoName) {
  const pr = payload.pull_request;
  const action = payload.action;

  if (!pr || !['opened', 'closed'].includes(action)) return;

  let title;
  let color;

  if (action === 'opened') {
    title = `PR Opened: #${pr.number}`;
    color = 0x0000ff;
  } else if (pr.merged) {
    title = `PR Merged: #${pr.number}`;
    color = 0x00ff00;
  } else {
    title = `PR Closed: #${pr.number}`;
    color = 0xff0000;
  }

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(pr.title)
    .setURL(pr.html_url)
    .addFields({ name: 'Author', value: pr.user.login, inline: true })
    .setColor(color)
    .setTimestamp()
    .setFooter({ text: config.branding.footer });

  await channel.send({ embeds: [embed] });
}
