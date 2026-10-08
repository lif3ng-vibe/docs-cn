import type { Metadata } from 'next';
import { PlaygroundRecovery } from '@/components/playground/recovery';

export const metadata: Metadata = {
  title: '恢复你的 Playground 设置',
  robots: { index: false, follow: false },
};

export default function PlaygroundRecoveryPage() {
  return <PlaygroundRecovery />;
}
