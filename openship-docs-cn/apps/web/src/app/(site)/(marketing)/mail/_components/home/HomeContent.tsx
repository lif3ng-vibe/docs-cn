'use client';
import {
  ChevronDown,
  CurvedArrow,
  GitHub,
  Plus,
  Cube,
  MediumStack,
  Clock,
  PanelLeftOpen,
  Check,
  Filter,
  Search,
  User,
  Lightning,
  ExclamationTriangle,
  Bell,
  Tag,
  GroupPeople,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Figma,
  Docx,
  ImageFile,
  Expand,
  Sparkles,
  LockIcon,
  Mail,
  GmailColor,
  OutlookColor,
  Phone,
  Inbox,
  ArrowRight,
} from '../icons';
import { PixelatedBackground, PixelatedLeft, PixelatedRight } from './pixelated-bg';
import { Tabs, TabsContent } from '../ui/tabs';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Balancer } from 'react-wrap-balancer';
import { motion } from 'motion/react';
import MailFooter from './footer';
import React from 'react';

const firstRowQueries: string[] = [
  '来自 Stripe 的账单',
  '来自 Nick 的邮件',
  '本周未读',
];

const secondRowQueries: string[] = [
  '超过 10MB 的附件',
  '提到设计评审的内容',
];

const tabs = [
  { label: '与收件箱对话', value: 'smart-categorization' },
  { label: '智能标签', value: 'ai-features' },
  { label: '写出更好的邮件', value: 'feature-3' },
];

