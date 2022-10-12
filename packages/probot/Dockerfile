FROM node:18
 
ENV PATH=$PATH:/app/node_modules/.bin
WORKDIR /app
COPY . .
RUN npm install --production && npm run build

ENTRYPOINT ["probot", "receive"]
CMD ["/app/lib/index.js"]
