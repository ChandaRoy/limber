FROM mhart/alpine-node:6.2.0

WORKDIR /usr/src/service

COPY package.json /usr/src/service
RUN npm install --production

COPY bin /usr/src/service/bin/
COPY authFolder /usr/src/service/authFolder/
COPY bower_components /usr/src/service/bower_components/
COPY config /usr/src/service/config/
COPY githubIntegration /usr/src/service/githubIntegration/
COPY io /usr/src/service/io/
COPY models /usr/src/service/models/
COPY public /usr/src/service/public/
COPY redis /usr/src/service/redis/
COPY chatservice /usr/src/service/chatservice/
COPY routes /usr/src/service/routes/
COPY seed /usr/src/service/seed/
COPY views /usr/src/service/views/
COPY app.js /usr/src/service
COPY passport-init.js /usr/src/service
COPY resfilter.js /usr/src/service
COPY seed.js /usr/src/service


# Use --production flag for production. To enable CORS during development, ensure that the --production flag is removed, and make sure to set the NODE_ENV environment variable to 'dev' in the docker-compose.yml file.
CMD ["npm","start"]
