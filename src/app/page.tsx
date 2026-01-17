'use client';

import { Timer } from '@/components/timer/Timer';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 safe-area-inset-top safe-area-inset-bottom">
      <Timer />
    </main>
  );
}
