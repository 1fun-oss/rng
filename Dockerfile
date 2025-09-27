FROM node:22-trixie

# Install dieharder
RUN apt-get update && \
    apt-get install -y \
    dieharder

WORKDIR /usr/src/lib

COPY . .

# Install app dependencies
RUN npm ci

CMD ["/bin/bash"]
