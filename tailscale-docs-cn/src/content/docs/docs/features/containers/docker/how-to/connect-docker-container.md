---
title: "Connect a Docker container to your tailnet with Docker Compose"
description: "Use this guide to run a container that combines the Tailscale client with an [nginx][xt-nginx] web server and reverse proxy, using the [Docker Compose][xt-docker-docs-compose] command line method. The"
---

Last validated Mar 23, 2026

Use this guide to run a container that combines the Tailscale client with an [nginx][xt-nginx] web server and reverse proxy, using the [Docker Compose][xt-docker-docs-compose] command line method. The nginx container shares the Tailscale network connection, allowing you to access it securely over your tailnet.

## Prerequisites

Before you begin, you need:

* Docker Engine installed and running.
* Docker Compose installed and accessible using the `docker compose` command.
* A Tailscale account with permission to generate [auth keys][docs-auth-keys] from the admin console.

Once you have these ready, you can start connecting Docker containers to your tailnet.

## Generate an auth key

You can automatically connect Docker containers to your tailnet by generating an authentication key and adding it to your Docker configuration, eliminating the need to log in manually.

1. Go to the [Keys](https://console.tailscale.com/admin/settings/keys) page of the admin console.
2. In the **Auth keys** section, select **Generate auth key**.
   1. Add a description to identify the key. The description does not affect configuration.
   2. Leave all other options as-is.
   3. Select **Generate key**.
3. Copy the key now. After you close the dialog, you cannot view it again.

For more information about Tailscale authentication keys, refer to [Auth keys][docs-auth-keys].

## Create and run your containers

1. Create a new file named `docker-compose.yml` in your project directory and add your configuration instructions in the file. The following configuration defines two services. One for the Tailscale client and one for the nginx web server.

   ```yaml
   services:
     tailscale:
       image: tailscale/tailscale:latest
       container_name: tailscale
       hostname: tailscale-nginx
       environment:
         - TS_AUTHKEY=<tskey-YOUR-AUTH-KEY>
         - TS_STATE_DIR=/var/lib/tailscale
       volumes:
         - ./tailscale-state:/var/lib/tailscale
       cap_add:
         - net_admin
         - net_raw
       restart: unless-stopped

     nginx:
       image: nginx:latest
       container_name: nginx_server
       ports:
         - "8080:80"
       depends_on:
         - tailscale
       restart: unless-stopped

   ```

   > **Note:**
   >
   > Correct YAML formatting is critical. The file uses indentation (spaces, not tabs) to show structure and hierarchy. Each level of indentation must be consistent, typically using two spaces. Incorrect indentation will cause Docker Compose to fail with parsing errors.

2. Replace `<tskey-YOUR-AUTH-KEY>` with the auth key you generated.

3. Save the file, then start the containers:

   ```shell
   docker compose up -d
   ```

4. Go to the [Machines](https://console.tailscale.com/admin/machines) page of the admin console and verify that `tailscale-nginx` appears.

From a browser on a device connected to your tailnet, go to `http://localhost:8080` on the Docker host. The "Welcome to nginx" page appears.

## Docker Compose example details

Based on the Docker Compose YAML example in this topic, here is a breakdown of the included fields and flags for this setup:

**The Tailscale service components**

* `tailscale`: Runs the Tailscale client in a container.
  * `image: tailscale/tailscale:latest`: Tells Docker to download the official Tailscale image and use the latest version.
  * `container_name: tailscale`: Gives the container a fixed name so it is easier to find and manage with Docker commands.
  * `hostname: tailscale-nginx`: Sets how this container identifies itself on your network and in your tailnet.
  * `environment`: Defines environment variables to use on startup such as [Tailscale configuration parameters][docs-docker-parameters].
    * `TS_AUTHKEY`: Authenticates the container using your Tailscale auth key.
    * `TS_STATE_DIR`: Tells Tailscale where to store its login and connection data.
  * `volumes`: Lets the container save data to your computer instead of losing it on restart.
    * `./tailscale-state:/var/lib/tailscale`: Stores Tailscale data in a local folder so it stays logged in after restarts.
  * `cap_add`: Adds extra system permissions that the container needs to work properly.
    * `net_admin`: Lets the container configure network interfaces, routing tables, and other network settings. This capability is required when using kernel networking with Tailscale.
    * `net_raw`: Lets the container work with network traffic at a deeper level, which is needed for things like Tailscale to create a VPN connection and for tools like `ping` to function properly.
  * `restart: unless-stopped`: Automatically restarts the container unless you manually stop it.

**The nginx service components**

* `nginx`: Runs the nginx web server.
  * `image: nginx:latest`: Tells Docker to download the official nginx image and use the latest version.
  * `container_name: nginx_server`: Gives the container a fixed name so it is easier to find and manage with Docker commands.
  * `ports`: Defines how your computer can access the container.
    * `"8080:80"`: Maps port 8080 on your computer to port 80 in the container so you can open the site at `http://localhost:8080`.
  * `depends_on`: Lists the services that must start before this service.
    * `tailscale`: Ensures the Tailscale service starts before this service.
  * `restart: unless-stopped`: Automatically restarts the container unless you manually stop it.

There are many fields and flags options to include in a Docker Compose file, depending on your specific setup and needs. For more example configurations with Tailscale, refer to [`tailscale-dev/docker-guide-code-examples`][xt-gh-tailscale-docker-examples].

[docs-auth-keys]: /docs/features/access-control/auth-keys

[docs-docker-parameters]: /docs/features/containers/docker/docker-params

[xt-docker-docs-compose]: https://docs.docker.com/compose/

[xt-gh-tailscale-docker-examples]: https://github.com/tailscale-dev/docker-guide-code-examples

[xt-nginx]: https://nginx.org/
