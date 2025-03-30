# Run Instant-AI in production without Docker

## Local hosting

Here you can find the scripts and known working process to run Instant-AI outside of a Docker container.

## Prerequisites

- Node.js v18.19 or higher (LTS) - [Install Node.js](https://nodejs.org/)
- Git
- SQLite (Comes pre-installed on macOS and most Linux distributions)

## Running Instant-AI in production

Please make sure that you have setup the proper environment variables for your production environment setup.

For local development the defaults usually work, but in a production environment, you want to secure your application.

You can see all the environment configuration that may be set at [server/.env.example](server/.env.example) for the server and collector.

To setup your production bare metal hosting environment:

1. Clone the repo `git clone https://github.com/wildmaker/Instant-AI.git` or download the latest release from [GitHub Releases](https://github.com/wildmaker/Instant-AI/releases).
2. Run `npm install` in the project root directory
3. Run `npm run build:server` to build the server, collector, and frontend
4. Make sure any `.env` variables are set for your server environment. `cd server && nano .env`
5. Run `node server/index.js` to run the server and `node server/collector/index.js` to run the collector.

Instant-AI is comprised of three main sections. The `frontend`, `server`, and `collector`. When running in production you will be running `server` and `collector` on two different processes, with a built `frontend` being served by the `server` process.

We recommend running `node server/index.js` and `node server/collector/index.js` as a process with a manager so that it can restart on failure, such as using [PM2](https://pm2.keymetrics.io/).
Our suggested PM2 ecosystem config is below.

```javascript
module.exports = {
  apps: [
    {
      name: "instant-ai-server",
      script: "./index.js",
      watch: false,
      cwd: "./server/",
      env: {
        // Put your env variables here
      },
    },
    {
      name: "instant-ai-collector",
      script: "./collector/index.js",
      watch: false,
      cwd: "./server/",
      env: {
        // Put your env variables here
      },
    },
  ],
};
```

Instant-AI should now be running on `http://localhost:3001`!

## Updating Instant-AI

To update Instant-AI with future updates you can `git pull origin master` to pull in the latest code and then repeat steps 2 - 5 to deploy with all changes fully.

For security reasons, we do not recommend using `git pull origin master` in a production environment. Instead, always download the latest release from [GitHub Releases](https://github.com/wildmaker/Instant-AI/releases).

_note_ You should `pkill node` before running an update so that you are not running multiple Instant-AI processes on the same instance as this can cause conflicts.


