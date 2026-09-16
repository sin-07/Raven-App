import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AdminProvider } from '@/context/AdminContext';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-outfit',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Raven Tutorials - Learn Smarter, Achieve More',
    template: '%s | Raven Tutorials',
  },
  description: 'Master competitive exams with India\'s top educators. Access 150+ expert courses, live classes, and personalized mentorship for JEE, NEET, and Board exams.',
  keywords: ['online courses', 'JEE preparation', 'NEET coaching', 'board exams', 'competitive exams', 'online learning', 'Raven Tutorials', 'coaching classes', 'Bihar coaching', 'Patna coaching'],
  authors: [{ name: 'Raven Tutorials' }],
  creator: 'Raven Tutorials',
  publisher: 'Raven Tutorials',
  metadataBase: new URL('https://raventutorials.com'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://raventutorials.com',
    siteName: 'Raven Tutorials',
    title: 'Raven Tutorials - Learn Smarter, Achieve More',
    description: 'Master competitive exams with India\'s top educators. Access 150+ expert courses, live classes, and personalized mentorship.',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Raven Tutorials - Online Learning Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Raven Tutorials - Learn Smarter, Achieve More',
    description: 'Master competitive exams with India\'s top educators.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Raven Tutorials',
  url: 'https://raventutorials.com',
  logo: 'https://raventutorials.com/logo.png',
  description: 'Premier online learning and classroom coaching platform for Board exams, JEE, and NEET preparation.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Patna',
    addressRegion: 'Bihar',
    addressCountry: 'India',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${plusJakarta.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${plusJakarta.className} font-sans antialiased selection:bg-emerald-500 selection:text-white`}>
        <AdminProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#fff',
                borderRadius: '12px',
                padding: '16px',
              },
              success: {
                style: {
                  background: '#059669',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#059669',
                },
              },
              error: {
                style: {
                  background: '#dc2626',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#dc2626',
                },
              },
            }}
          />
        </AdminProvider>
      </body>
    </html>
  );
}


