FROM resin/raspberrypi3-debian
RUN [ "cross-build-start" ]

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - \
&& apt-get install -yqq --no-install-recommends nodejs   && rm -rf /var/lib/apt/lists/*

RUN apt-get update && \
apt-get install -yqq --no-install-recommends g++ gcc make libudev-dev  && rm -rf /var/lib/apt/lists/*


RUN curl -o openzwave-1.4.164.tar.gz  http://old.openzwave.com/downloads/openzwave-1.4.164.tar.gz \
&& tar -xzf openzwave-1.4.164.tar.gz \
&& cd openzwave-1.4.164/ \
&& make \
&& make install 

ENV LD_LIBRARY_PATH /usr/local/lib


RUN mkdir /App/
COPY App/package.json  /App/package.json

RUN cd /App \
&& npm  install 


COPY App /App



RUN [ "cross-build-end" ]  


ENV TEMPQUEUEURL amqp://pi:pi@192.168.0.96


ENTRYPOINT ["node","/App/app.js"]