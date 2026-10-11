Type: A Record
Host: touchpost
Value: 49.12.76.128
TTL: Automatic

ssh root@49.12.76.128

cd /var/www
mkdir -p touchpost
cd touchpost
nano app-ads.txt → google.com, pub-4041382605494077, DIRECT, f08c47fec0942fa0
nano /etc/nginx/sites-available/touchpost.portfolio-projects.space

server {
  server_name touchpost.portfolio-projects.space;

  root /var/www/touchpost;

  location / {
    try_files $uri =404;
  }

  listen 80;
}

ln -s /etc/nginx/sites-available/touchpost.portfolio-projects.space /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
certbot --nginx -d touchpost.portfolio-projects.space
curl https://touchpost.portfolio-projects.space/app-ads.txt && echo