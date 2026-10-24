---
title: "Access an Amazon RDS database using Tailscale PAM"
description: "[Tailscale PAM][docs-pam] lets users connect to Amazon Relational Database Service (RDS) using their [Tailscale identity][docs-tailscale-identity] instead of sharing database credentials."
---

Last validated Sep 2, 2026

> **Note:** Tailscale PAM is currently in beta.

[Tailscale PAM][docs-pam] lets users connect to Amazon Relational Database Service (RDS) using their [Tailscale identity][docs-tailscale-identity] instead of sharing database credentials.

You can control who has access to the database, apply fine-grained permissions, and keep an audit trail of database sessions. Users can continue using their preferred database clients or connect directly from their browser.

This guide focuses on Amazon RDS for MySQL and PostgreSQL and walks you through creating an RDS PAM service, connecting to it, and reviewing the resulting session activity.

## Prerequisites

Before you begin, make sure you have the following:

* A Tailscale PAM [connector][docs-pam-connectors] that is installed, online, and able to reach the RDS instance.
* Tailscale [installed][docs-install] and signed in on the device you'll use to connect, if you plan to use a native database client.
* An Amazon RDS instance running MySQL or PostgreSQL.
* The endpoint and port for your RDS instance.
* Permission to update your [tailnet policy file][docs-tailnet-policy-file].

The PAM connector must have network access to the RDS instance. For a private RDS instance, you can run the connector on an Elastic Compute Cloud (EC2) instance or another device with access to the Amazon Virtual Private Cloud (VPC). If your RDS instance is publicly accessible, the connector can run outside the VPC as long as the RDS security groups allow the connection.

## Choose an authentication method

Tailscale PAM supports two ways to authenticate to the upstream RDS database:

* **Password authentication**: The connector uses a database username and password.
* **IAM database authentication**: The connector uses an Amazon Web Services (AWS) identity to authenticate to RDS without storing a database password.

### Use password authentication

Password authentication works the same way as it does for a regular MySQL or PostgreSQL PAM service.

You'll need:

* The RDS endpoint.
* The database port. For MySQL, the default port is `3306`. For PostgreSQL, the default port is `5432`.
* A database username.
* The password for that database user.

If you're using password authentication, you can skip to [Create an Amazon RDS PAM service][ar-create-service].

### Use IAM database authentication

Amazon RDS IAM database authentication lets the PAM connector authenticate using an AWS identity instead of a static database password.

If you are using IAM database authentication, take the following action in your AWS environment:

1. Enable **IAM database authentication** for your RDS instance.

2. Create a database user that can authenticate with IAM.

   For RDS for MySQL, connect as a user that can create database users and run:

   ```sql
   CREATE USER 'tailscale_pam' IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS';
   ```

   Then grant the user the database privileges it needs.

   For RDS for PostgreSQL, create the user and grant it the `rds_iam` role:

   ```sql
   CREATE USER tailscale_pam;
   GRANT rds_iam TO tailscale_pam;
   ```

