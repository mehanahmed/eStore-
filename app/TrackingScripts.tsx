'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { trackPageView } from './lib/analytics';

export function TrackingHead() {
    const [config, setConfig] = useState<{
        pixel_id: string;
        pixel_enabled: boolean;
        gtm_id: string;
        gtm_enabled: boolean;
    } | null>(null);

    useEffect(() => {
        fetch('/api/public/config')
            .then(res => res.json())
            .then(data => {
                setConfig(data);
                // Immediately capture fbclid into _fbc cookie if arriving from a Meta ad
                if (typeof window !== 'undefined') {
                    const params = new URLSearchParams(window.location.search);
                    const fbclid = params.get('fbclid');
                    if (fbclid) {
                        const fbc = `fb.1.${Date.now()}.${fbclid}`;
                        document.cookie = `_fbc=${fbc}; path=/; max-age=${90 * 24 * 3600}; SameSite=Lax`;
                    }
                }
            })
            .catch(err => console.error('Failed to load tracking config:', err));
    }, []);

    if (!config) return null;

    return (
        <>
            {/* Google Tag Manager Header Script */}
            {config.gtm_enabled && config.gtm_id && (
                <Script id="gtm-script" strategy="afterInteractive">
                    {`
                        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                        })(window,document,'script','dataLayer','${config.gtm_id}');
                    `}
                </Script>
            )}

            {/* Meta Pixel Base Code (PageView is deduplicated via CAPI + browser eventID) */}
            {config.pixel_enabled && config.pixel_id && (
                <Script id="fb-pixel" strategy="afterInteractive">
                    {`
                        !function(f,b,e,v,n,t,s)
                        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                        n.queue=[];t=b.createElement(e);t.async=!0;
                        t.src=v;s=b.getElementsByTagName(e)[0];
                        s.parentNode.insertBefore(t,s)}(window, document,'script',
                        'https://connect.facebook.net/en_US/fbevents.js');
                        fbq('init', '${config.pixel_id}');
                    `}
                </Script>
            )}
        </>
    );
}

export function TrackingBody() {
    const [config, setConfig] = useState<{
        pixel_id: string;
        pixel_enabled: boolean;
        gtm_id: string;
        gtm_enabled: boolean;
    } | null>(null);

    useEffect(() => {
        fetch('/api/public/config')
            .then(res => res.json())
            .then(data => setConfig(data))
            .catch(err => console.error('Failed to load tracking config:', err));
    }, []);

    if (!config) return null;

    return (
        <>
            {/* Google Tag Manager (noscript fallback) */}
            {config.gtm_enabled && config.gtm_id && (
                <noscript>
                    <iframe
                        src={`https://www.googletagmanager.com/ns.html?id=${config.gtm_id}`}
                        height="0"
                        width="0"
                        style={{ display: 'none', visibility: 'hidden' }}
                    />
                </noscript>
            )}

            {/* Meta Pixel Noscript */}
            {config.pixel_enabled && config.pixel_id && (
                <noscript>
                    <img
                        height="1"
                        width="1"
                        style={{ display: 'none' }}
                        src={`https://www.facebook.com/tr?id=${config.pixel_id}&ev=PageView&noscript=1`}
                    />
                </noscript>
            )}
        </>
    );
}

