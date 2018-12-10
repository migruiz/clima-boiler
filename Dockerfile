FROM resin/raspberrypi3-debian
RUN [ "cross-build-start" ]

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - \
&& apt-get install -yqq --no-install-recommends nodejs   && rm -rf /var/lib/apt/lists/*

RUN apt-get update && \
apt-get install -yqq --no-install-recommends g++ gcc make && rm -rf /var/lib/apt/lists/*



RUN mkdir /ClimaBoiler/
COPY App/package.json  /ClimaBoiler/package.json

RUN cd /ClimaBoiler \
&& npm  install 


COPY App /ClimaBoiler



RUN [ "cross-build-end" ]  



ENTRYPOINT ["node","/ClimaBoiler/app.js"]