FROM node:16
WORKDIR /app
COPY . .
RUN "npm i"

EXPOSE 80
EXPOSE 443

CMD ["npm", "start"]