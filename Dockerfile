# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node AS  build-stage

USER root
RUN mkdir /app
WORKDIR /app
COPY package*.json /app/

COPY /tmp/build/inputs/ /app/

WORKDIR /app/packages/objectstore-ui

RUN yarn
RUN yarn build

WORKDIR /app/packages/seqdb-ui

RUN yarn
RUN yarn build

# Stage 1, based on Caddy 2.0, to have only the compiled app, ready for production with Caddy
FROM caddy/caddy:2.0.0-rc.3
RUN echo caddy/caddy:2.0.0-rc.3"
USER root

ENV HTML_ROOT=objectstore-ui
ENV EXTERNAL_API_SVC=objectstore-api

COPY --from=build-stage /app/packages/objectstore-ui/out/ /app/packagehtml/objectstore-ui
COPY --from=build-stage /app/packages/seqdb-ui/out/ /app/packagehtml/seqdb-ui

COPY Caddyfile /app/Caddyfile

RUN chgrp -R 0 /app/ && \
    chmod -R g=u /app/

WORKDIR /app

USER 1000250000

EXPOSE 8080

ENTRYPOINT ["caddy","run"]
