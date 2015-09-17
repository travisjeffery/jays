FROM ubuntu:precise

RUN apt-get update && apt-get install -y curl
RUN curl --silent --location https://deb.nodesource.com/setup_0.12 | bash -
RUN apt-get install --yes nodejs

COPY . /src
WORKDIR /src

RUN npm install

EXPOSE 3000

CMD ["node", "--harmony", "/src/index.js"]
