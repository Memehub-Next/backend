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
COPY --from=build /app/dist ./dist
COPY --from=deps /app ./
COPY ./start.backend.sh ./start.backend.sh
EXPOSE 5000