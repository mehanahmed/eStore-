import React from 'react';
import './globals.css';
import { Metadata, Viewport } from 'next';

import ContactMotion from './ContactMotion';
import { TrackingHead, TrackingBody, TrafficTracker } from './TrackingScripts';
import ApolloProviderWrapper from './ApolloProviderWrapper';

import mysql from 'mysql2/promise';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
            database: process.env.DB_NAME || 'ecommerce_db'
        });

        interface SiteSetting {
            setting_key: string;
            setting_value: string;
        }

        const [rows] = await connection.query('SELECT * FROM site_settings');
        await connection.end();

        const settings: Record<string, string> = {};
        const rowsTyped = rows as SiteSetting[];
        if (Array.isArray(rowsTyped)) {
            rowsTyped.forEach((row) => {
                const key = row.setting_key;
                const value = row.setting_value;
                if (key) {
                    settings[key] = value || '';
                }
            });
        }

        const title = settings.home_title || 'Color Hut - Your Trusted Partner for Branding & Creative Solutions';
        const description = settings.home_description || 'Shop for unique gifts, restaurant packaging, and custom branding solutions. Color Hut is your dedicated partner for logo design, menu printing, and premium creative work in Bangladesh.';
        const keywords = settings.site_keywords || 'Branding, Logo Design, Menu Printing, Packaging, Gift Shop, Bangladesh, Creative Studio';

        return {
            metadataBase: new URL('https://store.colorhutbd.xyz'),
            title: title,
            description: description,
            keywords: keywords,
            alternates: {
                canonical: '/',
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
            openGraph: {
                title: title,
                description: description,
                url: '/',
                siteName: 'Color Hut',
                images: [
                    {
                        url: '/banner.jpg?v=1',
                        width: 1200,
                        height: 630,
                        alt: 'Color Hut Branding',
                    },
                ],
                locale: 'en_US',
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: title,
                description: description,
                images: ['/banner.jpg?v=1'],
            },
            other: {
                'fb:app_id': '966242223397117',
            },
        };
    } catch (err) {
        console.error('Error generating metadata:', err);
        return {
            metadataBase: new URL('https://store.colorhutbd.xyz'),
            title: 'Color Hut - Your Trusted Partner for Branding & Creative Solutions',
            description: 'Shop for unique gifts, restaurant packaging, and custom branding solutions. Color Hut is your dedicated partner for logo design, menu printing, and premium creative work in Bangladesh.',
            keywords: 'Branding, Logo Design, Menu Printing, Packaging, Gift Shop, Bangladesh, Creative Studio',
            alternates: {
                canonical: '/',
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
            openGraph: {
                title: 'Color Hut - Branding & Creative Solutions',
                description: 'Premium creative agency in Bangladesh specializing in logo design and branding.',
                url: '/',
                siteName: 'Color Hut',
                images: [
                    {
                        url: '/banner.jpg?v=1',
                        width: 1200,
                        height: 630,
                        alt: 'Color Hut Branding',
                    },
                ],
                locale: 'en_US',
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: 'Color Hut - Branding & Creative Solutions',
                description: 'Premium creative agency in Bangladesh specializing in logo design and branding.',
                images: ['/banner.jpg?v=1'],
            },
            other: {
                'fb:app_id': '966242223397117',
            },
        };
    }
}


export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Color Hut",
        "url": "https://store.colorhutbd.xyz/",
        "logo": "https://store.colorhutbd.xyz/image/logo.png",
        "description": "Premium creative agency in Bangladesh specializing in logo design, menu printing, and custom branding solutions.",
        "sameAs": [
            "https://www.facebook.com/colorhutbd",
            "https://www.instagram.com/colorhutbd"
        ]
    };

    const websiteJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Color Hut",
        "url": "https://store.colorhutbd.xyz/",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://store.colorhutbd.xyz/all?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };

    return (
        <html lang="en" prefix="og: http://ogp.me/ns# website: http://ogp.me/ns/website#" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
                />
                <TrackingHead />
            </head>
            <body itemScope itemType="http://schema.org/WebPage" vocab="http://schema.org/" {...{ typeof: "WebPage" }} suppressHydrationWarning>
                <TrackingBody />
                <TrafficTracker />
                <ApolloProviderWrapper>
                    {children}
                </ApolloProviderWrapper>
                <ContactMotion />
            </body>
        </html>
    )
}
