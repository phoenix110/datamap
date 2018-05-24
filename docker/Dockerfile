FROM node:8.9.4
ENV TZ Asia/Shanghai
COPY . /tmp/
RUN cd /tmp && \
    yarn config set registry 'https://registry.npm.taobao.org' && \
    npm config set registry 'https://registry.npm.taobao.org' && \
    yarn install && \
    yarn global add cordova && \
    yarn global add cordova-hot-code-push-cli && \
    cordova platform add browser
WORKDIR /tmp