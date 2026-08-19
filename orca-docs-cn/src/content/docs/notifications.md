---
title: "通知"
description: "通知与收件箱——智能体完成提醒、常驻铃铛与自定义提示音。"
source: "https://www.onorca.dev/docs/notifications"
---

$undefined

Orca 运行的是智能体而不只是终端，因此它能分辨智能体是真的完成还是只是暂停。通知依托这一信号，让你可以排三个智能体、走开，等第一个完成再回来。

## 智能体完成提醒

当智能体从工作转入空闲，Orca 会发出通知——系统通知、提示音，以及 worktree 上的角标。

## 常驻铃铛

顶栏铃铛显示所有 worktree 的未读通知。点击某条通知会跳到对应的 worktree 与窗格。

在 macOS 上，同一未读数还会镜像为 Dock 图标上的徽标，无需把 Orca 调到前台即可看到待处理的智能体提醒。

## 标记未读

右键某条通知可标记为未读——当你已经处理过一件事、但想稍后再回来看时有用。

## 调整

在 [Settings → Notifications](/settings) 关闭特定类别（系统、提示音、仅角标）。

## 自定义提示音

在 [Settings → Notifications](/settings) 为每个类别挑选自定义桌面通知音——指向磁盘上的任意音频文件，或从 Orca 内置音色中挑选。想让智能体完成提醒与系统邮件、Slack 区分开时很有用。

支持的格式：MP3、WAV、OGG、M4A、AAC、FLAC。一个文件应用于所有发出的桌面通知。

使用自定义提示音时，可在同一设置页设置播放音量。
