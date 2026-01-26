import './globals.css';
import type { Metadata } from 'next';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: 'TCTP - Too Cool To Party',
  description: 'Ephemeral, anonymous, crowd-verified party and event discovery. No logins. No AI. Just vibes.',
  keywords: ['party', 'events', 'DJs', 'Goa', 'Mumbai', 'Bangalore', 'gathering', 'underground', 'brunches'],
  openGraph: {
    title: 'TCTP - Too Cool To Party',
    description: 'Find out what\'s happening. Crowd-verified. Anonymous.',
    type: 'website',
  },
};

import CityPicker from '@/components/CityPicker';
import Search from '@/components/Search';

import prisma from '@/lib/db';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Dynamic fetch of cities for the global picker
  const cities = await (prisma as any).city.findMany({
    where: { active: true },
    orderBy: { name: 'asc' }
  });

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Header */}
        <header className="header">

          <div className="container header__inner">
            <a href="/" className="header__logo">TCTP</a>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CityPicker cities={cities} />
              <Search />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="page">
          <div className="container">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <p>Event information aggregated from public sources. Official links always provided.</p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.7rem', opacity: 0.3 }}>
              Build: 2026-01-26.2 (Multi-city Stable)
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              <a href="/create">Add an event</a>
            </p>
          </div>
        </footer>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
