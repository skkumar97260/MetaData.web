FROM node:latest as nodework
WORKDIR /app
COPY package*.json ./

RUN rm -rf node_modules package-lock.json
RUN npm install 
COPY . .
RUN npm run build

FROM nginx
RUN rm -rf /usr/share/nginx/html/index.html



COPY --from=nodework /app/build /usr/share/nginx/html
COPY app.conf /etc/nginx/conf.d/app.conf


CMD ["nginx", "-g", "daemon off;"]

