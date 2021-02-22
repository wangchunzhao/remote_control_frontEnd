FROM registry.cn-shanghai.aliyuncs.com/greatauk/nginx
# RUN npm install -g cnpm --registry=https://registry.npm.taobao.org \
#   && cnpm install \
#   && npm run build
COPY dist/ /usr/share/nginx/html/
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# 启动 nginx: cd usr/local/nginx/sbin/ & ./nginx

EXPOSE 8080

# CMD ["cd /usr/sbin/", "./nginx", "nginx -t"]
