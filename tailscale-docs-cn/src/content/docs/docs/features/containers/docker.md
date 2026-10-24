---
title: "Docker"
description: "Installing applications like web servers, databases, or self-hosted services directly on your machine can create challenges. Each service needs specific dependencies that can conflict with other softw"
---

Last validated Mar 23, 2026

Installing applications like web servers, databases, or self-hosted services directly on your machine can create challenges. Each service needs specific dependencies that can conflict with other software, setup requires multiple steps, and removal can be difficult. To access these services remotely, you typically need to expose them to the public internet, which creates security risks. [Docker][xt-docker] containers solve these problems by packaging each application with everything it needs in an isolated environment. You can run multiple services without conflicts, test software without cluttering your system, and remove containers cleanly. When you connect Docker containers to your tailnet, you can securely access these services from anywhere without public exposure.

Common use cases include running self-hosted applications such as Plex, Grafana, and Home Assistant, accessing development databases and tools remotely, connecting microservices across different hosts, and testing applications in isolated environments. Refer to [Tailscale Docker code examples][xt-gh-tailscale-docker-examples] in GitHub, for more ideas and examples of what you can install alongside the Tailscale client in a container.

[**Understanding Docker components**](/docs/features/containers/docker/docker-components) — Docker components overview covering Engine that runs containers, Dockerfiles that define images, images that package apps, containers that run them, and Compose for multi container setups.

[**Connect a Docker container to your tailnet with standalone Docker**](/docs/features/containers/docker/how-to/connect-docker-standalone) — Run the Tailscale Docker image using a single command to create and authenticate a container to your tailnet.

[**Connect a Docker container to your tailnet with Docker Compose**](/docs/features/containers/docker/how-to/connect-docker-container) — Set up a Tailscale-connected container using Docker Compose with nginx, allowing secure access to the service over your tailnet.

[**Connect a Docker container to your tailnet with an alternative Docker manager**](/docs/features/containers/docker/how-to/connect-docker-alt-manager) — Run the Tailscale Docker image with alternative container managers like Podman, Portainer, or Colima using the same configuration.

[**Docker configuration parameters**](/docs/features/containers/docker/docker-params) — Use Docker environment variables to configure how a Tailscale container authenticates, connects to your tailnet, and exposes services.

> **Note:**
>
> The following related video provides additional context and examples.

[Get started with Docker and Tailscale (video)](https://www.youtube.com/watch?v=YTjYXii4WzI)

[xt-docker]: https://www.docker.com/

[xt-gh-tailscale-docker-examples]: https://github.com/tailscale-dev/docker-guide-code-examples