export function TrafficTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Exclude all admin panel routes from client-side traffic tracking
        if (!pathname || pathname.startsWith('/admin')) {
            return;
        }

        // 1. Capture UTM from URL query parameters and persist it in localStorage
        const params = new URLSearchParams(window.location.search);
        const utm = params.get('utm');
        if (utm) {
            localStorage.setItem('utm_campaign', utm);
        }

        // 2. Capture fbclid to _fbc cookie immediately if arriving from Meta ads
        const fbclid = params.get('fbclid');
        if (fbclid) {
            const fbc = `fb.1.${Date.now()}.${fbclid}`;
            document.cookie = `_fbc=${fbc}; path=/; max-age=${90 * 24 * 3600}; SameSite=Lax`;
        }

        // 3. Dispatch Deduplicated PageView to Browser Pixel, GTM, and Server CAPI
        trackPageView(pathname);

        // 4. Fetch public meeting settings (IP checking + campaign config)
        const checkMeetingStatus = async () => {
            try {
                const activeUtm = utm || localStorage.getItem('utm_campaign') || '';
                const url = activeUtm 
                    ? `/api/public/campaign-url?utm=${encodeURIComponent(activeUtm)}` 
                    : '/api/public/campaign-url';
                
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.meeting === 'hide') {
                        const days = data.days ? parseInt(data.days, 10) : 1;
                        const expirationTime = days === 0 ? 0 : Date.now() + days * 24 * 60 * 60 * 1000;
                        localStorage.setItem('meeting_override', 'hide');
                        localStorage.setItem('meeting_override_expires', String(expirationTime));
                        
                        // Dispatch custom event to notify active pages to hide the popup instantly
                        window.dispatchEvent(new Event('meeting_override_updated'));
                    }
                }
            } catch (err) {
                console.error('Failed to load campaign/meeting config:', err);
            }
        };
        checkMeetingStatus();

        // 5. Track visit
        const trackVisit = async () => {
            try {
                const fullPath = window.location.pathname + window.location.search;
                await fetch('/api/public/track', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        source: document.referrer,
                        path: fullPath
                    })
                });
            } catch (err) {
                console.error('Failed to log client-side page traffic:', err);
            }
        };

        trackVisit();
    }, [pathname]);

    // 6. Persistence of UTM parameter across clicks and programmatic transitions
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Global link click interceptor
        const handleLinkClick = (e: MouseEvent) => {
            let target = e.target as HTMLElement | null;
            while (target && target.tagName !== 'A') {
                target = target.parentElement;
            }
            if (target) {
                const anchor = target as HTMLAnchorElement;
                if (anchor.href) {
                    const activeUtm = localStorage.getItem('utm_campaign');
                    if (activeUtm) {
                        try {
                            const url = new URL(anchor.href);
                            if (url.origin === window.location.origin) {
                                if (!url.searchParams.has('utm') && !url.pathname.startsWith('/admin') && !url.pathname.startsWith('/api')) {
                                    url.searchParams.set('utm', activeUtm);
                                    anchor.href = url.pathname + url.search + url.hash;
                                }
                            }
                        } catch (err) {}
                    }
                }
            }
        };

        document.addEventListener('click', handleLinkClick, true);

        // Global pushState interceptor for client-side programmatic route changes (e.g. router.push)
        const originalPush = window.history.pushState;
        window.history.pushState = function (state, title, url) {
            const activeUtm = localStorage.getItem('utm_campaign');
            let finalUrl = url;
            if (activeUtm && url && typeof url === 'string') {
                try {
                    const parsedUrl = new URL(url, window.location.origin);
                    if (!parsedUrl.searchParams.has('utm') && !parsedUrl.pathname.startsWith('/admin') && !parsedUrl.pathname.startsWith('/api')) {
                        parsedUrl.searchParams.set('utm', activeUtm);
                        finalUrl = parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
                    }
                } catch (e) {}
            }
            return originalPush.apply(this, [state, title, finalUrl]);
        };

        // Global replaceState interceptor
        const originalReplace = window.history.replaceState;
        window.history.replaceState = function (state, title, url) {
            const activeUtm = localStorage.getItem('utm_campaign');
            let finalUrl = url;
            if (activeUtm && url && typeof url === 'string') {
                try {
                    const parsedUrl = new URL(url, window.location.origin);
                    if (!parsedUrl.searchParams.has('utm') && !parsedUrl.pathname.startsWith('/admin') && !parsedUrl.pathname.startsWith('/api')) {
                        parsedUrl.searchParams.set('utm', activeUtm);
                        finalUrl = parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
                    }
                } catch (e) {}
            }
            return originalReplace.apply(this, [state, title, finalUrl]);
        };

        return () => {
            document.removeEventListener('click', handleLinkClick, true);
            window.history.pushState = originalPush;
            window.history.replaceState = originalReplace;
        };
    }, []);

    return null;
}
