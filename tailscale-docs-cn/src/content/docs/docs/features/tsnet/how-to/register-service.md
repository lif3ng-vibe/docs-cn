---
title: "Register a tsnet application as a Tailscale Service"
description: "In this guide you will use the [`tsnet`][docs-tsnet] package to register an application as a [Tailscale Service][docs-tailscale-services] host. This pattern can be applied to other `tsnet` application"
---

Last validated Jan 27, 2026

## Introduction

In this guide you will use the [`tsnet`][docs-tsnet] package to register an application as a [Tailscale Service][docs-tailscale-services] host. This pattern can be applied to other `tsnet` applications.

The example code for this demo is available in the [`tailscale/tailscale` repository][xt-github-tailscale-tsnet-services-example].

## Prerequisites

Before you begin this guide you'll need the following:

* The [Go compiler toolchain][xt-go-download].
* A terminal window (command prompt).
* An active tailnet.
* One or more devices running Tailscale v1.86.0 or later.
* [Owner, Admin, or Network admin](/docs/reference/user-roles) account permissions.

## Step 1: Update your tailnet policy file

Add `tagOwners`, `autoApprovers`, and `grants` to your tailnet policy file.

### Create a tag

Use the Tailscale admin console to create a [Tailscale tag][docs-tags].

1. Open the [Access controls](https://console.tailscale.com/admin/acls) page of the admin console.

2. Select the **Tags** pane.

3. Select **Create tag**.

4. Add the **Tag name**.

   ```json
   tsnet-demo-host
   ```

5. Add the **Tag owner**.

   ```json
   autogroup:member
   ```

6. Select **Save**.

### Define a service

Use the Tailscale admin console to add a Tailscale Service.

1. Open the [Services](https://console.tailscale.com/admin/services) page of the admin console.

2. Select the **Advertised** pane.

3. Select **Define Service**.

4. Add the **Service name**.

   ```json
   tsnet-demo
   ```

5. Add the **Ports**.

   ```json
   443
   ```

6. Select **Define Service**.

For the purposes of this example, the Service definition itself does not restrict which tags may host it, but the host node needs to be tagged.

### Define auto approval

Use the Tailscale admin console to add auto approval.

1. Open the [Access controls](https://console.tailscale.com/admin/acls) page of the admin console.

2. Select the **Auto approvers** pane.

3. Select the **Select service** dropdown and choose the example service.

   ```json
   svc:tsnet-demo
   ```

4. Select the **Service can automatically accept devices** dropdown and choose the example tag.

   ```json
   tag:tsnet-demo-host
   ```

5. Select **Save service auto approver**.

### Define grants

Use the Tailscale admin console to add grants.

1. Open the [Access controls](https://console.tailscale.com/admin/acls) page of the admin console.

2. Select the **General access rule** pane.

3. Select **Add rule**.

4. Add **All users and devices** for **Source**.

5. Add the example service for **Destination**.

   ```json
   svc:tsnet-demo
   ```

6. Add **All ports and protocols** for **Port and protocol**.

7. Select **Save grant**.

### Example tailnet policy file

At this point, your policy file should include the following keys (merge them into your existing file):

```json
"tagOwners": {
  "tag:tsnet-demo-host": ["autogroup:member"],
},
"autoApprovers": {
  "services": {
    "svc:tsnet-demo": ["tag:tsnet-demo-host"],
  },
},
"grants": [
  {
    "src": ["*"],
    "dst": ["svc:tsnet-demo"],
    "ip": ["*"],
  },
],
```

## Step 2: Generate an auth key

Use the Tailscale admin console to [generate an auth key][docs-auth-key-generate-an-auth-key].

1. Open the [Keys](https://console.tailscale.com/admin/settings/keys) page of the admin console.
2. Select **Generate auth key**.
3. Enable **Tags**.
4. Select **Add tags** and choose the example tag.
5. Select **Generate key**.
6. Copy the auth key to your clipboard for use later.
7. Select **Done**.

Open a command terminal and save the auth key as an environment variable.

```shell
export TS_AUTHKEY=<your-authkey>
```

## Step 3: Use the `tsnet` package

1. Open your text editor.
2. Create a `tsnet-services.go` file:

```go
package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"

	"tailscale.com/tsnet"
)

var (
	svcName = flag.String("service", "", "the name of your Service, e.g. svc:tsnet-demo")
)

func main() {
	flag.Parse()
	if *svcName == "" {
		log.Fatal("a Service name must be provided")
	}

	s := &tsnet.Server{
		Hostname: "tsnet-services-demo",
	}
	defer s.Close()

	ln, err := s.ListenService(*svcName, tsnet.ServiceModeHTTP{
		HTTPS: true,
		Port:  443,
	})
	if err != nil {
		log.Fatal(err)
	}
	defer ln.Close()

	log.Printf("Listening on https://%v\n", ln.FQDN)

	err = http.Serve(ln, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "<html><body><h1>Hello, tailnet!</h1>")
	}))
	log.Fatal(err)
}
```

In this example program, you will create a `tsnet.Server` instance with the hostname `tsnet-services-demo`. This server acts as a virtual node in your tailnet. The program instructs the node to listen for HTTPS connections to a Service on port `443`. The listener uses the `tsnet` package's [`ListenService`][docs-tailscale-services-listenservice] and `ServiceModeHTTP`. The program also uses the Go standard library's `net/http` package to run an HTTP server on top of the listener. When other nodes in the tailnet connect to the Service, those connections will be routed to the virtual node defined by this program.

## Step 4: Run the program

1. Run the command:

   ```shell
   go run tsnet-services.go --service=svc:tsnet-demo
   ```

## Step 5: Connect to the application

1. Visit the example server:

   ```
   open https://tsnet-demo.<your-tailnet-DNS-name>
   ```

For more information about tailnet DNS names, refer to [tailnet name][docs-tailnet-name-dns-name].

## Conclusion

This pattern can be applied to other `tsnet` applications as Tailscale Services hosts.

[docs-auth-key-generate-an-auth-key]: /docs/features/access-control/auth-keys#generate-an-auth-key

[docs-tags]: /docs/features/tags

[docs-tailscale-services-listenservice]: /docs/reference/tsnet-server-api#serverlistenservice

[docs-tailscale-services]: /docs/features/tailscale-services

[docs-tailnet-name-dns-name]: /docs/concepts/tailnet-name#tailnet-dns-name

[docs-tsnet]: /docs/features/tsnet

[xt-github-tailscale-tsnet-services-example]: https://github.com/tailscale/tailscale/blob/v1.94.1/tsnet/example/tsnet-services/tsnet-services.go

[xt-go-download]: https://go.dev/dl
