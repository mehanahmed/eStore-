/**
 * Meta Conversions API (CAPI) Integration Module
 * Graph API v26.0 (Node.js reference implementation)
 * Includes event deduplication, SHA-256 customer data hashing, and proxy IP extraction.
 */

const crypto = require('crypto');

function sha256(v) {
  if (!v) return null;
  return crypto.createHash('sha256').update(String(v), 'utf8').digest('hex');
}

/**
 * Normalizes Bangladeshi phone numbers into the 8801XXXXXXXXX international format
 */
function normalizeBdPhone(phone) {
  if (!phone) return null;
  let d = String(phone).replace(/\D/g, '');
  if (d.startsWith('880')) {
    // already starts with country code
  } else if (d.startsWith('0')) {
    d = '88' + d;
  } else if (d.length === 10 && d.startsWith('1')) {
    d = '880' + d;
  }
  return d.length === 13 ? d : (d.length >= 10 ? d : null);
}

/**
 * Extracts true visitor IP address behind Cloudflare, Nginx, or reverse proxies
 */
function getClientIp(req) {
  if (!req || !req.headers) return '127.0.0.1';
  const h = req.headers;
  if (h['cf-connecting-ip']) return String(h['cf-connecting-ip']).trim();
  if (h['x-forwarded-for']) return String(h['x-forwarded-for']).split(',')[0].trim();
  if (h['x-real-ip']) return String(h['x-real-ip']).trim();
  return req.socket?.remoteAddress || '127.0.0.1';
}

/**
 * Extracts cookies from request headers
 */
function parseCookies(req) {
  const list = {};
  const cookieHeader = req?.headers?.cookie;
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    const name = parts[0]?.trim();
    if (!name) return;
    const value = parts.slice(1).join('=').trim();
    list[name] = decodeURIComponent(value);
  });
  return list;
}

/**
 * Builds hashed user_data payload complying with Meta Event Match Quality standards
 */
function buildUserData({ ip, userAgent, fbp, fbc, email, phone, firstName, lastName, city, externalId }) {
  const ud = {
    client_ip_address: ip || '127.0.0.1',
    client_user_agent: userAgent || 'Mozilla/5.0'
  };

  if (fbp) ud.fbp = fbp;
  if (fbc) ud.fbc = fbc;

  const em = email ? String(email).trim().toLowerCase() : null;
  if (em) ud.em = [sha256(em)];

  const ph = normalizeBdPhone(phone);
  if (ph) ud.ph = [sha256(ph)];

  if (firstName) {
    ud.fn = [sha256(String(firstName).trim().toLowerCase())];
  }
  if (lastName) {
    ud.ln = [sha256(String(lastName).trim().toLowerCase())];
  }
  if (city) {
    ud.ct = [sha256(String(city).trim().toLowerCase().replace(/\s+/g, ''))];
  }

  ud.country = [sha256('bd')];

  if (externalId) {
    ud.external_id = [sha256(String(externalId))];
  }

  return ud;
}

/**
 * Sends a server-side event to Meta Conversions API via Graph API
 */
async function sendMetaCapiEvent({
  pixelId,
  accessToken,
  testEventCode,
  graphVersion = 'v26.0',
  eventName,
  eventId,
  url,
  userData,
  customData
}) {
  if (!pixelId || !accessToken) {
    return { skipped: true, reason: 'Missing Meta Pixel ID or CAPI Access Token' };
  }

  const endpoint = `https://graph.facebook.com/${graphVersion}/${pixelId}/events`;

  const payload = {
    data: [{
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: 'website',
      event_source_url: url || 'https://colorhutbd.xyz',
      user_data: userData || {},
      ...(customData && { custom_data: customData })
    }],
    access_token: accessToken,
    ...(testEventCode ? { test_event_code: testEventCode } : {})
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    if (!res.ok) {
      console.error(`[Meta CAPI] Error ${res.status}:`, JSON.stringify(json));
      return { success: false, status: res.status, error: json };
    }

    return { success: true, response: json };
  } catch (err) {
    console.error('[Meta CAPI] Network / Server Error:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sha256,
  normalizeBdPhone,
  getClientIp,
  parseCookies,
  buildUserData,
  sendMetaCapiEvent
};
