# syntax=docker/dockerfile:1

# Single stage with dependencies installed. Source is bind-mounted at runtime
# by compose.yaml so dev/build/preview all see live source and write dist/
# straight to the host - no image rebuild needed while iterating.
FROM node:22-alpine AS base
WORKDIR /app
RUN chown node:node /app
COPY --chown=node:node package.json package-lock.json* ./
USER node
RUN npm install
EXPOSE 4321
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
