FROM node:18.7.0 as build

WORKDIR /app/
RUN npm install -g typescript
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18.7.0 as deps
WORKDIR /app/
COPY package*.json ./
RUN npm i --production

FROM node:18.7.0-slim
WORKDIR /app/
ENV PATH /app/node_modules/.bin:$PATH
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
RUN apt-get update && apt-get install gnupg wget -y && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install google-chrome-stable -y --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y apt-transport-https ca-certificates curl gnupg && \
  curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | apt-key add - && \
  echo "deb https://packages.doppler.com/public/cli/deb/debian any-version main" | tee /etc/apt/sources.list.d/doppler-cli.list && \
  apt-get update && \
  apt-get -y install doppler
COPY --from=build /app/dist ./dist
COPY --from=deps /app ./
EXPOSE 5000