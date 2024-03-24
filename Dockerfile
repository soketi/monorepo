FROM --platform=$BUILDPLATFORM node:20-bullseye as build

COPY . /tmp/build

WORKDIR /tmp/build

RUN corepack enable ; \
    pnpm install --frozen-lockfile ; \
    npx nx run-many --target=lint,test,build --all

FROM --platform=$TARGETPLATFORM node:20-bullseye-slim

COPY --from=build /tmp/build/dist /app/dist/
COPY --from=build /tmp/build/node_modules /app/node_modules/
COPY --from=build /tmp/build/package.json /tmp/build/pnpm-lock.yaml /app/

WORKDIR /app

ENTRYPOINT ["node", "--no-warnings", "--experimental-modules", "--es-module-specifier-resolution=node", "/app/dist/packages/cli/index.js"]

CMD ["ipfs", "start"]

EXPOSE 7001 7001/udp 8001 8001/udp 4001 4001/udp 5001 5001/udp
