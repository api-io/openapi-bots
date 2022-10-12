FROM node:18-slim
WORKDIR /app
COPY package.json yarn.lock ./
ENV NODE_ENV="production"
RUN npx lerna bootstrap  --force-local
RUN npx lerna run build
COPY . .
EXPOSE 3000
CMD ["lerna", "run start"]

 