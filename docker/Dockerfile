FROM node:8.9.4
ENV TZ Asia/Shanghai
RUN yarn global add cordova cordova-hot-code-push-cli
COPY . /tmp/
RUN cd /tmp && \
    npm install && \
    cordova platform rm browser && \
    cordova platform add browser
WORKDIR /tmp