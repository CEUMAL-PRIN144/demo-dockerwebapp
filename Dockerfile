# The fix: ship the exact runtime together with the app.
# Everyone (dev laptop, CI, production) runs this same image,
# so everyone gets Node 22 — no more "works on my machine".
FROM node:22-alpine

WORKDIR /app
COPY package.json server.js ./

ENV PORT=3000
EXPOSE 3000

USER node
CMD ["node", "server.js"]
