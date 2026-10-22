/**
 * Client-Side E-Commerce Analytics Engine
 * Supports Meta Pixel (with Event Deduplication) & Google Tag Manager (GTM)
 * Automatically syncs browser-side events with Server-Side CAPI.
 * Features deduplication guards to ensure events never double-fire.
 */

// In-memory deduplication cache to prevent React strict-mode double firing
const firedEventsCache = new Set<string>();

/**
 * Generates an event ID for Meta Pixel + CAPI Deduplication
 */
export function generateEventId(prefix: string = 'evt'): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${ts}_${rand}`;
}

/**
 * Dispatches an event to the backend server-side CAPI proxy
 */
async function dispatchServerCapi(payload: {
  eventName: string;
  eventId: string;
  url?: string;
  customData?: Record<string, any>;
  customer?: Record<string, any>;
}) {
  try {
    if (typeof window === 'undefined') return;
    const body = {
      ...payload,
      url: payload.url || window.location.href
    };

    // Use sendBeacon if available for non-blocking unload safety, else fetch
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
      navigator.sendBeacon('/api/public/tracking/event', blob);
    } else {
      fetch('/api/public/tracking/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true
      }).catch(() => {});
    }
  } catch (e) {
    // Non-blocking fail-safe
  }
}

/**
 * 1. Track PageView
 */
export function trackPageView(url?: string) {
  if (typeof window === 'undefined') return;
  const currentPath = url || window.location.pathname;
  
  // Guard against duplicate firing within same navigation tick
  const cacheKey = `pageview_${currentPath}_${Math.floor(Date.now() / 2000)}`;
  if (firedEventsCache.has(cacheKey)) return;
  firedEventsCache.add(cacheKey);

  const eventId = generateEventId('pv');

  // 1. Meta Pixel
  if (typeof (window as any).fbq === 'function') {
    (window as any).fbq('track', 'PageView', {}, { eventID: eventId });
  }

  // 2. Google Tag Manager
  if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push({
      event: 'page_view',
      page_path: currentPath,
      event_id: eventId
    });
  }

  // 3. Server-Side CAPI
  dispatchServerCapi({
    eventName: 'PageView',
    eventId,
    url: window.location.href
  });
}

/**
 * 2. Track ViewContent (Product Details / Landing Page)
 */
export function trackViewContent(product: {
  id: number | string;
  name: string;
  price?: number | string | null;
  category_name?: string;
}) {
  if (typeof window === 'undefined' || !product || !product.id) return;

  const cacheKey = `viewcontent_${product.id}_${Math.floor(Date.now() / 3000)}`;
  if (firedEventsCache.has(cacheKey)) return;
  firedEventsCache.add(cacheKey);

  const eventId = `vc_${product.id}_${Date.now()}`;
  const priceNum = Number(product.price) || 0;

  const customData = {
    content_name: product.name,
    content_ids: [String(product.id)],
    content_type: 'product',
    value: priceNum,
    currency: 'BDT'
  };

  // 1. Meta Pixel
  if (typeof (window as any).fbq === 'function') {
    (window as any).fbq('track', 'ViewContent', customData, { eventID: eventId });
  }

  // 2. Google Tag Manager
  if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push({
      event: 'view_item',
      event_id: eventId,
      ecommerce: {
        currency: 'BDT',
        value: priceNum,
        items: [{
          item_id: String(product.id),
          item_name: product.name,
          item_category: product.category_name || 'General',
          price: priceNum,
          quantity: 1
        }]
      }
    });
  }

  // 3. Server-Side CAPI
  dispatchServerCapi({
    eventName: 'ViewContent',
    eventId,
    customData
  });
}

/**
 * 3. Track AddToCart
 */
export function trackAddToCart(product: {
  id: number | string;
  name: string;
  price?: number | string | null;
  category_name?: string;
}, quantity: number = 1) {
  if (typeof window === 'undefined' || !product) return;

  const eventId = `atc_${product.id}_${Date.now()}`;
  const priceNum = Number(product.price) || 0;
  const totalValue = priceNum * quantity;

  const customData = {
    content_name: product.name,
    content_ids: [String(product.id)],
    content_type: 'product',
    value: totalValue,
    currency: 'BDT',
    num_items: quantity
  };

  // 1. Meta Pixel
  if (typeof (window as any).fbq === 'function') {
    (window as any).fbq('track', 'AddToCart', customData, { eventID: eventId });
  }

  // 2. Google Tag Manager
  if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push({
      event: 'add_to_cart',
      event_id: eventId,
      ecommerce: {
        currency: 'BDT',
        value: totalValue,
        items: [{
          item_id: String(product.id),
          item_name: product.name,
          item_category: product.category_name || 'General',
          price: priceNum,
          quantity: quantity
        }]
      }
    });
  }

  // 3. Server-Side CAPI
  dispatchServerCapi({
    eventName: 'AddToCart',
    eventId,
    customData
  });
}

/**
 * 4. Track InitiateCheckout
 */
export function trackInitiateCheckout(items: Array<{
  product_id?: number | string;
  id?: number | string;
  name?: string;
  price?: number | string | null;
  quantity?: number;
}>, totalAmount: number) {
  if (typeof window === 'undefined' || !items || items.length === 0) return;

  const cacheKey = `initiate_checkout_${Math.floor(Date.now() / 3000)}`;
  if (firedEventsCache.has(cacheKey)) return;
  firedEventsCache.add(cacheKey);

  const eventId = generateEventId('ic');
  const contentIds = items.map(i => String(i.product_id || i.id));
  const numItems = items.reduce((sum, i) => sum + (i.quantity || 1), 0);

  const customData = {
    content_ids: contentIds,
    content_type: 'product',
    num_items: numItems,
    value: Number(totalAmount) || 0,
    currency: 'BDT'
  };

  // 1. Meta Pixel
  if (typeof (window as any).fbq === 'function') {
    (window as any).fbq('track', 'InitiateCheckout', customData, { eventID: eventId });
  }

  // 2. Google Tag Manager
  if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push({
      event: 'begin_checkout',
      event_id: eventId,
      ecommerce: {
        currency: 'BDT',
        value: Number(totalAmount) || 0,
        items: items.map(i => ({
          item_id: String(i.product_id || i.id),
          item_name: i.name || 'Product',
          price: Number(i.price) || 0,
          quantity: i.quantity || 1
        }))
      }
    });
  }

  // 3. Server-Side CAPI
  dispatchServerCapi({
    eventName: 'InitiateCheckout',
    eventId,
    customData
  });
}

/**
 * 5. Track Purchase (Order Confirmed)
 * Strictly guards against double firing on refresh using sessionStorage!
 */
export function trackPurchase(order: {
  orderNumber: string;
  totalAmount: number | string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  city?: string;
  items: Array<{
    product_id?: number | string;
    id?: number | string;
    name?: string;
    price?: number | string | null;
    quantity?: number;
  }>;
}) {
  if (typeof window === 'undefined' || !order || !order.orderNumber) return;

  // Strict anti-duplicate guard: Never send purchase twice for same orderNumber
  const storageKey = `tracked_purchase_${order.orderNumber}`;
  if (sessionStorage.getItem(storageKey)) {
    console.log(`[Analytics] Purchase ${order.orderNumber} already tracked. Skipping duplicate.`);
    return;
  }
  sessionStorage.setItem(storageKey, '1');

  // Exact matching event_id as sent by backend CAPI
  const eventId = `purchase_${order.orderNumber}`;
  const totalVal = Number(order.totalAmount) || 0;
  const contentIds = order.items.map(i => String(i.product_id || i.id));
  const numItems = order.items.reduce((sum, i) => sum + (i.quantity || 1), 0);

  const customData = {
    content_ids: contentIds,
    content_type: 'product',
    num_items: numItems,
    value: totalVal,
    currency: 'BDT',
    order_id: order.orderNumber
  };

  // 1. Meta Browser Pixel
  if (typeof (window as any).fbq === 'function') {
    (window as any).fbq('track', 'Purchase', customData, { eventID: eventId });
  }

  // 2. Google Tag Manager
  if (Array.isArray((window as any).dataLayer)) {
    (window as any).dataLayer.push({
      event: 'purchase',
      event_id: eventId,
      ecommerce: {
        transaction_id: order.orderNumber,
        value: totalVal,
        currency: 'BDT',
        items: order.items.map(i => ({
          item_id: String(i.product_id || i.id),
          item_name: i.name || 'Product',
          price: Number(i.price) || 0,
          quantity: i.quantity || 1
        }))
      }
    });
  }

  // Note: Backend server automatically dispatched CAPI event with event_id: "purchase_" + orderNumber on order insertion.
  // Both browser and server events will match and deduplicate perfectly in Meta Events Manager!
}
