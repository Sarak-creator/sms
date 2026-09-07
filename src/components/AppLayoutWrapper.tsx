'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSchool } from '@/lib/stateContext';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn } = useSchool();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isAuthPage = pathname === '/login';

  useEffect(() => {
    if (isMounted && !isLoggedIn && !isAuthPage) {
      router.replace('/login');
    }
  }, [isMounted, isLoggedIn, isAuthPage, router]);

  if (isAuthPage) {
    return <main className="w-full min-h-screen">{children}</main>;
  }

  if (!isMounted || !isLoggedIn) {
    return (
      <div className="flex w-full min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-500 font-medium font-khmer">កំពុងផ្ទៀងផ្ទាត់...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
