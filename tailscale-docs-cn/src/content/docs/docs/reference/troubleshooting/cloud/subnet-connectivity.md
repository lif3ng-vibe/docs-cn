---
title: "Troubleshoot subnet connectivity in the cloud"
description: "The most common issue in Amazon Web Services, Microsoft Azure, and Google Cloud Platform that we've seen is a security group being too restrictive, and blocking connections. For troubleshooting purpos"
---

Last validated Mar 20, 2026

The most common issue in Amazon Web Services, Microsoft Azure, and Google Cloud Platform that we've seen is a security group being too restrictive, and blocking connections. For troubleshooting purposes, try setting the internal security group to allow all traffic on the subnet, and the security group on the subnet router itself to allow all traffic to test if that unblocks connections.