export default function HomeContent() {
  return (
    <main
      data-section="dark"
      className="mail-home relative flex h-full flex-1 flex-col overflow-x-hidden bg-[#0F0F0F] px-2"
    >
      <PixelatedBackground
        className="z-1 absolute left-1/2 top-[-40px] h-auto w-screen min-w-[1920px] -translate-x-1/2 object-cover"
        style={{
          mixBlendMode: 'screen',
          maskImage: 'linear-gradient(to bottom, black, transparent)',
        }}
      />

      <section className="z-10 mt-32 flex flex-col items-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center text-4xl font-medium md:text-6xl"
        >
          <Balancer className="mb-3 max-w-[1130px]">
            <span className="block">你的邮件服务器，</span>
            <span className="block">跑在你自己的硬件上</span>
          </Balancer>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mx-auto mb-4 max-w-2xl text-center text-base font-medium text-[#B7B7B7] md:text-lg"
        >
          域名、邮箱与现代化的网页邮箱，尽在一个面板——没有 SaaS，没有按席位定价，收件箱里
          也没有第三方。
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mx-auto mb-4 max-w-2xl text-center text-sm text-[#B7B7B7]/70 md:text-[15px]"
        >
          经可信中继（Amazon SES 或任意 SMTP）发送，确保邮件送达——每一个字节都留在你的服务器上。
        </motion.p>
        <p className="mb-4 ml-0.5 text-xs text-[#B7B7B7]/60">开源。自托管。属于你。</p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border-input/50 mb-6 inline-flex items-center gap-2 rounded-full border border-[#2A2A2A] bg-[#1E1E1E] px-4 py-1"
        >
          <Link
            href="https://github.com/oblien/openship"
            target="_blank"
            className="flex items-center gap-2 text-sm"
          >
            <GitHub className="size-4 fill-white" />
            <span>100% 开源 · Apache 2.0</span>
          </Link>
        </motion.div>

        {/* Get Started button only visible for mobile screens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-6 lg:hidden"
        >
          <Link href="/docs/getting-started/quickstart">
            <Button>安装 Openship</Button>
          </Link>
        </motion.div>
      </section>

      <section className="relative mt-10 hidden flex-col justify-center md:flex">
        <div className="bg-border absolute left-1/2 top-0 h-px w-full -translate-x-1/2 md:container xl:max-w-7xl" />
        <Tabs
          defaultValue="smart-categorization"
          className="flex w-full flex-col items-center gap-0"
        >
          <div
            className="relative bottom-2 flex w-full justify-center md:border-t"
            style={{ clipPath: 'inset(0 0 0 0)', height: '110%' }}
          >
            <div className="container relative -top-1.5 md:border-x xl:max-w-7xl">
              <PixelatedLeft
                className="absolute left-0 top-0 -z-10 hidden h-full w-auto -translate-x-full opacity-50 md:block"
                style={{ mixBlendMode: 'screen' }}
              />
              <PixelatedRight
                className="absolute right-0 top-0 -z-10 hidden h-full w-auto translate-x-full opacity-50 md:block"
                style={{ mixBlendMode: 'screen' }}
              />
              {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                  <img
                    src="/email-preview.png"
                    alt="Zero 邮件预览"
                    width={1920}
                    height={1080}
                    className="relative hidden md:block"
                    loading="eager"
                  />
                </TabsContent>
              ))}
            </div>
          </div>
        </Tabs>
      </section>

      <div className="flex items-center justify-center px-4 md:hidden">
        <img
          src="/email-preview.png"
          alt="Zero 邮件预览"
          width={1920}
          height={1080}
          className="mt-10 h-fit w-full rounded-xl border"
          loading="eager"
        />
      </div>

      <div className="relative -top-3.5 hidden h-px w-full bg-[#313135] md:block" />

      <div className="relative mt-52">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center"
        >
          <h1 className="text-lg font-light text-white/40 md:text-xl">
            为珍惜时间的高级用户而设计
          </h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-2 flex flex-col items-center justify-center md:mt-8"
        >
          <h1 className="text-center text-4xl font-medium text-white md:text-6xl">
            速度就是一切
          </h1>
          <h1 className="mb-3 text-center text-4xl font-medium text-white/40 md:text-6xl">
            秒级回复
          </h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative bottom-3 mx-12 flex items-center justify-center bg-[#0F0F0F] md:mx-0"
        >
          <div className="bg-panelDark mx-auto mt-10 inline-flex max-w-[600px] flex-col items-center justify-center overflow-hidden rounded-2xl shadow-md">
            <div className="inline-flex h-12 items-center justify-start gap-2 self-stretch border-b-[0.50px] p-4">
              <div className="text-base-gray-500/50 justify-start text-sm leading-none">收件人：</div>
              <div className="flex flex-1 items-center justify-start gap-1">
                <div className="outline-tokens-badge-default/10 flex items-center justify-start gap-1.5 rounded-full border border-[#2B2B2B] py-1 pl-1 pr-1.5">
                  <img
                    height={20}
                    width={20}
                    className="h-5 w-5 rounded-full"
                    src="https://randomuser.me/api/portraits/men/32.jpg"
                    alt="Alex"
                  />
                  <div className="flex items-center justify-start">
                    <div className="flex items-center justify-center gap-2.5 pr-0.5">
                      <div className="text-base-gray-950 justify-start text-sm leading-none">
                        Alex
                      </div>
                    </div>
                  </div>
                </div>
                <div className="outline-tokens-badge-default/10 flex items-center justify-start gap-1.5 rounded-full border border-[#2B2B2B] py-1 pl-1 pr-1.5">
                  <img
                    height={20}
                    width={20}
                    className="h-5 w-5 rounded-full"
                    src="https://randomuser.me/api/portraits/women/44.jpg"
                    alt="Jordan"
                  />{' '}
                  <div className="flex items-center justify-start">
                    <div className="flex items-center justify-center gap-2.5 pr-0.5">
                      <div className="text-base-gray-950 justify-start text-sm leading-none">
                        Jordan
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="inline-flex h-12 items-center justify-start gap-2.5 self-stretch p-4">
              <Clock className="relative h-3.5 w-3.5 overflow-hidden fill-[#9A9A9A]" />
              <div className="inline-flex flex-1 flex-col items-start justify-start gap-3">
                <div className="inline-flex items-center justify-start gap-1 self-stretch">
                  <div className="text-base-gray-950 flex-1 justify-start text-sm font-normal leading-none">
                    Re: 代码评审反馈
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start justify-start gap-12 self-stretch rounded-2xl bg-[#202020] px-4 py-3">
              <div className="flex flex-col items-start justify-start gap-3 self-stretch">
                <div className="justify-start self-stretch text-sm font-normal leading-normal text-white">
                  各位好，
                </div>
                <div className="justify-start self-stretch text-sm font-normal leading-normal text-white">
                  我看了代码评审的反馈。很喜欢键盘导航——一切操作都快多了。搜索实现很干净，
                  不过希望能看到链接，让我亲自试试。
                </div>
                <div className="justify-start self-stretch text-sm font-normal leading-normal text-white">
                  能分享预览时告诉我一声，我再给出更详细的反馈。
                </div>
              </div>
              <div className="inline-flex items-center justify-between self-stretch">
                <div className="flex items-center justify-start gap-3">
                  <div className="flex items-center justify-start rounded-md bg-white text-black">
                    <div className="flex h-7 items-center justify-center gap-1.5 overflow-hidden rounded-bl-md rounded-tl-md bg-white pl-1.5 pr-1">
                      <div className="flex items-center justify-center gap-2.5 pl-0.5">
                        <div className="justify-start text-center text-sm leading-none text-black">
                          <span className="hidden md:inline">立即</span>发送
                        </div>
                      </div>
                      <div className="flex h-5 items-center justify-center gap-2.5 rounded bg-[#E7E7E7] px-1 outline outline-1 -outline-offset-1 outline-[#D2D2D2]">
                        <div className="text-tokens-shortcut-primary-symbol justify-start text-center text-sm font-semibold leading-none">
                          ⏎
                        </div>
                      </div>
                    </div>
                    <div className="bg-base-gray-950 flex items-center justify-start gap-2.5 self-stretch px-2 pr-3">
                      <div className="relative h-3 w-px rounded-full bg-[#D0D0D0]" />
                    </div>
                    <div className="bg-base-gray-950 flex h-7 items-center justify-center gap-1.5 overflow-hidden rounded-br-md rounded-tr-md pr-2">
                      <ChevronDown className="relative h-2 w-2 overflow-hidden fill-black" />
                    </div>
                  </div>
                  <div className="flex h-7 items-center justify-center gap-0.5 overflow-hidden rounded-md bg-[#373737] px-1.5">
                    <Plus className="relative h-2.5 w-2.5 overflow-hidden fill-[#9A9A9A]" />
                    <div className="flex items-center justify-center gap-2.5 px-0.5">
                      <div className="text-base-gray-950 justify-start text-sm leading-none">
                        <span className="hidden md:inline">添加</span>附件
                      </div>
                    </div>
                  </div>
                </div>
                <div className="hidden items-start justify-start gap-3 md:flex">
                  <div className="flex h-7 items-center justify-center gap-0.5 overflow-hidden rounded-md bg-[#373737] px-1.5">
                    <Cube className="relative h-3 w-3 overflow-hidden fill-[#9A9A9A]" />

                    <div className="flex items-center justify-center gap-2.5 px-0.5">
                      <div className="text-base-gray-950 justify-start text-sm leading-none">
                        中性
                      </div>
                    </div>
                  </div>
                  <div className="flex h-7 items-center justify-center gap-0.5 overflow-hidden rounded-md bg-[#373737] px-1.5">
                    <MediumStack className="relative mx-1 h-2.5 w-2.5 overflow-hidden fill-[#9A9A9A]" />

                    <div className="flex items-center justify-center gap-2.5 px-0.5">
                      <div className="text-base-gray-950 justify-start text-sm leading-none">
                        中等长度
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="inline-flex items-start justify-start self-stretch">
              <div className="border-tokens-stroke-light/5 flex h-12 flex-1 items-center justify-center gap-2 border-r-[0.50px]">
                <div className="flex items-center justify-start gap-1">
                  <div className="flex h-5 w-5 items-center justify-center gap-2.5 rounded-[5px] bg-[#2B2B2B] px-1.5">
                    <div className="justify-start text-center text-sm font-semibold leading-none text-[#8C8C8C]">
                      ↓
                    </div>
                  </div>
                  <div className="flex h-5 w-5 items-center justify-center gap-2.5 rounded-[5px] bg-[#2B2B2B] px-1.5">
                    <div className="justify-start text-center text-sm font-semibold leading-none text-[#8C8C8C]">
                      ↑
                    </div>
                  </div>
                </div>
                <div className="justify-start text-sm leading-none text-[#8C8C8C]">移动选择</div>
              </div>
              <div className="flex h-12 flex-1 items-center justify-center gap-2">
                <div className="flex h-5 items-center justify-center gap-2.5 rounded-[5px] bg-[#2B2B2B] px-1">
                  <div className="justify-start text-center text-sm font-semibold leading-none text-[#8C8C8C]">
                    ⌘Z
                  </div>
                </div>
                <div className="justify-start text-sm leading-none text-[#8C8C8C]">
                  重新生成
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="relative mt-52 flex items-center justify-center">
        <div className="mx-auto grid w-full! max-w-[1250px] grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl md:h-96">
              <div className="absolute left-0 top-0 aspect-square w-full rounded-2xl border border-[#252525] bg-neutral-800 md:h-96 md:w-96" />
              <div className="outline-tokens-stroke-light/5 bg-panelDark absolute left-1/2 top-[34px] inline-flex h-[771px] w-72 -translate-x-1/2 flex-col items-start justify-start overflow-hidden rounded-lg">
                <div className="inline-flex h-10 items-center justify-start gap-3 self-stretch overflow-hidden border-b-[0.38px] border-[#252525] px-4 py-5">
                  <div className="flex flex-1 items-center justify-start gap-2">
                    <div className="flex flex-1 items-center justify-start gap-1.5">
                      <PanelLeftOpen className="h-3 w-3 fill-[#8C8C8C]" />
                      <div className="ml-1 justify-start text-xs leading-3 text-white">收件箱</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-start gap-1">
                    <Check className="h-2.5 w-2.5 fill-[#8C8C8C]" />
                    <div className="justify-start text-xs leading-3 text-[#8C8C8C]">选择</div>
                  </div>
                  <div className="relative h-2.5 w-[0.76px] rounded-full bg-[#252525]" />
                  <div className="flex items-center justify-start gap-2">
                    <Filter className="relative h-3 w-3 fill-[#8C8C8C]" />
                  </div>
                </div>
                <div className="flex flex-col items-start justify-start gap-3 self-stretch p-4">
                  <div className="inline-flex h-7 items-center justify-start gap-1 self-stretch overflow-hidden rounded bg-[#141414] pl-1.5 pr-[3.04px]">
                    <Search className="relative mr-1 h-3 w-3 overflow-hidden rounded-[1.14px] fill-[#8C8C8C]" />
                    <div className="flex-1 justify-start text-xs leading-3 text-[#929292]">
                      搜索
                    </div>
                    <div className="flex h-5 items-center justify-center gap-2 rounded-sm bg-[#262626] px-1">
                      <div className="justify-start text-xs leading-3 text-[#929292]">⌘K</div>
                    </div>
                  </div>
                  <div className="inline-flex items-start justify-start gap-1.5 self-stretch">
                    <div className="flex h-6 w-6 items-center justify-center gap-[3.04px] overflow-hidden rounded bg-[#313131]">
                      <Lightning className="relative h-3 w-3 overflow-hidden fill-[#989898]" />
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center gap-[3.04px] overflow-hidden rounded bg-[#313131]">
                      <ExclamationTriangle className="relative h-3.5 w-3.5 overflow-hidden fill-[#989898]" />
                    </div>
                    <div className="flex h-6 flex-1 items-center justify-center gap-[3.04px] overflow-hidden rounded bg-[#39AE4A] px-2.5">
                      <User className="relative h-3 w-3 overflow-hidden fill-white" />
                      <div className="flex items-center justify-center gap-2 px-[1.52px]">
                        <div className="justify-start text-xs leading-3 text-white">个人</div>
                      </div>
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center gap-[3.04px] overflow-hidden rounded bg-[#313131]">
                      <Bell className="relative h-3 w-3 overflow-hidden fill-[#989898]" />
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center gap-[3.04px] overflow-hidden rounded bg-[#313131]">
                      <Tag className="relative h-3 w-3 overflow-hidden fill-[#989898]" />
                    </div>
                  </div>
                  <div className="relative flex flex-col items-start justify-center gap-2.5 self-stretch overflow-hidden rounded-md bg-[#12341D] px-2 py-2.5">
                    <div className="justify-start self-stretch text-xs leading-3 text-[#A3E1B3]">
                      安全、截止期限与紧急更新
                    </div>
                    <div className="justify-start self-stretch text-xs font-normal leading-none text-[#F4FBF6]">
                      时效性通知、安全警报，<br />
                      以及关键项目更新。
                    </div>
                    <div className="absolute left-[239.80px] top-[6.07px] h-3 w-3 overflow-hidden opacity-50" />
                  </div>
                </div>
                <div className="inline-flex items-center justify-start gap-1 self-stretch px-4 pb-3 pt-5">
                  <div className="flex flex-1 items-center justify-start gap-1">
                    <div className="justify-start text-xs leading-3 text-[#8C8C8C]">置顶</div>
                    <div className="justify-start text-xs leading-3 text-[#8C8C8C]">[3]</div>
                  </div>
                </div>
                <div className="flex flex-col items-start justify-start gap-1.5 self-stretch px-1.5">
                  <div className="inline-flex items-center justify-start gap-2.5 self-stretch rounded-md p-2.5">
                    <img
                      alt="Sam"
                      height={250}
                      width={250}
                      className="h-6 w-6 rounded-full object-cover"
                      src="https://randomuser.me/api/portraits/men/68.jpg"
                    />
                    <div className="inline-flex h-7 flex-1 flex-col items-start justify-start gap-2">
                      <div className="inline-flex items-start justify-start gap-2 self-stretch">
                        <div className="flex flex-1 items-center justify-start gap-2.5">
                          <div className="flex items-center justify-start gap-[3.04px]">
                            <div className="text-base-gray-950 justify-start text-xs leading-3">
                              Sam
                            </div>
                            <div className="justify-start text-center text-xs leading-3 text-[#8C8C8C]">
                              [9]
                            </div>
                          </div>
                        </div>
                        <div className="text-xs font-normal leading-3 text-[#8C8C8C]">3 月 29 日</div>
                      </div>
                      <div className="inline-flex items-center justify-start gap-2 self-stretch">
                        <div className="text-xs font-normal leading-3 text-[#8C8C8C]">
                          新的设计评审
                        </div>
                        <div className="flex items-start justify-start gap-[3.04px]">
                          <div className="relative h-3.5 w-3.5 overflow-hidden" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="inline-flex items-center justify-start gap-2.5 self-stretch rounded-lg p-2.5">
                    <div className="inline-flex h-6 w-6 flex-col items-center justify-center gap-2 overflow-hidden rounded-full bg-[#313131] px-1 py-2">
                      <GroupPeople className="relative h-5 w-5 overflow-hidden fill-[#989898]" />
                    </div>
                    <div className="inline-flex flex-1 flex-col items-start justify-start gap-2">
                      <div className="inline-flex items-start justify-start gap-2 self-stretch">
                        <div className="flex flex-1 items-center justify-start gap-2.5">
                          <div className="flex items-center justify-start gap-1">
                            <div className="text-base-gray-950 justify-start text-xs leading-3">
                              Alex, Ali, Sarah
                            </div>
                            <div className="justify-start text-center text-xs leading-3 text-[#8C8C8C]">
                              [6]
                            </div>
                          </div>
                        </div>
                        <div className="text-xs font-normal leading-3 text-[#8C8C8C]">3 月 28 日</div>
                      </div>
                      <div className="inline-flex items-center justify-start gap-2 self-stretch">
                        <div className="text-xs font-normal leading-3 text-[#8C8C8C]">
                          Re: 设计评审反馈
                        </div>
                        <div className="flex items-start justify-start gap-[3.04px]">
                          <div className="relative h-3.5 w-3.5 overflow-hidden" />
                          <div className="relative h-3.5 w-3.5 overflow-hidden" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 gap-4">
              <h1 className="mb-2 text-xl font-medium leading-loose text-white">
                快如闪电的界面
              </h1>
              <p className="max-w-sm text-sm font-light text-[#979797]">
                以思维的速度处理邮件。仅用键盘就能纵横整个收件箱，
                几分钟内处理数百封邮件。
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl md:h-96">
              <div className="absolute left-0 top-0 aspect-square w-full rounded-2xl bg-[#2B2B2B] md:h-96 md:w-96" />
              <div className="absolute left-[44px] top-0 h-[720px] w-[610px]">
                <div className="absolute left-[31px] top-[29px] inline-flex h-[720px] w-[547px] flex-col items-start justify-start overflow-hidden rounded-lg bg-[#202020] opacity-20">
                  <div className="border-tokens-stroke-light/5 inline-flex h-9 items-center justify-between self-stretch overflow-hidden border-b-[0.35px] py-3 pl-3.5 pr-2">
                    <div className="flex items-center justify-start gap-3">
                      <X className="relative h-3 w-3 overflow-hidden fill-[#8C8C8C]" />
                      <div className="relative h-2 w-[0.71px] rounded-full bg-[#2B2B2B]" />
                      <div className="flex items-center justify-start gap-2">
                        <ChevronLeft className="relative h-3 w-3 overflow-hidden fill-[#8C8C8C]" />
                        <ChevronRight className="relative h-3 w-3 overflow-hidden fill-[#8C8C8C]" />
                      </div>
                    </div>
                    <div className="flex items-center justify-start gap-2">
                      <div className="bg-tokens-button-surface/10 flex h-5 w-5 items-center justify-center gap-[2.83px] overflow-hidden rounded">
                        <div className="relative h-4 w-4 overflow-hidden">
                          <div className="bg-base-warning-500 absolute left-[5.37px] top-[3.90px] h-2.5 w-1.5" />
                        </div>
                      </div>
                      <div className="bg-tokens-stroke-light/5 relative h-2 w-[0.71px] rounded-full" />
                      <div className="bg-tokens-button-surface/10 flex h-5 items-center justify-center gap-[1.42px] overflow-hidden rounded px-1">
                        <div className="relative h-3 w-3" />
                        <div className="flex items-center justify-center gap-2 pl-[0.71px] pr-[1.42px]">
                          <div className="text-base-gray-950 justify-start text-[9.92px] leading-[9.92px]">
                            全部回复
                          </div>
                        </div>
                      </div>
                      <div className="bg-tokens-button-surface/10 flex h-5 w-5 items-center justify-center gap-[2.83px] overflow-hidden rounded">
                        <div className="relative h-3 w-3 overflow-hidden" />
                      </div>
                      <div className="bg-tokens-button-surface/10 flex h-5 w-5 items-center justify-center gap-[2.83px] overflow-hidden rounded">
                        <div className="relative h-3 w-3" />
                      </div>
                      <div className="bg-tokens-button-surface/10 flex h-5 w-5 items-center justify-center gap-[2.83px] overflow-hidden rounded">
                        <div className="relative h-3 w-3 overflow-hidden" />
                      </div>
                      <div className="bg-base-danger-100 outline-base-danger-200 flex h-5 w-5 items-center justify-center gap-[2.83px] overflow-hidden rounded outline outline-[0.35px]">
                        <div className="relative h-3 w-3 overflow-hidden" />
                      </div>
                    </div>
                  </div>
                  <div className="border-tokens-stroke-light/5 flex flex-col items-start justify-start gap-6 self-stretch overflow-hidden border-b-[0.35px] p-3.5">
                    <div className="flex flex-col items-start justify-start gap-4 self-stretch">
                      <div className="flex flex-col items-start justify-start gap-2.5 self-stretch">
                        <div className="inline-flex items-start justify-start gap-[2.83px] self-stretch">
                          <div className="text-base-gray-950 justify-start text-xs leading-3">
                            Re: 设计评审反馈
                          </div>
                          <div className="text-base-gray-500/50 justify-start text-center text-xs leading-3">
                            [6]
                          </div>
                        </div>
                        <div className="inline-flex items-start justify-start gap-1 self-stretch">
                          <Calendar className="relative bottom-px h-2.5 w-2.5 overflow-hidden fill-[#8C8C8C]" />
                          <div className="text-base-gray-500/50 flex-1 justify-start text-[9.92px] font-normal leading-[9.92px]">
                            3 月 25 日 - 3 月 29 日
                          </div>
                        </div>
                      </div>
                      <div className="inline-flex items-center justify-start gap-3">
                        <div className="flex items-center justify-start gap-1 overflow-hidden shadow-[0px_0.7086613774299622px_1.4173227548599243px_0px_rgba(255,255,255,0.00)] shadow-[0px_0px_0px_0.3543306887149811px_rgba(255,255,255,0.00)]">
                          <div className="flex items-center justify-start">
                            <div className="bg-base-success-500 outline-tokens-surface-secondary flex h-5 w-5 items-center justify-center gap-[2.83px] rounded px-2 outline outline-1">
                              <div className="relative h-3 w-3 overflow-hidden" />
                            </div>
                            <div className="bg-base-secondary-500 flex h-5 w-5 items-center justify-center gap-[2.83px] rounded px-2">
                              <div className="relative h-3 w-3 overflow-hidden" />
                            </div>
                          </div>
                          <div className="relative h-3 w-3 overflow-hidden" />
                        </div>
                        <div className="bg-tokens-stroke-light/5 relative h-2 w-[0.71px] rounded-full" />
                        <div className="flex items-center justify-start gap-[2.83px]">
                          <div className="outline-tokens-badge-default/10 flex items-center justify-start gap-1 overflow-hidden rounded-full py-[2.83px] pl-[2.83px] pr-2 outline outline-[0.35px] outline-offset-[-0.35px]">
                            <img
                              className="h-3.5 w-3.5 rounded-full px-[2.66px] py-1"
                              src="https://placehold.co/14x14"
                            />
                            <div className="text-base-gray-950 justify-start text-[9.92px] leading-[9.92px]">
                              Ali
                            </div>
                          </div>
                          <div className="outline-tokens-badge-default/10 flex items-center justify-start gap-1 overflow-hidden rounded-full py-[2.83px] pl-[2.83px] pr-2 outline outline-[0.35px] outline-offset-[-0.35px]">
                            <div className="inline-flex h-3.5 w-3.5 flex-col items-center justify-center gap-2 overflow-hidden rounded-full">
                              <img className="h-4 w-4" src="https://placehold.co/17x17" />
                            </div>
                            <div className="text-base-gray-950 justify-start text-[9.92px] leading-[9.92px]">
                              Nick
                            </div>
                          </div>
                          <div className="outline-tokens-badge-default/10 flex items-center justify-start gap-1 overflow-hidden rounded-full py-[2.83px] pl-[2.83px] pr-2 outline outline-[0.35px] outline-offset-[-0.35px]">
                            <img
                              className="h-3.5 w-3.5 rounded-full"
                              src="https://placehold.co/14x14"
                            />
                            <div className="text-base-gray-950 justify-start text-[9.92px] leading-[9.92px]">
                              Sarah
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-tokens-surface-on-secondary/5 outline-base-secondary-500 flex flex-col items-start justify-start gap-3.5 self-stretch rounded-lg p-3 outline outline-[0.35px] outline-offset-[-0.35px]">
                      <div className="inline-flex items-center justify-start gap-1">
                        <div className="justify-start text-[9.92px] leading-[9.92px] text-[#948CA4]">
                          隐私状态
                        </div>
                      </div>
                      <div className="text-base-gray-950 justify-start self-stretch text-[9.92px] font-normal leading-none">
                        会话保存在你的服务器上。4 个附件、6 位参与者——静态加密存储，
                        绝不被第三方索引或扫描。邮箱、数据与域名都归你所有。
                      </div>
                    </div>
                    <div className="flex flex-col items-start justify-start gap-2.5 self-stretch">
                      <div className="inline-flex items-center justify-start gap-[2.83px]">
                        <div className="text-base-gray-950 justify-start text-[9.92px] leading-[9.92px]">
                          附件
                        </div>
                        <div className="text-base-gray-500/50 justify-start text-center text-[9.92px] leading-[9.92px]">
                          [4]
                        </div>
                      </div>
                      <div className="inline-flex flex-wrap content-start items-start justify-start gap-2 self-stretch">
                        <div className="outline-tokens-stroke-element/0 flex h-5 items-center justify-start gap-1 overflow-hidden rounded bg-[#26232C] px-1.5 py-1 shadow">
                          <div className="relative overflow-hidden">
                            <Figma className="relative h-2 w-2 overflow-hidden" />
                          </div>
                          <div className="flex items-center justify-start gap-[2.83px]">
                            <div className="text-base-gray-950 justify-start text-[9.92px] leading-[9.92px]">
                              cmd.center.fig
                            </div>
                            <div className="justify-start text-[9.92px] leading-[9.92px] opacity-50">
                              21 MB
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-start gap-1 overflow-hidden rounded bg-[#26232C] py-1 pl-1 pr-1.5 shadow">
                          <Docx className="relative h-2 w-2 overflow-hidden fill-blue-500" />
                          <div className="flex items-center justify-start gap-[2.83px]">
                            <div className="text-base-gray-950 justify-start text-[9.92px] leading-[9.92px]">
                              comments.docx
                            </div>
                            <div className="justify-start text-[9.92px] leading-[9.92px] opacity-50">
                              3.7 MB
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-start gap-1 overflow-hidden rounded bg-[#26232C] py-1 pl-1 pr-1.5 shadow">
                          <ImageFile className="relative h-2 w-2 overflow-hidden fill-purple-500" />
                          <div className="flex items-center justify-start gap-[2.83px]">
                            <div className="text-base-gray-950 justify-start text-[9.92px] leading-[9.92px]">
                              img.png
                            </div>
                            <div className="justify-start text-[9.92px] leading-[9.92px] opacity-50">
                              2.3 MB
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-tokens-stroke-light/5 flex-col items-start justify-start gap-6 self-stretch overflow-hidden border-b-[0.35px] p-3.5">
                    <div className="inline-flex items-center justify-start gap-3 self-stretch">
                      <img
                        alt="Taylor"
                        height={200}
                        width={200}
                        className="h-6 w-6 rounded-full"
                        src="https://randomuser.me/api/portraits/women/65.jpg"
                      />
                      <div className="inline-flex flex-1 flex-col items-start justify-start gap-2">
                        <div className="inline-flex items-start justify-start gap-2 self-stretch">
                          <div className="flex flex-1 items-center justify-start gap-2">
                            <div className="flex items-center justify-start gap-[2.83px]">
                              <div className="text-base-gray-950 justify-start text-[9.92px] leading-[9.92px]">
                                Taylor
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="inline-flex items-center justify-start gap-[2.83px] self-stretch opacity-50">
                          <div className="text-base-gray-500/50 justify-start text-[9.92px] font-normal leading-[9.92px]">
                            收件人：
                          </div>
                          <div className="text-base-gray-500/50 justify-start text-[9.92px] font-normal leading-[9.92px]">
                            Alex, Sarah
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="from-tokens-scroll-overlay-primary to-tokens-scroll-overlay-top/0 absolute left-0 top-[668.98px] h-12 w-[547.09px] bg-linear-to-l" />
                  <div className="bg-tokens-agent-surface/10 border-tokens-agent-stroke absolute left-[498.90px] top-[674.65px] h-8 w-8 rounded-full border-2 px-1 shadow-[0px_8.503936767578125px_17.00787353515625px_0px_rgba(0,0,0,0.15)] backdrop-blur-lg" />
                </div>
                <div className="absolute left-0 top-[121px] inline-flex w-[650px] flex-col items-start justify-start gap-4 overflow-hidden rounded-3xl border border-[#8B5CF6] bg-[#2A1D48] p-6 outline outline-[#3F325F]">
                  <div className="inline-flex items-center justify-start gap-1.5">
                    <div className="relative h-3.5 w-3.5">
                      <LockIcon className="h-3.5 w-3.5 fill-[#D8C8FC]" />
                    </div>
                    <div className="flex items-center justify-start gap-1 text-xs leading-3 text-[#948CA4]">
                      隐私状态
                      <ChevronDown className="relative h-2 w-2 overflow-hidden fill-[#8C8C8C]" />
                    </div>
                  </div>
                  <div className="justify-start self-stretch text-base font-normal leading-snug text-white">
                    会话保存在你的服务器上。4 个附件、6 位参与者——{' '}
                    <span className="text-[#D8C8FC]">
                      静态加密存储，绝不被第三方索引或扫描。邮箱、数据与域名都归你所有。
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h1 className="mb-2 mt-4 text-lg font-medium leading-loose text-white">
                你的收件箱，你的服务器
              </h1>
              <p className="max-w-sm text-sm font-light text-[#979797]">
                没有 SaaS 扫描你的邮件。每个会话、每个附件、每个联系人都存在于你掌控的硬件上——
                端到端，只属于你。
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl md:h-96">
              <div className="absolute left-0 top-0 aspect-square w-full rounded-2xl bg-[#2B2B2B] md:h-96 md:w-96" />
              <div className="bg-panelDark absolute left-[34px] top-[34px] inline-flex w-[600px] flex-col items-start justify-start overflow-hidden rounded-xl">
                <div className="bg-tokens-surface-secondary border-tokens-stroke-light/5 inline-flex h-12 items-center justify-center gap-3 self-stretch overflow-hidden border-b-[0.50px] px-4 py-3">
                  <div className="flex h-6 items-center justify-center overflow-hidden rounded bg-[#262626] pl-1 pr-1.5">
                    <X className="relative h-3.5 w-3.5 overflow-hidden fill-[#767676]" />
                    <div className="flex items-center justify-center gap-2.5 px-0.5 text-[#767676]">
                      esc
                    </div>
                  </div>
                  <div className="flex flex-1 items-center justify-start gap-1">
                    <div className="relative w-px self-stretch rounded-full bg-[#767676]" />
                    <div className="flex-1 justify-center text-sm font-normal leading-none text-[#767676]">
                      按发件人、主题或内容搜索……
                    </div>
                  </div>
                </div>
                <div className="bg-tokens-surface-secondary border-tokens-stroke-light/5 flex flex-col items-start justify-start self-stretch overflow-hidden border-b-[0.50px]">
                  <div className="inline-flex items-center justify-start gap-1.5 self-stretch px-5 pb-3 pt-5">
                    <div className="flex-1 justify-start text-sm leading-none text-[#8C8C8C]">
                      最近互动
                    </div>
                  </div>
                  <div className="flex flex-col items-start justify-start gap-2 self-stretch p-2">
                    <div className="inline-flex items-center justify-start gap-3 self-stretch rounded-lg p-3">
                      <div className="relative h-8 w-8 rounded-full bg-indigo-500/10">
                        <div className="absolute left-[10.2px] top-[4px] h-7 w-3 overflow-hidden">
                          <img
                            src="/stripe.svg"
                            alt="Stripe"
                            width={12}
                            height={24}
                            className="w-18 absolute h-6"
                          />
                        </div>
                      </div>
                      <div className="inline-flex flex-1 flex-col items-start justify-start gap-2.5">
                        <div className="inline-flex items-start justify-start gap-2.5 self-stretch">
                          <div className="flex flex-1 items-center justify-start gap-3">
                            <div className="flex items-center justify-start gap-1">
                              <div className="text-base-gray-950 justify-start text-sm leading-none">
                                Stripe
                              </div>
                            </div>
                          </div>
                          <div className="text-base-gray-500/50 justify-start text-sm font-normal leading-none">
                            3 月 29 日
                          </div>
                        </div>
                        <div className="inline-flex items-center justify-start gap-2.5 self-stretch">
                          <div className="flex-1 justify-start text-sm font-normal leading-none text-[#8C8C8C]">
                            付款确认 #1234
                          </div>
                          <div className="flex items-start justify-start gap-1">
                            <div className="relative h-3.5 w-3.5 overflow-hidden" />
                            <div className="relative h-3.5 w-3.5 overflow-hidden" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="inline-flex items-center justify-start gap-3 self-stretch rounded-lg p-3">
                      <div className="relative h-8 w-8 rounded-full bg-red-600/10">
                        <div className="absolute left-0 top-0 h-8 w-8 rounded-full" />
                        <div className="absolute left-[11px] top-[4px] h-7 w-2.5">
                          <img
                            src="/netflix.svg"
                            alt="Stripe"
                            width={12}
                            height={24}
                            className="w-18 absolute h-6"
                          />
                        </div>
                      </div>
                      <div className="inline-flex flex-1 flex-col items-start justify-start gap-2.5">
                        <div className="inline-flex items-start justify-start gap-2.5 self-stretch">
                          <div className="flex flex-1 items-center justify-start gap-3">
                            <div className="flex items-center justify-start gap-1">
                              <div className="text-base-gray-950 justify-start text-sm leading-none">
                                Netflix
                              </div>
                            </div>
                          </div>
                          <div className="text-base-gray-500/50 justify-start text-sm font-normal leading-none">
                            3 月 29 日
                          </div>
                        </div>
                        <div className="inline-flex items-center justify-start gap-2.5 self-stretch">
                          <div className="flex-1 justify-start text-sm font-normal leading-none text-[#8C8C8C]">
                            你的片单新增了剧集
                          </div>
                          <div className="flex items-start justify-start gap-1">
                            <div className="relative h-3.5 w-3.5 overflow-hidden" />
                            <div className="relative h-3.5 w-3.5 overflow-hidden" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="inline-flex items-center justify-start gap-3 self-stretch rounded-[10px] bg-[#202020] p-3">
                      <img
                        className="h-8 w-8 rounded-full"
                        src="https://randomuser.me/api/portraits/men/15.jpg"
                        alt="Casey"
                        width={32}
                        height={32}
                      />
                      <div className="inline-flex h-9 flex-1 flex-col items-start justify-start gap-2.5">
                        <div className="inline-flex items-start justify-start gap-2.5 self-stretch">
                          <div className="flex flex-1 items-center justify-start gap-3">
                            <div className="flex items-center justify-start gap-1">
                              <div className="text-base-gray-950 justify-start text-sm leading-none">
                                Casey
                              </div>
                              <div className="justify-start text-center text-sm leading-none text-[#8C8C8C]">
                                [9]
                              </div>
                            </div>
                          </div>
                          <div className="text-base-gray-500/50 justify-start text-sm font-normal leading-none">
                            3 月 29 日
                          </div>
                        </div>
                        <div className="inline-flex items-center justify-start gap-2.5 self-stretch">
                          <div className="flex-1 justify-start text-sm font-normal leading-none text-[#8C8C8C]">
                            新的设计评审
                          </div>
                          <div className="flex items-start justify-start gap-1">
                            <div className="relative h-3.5 w-3.5 overflow-hidden" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="inline-flex items-center justify-start gap-3 self-stretch rounded-lg p-3">
                      <div className="inline-flex h-8 w-8 flex-col items-center justify-center gap-2.5 overflow-hidden rounded-full bg-[#2B2B2B]">
                        <div className="relative h-8 w-8 overflow-hidden">
                          <div className="absolute left-[10.60px] top-[8px] h-4 w-2.5 overflow-hidden">
                            <Figma className="relative h-4 w-2.5 overflow-hidden" />
                          </div>
                        </div>
                      </div>
                      <div className="inline-flex flex-1 flex-col items-start justify-start gap-2.5">
                        <div className="inline-flex items-start justify-start gap-2.5 self-stretch">
                          <div className="flex flex-1 items-center justify-start gap-3">
                            <div className="flex items-center justify-start gap-1">
                              <div className="text-base-gray-950 justify-start text-sm leading-none">
                                Figma
                              </div>
                              <div className="justify-start text-center text-sm leading-none text-[#8C8C8C]">
                                [5]
                              </div>
                            </div>
                          </div>
                          <div className="text-base-gray-500/50 justify-start text-sm font-normal leading-none">
                            3 月 26 日
                          </div>
                        </div>
                        <div className="inline-flex items-center justify-start gap-2.5 self-stretch">
                          <div className="text-base-gray-500/50 flex-1 justify-start text-sm font-normal leading-none">
                            “Landing Page v2”的新评论
                          </div>
                          <div className="flex items-start justify-start gap-1">
                            <div className="relative h-3.5 w-3.5 overflow-hidden" />
                            <div className="relative h-3.5 w-3.5 overflow-hidden" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="inline-flex items-center justify-start gap-3 self-stretch rounded-lg p-3">
                      <div className="inline-flex h-8 w-8 flex-col items-center justify-center gap-2.5 overflow-hidden rounded-full bg-red-500/10 px-1.5 py-2.5">
                        <div className="relative h-8 w-8 overflow-hidden">
                          <div className="absolute left-[7.30px] top-[7px] h-4 w-4 overflow-hidden">
                            <div className="absolute left-0 top-0 h-4 w-4 bg-red-500" />
                          </div>
                        </div>
                      </div>
                      <div className="inline-flex flex-1 flex-col items-start justify-start gap-2.5">
                        <div className="inline-flex items-start justify-start gap-2.5 self-stretch">
                          <div className="flex flex-1 items-center justify-start gap-3">
                            <div className="flex items-center justify-start gap-1">
                              <div className="text-base-gray-950 justify-start text-sm leading-none">
                                Asana
                              </div>
                            </div>
                          </div>
                          <div className="text-base-gray-500/50 justify-start text-sm font-normal leading-none">
                            3 月 25 日
                          </div>
                        </div>
                        <div className="inline-flex items-center justify-start gap-2.5 self-stretch">
                          <div className="text-base-gray-500/50 flex-1 justify-start text-sm font-normal leading-none">
                            每周任务摘要
                          </div>
                          <div className="flex items-start justify-start gap-1">
                            <div className="relative h-3.5 w-3.5 overflow-hidden" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="inline-flex items-center justify-start gap-3 self-stretch rounded-lg p-3">
                      <div className="relative inline-flex h-8 w-8 flex-col items-center justify-center gap-2.5 rounded-full px-1.5 py-2.5">
                        <div className="bg-base-primary-500 outline-tokens-surface-secondary absolute left-[24px] top-[24px] h-2 w-2 rounded-full outline outline-2" />
                      </div>
                      <div className="inline-flex flex-1 flex-col items-start justify-start gap-2.5">
                        <div className="inline-flex items-start justify-start gap-2.5 self-stretch">
                          <div className="flex flex-1 items-center justify-start gap-3">
                            <div className="flex items-center justify-start gap-1">
                              <div className="text-base-gray-950 justify-start text-sm leading-none">
                                Nick
                              </div>
                            </div>
                          </div>
                          <div className="text-base-gray-500/50 justify-start text-sm font-normal leading-none">
                            3 月 28 日
                          </div>
                        </div>
                        <div className="inline-flex items-center justify-start gap-2.5 self-stretch">
                          <div className="text-base-gray-500/50 flex-1 justify-start text-sm font-normal leading-none">
                            下周喝杯咖啡？
                          </div>
                          <div className="flex items-start justify-start gap-1">
                            <div className="relative h-3.5 w-3.5 overflow-hidden" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="inline-flex items-center justify-between self-stretch overflow-hidden">
                  <div className="border-tokens-stroke-light/5 flex h-12 flex-1 items-center justify-center gap-2 border-r-[0.50px]">
                    <div className="bg-tokens-button-surface/10 flex h-5 items-center justify-center overflow-hidden rounded px-1.5">
                      <div className="bg-base-gray-500/50 h-2 w-3" />
                    </div>
                    <div className="text-base-gray-500/50 justify-start text-sm leading-none">
                      打开
                    </div>
                  </div>
                  <div className="border-tokens-stroke-light/5 flex h-12 flex-1 items-center justify-center gap-2 border-r-[0.50px]">
                    <div className="bg-tokens-button-surface/10 flex h-5 items-center justify-center overflow-hidden rounded px-1">
                      <div className="text-base-gray-500/50 justify-start text-center text-sm leading-none">
                        ⌘R
                      </div>
                    </div>
                    <div className="text-base-gray-500/50 justify-start text-sm leading-none">
                      回复
                    </div>
                  </div>
                  <div className="border-tokens-stroke-light/5 flex h-12 flex-1 items-center justify-center gap-2 border-r-[0.50px]">
                    <div className="bg-tokens-button-surface/10 flex h-5 items-center justify-center overflow-hidden rounded px-1">
                      <div className="text-base-gray-500/50 justify-start text-center text-sm leading-none">
                        ⌘E
                      </div>
                    </div>
                    <div className="text-base-gray-500/50 justify-start text-sm leading-none">
                      归档
                    </div>
                  </div>
                  <div className="border-tokens-stroke-light/5 flex h-12 flex-1 items-center justify-center gap-2 border-r-[0.50px]">
                    <div className="bg-tokens-button-surface/10 flex h-5 items-center justify-center overflow-hidden rounded px-1">
                      <div className="text-base-gray-500/50 justify-start text-center text-sm leading-none">
                        ⌘M
                      </div>
                    </div>
                    <div className="text-base-gray-500/50 justify-start text-sm leading-none">
                      标为已读
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h1 className="mb-2 text-lg font-medium leading-loose text-white">智能搜索</h1>
              <p className="max-w-sm text-sm font-light text-[#979797]">
                你的收件箱，你定规则。创建个性化的邮件处理流程，完全贴合你整理、撰写、回复与工作的方式。
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative mt-52">
        <div className="z-1 relative w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center"
          >
            <h1 className="text-lg font-light text-white/40 md:text-xl">
              在你托管的每个邮箱中进行全文检索
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-2 flex flex-col items-center justify-center md:mt-8"
          >
            <h1 className="text-4xl font-medium text-white md:text-6xl">搜索任何内容</h1>
            <h1 className="mb-4 text-4xl font-medium text-white/40 md:text-6xl">
              纵贯你的服务器
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="relative flex w-full items-center justify-center"
          >
            <div className="relative mx-auto flex h-[587px] w-full max-w-[894px] items-center justify-center rounded-xl">
              <div className="absolute left-0 top-[319px] mx-auto inline-flex w-full max-w-[894px] flex-col items-start justify-start overflow-hidden rounded-xl bg-zinc-900 opacity-30">
                <div className="inline-flex items-center justify-start gap-1.5 self-stretch px-5 pb-4 pt-7">
                  <div className="flex flex-1 items-center justify-start gap-1.5">
                    <div className="justify-start text-sm leading-none text-[#8C8C8C]">置顶</div>
                    <div className="justify-start text-sm leading-none text-[#8C8C8C]">[3]</div>
                  </div>
                </div>
                <div className="flex flex-col items-start justify-start gap-2 self-stretch px-2 pb-2">
                  <div className="inline-flex items-center justify-start gap-3 self-stretch rounded-lg p-3">
                    <img
                      src="https://randomuser.me/api/portraits/men/32.jpg"
                      alt="头像"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div className="inline-flex h-9 flex-1 flex-col items-start justify-start gap-2.5">
                      <div className="inline-flex items-start justify-start gap-2.5 self-stretch">
                        <div className="flex flex-1 items-center justify-start gap-3">
                          <div className="flex items-center justify-start gap-1">
                            <div className="text-base-gray-950 justify-start text-sm leading-none">
                              来自 Openship 的 Alex
                            </div>
                            <div className="justify-start text-center text-sm leading-none text-[#8C8C8C]">
                              [9]
                            </div>
                          </div>
                        </div>
                        <div className="justify-start text-sm font-normal leading-none text-[#8C8C8C]">
                          3 月 29 日
                        </div>
                      </div>
                      <div className="inline-flex items-center justify-start gap-2.5 self-stretch">
                        <div className="flex-1 justify-start text-sm font-normal leading-none text-[#8C8C8C]">
                          新的设计评审
                        </div>
                        <div className="flex items-start justify-start gap-1">
                          <div className="relative h-3.5 w-3.5 overflow-hidden" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="inline-flex items-center justify-start gap-3 self-stretch rounded-[10px] p-3">
                    <div className="inline-flex h-8 w-8 flex-col items-center justify-center gap-2.5 overflow-hidden rounded-full bg-[#313131] px-1.5 py-2.5 shadow-[0px_0px_0px_0.5px_rgba(255,255,255,0.00)] shadow-[0px_1px_2px_0px_rgba(255,255,255,0.00)]">
                      <GroupPeople className="h-5 w-5 overflow-hidden fill-[#989898]" />
                    </div>
                    <div className="inline-flex flex-1 flex-col items-start justify-start gap-2.5">
                      <div className="inline-flex items-start justify-start gap-2.5 self-stretch">
                        <div className="flex flex-1 items-center justify-start gap-3">
                          <div className="flex items-center justify-start gap-1.5">
                            <div className="text-base-gray-950 justify-start text-sm leading-none">
                              Alex, Ali, Sarah
                            </div>
                            <div className="justify-start text-center text-sm leading-none text-[#8C8C8C]">
                              [6]
                            </div>
                          </div>
                        </div>
                        <div className="justify-start text-sm font-normal leading-none text-[#8C8C8C]">
                          3 月 28 日
                        </div>
                      </div>
                      <div className="inline-flex items-center justify-start gap-2.5 self-stretch">
                        <div className="flex-1 justify-start text-sm font-normal leading-none text-[#8C8C8C]">
                          Re: 设计评审反馈
                        </div>
                        <div className="flex items-start justify-start gap-1">
                          <div className="relative h-3.5 w-3.5 overflow-hidden" />
                          <div className="relative h-3.5 w-3.5 overflow-hidden" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="inline-flex items-center justify-start gap-3 self-stretch rounded-lg p-3">
                    <div className="bg-tokens-surface-primary inline-flex h-8 w-8 flex-col items-center justify-center gap-2.5 overflow-hidden rounded-full px-1.5 py-2.5">
                      <div className="relative h-fit">
                        <GitHub className="h-[25px] w-[25px] fill-white" />
                      </div>
                    </div>
                    <div className="inline-flex flex-1 flex-col items-start justify-start gap-2.5">
                      <div className="inline-flex items-start justify-start gap-2.5 self-stretch">
                        <div className="flex flex-1 items-center justify-start gap-3">
                          <div className="flex items-center justify-start gap-1">
                            <div className="text-base-gray-950 justify-start text-sm leading-none">
                              GitHub
                            </div>
                            <div className="justify-start text-center text-sm leading-none text-[#8C8C8C]">
                              [8]
                            </div>
                          </div>
                        </div>
                        <div className="justify-start text-sm font-normal leading-none text-[#8C8C8C]">
                          3 月 28 日
                        </div>
                      </div>
                      <div className="inline-flex items-center justify-start gap-2.5 self-stretch">
                        <div className="flex-1 justify-start text-sm font-normal leading-none text-[#8C8C8C]">
                          安全警报：严重漏洞
                        </div>
                        <div className="flex items-start justify-start gap-1">
                          <div className="relative h-3.5 w-3.5 overflow-hidden" />
                          <div className="relative h-3.5 w-3.5 overflow-hidden" />
                          <div className="relative h-3.5 w-3.5 overflow-hidden" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 inline-flex aspect-96/125 w-full flex-col items-center justify-center overflow-hidden rounded-xl bg-[#252525] md:h-[500px] md:w-96">
                <div className="border-tokens-stroke-light/5 inline-flex items-center justify-start gap-2 self-stretch overflow-hidden border-b-[0.50px] py-3.5 pl-5 pr-3.5">
                  <div className="flex flex-1 items-center justify-start gap-3">
                    <div className="text-base-gray-950 flex flex-1 items-center justify-start text-sm leading-none">
                      <X className="mr-2 h-4 w-4 fill-[#8C8C8C]" />
                      新聊天
                    </div>
                  </div>
                  <div className="flex h-6 items-center justify-center gap-0.5 overflow-hidden rounded-md px-1">
                    <Plus className="h-3 w-3 overflow-hidden fill-[#8C8C8C]" />
                  </div>
                  <div className="flex h-6 items-center justify-center gap-0.5 overflow-hidden rounded-md px-1">
                    <PanelLeftOpen className="h-3 w-3 overflow-hidden fill-[#8C8C8C]" />
                  </div>
                  <div className="flex h-6 items-center justify-center gap-0.5 overflow-hidden rounded-md px-1">
                    <Expand className="h-2.5 w-2.5 overflow-hidden fill-[#8C8C8C]" />
                  </div>
                </div>
                <div className="relative flex h-full flex-1 flex-col items-center justify-between gap-8 self-stretch overflow-hidden px-5 py-4">
                  <Search className="h-7 w-7 fill-white" />
                  <div className="flex flex-col items-center justify-start gap-3">
                    <div className="text-base-gray-950 justify-start text-sm leading-none">
                      搜索服务器上的每个邮箱
                    </div>
                    <div className="justify-start text-sm font-normal leading-none text-[#929292]">
                      在你的硬件上本地索引——不依赖第三方搜索服务
                    </div>
                  </div>
                  <div className="relative inline-flex w-96 flex-col items-start justify-center gap-2">
                    {/* First row */}
                    <div className="no-scrollbar relative flex w-full justify-center">
                      <div className="flex items-center justify-start gap-2 whitespace-nowrap">
                        {firstRowQueries.map((query) => (
                          <div
                            key={query}
                            className="flex h-7 shrink-0 items-center justify-start gap-1.5 overflow-hidden rounded-md bg-[#303030] px-2 py-1.5"
                          >
                            <div className="flex items-center justify-start gap-1 px-0.5">
                              <div className="justify-start text-sm leading-none text-[#8B8B8B]">
                                {query}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="absolute left-0 top-0 h-7 w-12 bg-linear-to-l from-neutral-800/0 to-neutral-800" />
                      <div className="absolute right-0 top-0 h-7 w-12 bg-linear-to-l from-neutral-800 to-neutral-800/0" />
                    </div>

                    {/* Second row */}
                    <div className="no-scrollbar relative flex w-full justify-center">
                      <div className="flex items-center justify-start gap-2 whitespace-nowrap">
                        {secondRowQueries.map((query) => (
                          <div
                            key={query}
                            className="flex h-7 shrink-0 items-center justify-start gap-1.5 overflow-hidden rounded-md bg-[#303030] px-2 py-1.5"
                          >
                            <div className="flex items-center justify-start gap-1 px-0.5">
                              <div className="justify-start text-sm leading-none text-[#8B8B8B]">
                                {query}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="absolute left-0 top-0 h-7 w-12 bg-linear-to-l from-neutral-800/0 to-neutral-800" />
                      <div className="absolute right-0 top-0 h-7 w-12 bg-linear-to-l from-neutral-800 to-neutral-800/0" />
                    </div>
                  </div>
                  <div className="inline-flex w-full items-center justify-start gap-4 overflow-hidden p-0 md:w-96 md:p-4 md:pb-0">
                    <div className="flex h-8 flex-1 items-center justify-start gap-1.5 overflow-hidden rounded-md bg-[#141414] pl-2.5 pr-1">
                      <div className="relative h-3 w-px rounded-full bg-white" />
                      <div className="flex-1 justify-start text-sm leading-none text-[#727272]">
                        让 Zero 做任何事……
                      </div>
                      <div className="flex h-6 items-center justify-center gap-2.5 rounded bg-[#262626] px-1">
                        <CurvedArrow className="relative left-px mt-1 h-4 w-4 fill-black dark:fill-[#929292]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          <img
            src="/pixel.svg"
            alt="主视觉"
            width={1920}
            height={1080}
            className="z-2 relative bottom-24 rotate-180 bg-transparent opacity-0"
            style={{ clipPath: 'inset(45% 0 0 0)' }}
          />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
           UNLIMITED - domains/mailboxes capped only by the box
           ════════════════════════════════════════════════════ */}
      <div className="relative mt-16 md:-mt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center"
        >
          <h1 className="text-lg font-light text-white/40 md:text-xl">
            没有 SaaS 计量，没有按席位税
          </h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-2 flex flex-col items-center justify-center md:mt-8"
        >
          <h1 className="text-center text-4xl font-medium text-white md:text-6xl">
            域名不限量
          </h1>
          <h1 className="mb-3 text-center text-4xl font-medium text-white/40 md:text-6xl">
            直到你的 VPS 扛不住为止
          </h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative mx-4 flex w-full items-center justify-center md:mx-0"
        >
          <div className="relative mx-auto flex w-full max-w-[920px] items-start justify-center md:h-[820px]">
            {/* Wide backdrop - Sending now activity feed (desktop only) */}
            <div className="absolute left-0 right-0 top-[440px] mx-auto hidden w-full max-w-[920px] flex-col items-start justify-start overflow-hidden rounded-2xl bg-zinc-900 opacity-30 md:inline-flex">
              <div className="inline-flex items-center justify-start gap-1.5 self-stretch px-5 pb-4 pt-7">
                <div className="flex flex-1 items-center justify-start gap-1.5">
                  <div className="text-sm leading-none text-[#8C8C8C]">正在发送</div>
                  <div className="text-sm leading-none text-[#8C8C8C]">[247]</div>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-[#12341D] px-1.5 py-0.5 text-[10px] leading-none text-[#A3E1B3]">
                  <span className="h-1 w-1 rounded-full bg-[#39AE4A]" />
                  实时
                </div>
              </div>
              <div className="flex flex-col items-start justify-start gap-2 self-stretch px-2 pb-2">
                {[
                  { from: 'oblien.com',        to: 'team@stripe.com',     subj: '收据 #4827',         when: '刚刚' },
                  { from: 'mail.openship.com', to: 'jordan@blackbird.io', subj: '欢迎来到 Openship',   when: '12 秒' },
                  { from: 'acme.io',           to: 'alex@dev.acme.io',    subj: '新设备登录',    when: '34 秒' },
                  { from: 'shop.acme.io',      to: 'nick@figma.com',      subj: '订单 #1248 已发货',   when: '52 秒' },
                ].map((row) => (
                  <div
                    key={row.subj}
                    className="inline-flex items-center justify-start gap-3 self-stretch rounded-lg p-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#313131]">
                      <Mail className="h-4 w-4 fill-[#989898]" />
                    </div>
                    <div className="inline-flex flex-1 flex-col items-start justify-start gap-2">
                      <div className="inline-flex items-center justify-start gap-2.5 self-stretch">
                        <div className="flex flex-1 items-center justify-start gap-1.5">
                          <span className="text-base-gray-950 text-sm leading-none">{row.from}</span>
                          <ArrowRight className="h-2.5 w-2.5 fill-[#8C8C8C]" />
                          <span className="text-sm leading-none text-[#8C8C8C]">{row.to}</span>
                        </div>
                        <div className="text-sm leading-none text-[#8C8C8C]">{row.when}</div>
                      </div>
                      <div className="text-sm leading-none text-[#8C8C8C]">{row.subj}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Center admin panel card */}
            <div className="bg-panelDark relative z-10 mt-10 inline-flex w-full max-w-[640px] flex-col overflow-hidden rounded-2xl shadow-md md:absolute md:top-0 md:mt-0">
            {/* Window chrome */}
            <div className="inline-flex h-12 items-center justify-start gap-3 self-stretch overflow-hidden border-b-[0.50px] border-[#252525] px-4">
              <div className="flex flex-1 items-center justify-start gap-2">
                <div className="flex flex-1 items-center justify-start gap-1.5">
                  <PanelLeftOpen className="h-3.5 w-3.5 fill-[#8C8C8C]" />
                  <div className="ml-1 justify-start text-sm leading-none text-white">域名</div>
                  <div className="ml-1 justify-start text-sm leading-none text-[#8C8C8C]">[12]</div>
                </div>
              </div>
              <div className="flex h-7 items-center justify-center gap-1.5 overflow-hidden rounded-md bg-white px-2.5">
                <Plus className="h-3 w-3 fill-black" />
                <div className="text-sm leading-none text-black">添加域名</div>
              </div>
            </div>

            {/* Search + filter chips */}
            <div className="flex flex-col items-start justify-start gap-3 self-stretch p-4">
              <div className="inline-flex h-9 items-center justify-start gap-1 self-stretch overflow-hidden rounded-md bg-[#141414] pl-2.5 pr-1.5">
                <Search className="relative mr-1.5 h-3.5 w-3.5 overflow-hidden fill-[#8C8C8C]" />
                <div className="flex-1 justify-start text-sm leading-none text-[#929292]">
                  搜索域名
                </div>
                <div className="flex h-6 items-center justify-center gap-2 rounded-sm bg-[#262626] px-1.5">
                  <div className="justify-start text-sm leading-none text-[#929292]">⌘K</div>
                </div>
              </div>

              <div className="inline-flex items-start justify-start gap-1.5 self-stretch">
                <div className="flex h-7 flex-1 items-center justify-center gap-1.5 overflow-hidden rounded-md bg-[#39AE4A] px-2.5">
                  <Check className="h-3 w-3 text-white" />
                  <div className="flex items-center justify-center gap-2">
                    <div className="justify-start text-sm leading-none text-white">全部</div>
                    <div className="justify-start text-sm leading-none text-white/80">[12]</div>
                  </div>
                </div>
                <div className="flex h-7 items-center justify-center gap-1 overflow-hidden rounded-md bg-[#313131] px-2.5">
                  <div className="text-sm leading-none text-[#989898]">已验证</div>
                  <div className="text-sm leading-none text-[#6F6F6F]">[12]</div>
                </div>
                <div className="flex h-7 items-center justify-center gap-1 overflow-hidden rounded-md bg-[#313131] px-2.5">
                  <div className="text-sm leading-none text-[#989898]">发送中</div>
                  <div className="text-sm leading-none text-[#6F6F6F]">[11]</div>
                </div>
                <div className="flex h-7 items-center justify-center gap-1 overflow-hidden rounded-md bg-[#313131] px-2.5">
                  <div className="text-sm leading-none text-[#989898]">空闲</div>
                  <div className="text-sm leading-none text-[#6F6F6F]">[1]</div>
                </div>
              </div>

              {/* Green status callout */}
              <div className="relative flex flex-col items-start justify-center gap-2 self-stretch overflow-hidden rounded-md bg-[#12341D] px-3 py-3">
                <div className="justify-start self-stretch text-sm leading-none text-[#A3E1B3]">
                  没有计量，没有按席位税
                </div>
                <div className="justify-start self-stretch text-sm font-normal leading-normal text-[#F4FBF6]">
                  域名和邮箱想加多少就加多少，只要 VPS 扛得住。<br />
                  上限随硬件水涨船高——不用换套餐，也不会弹升级窗口。
                </div>
              </div>
            </div>

            {/* List header */}
            <div className="inline-flex items-center justify-start gap-1 self-stretch px-4 pb-3 pt-1">
              <div className="flex flex-1 items-center justify-start gap-1.5">
                <div className="justify-start text-sm leading-none text-[#8C8C8C]">活跃</div>
                <div className="justify-start text-sm leading-none text-[#8C8C8C]">[6]</div>
              </div>
              <div className="hidden items-center justify-end gap-10 text-sm leading-none text-[#8C8C8C] sm:flex">
                <span>邮箱</span>
                <span>活动</span>
              </div>
            </div>

            {/* Domain rows - densely styled like the inbox card */}
            <div className="flex flex-col items-start justify-start gap-1 self-stretch px-1.5 pb-2">
              {[
                { name: 'oblien.com',         mailboxes: 247, when: '2 分钟前',  live: true,  pct: 38 },
                { name: 'mail.openship.com',  mailboxes: 412, when: '实时',       live: true,  pct: 62 },
                { name: 'acme.io',            mailboxes: 83,  when: '1 小时前',   live: true,  pct: 18 },
                { name: 'team.acme.io',       mailboxes: 45,  when: '8 分钟前',  live: true,  pct: 12 },
              ].map((d, i) => (
                <div
                  key={d.name}
                  className={`inline-flex items-center justify-start gap-3 self-stretch rounded-lg p-3 ${
                    i === 1 ? 'bg-[#202020]' : ''
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#313131]">
                    <Check className="h-3.5 w-3.5 text-[#A3E1B3]" />
                  </div>
                  <div className="flex flex-1 flex-col items-start justify-center gap-2">
                    <div className="inline-flex items-center justify-start gap-2 self-stretch">
                      <div className="text-sm leading-none text-white">{d.name}</div>
                      {d.live && (
                        <div className="inline-flex items-center gap-1 rounded-full bg-[#12341D] px-2 py-0.5 text-[11px] leading-none text-[#A3E1B3]">
                          <span className="h-1 w-1 rounded-full bg-[#39AE4A]" />
                          实时
                        </div>
                      )}
                    </div>
                    <div className="inline-flex items-center gap-2 self-stretch">
                      <div className="text-xs font-normal leading-none text-[#8C8C8C]">
                        SPF · DKIM · DMARC · TLS
                      </div>
                    </div>
                  </div>
                  <div className="hidden flex-col items-end gap-2 sm:flex">
                    <div className="text-sm leading-none text-white">{d.mailboxes}</div>
                    <div className="relative h-1 w-16 overflow-hidden rounded-full bg-[#262626]">
                      <div
                        className="absolute left-0 top-0 h-full rounded-full bg-[#39AE4A]"
                        style={{ width: `${d.pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="hidden w-20 justify-end text-right text-xs leading-none text-[#8C8C8C] sm:flex">
                    {d.when}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom stat strip - matches the kbd-shortcut footer pattern from Smart Search card */}
            <div className="inline-flex items-start justify-start self-stretch border-t-[0.50px] border-[#252525]">
              <div className="border-tokens-stroke-light/5 flex h-16 flex-1 flex-col items-center justify-center gap-1.5 border-r-[0.50px]">
                <div className="text-2xl font-medium leading-none text-white">∞</div>
                <div className="text-xs uppercase tracking-[0.16em] text-[#8C8C8C]">域名</div>
              </div>
              <div className="border-tokens-stroke-light/5 flex h-16 flex-1 flex-col items-center justify-center gap-1.5 border-r-[0.50px]">
                <div className="text-2xl font-medium leading-none text-white">∞</div>
                <div className="text-xs uppercase tracking-[0.16em] text-[#8C8C8C]">邮箱</div>
              </div>
              <div className="flex h-16 flex-1 flex-col items-center justify-center gap-1.5">
                <div className="text-2xl font-medium leading-none text-white">$0</div>
                <div className="text-xs uppercase tracking-[0.16em] text-[#8C8C8C]">附加费用</div>
              </div>
            </div>
          </div>
          </div>
        </motion.div>
      </div>

      {/* ════════════════════════════════════════════════════
           ACCESS - Gmail, Apple Mail, mobile, webmail, API
           ════════════════════════════════════════════════════ */}
      <div className="relative mt-52">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center"
        >
          <h1 className="text-lg font-light text-white/40 md:text-xl">
            任何客户端。任何设备。任何协议。
          </h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-2 flex flex-col items-center justify-center md:mt-8"
        >
          <h1 className="text-center text-4xl font-medium text-white md:text-6xl">
            随处访问
          </h1>
          <h1 className="mb-3 text-center text-4xl font-medium text-white/40 md:text-6xl">
            Gmail 应用、手机，或你的 API
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative bottom-3 mx-4 flex items-center justify-center bg-[#0F0F0F] md:mx-0"
        >
          <div className="bg-panelDark mx-auto mt-10 inline-flex w-full max-w-[920px] flex-col items-stretch overflow-hidden rounded-2xl shadow-md md:flex-row">
            {/* Left: client list */}
            <div className="flex flex-1 flex-col gap-2 border-b-[0.50px] p-4 md:border-b-0 md:border-r-[0.50px]">
              <div className="mb-1 px-2 text-[10.5px] font-medium uppercase tracking-[0.18em] text-[#8C8C8C]">
                连接任意客户端
              </div>

              {[
                {
                  icon: <GmailColor className="h-5 w-5" />,
                  name: 'Gmail',
                  desc: '作为第三方账户添加，用你的域名收发邮件。',
                  tag: 'IMAP · SMTP',
                },
                {
                  icon: <Mail className="h-5 w-5 fill-white" />,
                  name: 'Apple Mail',
                  desc: '原生支持 macOS 与 iOS。一键安装描述文件，或手动配置 SSL。',
                  tag: 'IMAP · SMTP',
                },
                {
                  icon: <OutlookColor className="h-5 w-5" />,
                  name: 'Outlook',
                  desc: '桌面与网页版——完整日历、联系人与子文件夹。',
                  tag: 'IMAP · SMTP',
                },
                {
                  icon: <Phone className="h-5 w-5 fill-white" />,
                  name: '移动应用',
                  desc: 'K-9、Spark、Edison、FairEmail——支持 IMAP 的都行。',
                  tag: 'IMAP · SMTP',
                },
                {
                  icon: <Inbox className="h-5 w-5 fill-white" />,
                  name: 'Openship 网页邮箱',
                  desc: '内置的网页客户端——快速、键盘驱动、无需安装。',
                  tag: '内置',
                },
              ].map((c) => (
                <div
                  key={c.name}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.03]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1A1A1A]">
                    {c.icon}
                  </div>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm leading-none text-white">{c.name}</div>
                      <div className="rounded-full bg-[#202020] px-1.5 py-0.5 text-[9.5px] font-medium uppercase tracking-[0.12em] text-[#8C8C8C]">
                        {c.tag}
                      </div>
                    </div>
                    <div className="text-xs leading-snug text-[#8C8C8C]">{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: protocol/API panel */}
            <div className="flex flex-1 flex-col gap-4 p-5">
              <div className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-[#8C8C8C]">
                或直接与我们对话
              </div>

              {/* Protocol pills */}
              <div className="flex flex-wrap gap-2">
                {['IMAP', 'IMAPS', 'SMTP', 'Submission', 'POP3', 'JMAP', 'REST API', 'Webhooks'].map((p) => (
                  <span
                    key={p}
                    className="rounded-full border border-[#2B2B2B] bg-[#1A1A1A] px-2.5 py-1 text-xs text-[#B7B7B7]"
                  >
                    {p}
                  </span>
                ))}
              </div>

              {/* Code example */}
              <div className="rounded-lg border border-[#2B2B2B] bg-[#141414] p-3">
                <div className="mb-2 flex items-center gap-2">
                  <CurvedArrow className="h-3 w-3 fill-[#8C8C8C]" />
                  <div className="text-[11px] font-medium text-[#8C8C8C]">从代码发送</div>
                </div>
                <pre className="overflow-x-auto whitespace-pre font-mono text-[11px] leading-[1.55] text-[#B7B7B7]">
                  <span className="text-[#8C8C8C]">$ </span>curl https://api.openship.email/v1/send \{'\n'}
                  {'    '}-H <span className="text-[#A3E1B3]">"Authorization: Bearer ..."</span> \{'\n'}
                  {'    '}-d <span className="text-[#A3E1B3]">'{`{"from":"alex@yours.com","to":...}`}'</span>{'\n'}
                  <span className="text-[#A3E1B3]">{'  '}→ 202 Accepted · queued</span>
                </pre>
              </div>

              {/* Auth note */}
              <div className="flex items-start gap-2 rounded-lg border border-[#2B2B2B] bg-[#1A1A1A] p-3">
                <LockIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 fill-[#D8C8FC]" />
                <div className="text-xs leading-relaxed text-[#B7B7B7]">
                  <span className="text-white">全程 TLS。</span>{' '}
                  添加域名的瞬间就会配好 SPF、DKIM、DMARC 与反向 DNS——每个客户端都落在可送达的收件箱上。
                </div>
              </div>

              <Link
                href="/docs/clients"
                className="inline-flex items-center gap-1 text-xs text-[#8C8C8C] transition-colors hover:text-white"
              >
                每个客户端的配置指南
                <ArrowRight className="h-3 w-3 fill-current" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative hidden lg:block"
      >
        <div className="mx-auto max-w-[920px] text-center text-4xl font-normal leading-[48px] text-white">
          <span className="text-[#B7B7B7]">Work smarter, not harder.</span>{' '}
          <span className="pr-12 text-white">Automate repetitive</span>{' '}
          <span className="text-[#B7B7B7]">email</span>
          <span className="text-[#B7B7B7]"> tasks with</span>{' '}
          <span className="pr-14 text-white">smart templates, </span>{' '}
          <span className="text-white">scheduled sends</span>
          <span className="text-[#B7B7B7]">
            , follow-up reminders, and batch processing capabilities that
          </span>{' '}
          <br />
          <span className="text-white underline">save hours every week.</span>
        </div>
        <div className="flex items-center justify-center">
          <img
            className="relative bottom-12 right-[162px]"
            src="/verified-home.png"
            alt="tasks"
            width={50}
            height={50}
          />
          <img
            className="relative bottom-[145px] right-[47px]"
            src="/snooze-home.png"
            alt="tasks"
            width={50}
            height={50}
          />
          <img
            className="relative bottom-[195px] left-[210px]"
            src="/star-home.png"
            alt="tasks"
            width={50}
            height={50}
          />
        </div>
      </motion.div> */}

      {/* ════════════════════════════════════════════════════
           SETUP GUIDES - deep-link cards into /mail/setup-guide/<client>
           ════════════════════════════════════════════════════ */}
      <div className="relative mt-52">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center"
        >
          <h1 className="text-lg font-light text-white/40 md:text-xl">
            一步步来，按客户端分。
          </h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-2 flex flex-col items-center justify-center md:mt-8"
        >
          <h1 className="text-center text-4xl font-medium text-white md:text-6xl">
            配置指南
          </h1>
          <h1 className="mb-3 text-center text-4xl font-medium text-white/40 md:text-6xl">
            覆盖每个客户端
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative mx-4 mt-10 flex items-center justify-center md:mx-0"
        >
          <div className="mx-auto grid w-full max-w-[920px] grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              {
                slug: 'ios',
                title: 'iOS 与 macOS 邮件',
                desc: 'iPhone、iPad 与 Mac 上的原生 Apple 邮件。',
                tag: 'Apple',
              },
              {
                slug: 'android',
                title: 'Android Gmail 应用',
                desc: '在 Gmail 中作为第三方 IMAP 账户添加。',
                tag: 'Android',
              },
              {
                slug: 'desktop',
                title: '桌面客户端',
                desc: 'Thunderbird、Outlook、Spark、K-9——流程相同。',
                tag: 'IMAP · SMTP',
              },
              {
                slug: 'nodemailer',
                title: '用代码发送',
                desc: 'Node、Python、Go——任何 SMTP 库都行。',
                tag: 'SMTP',
              },
            ].map((g) => (
              <Link
                key={g.slug}
                href={`/mail/setup-guide/${g.slug}`}
                className="bg-panelDark group flex items-start gap-3 rounded-2xl border border-white/5 p-4 transition-colors hover:border-white/15"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1A1A1A]">
                  <Mail className="h-4 w-4 fill-white" />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium leading-none text-white">
                      {g.title}
                    </div>
                    <div className="rounded-full bg-[#202020] px-1.5 py-0.5 text-[9.5px] font-medium uppercase tracking-[0.12em] text-[#8C8C8C]">
                      {g.tag}
                    </div>
                  </div>
                  <div className="text-xs leading-snug text-[#8C8C8C]">{g.desc}</div>
                </div>
                <ArrowRight className="mt-1 h-3 w-3 shrink-0 fill-[#8C8C8C] transition-colors group-hover:fill-white" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="relative mt-52">
        <MailFooter />
      </div>
    </main>
  );
}
