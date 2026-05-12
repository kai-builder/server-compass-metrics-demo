FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067

ENTRYPOINT ["/bin/bash", "-l", "-c"]
WORKDIR /app/
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs
ENV PATH="/usr/local/bin:/usr/bin:/bin:$PATH"




ARG CI NIXPACKS_METADATA NODE_ENV NPM_CONFIG_PRODUCTION
ENV CI=$CI NIXPACKS_METADATA=$NIXPACKS_METADATA NODE_ENV=$NODE_ENV NPM_CONFIG_PRODUCTION=$NPM_CONFIG_PRODUCTION

# setup phase
# noop

# install phase
ENV NIXPACKS_PATH=/app/node_modules/.bin:$NIXPACKS_PATH
COPY . /app/.
RUN --mount=type=cache,id=0yYaQpdUnX0-/root/npm,target=/root/.npm npm ci

# build phase
COPY . /app/.
ARG SERVER_COMPASS_NEXT_PUBLIC_ENV_B64
RUN set -e; if [ -n "$SERVER_COMPASS_NEXT_PUBLIC_ENV_B64" ]; then echo "$SERVER_COMPASS_NEXT_PUBLIC_ENV_B64" | base64 -d > .env.production.local; fi
RUN --mount=type=cache,id=0yYaQpdUnX0-next/cache,target=/app/.next/cache --mount=type=cache,id=0yYaQpdUnX0-node_modules/cache,target=/app/node_modules/.cache npm run build


RUN printf '\nPATH=/app/node_modules/.bin:$PATH' >> /root/.profile


# start
COPY . /app

CMD ["npm run start"]