---
title: Roll your own Ngrok alternative
description: "Roll your own Ngrok alternative for free with Nginx and SSH."
hero: true
tags:
  - networking

---

Ngrok allows you to expose your local development port from behind NAT to the
internet. However, it has rate limits and is not free. If you already have a
public server, why not just use SSH to remote port-forward?

It turns out that is a [popular solution][1], but there are some additions we
can add. Let's stop Google from ever indexing us. Secondly, let's add an
optional way to password protect the tunnel.

Our Nginx config:

```nginx
server {
  listen 443 ssl http2;
  server_name tunnel.yourdomain.com;

  ssl_certificate /etc/nginx/ssl/live/tunnel.yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/nginx/ssl/live/tunnel.yourdomain.com/privkey.pem;
  ssl_trusted_certificate /etc/nginx/ssl/live/tunnel.yourdomain.com/fullchain.pem;

  root /var/www/tunnel.yourdomain.com;
  index index.html;

  try_files $uri $uri/index.html $uri.html @app;

  add_header "X-Robots-Tag" "noindex, nofollow, nosnippet, noarchive";

  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header Host $http_host;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "Upgrade";
  proxy_redirect off;

  location @app {
    proxy_intercept_errors on;
    error_page 502 = @protected;

    proxy_pass http://localhost:8001;
  }

  location @protected {
    auth_basic "Restricted Content";
    auth_basic_user_file /etc/nginx/conf.d/htpasswd;

    proxy_pass http://localhost:8002;
  }
}
```

The added header will prevent Google from indexing the tunnel:

```nginx
add_header "X-Robots-Tag" "noindex, nofollow, nosnippet, noarchive";
```

The password protection magic happens by setting a failover for the 503
bad-gateway error to the second location block (which has basic auth on it).

```nginx
proxy_intercept_errors on;
error_page 502 = @protected;
```

You can use the basic-auth protection by proxying to port 8002 instead of 8001.

```bash
# Normal
ssh -R 8001:localhost:5000 yourserver.yourdomain.com

# Protected
ssh -R 8002:localhost:5000 yourserver.yourdomain.com
```

We can wrap this in a shell function to make it easier to run:

```bash
tunup () {
  if [ $1 == "-p" ]; then
    REMOTE_PORT=8002
    PORT=${2:-5000}
  else
    REMOTE_PORT=8001
    PORT=${1:-5000}
  fi

  echo "Forwarding tunnel:$REMOTE_PORT to local port $PORT"
  echo ssh -R $REMOTE_PORT:127.0.0.1:$PORT user@yourserver.yourdomain.com
}
```

Then to use it:

```bash
# Normal
tunup # # tunnel.yourdomain.com -> port 5000
tunup 4000 # tunnel.yourdomain.com -> port 4000

# Protected
tunup -p # tunnel.yourdomain.com -> Port 5000
tunup -p 4000 # tunnel.yourdomain.com -> port 4000
```

## Running Nginx on Docker? You may need to configure SSH & Docker

When running the SSH command, you're binding the port (8001) to the server—the
"host". Nginx is currently set up to proxy traffic to localhost within the
Docker container, not the host. We need to configure everything to talk to the
Docker network IP.

First, tell OpenSSH to allow us to bind to other interfaces when doing port
forwarding.

Open `/etc/ssh/sshd_config` and add/change `GatewayPorts`:

```
GatewayPorts clientspecified
```

> The default option is "no". Other possible options include: "yes" (binds ports
> to 0.0.0.0 - all interfaces) or "clientspecified". Which leaves it up to the
> calling ssh command to choose the bind IP.

Next, grab the IP of the Docker interface:

```bash
ip addr show docker0 | grep -Po 'inet \K[\d.]+'
```

Now update the proxy commands:

```bash
ssh -R 8001:172.17.0.1:5000 yourserver.yourdomain.com
ssh -R 8002:172.17.0.1:5000 yourserver.yourdomain.com
```
(if you're happy with the firewall on the server, you can bind to 0.0.0.0 instead.)

Next, we need to update the Nginx config to point to our Docker IP.

If you're running a newer Docker engine (>20.04), you can add
`--add-host=host.docker.internal:host-gateway` to your Docker run command to get
a hostname to use instead.

```nginx
server {
  ....

  location @app {
    proxy_intercept_errors on;
    error_page 502 = @protected;

    # proxy_pass http://172.17.0.1:8001;
    # or
    proxy_pass http://host.docker.internal:8001;
  }

  ....
}
```

That's everything. We now have our Ngrok alternative that is protected, that we
control and providing you already own a server hasn't cost anything.

If you need a server, then both [Digital Ocean][2] and [Linode][3] have $5/month
offerings. The exact price Ngrok charges, but with the added bonus of being able
to run several other services.

[1]: https://www.reddit.com/r/selfhosted/comments/iyzfse/i_started_a_list_of_ngrok_alternatives_most_of/g6glwzf/
[2]: https://m.do.co/c/7049c1f33a6f
[3]: https://www.linode.com
