import './globals.css';
import type { Metadata } from 'next';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: 'TCTP - Too Cool To Party',
  description: 'Ephemeral, anonymous, crowd-verified nightlife discovery. No logins. No AI. Just vibes.',
  keywords: ['nightlife', 'party', 'events', 'DJs', 'Goa', 'rave', 'techno', 'house'],
  openGraph: {
    title: 'TCTP - Too Cool To Party',
    description: 'Find out what\'s happening tonight. Crowd-verified. Anonymous.',
    type: 'website',
  },
};

import CityPicker from '@/components/CityPicker';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
            <CityPicker />
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
