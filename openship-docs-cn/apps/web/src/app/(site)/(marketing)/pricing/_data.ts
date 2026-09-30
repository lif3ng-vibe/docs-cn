import { UI, paidLadder, type CloudPricing } from "@/lib/pricing";

export interface FaqItem {
  q: string;
  a: string;
}

export function faq(pricing: CloudPricing): FaqItem[] {
  const ladder = paidLadder(pricing);

  return [
    {
      q: "自托管真的免费吗？",
      a: "是的——永久免费。完整平台跑在你自己的服务器上，没有计量、没有席位上限、没有遥测。它以 Apache 2.0 开源，无需购买或注册任何东西：装好 CLI，指向一台机器，就能跑起来。",
    },
    {
      q: "Openship Cloud 要花多少钱？",
      a: [
        pricing.freeTier ? `${pricing.freeTier.name} 套餐分文不收。` : null,
        ladder ? `付费套餐为 ${ladder}，${UI.billedMonthly}。` : null,
        !pricing.available ? "当前 Cloud 套餐与可用情况请查看你的控制台。" : null,
        pricing.customTiers.length > 0
          ? `${pricing.customTiers.map((p) => p.name).join(" 与 ")} 按合同定价——请联系销售。`
          : null,
        "套餐按组织计费。结账时会在支付前显示最终金额。",
      ]
        .filter((s): s is string => s !== null)
        .join(" "),
    },
    {
      q: "以后可以在自托管与云端之间迁移吗？",
      a: "可以，双向都行。容器原样迁移——无需重新构建、无需改写——因为 Openship 上的部署就是一个普通镜像加标准清单。把工作负载从 Cloud 搬到自己的机器，或反向搬回，都不用交“离场税”。",
    },
    {
      q: "采用什么许可？",
      a: "Apache 2.0——宽松许可。使用、修改、fork，或用于商业与闭源产品，均无附加条件。可以跑在你的云里、树莓派上，或作为 SaaS 的生产环境。",
    },
    {
      q: "你们会存储我的源码吗？",
      a: "只保留构建所需的部分。我们从不存储未加密的机密，源码每次构建都从你的仓库重新拉取。自托管则一切都留在你自己的基础设施内。",
    },
  ];
}

/** Where a Cloud plan's CTA goes. The marketing site has no signup route of its
 *  own; `/login` redirects to the app, same as the navbar. */
export const CLOUD_CTA_HREF = "/login";
export const SELF_HOST_CTA_HREF = "/docs/getting-started/quickstart";
