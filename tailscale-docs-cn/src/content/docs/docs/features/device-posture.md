---
title: "Device posture management"
description: "Use device posture for enforcing device rules in your tailnet."
---

Last validated Oct 6, 2026

Device posture management is a feature for managing security requirements for devices that access your network. You can create rules so that devices have conditional access based on a custom set of security standards, called a posture. You configure a posture to include rules relating to specific device attributes, such as its operating system or the Tailscale version it runs.

You can use device posture management to create basic rules, such as denying all access to devices that don't meet your posture requirements, or you can control access with far more granularity. For example, you can require devices to meet stricter security requirements to connect to production. Or you can disallow access to most of your corporate network for devices that don't meet your posture requirements, but still allow them to reach the IT help desk.

Device attributes you use to create rules can include pre-populated host information such as the operating system version, custom attributes that you set through the postures API, or attributes synced from [integrated endpoint detection and response (EDR) and mobile device management (MDM) tools][docs-device-posture-integrations].

> **Note:**
>
> Attribute availability [varies by Tailscale plan][ar-usage-by-plan].

## Benefits

* **Enhanced security**: Reduce risks from compromised or non-compliant devices by verifying the device security state and configuration before granting tailnet access.
* **Context-aware access controls**: Limit access to critical applications and tailnet resources based on the state of a device. You can provide elevated access for high-compliance devices, or completely block access for non-compliant devices.
* **Continuous verification**: Make ongoing assessments of device health and compliance and enable adaptive access controls.

## Use cases

* **Security audits**: Evaluate the configuration and compliance of devices in real-time.
* **Remote work security**: Make sure employees' devices meet security standards before accessing company resources.
* **Bring your own device (BYOD)**: Safely enable BYOD with tiered access to applications and tailnet resources for un-managed and managed devices with device state incorporated.
* **Move toward Zero Trust**: Help your organization achieve Zero Trust with micro-segmentation, least-privileged access, continuous verification, and adaptive policy.

## Usage by plan

Your Tailscale pricing plan determines which device attributes you can use in your device posture configurations. For more information on the different types of device attributes, refer to [Device attributes][docs-device-posture-attributes].

| **Attribute types**                              | **Plan**                      |
| ------------------------------------------------ | ----------------------------- |
| Default                                          | All plans                     |
| Third-party integration attributes (MDM and EDR) | Standard, Premium, Enterprise |
| Geolocation                                      | Standard, Premium, Enterprise |
| Custom                                           | Premium, Enterprise           |

For more information, refer to our [Pricing][co-pricing] page.

## Learn more about device posture management

[**Understand device postures and attributes**](/docs/features/device-posture/postures-and-attributes) — Understand device postures and attributes and how to use them.

[**Postures in access rules**](/docs/features/device-posture/postures-in-access-rules) — Understand how postures work with access rules

[**Monitoring and alerts for device postures**](/docs/features/device-posture/monitoring-postures) — Check the state of device postures and send notifications when postures fail.

[**Integrations for device posture management**](/docs/features/device-posture/integrations) — Review available integrations for device posture management.

[**Get device posture attributes with the API**](https://tailscale.com/api#tag/devices/GET/device/%7BdeviceId%7D/attributes) — Review API commands for device posture attributes

[ar-usage-by-plan]: #usage-by-plan

[co-api-get-device-posture-attrs]: https://tailscale.com/api#tag/devices/GET/device/%7BdeviceId%7D/attributes

[co-pricing]: https://tailscale.com/pricing

[docs-device-posture-attributes]: /docs/features/device-posture/postures-and-attributes#device-posture-attributes

[docs-device-posture-integrations]: /docs/features/device-posture/integrations
