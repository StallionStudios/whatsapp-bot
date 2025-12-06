FROM node:20-slim

# Install system chromium
RUN apt-get update && apt-get install -y \
    chromium \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libnspr4 \
    libnss3 \
    libxshmfence1 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Stop puppeteer from trying to download chromium itself
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Tell puppeteer where chromium is
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm","start"]