3. Grant the database user any additional database permissions it needs.

   The AWS identity used by the Tailscale PAM connector must also have permission to connect as that database user. For example:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": "rds-db:connect",
         "Resource": "arn:aws:rds-db:<region>:<account-id>:dbuser:<db-resource-id>/tailscale_pam"
       }
     ]
   }
   ```

   Replace `<region>`, `<account-id>`, and `<db-resource-id>` with the values for your RDS instance.

The PAM connector uses AWS credentials available in its environment. If the connector runs on EC2, the simplest option is to use an IAM role attached to the instance. You can also provide AWS credentials using standard AWS configuration or environment variables.

## Create an Amazon RDS PAM service

Now that your RDS instance is ready, create a PAM service for it.

1. Open the [Services](https://console.tailscale.com/admin/services) page of the Tailscale admin console.

2. Select **Add service**.

3. Select **PAM service**.

4. Select either **MySQL - AWS RDS** or **PostgreSQL - AWS RDS**.

5. Select **Continue**.

6. Enter a name for the service.

   Use a name that will make the database suitable for users to recognize when they browse the services they can access.

7. (Optional) Provide a description for the service.

8. Choose whether to enable session recording.

9. Select the Tailscale PAM connector that can reach your RDS instance.

10. Select **Continue**.

11. For **Upstream hostname or IP**, enter the RDS endpoint.

12. For **Port**, enter `3306` for MySQL or `5432` for PostgreSQL.

13. Configure how the PAM connector should connect and authenticate to your RDS instance.

    #### Username and Password

    1. For **Authentication type**, select **Username and Password**.
    2. For **Username**, enter the database username Tailscale PAM should use.
    3. For **Password**, enter password for that database user.
    4. (Optional) For **Server CA certificate**, enter the PEM-encoded certificate authority (CA) certificate used to verify the upstream service's TLS certificate. You must provide a CA certificate to verify the upstream's certificate, or you can leave it blank and skip the verification process.

    #### IAM

    1. For **Authentication type**, select **IAM**.
    2. For **Username**, enter the database username Tailscale PAM should use.
    3. (Optional) For **Server CA certificate**, enter the PEM-encoded certificate authority (CA) certificate used to verify the upstream service's TLS certificate. You must provide a CA certificate to verify the upstream's certificate, or you can leave it blank and skip the verification process.
    4. For **RDS instance region**, select the region for your RDS instance.
    5. For **AWS authentication strategy**, select how the connector authenticates against AWS.

14. Select **Save**.

Your Amazon RDS PAM service has been created. You can access it in the [Services](https://console.tailscale.com/admin/services) page.

## Grant access to the Amazon RDS database

Before users can connect, make sure a Tailscale PAM [grant][docs-grants] gives them access to the service. For example, the following grant permits any source to connect to PAM database services:

```json
"grants": [
  {
    "src": ["*"],
    "dst": ["*"],
    "ip": ["*"],

    "app": {
      "tailscale.com/cap/pam": [
        {
          "version": "v1",

          "permissions": {
            "database": {}
          }
        }
      ]
    }
  }
]
```

> **Warning:**
>
> This is a broad grant that's useful for getting started. In a production environment, you can restrict the `src` and `dst` fields to control which users, groups, devices, or tags can access specific services.

You can also define more advanced database permissions, such as read-only access.

For more PAM grant examples and information about fine-grained access controls, refer to [Control access to Tailscale PAM services][docs-pam-control-access].

For information about editing grants, refer to [Edit access control policies in your tailnet policy file][docs-manage-tailnet-policies].

## Connect to the Amazon RDS database

The primary way to connect is through the Tailscale client, which can launch your preferred database client. You can also connect entirely from your browser using the Tailscale browser client.

### Connect with your preferred Amazon RDS client

Use the Tailscale client to quickly open the database with a compatible database client already installed on your device.

1. Open the Tailscale client.
2. Open **Services**.
3. Select your Amazon RDS service.
4. Choose the database client you want to use.

The Tailscale client scans your device for well-known clients compatible with the database engine and shows the ones it can find. Selecting one establishes the PAM session and launches that client for you.

You aren't limited to the clients shown in the Tailscale client. If your preferred database client isn't listed, open it directly and use the name of the Tailscale PAM service as the hostname.

For an RDS for MySQL service, you can connect with the standard MySQL command-line client:

```shell
mysql -h <service-name> -P 3306 --protocol TCP
```

For an RDS for PostgreSQL service, you can use `psql`:

```shell
psql -h <service-name> -p 5432 -d <database-name>
```

Replace `<service-name>` with the name of your Amazon RDS PAM service and `<database-name>` with the name of your database.

Tailscale PAM uses your Tailscale identity to authorize the connection and manages the upstream RDS connection on your behalf. You don't need to know or manage the upstream database credentials.

### Connect from the browser

Alternatively, you can connect with the web-based database client. The browser client runs a Tailscale client directly in your browser using WebAssembly (Wasm), so there's nothing else to install.

1. Open the [Services](https://console.tailscale.com/admin/services) page of the Tailscale admin console.
2. Select the Amazon RDS service you want to access.
3. Select **Connect** in the upper-right corner, and the Tailscale database browser client opens.
4. If prompted, authenticate with your Tailscale identity.

You can now run queries against your Amazon RDS database directly from your browser.

The browser client appears as a Tailscale device in your tailnet. If [device approval][docs-device-approval] is enabled, an admin must approve the browser device before it can connect.

## Secure the upstream credentials

If your RDS service uses password authentication, the upstream database username and password can be stored as part of the PAM service configuration. Tailscale stores these credentials in encrypted form, but for production environments we recommend keeping upstream credentials local to the connector whenever possible.

You can configure the connector to load credentials dynamically from a supported secret source instead of storing the credentials directly in the service configuration. For example, you can load credentials from an environment variable, AWS Systems Manager Parameter Store, AWS Secrets Manager, a local file, or another supported secrets management system.

For more information, refer to [Manage secrets and credentials][docs-pam-manage-secrets].

If you're using IAM database authentication, you don't need to store a static database password. Tailscale PAM uses the AWS identity available to the connector to authenticate to RDS.

RDS IAM database authentication uses TLS for the connection to the upstream database.

## Review session details and recordings

Tailscale PAM gives you visibility into connections to your Amazon RDS service.

Open the [Sessions](https://console.tailscale.com/admin/logs/pam_sessions) page of the admin console, then select a session for your RDS service. You can review information such as:

* The Tailscale identity that connected.
* The originating device.
* The connection time.
* The service that was accessed.

When session recording is enabled, you can also review the SQL queries for the session.

This gives you a direct answer to two useful questions: who accessed the database, and what did they do while they were there?

## Troubleshooting

If you can't connect to your Amazon RDS service, first confirm that the PAM connector can reach the RDS endpoint and database port.

For a private RDS instance, verify that the connector has network access to the VPC and that the RDS security group permits connections from the connector.

For password authentication, verify that the database username and password in the PAM service configuration are valid.

For IAM database authentication, verify that:

* IAM database authentication is enabled on the RDS instance.
* The database user is configured for IAM authentication.
* The AWS identity used by the connector has the `rds-db:connect` permission for that database user.
* The connector has valid AWS credentials and the correct AWS Region configured.

If none of the troubleshooting steps mentioned above resolve your issue, review the connector logs and the details for the failed session in the PAM [session logs][docs-pam-session-logs]. Failed sessions often include information about why the connection couldn't be established, which can help narrow down whether the problem is network connectivity, AWS IAM permissions, database authentication, or the RDS instance itself.

[ar-create-service]: #create-an-amazon-rds-pam-service

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-grants]: /docs/features/access-control/grants

[docs-install]: /docs/install

[docs-manage-tailnet-policies]: /docs/features/tailnet-policy-file/manage-tailnet-policies

[docs-pam-connectors]: /docs/privileged-access-management/connectors

[docs-pam-control-access]: /docs/privileged-access-management/how-to/control-access

[docs-pam-manage-secrets]: /docs/privileged-access-management/how-to/manage-secrets

[docs-pam-session-logs]: /docs/privileged-access-management/session-logs

[docs-pam]: /docs/privileged-access-management

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-identity]: /docs/concepts/tailscale-identity
