import localFont from 'next/font/local';

// 中文镜像：Google Fonts 需要联网下载，改为使用 geist npm 包内置的
// 本地可变字体（与 next/font/google 的 Geist/Geist_Mono 同源同权值）。
export const sans = localFont({
  src: '../../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2',
  variable: '--font-sans',
  weight: '100 900',
  display: 'swap',
});

export const mono = localFont({
  src: '../../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2',
  variable: '--font-mono',
  weight: '100 900',
  display: 'swap',
});