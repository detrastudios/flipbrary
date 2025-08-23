
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'Flipbrary by Sahijra',
  description: 'View and interact with your PDFs effortlessly.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet"></link>
        
        <meta name="application-name" content="Flipbrary" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Flipbrary" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#FFFFFF" />

        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><path d=%22M4 19.5A2.5 2.5 0 0 1 6.5 17H20v60a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 76.5V19.5Z%22 fill=%22hsl(240 5.9% 10%)%22></path><path d=%22M20 17h56a2 2 0 0 1 2 2v57.5a2.5 2.5 0 0 1-2.5 2.5H20V17Z%22 fill=%22hsl(240 5.9% 10%)%22></path><path d=%22M20 17h55a2 2 0 0 1 2 2v60a2 2 0 0 1-2 2h-2V34a6 6 0 0 0-6-6H20V17Z%22 fill=%22hsl(240 5.9% 10%)%22></path><polygon points=%2220 17,20 28,31 17%22 fill=%22hsl(240 4.8% 95.9%)%22></polygon></svg>" />
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
