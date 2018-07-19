#!/bin/bash  
HUBNAME=""
if [[ -z "$TRAVIS_TAG" ]]; then
   HUBNAME=migruiz/$PI_APP;
else
	HUBNAME=migruiz/$PI_APP:$TRAVIS_TAG;
fi
docker pull $HUBNAME || true;
docker build  -f Dockerfile_www --cache-from $HUBNAME  -t $HUBNAME  . || travis_terminate 1;
echo "$DOCKER_PASSWORD" | docker login -u "coco" --password-stdin || travis_terminate 1;
docker push $HUBNAME  || travis_terminate 1;