# Lightweight Node.js image use karein
FROM node:18-alpine

# Container ke andar working directory set karein
WORKDIR /app

# Sirf package.json pehle copy karein taake dependencies cache ho sakein
COPY package*.json ./

# Packages install karein
RUN npm install

# Baqi saara code copy karein (index.js etc)
COPY . .

# Service ka port expose karein
EXPOSE 8084

# Container start hone par command chalayein
CMD ["node", "index.js"]