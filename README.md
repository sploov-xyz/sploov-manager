# Sploov Manager Bot

A Discord bot designed to manage and enhance community interactions for the Sploov open-source organization. It provides automated welcome messages for new members and integrates with GitHub to announce releases, pushes, and pull requests.

## Features

- **Welcome System**: Automatically welcomes new members with customizable embeds, optional DMs, and introduction threads.
- **GitHub Integration**: Handles webhooks for releases (draft, prerelease, stable), pushes (with commit limits), and pull requests (opened, merged, closed) across multiple repositories.
- **Slash Commands**: Includes `/ping`, `/about`, and `/repo` for basic interactions.
- **Security**: Verifies GitHub webhook signatures to ensure authenticity.
- **Configurable**: Supports multiple repos with per-repo channel routing and event filtering.

## Requirements

- Node.js >= 18.0.0
- npm
- A Discord bot token
- GitHub webhook secret

## Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/sploov-xyz/sploov-manager.git
   cd sploov-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file and configure it:
   ```bash
   cp .env.example .env
   ```
   Fill in the required values (see Environment Variables section below).

4. Start the bot:
   ```bash
   npm start
   ```

5. Set up GitHub webhooks for your repositories pointing to `http://localhost:PORT/github/webhook` (replace PORT with your configured port).

The bot will register slash commands on startup.

## Railway Deployment

1. Fork or clone this repository to your GitHub account.

2. Create a new Railway project and connect it to your GitHub repository.

3. Set the environment variables in Railway's dashboard (see table below).

4. Deploy the project. Railway will automatically use the `start` script from `package.json`.

5. Update your GitHub webhooks to point to the Railway-provided URL + `/github/webhook` (e.g., `https://your-railway-app.railway.app/github/webhook`).

## Environment Variables

| Variable                  | Required | Description                                      | Default |
|---------------------------|----------|--------------------------------------------------|---------|
| `DISCORD_TOKEN`          | Yes     | Discord bot token                               | -      |
| `CLIENT_ID`              | Yes     | Discord application client ID                   | -      |
| `GUILD_ID`               | Yes     | Discord server (guild) ID                       | -      |
| `WELCOME_CHANNEL_ID`     | Yes     | Channel ID for welcome messages                 | -      |
| `ANNOUNCEMENT_CHANNEL_ID`| Yes     | Default channel for GitHub announcements        | -      |
| `GITHUB_WEBHOOK_SECRET`  | Yes     | Secret for GitHub webhook verification          | -      |
| `INTRODUCTIONS_CHANNEL_ID`| No     | Channel ID for introduction threads             | -      |
| `WELCOME_DM_ENABLED`     | No     | Enable DM welcomes (`true` or `false`)         | `false`|
| `WELCOME_THREAD_ENABLED` | No     | Enable auto-threads in introductions (`true` or `false`) | `false`|
| `PORT`                   | No     | Port for the webhook server                     | `3000` |

## Usage

Once deployed, the bot will:

- Welcome new members in the specified channel.
- Announce GitHub events in configured channels.
- Respond to slash commands.

## Configuration

Repository-specific settings can be modified in `src/config/config.js`. Add or update the `repositories` object to configure channels and events per repo.

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Make your changes and ensure tests pass.
4. Commit and push: `git push origin feature/your-feature`.
5. Open a pull request.

Please follow the existing code style and include tests for new features.

## License

This project is licensed under the MIT License. See the LICENSE file for details.