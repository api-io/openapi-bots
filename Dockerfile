FROM node:18-slim
WORKDIR /app
COPY . .
ENV NODE_ENV="production"
RUN npx lerna bootstrap  --force-local
RUN \
  npx lerna run build && \
  :

COPY . .

RUN npx lerna run build
EXPOSE 3000

CMD ["lerna", "run start"]

ARG VCS_REF
ARG BUILD_DATE
LABEL \
	org.opencontainers.image.ref.name=$VCS_REF \
  org.opencontainers.image.created=$BUILD_DATE

 