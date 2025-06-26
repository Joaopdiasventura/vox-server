FROM nginx:latest

COPY nginx.conf /etc/nginx/templates/nginx.conf

EXPOSE 80

CMD envsubst '${SERVER_1} ${SERVER_2} ${SERVER_3}' < /etc/nginx/templates/nginx.conf > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'