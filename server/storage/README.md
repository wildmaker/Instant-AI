# Instant-AI Storage

This directory is mounted if you are using the docker container and using a volume mount.

## Data
This is a highly important folder for actual data persistance. In here you will find the following:

- All uploaded documents for Workspaces
- A Vector Cache for specific use cases like Supabase vectors.
- The `documents` folder for all original document storage
- and a file named exactly `anythingllm.db`

## Common Issues

### Why is my database empty/data reset?
You most likely do not have proper permissions to read or write to this file.

- Create a `anythingllm.db` empty file in this directory. Thats all. No need to reboot the server or anything. If your permissions are correct this should not ever occur since the server will create the file if it does not exist.

### How to properly ensure docker permissions?
- Get your Instant-AI docker container id with `docker ps -a`. The container must be running to execute the next commands.
- Run `docker container exec -u 0 -t <INSTANT-AI DOCKER CONTAINER ID> mkdir -p /app/server/storage /app/server/storage/documents /app/server/storage/vector-cache /app/server/storage/lancedb`
- Run `docker container exec -u 0 -t <INSTANT-AI DOCKER CONTAINER ID> touch /app/server/storage/anythingllm.db`
- Run `docker container exec -u 0 -t <INSTANT-AI DOCKER CONTAINER ID> chown -R anythingllm:anythingllm /app/collector /app/server`

  - The above commands will create the appropriate folders inside of the docker container and will persist as long as you do not destroy the container and volume. This will also fix any ownership issues of folder files in the collector and the server.