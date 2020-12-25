FROM mcr.microsoft.com/playwright:bionic

LABEL maintainer="Naoto Ida"

WORKDIR /home/playwright/app

COPY package.json yarn.lock tsconfig.json ./
COPY src ./src 

RUN yarn install --frozen-lockfile --non-interactive && \
  rm -rf /usr/local/share/.cache && yarn build:ts

EXPOSE 8080

ENV DISPLAY :99
ENV HEADLESS false
CMD Xvfb :99 -screen 0 1280x720x16 & yarn start

