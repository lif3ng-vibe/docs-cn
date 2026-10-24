---
title: "Host a website using a tailnet device"
description: "This topic provides details about serving a website from a Tailscale device that is only accessible to other users in a Tailscale network (known as a tailnet) using [Tailscale Serve][docs-serve]. Alte"
---

Last validated Jan 5, 2026

This topic provides details about serving a website from a Tailscale device that is only accessible to other users in a Tailscale network (known as a tailnet) using [Tailscale Serve][docs-serve]. Alternatively, you can use the instructions below to host a website that is accessible to the public internet, using [Tailscale Funnel][docs-funnel].

## Prerequisites

* You need a [Tailscale account][docs-install].
* You need to [install Tailscale on your local machine][co-download].

> **Note:**
>
> We recommend serving your files and website using a Linux VM. You can attempt this on macOS. However, due to the sandboxed nature of the operating system, you may encounter errors.

Here are instructions for creating various cloud-based Linux VMs and setting up Tailscale on your VM:

* [Create a Linux VM on Azure][xt-entra-vm]
* [Create a Linux VM on AWS][xt-aws-ec2-get-started]
* [Create a Linux VM on GCP][xt-google-linux-vm-create]

After your Linux VM is created, you must also [install Tailscale on your Linux VM][docs-install-linux].

## Serve your files and website

1. Start by creating a file named `index.html` on your local machine for testing. Here is an example of HTML code that you can use in your file:

   ```html
   <!DOCTYPE html>
   <html>
       <head>
           <title>Test Website</title>
       </head>
       <body>
           <h1>This is a heading</h1>
           <p>This is a paragraph</p>
       </body>
   </html>
   ```

2. Create a `/tmp` directory and a subdirectory on your local machine below the root directory:

   ```shell
   mkdir /tmp
   mkdir /tmp/test-funnel
   ```

3. Move the `index.html` file you created into the `/tmp/test-funnel` subdirectory that you created in the previous step. In this example, the current location of the file is `/home/amelie`:

   ```shell
   mv /home/amelie/index.html /tmp/test-funnel
   ```

4. Run the following command on your machine to serve the `index.html` file to your tailnet:

   ```shell
   tailscale serve /tmp/test-funnel/index.html
   ```

   Or, if you want to make the same files and website visible on the public internet, use the following command:

   ```shell
   tailscale funnel /tmp/test-funnel/index.html
   ```

## Share your website

You can now share the website URL by combining your tailnet machine name and the name of your tailnet. The machine name can be found in the [Machines](https://console.tailscale.com/admin/machines) page of the admin console, and the tailnet DNS name can be found in the [DNS](https://console.tailscale.com/admin/dns) page of the admin console.

If your tailnet machine name is `amelie-vm`, and your tailnet DNS name is `pango-lin.ts.net`, share the URL:

`https://amelie-vm.pango-lin.ts.net`

[co-download]: https://tailscale.com/download

[docs-funnel]: /docs/features/tailscale-funnel

[docs-install-linux]: /docs/install/linux

[docs-install]: /docs/how-to/quickstart

[docs-serve]: /docs/features/tailscale-serve

[xt-aws-ec2-get-started]: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html

[xt-entra-vm]: https://learn.microsoft.com/en-us/azure/virtual-machines/linux/quick-create-portal?tabs=ubuntu

[xt-google-linux-vm-create]: https://cloud.google.com/compute/docs/create-linux-vm-instance
