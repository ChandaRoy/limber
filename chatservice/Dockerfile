#FROM quizrtsocial/base-image
FROM mhart/alpine-node:6.2.0
WORKDIR /usr/src/service

RUN mkdir /data/chathistory/ -p

COPY package.json /usr/src/service
RUN npm install --production

COPY chatservice.js /usr/src/service

CMD ["npm","start","--production"]
