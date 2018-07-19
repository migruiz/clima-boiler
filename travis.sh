#!/bin/bash  
set -ev
HUBNAME=""
if [[ -z "$TRAVIS_TAG" ]]; then
   HUBNAME=migruiz/$PI_APP;
else
	HUBNAME=migruiz/$PI_APP:$TRAVIS_TAG;
fi
docker pull $HUBNAME || true;
docker build  -f Dockerfile_www --cache-from $HUBNAME  -t $HUBNAME  .
echo "$DOCKER_PASSWORD" | docker login -u "coco" --password-stdin
docker push $HUBNAME 