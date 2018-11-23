#!/bin/bash

REPOSITRY="cloud.canister.io:5000"
NAME=$(node -p "require('./package.json').name");
VERSION=$(node -p "require('./package.json').version");

# secure canister login
echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin $REPOSITRY

docker build -t "$REPOSITRY/$DOCKER_USERNAME/$NAME:$VERSION" -t "$REPOSITRY/$DOCKER_USERNAME/$NAME:latest" .
docker push "$REPOSITRY/$DOCKER_USERNAME/$NAME:$VERSION"
docker push "$REPOSITRY/$DOCKER_USERNAME/$NAME:latest"

curl -X POST $DOCKER_WEBHOOK