FROM node:alpine
MAINTAINER joeran.tesse@iteratec.de

ENV HTTP_PORT 8080
ENV ALLOWED_PORTS 5601, 8000-10000

ENV HOME /root

EXPOSE ${HTTP_PORT}

WORKDIR $HOME
COPY . $HOME
RUN cd $HOME && npm install
CMD ["npm","start"]
