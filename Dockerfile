# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY bun.lockb ./

RUN bun install
# If you are building your code for production
# RUN npm ci --omit=dev

COPY . .

RUN bun run build

CMD ["bun", "dist/index.js"]
