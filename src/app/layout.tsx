import type { Metadata } from 'next';
import './globals.css';
import { SchoolProvider } from '@/lib/stateContext';
import { AppLayoutWrapper } from '@/components/AppLayoutWrapper';

export const metadata: Metadata = {
  title: 'ប្រព័ន្ធគ្រប់គ្រងវិទ្យាល័យរដ្ឋកម្ពុជា - MoEYS High School Management System',
  description: 'ប្រព័ន្ធគ្រប់គ្រងទិន្នន័យសិស្ស ពិន្ទុ និងវត្តមានស្របតាមស្តង់ដារក្រសួងអប់រំ យុវជន និងកីឡា',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="km">
      <head>
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
