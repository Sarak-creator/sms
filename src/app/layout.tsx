import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SchoolProvider } from '@/lib/stateContext';
import { AppLayoutWrapper } from '@/components/AppLayoutWrapper';

export const viewport: Viewport = {
  themeColor: '#1d4ed8',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'ប្រព័ន្ធគ្រប់គ្រងវិទ្យាល័យរដ្ឋកម្ពុជា - MoEYS High School Management System',
  description: 'ប្រព័ន្ធគ្រប់គ្រងទិន្នន័យសិស្ស ពិន្ទុ និងវត្តមានស្របតាមស្តង់ដារក្រសួងអប់រំ យុវជន និងកីឡា',
  manifest: '/manifest.json',
  applicationName: 'MoEYS SMS',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MoEYS SMS',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="km">
      <head>
        {/* iOS Full-Screen PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MoEYS SMS" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Battambang:wght@400;700;900&family=Kantumruy+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('moeys_theme_mode');var p=localStorage.getItem('moeys_color_palette');if(p){document.documentElement.setAttribute('data-palette',p);}if(m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-slate-50 font-khmer text-slate-800">
        <SchoolProvider>
          <AppLayoutWrapper>{children}</AppLayoutWrapper>
        </SchoolProvider>
      </body>
    </html>
  );
}
