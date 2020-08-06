#!/usr/bin/env bash
find src/*.ts src/*.js src/*/*.ts test/*.ts package.json tsconfig.json | entr -rc -s "yarn build && yarn run dev"
