FROM gr4per/node-react-base
MAINTAINER kwierchris

WORKDIR /var/tmp/base
COPY package.json .

# Make sure node can load modules from /var/tmp/base/node_modules
# Setting NODE_ENV is necessary for "npm install" below.
RUN apk add --no-cache curl
ENV NODE_ENV=development NODE_PATH=/var/tmp/base/node_modules PATH=${PATH}:${NODE_PATH}/.bin
RUN npm set progress=false ; npm install ; npm cache clean

WORKDIR /home/node/redis-events

# Bundle app source by overwriting all WORKDIR content.
COPY . .

# Set the user name or UID to use when running the image and for any RUN, CMD and ENTRYPOINT instructions that follow
USER node

CMD [ "npm", "start" ]
