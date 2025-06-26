FROM nginx:latest

COPY nginx.conf /etc/nginx/templates/nginx.conf.template

RUN rm /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD [ "bash", "-c", "envsubst '${SERVER_1} ${SERVER_2} ${SERVER_3} ${SERVER_4} ${SERVER_5}' \
    < /etc/nginx/templates/nginx.conf.template \
    > /etc/nginx/nginx.conf && nginx -g 'daemon off;'" ]
