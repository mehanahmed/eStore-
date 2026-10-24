/**
 * PayStation Payment Gateway Integration Helper (Bangladesh PSO)
 * Supports Sandbox and Production (Live) environments
 * Official Docs: https://paystation.com.bd/documentation
 */

const SANDBOX_BASE_URL = 'https://sandbox.paystation.com.bd';
const LIVE_BASE_URL = 'https://api.paystation.com.bd';

// Official PayStation Sandbox Test Credentials
const DEFAULT_SANDBOX_MERCHANT_ID = '104-1653730183';
const DEFAULT_SANDBOX_PASSWORD = 'gamecoderstorepass';

/**
 * Resolve PayStation configuration from environment variables or optional settings object
 * Priority: process.env > settingsOverride > sandbox defaults
 */
function getPaystationConfig(settingsOverride = {}) {
    const rawEnv = (process.env.PAYSTATION_ENV || settingsOverride.paystation_env || 'sandbox').toLowerCase().trim();
    const isLive = rawEnv === 'live' || rawEnv === 'production' || rawEnv === 'prod';
    const environment = isLive ? 'live' : 'sandbox';
    const baseUrl = isLive ? LIVE_BASE_URL : SANDBOX_BASE_URL;

    let merchantId = process.env.PAYSTATION_MERCHANT_ID || settingsOverride.paystation_merchant_id || '';
    let password = process.env.PAYSTATION_PASSWORD || settingsOverride.paystation_password || '';

    // If sandbox and no custom credentials provided, use official test credentials
    if (!isLive) {
        if (!merchantId) merchantId = DEFAULT_SANDBOX_MERCHANT_ID;
        if (!password) password = DEFAULT_SANDBOX_PASSWORD;
    }

    return {
        environment,
        isLive,
        isSandbox: !isLive,
        baseUrl,
        merchantId: merchantId.trim(),
        password: password.trim()
    };
}

/**
 * Initiate a payment session on PayStation Hosted Checkout
 * @param {Object} params
 * @param {string} params.invoiceNumber Unique invoice or order number
 * @param {number} params.amount Total payable amount in BDT
 * @param {string} params.customerName Customer full name
 * @param {string} params.customerPhone Customer mobile number (e.g. 017XXXXXXXX)
 * @param {string} [params.customerEmail] Customer email (optional)
 * @param {string} params.customerAddress Detailed shipping/billing address
 * @param {string} params.callbackUrl Callback redirect URL on our site
 * @param {string} [params.reference] Internal reference (e.g. Order ID)
 * @param {string} [params.checkoutItems] Description or item names
 * @param {Object} [settingsOverride] Optional db settings
 */
async function initiatePayment(params, settingsOverride = {}) {
    const config = getPaystationConfig(settingsOverride);

    if (!config.merchantId || !config.password) {
        return {
            success: false,
            error: `PayStation credentials missing for ${config.environment} environment.`
        };
    }

    const payload = {
        invoice_number: String(params.invoiceNumber),
        currency: 'BDT',
        payment_amount: Number(params.amount),
        cust_name: String(params.customerName || 'Customer'),
        cust_phone: String(params.customerPhone || '01700000000'),
        cust_email: params.customerEmail ? String(params.customerEmail) : 'customer@store.com',
        cust_address: String(params.customerAddress || 'Dhaka, Bangladesh'),
        reference: String(params.reference || params.invoiceNumber),
        callback_url: String(params.callbackUrl),
        checkout_items: String(params.checkoutItems || 'Order Payment'),
        merchantId: config.merchantId,
        password: config.password
    };

    const endpoint = `${config.baseUrl}/initiate-payment`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'ColorHut-Store/1.0'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // Successful link creation returns status_code: "200", status: "success", payment_url
        if (data && (data.status === 'success' || data.status_code === '200') && data.payment_url) {
            return {
                success: true,
                paymentUrl: data.payment_url,
                invoiceNumber: data.invoice_number || payload.invoice_number,
                paymentAmount: data.payment_amount || payload.payment_amount,
                environment: config.environment,
                raw: data
            };
        }

        const errMsg = data?.message || data?.error || 'Failed to initialize PayStation gateway';
        return {
            success: false,
            error: errMsg,
            statusCode: data?.status_code,
            raw: data
        };
    } catch (err) {
        console.error('[PayStation] Initiate payment network error:', err);
        return {
            success: false,
            error: err.message || 'Network error communicating with PayStation'
        };
    }
}

/**
 * Verify a completed transaction with PayStation server-to-server
 * @param {Object} params
 * @param {string} params.invoiceNumber
 * @param {string} [params.trxId] Optional transaction ID returned by callback
 * @param {Object} [settingsOverride]
 */
async function verifyPayment(params, settingsOverride = {}) {
    const config = getPaystationConfig(settingsOverride);

    if (!config.merchantId) {
        return {
            success: false,
            verified: false,
            error: 'Merchant ID missing for PayStation verification'
        };
    }

    const endpoint = `${config.baseUrl}/transaction-status`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'merchantId': config.merchantId,
                'User-Agent': 'ColorHut-Store/1.0'
            },
            body: JSON.stringify({
                invoice_number: String(params.invoiceNumber)
            })
        });

        const data = await response.json();

        if (data && data.status_code === '200' && data.data) {
            const trx = data.data;
            const statusLower = (trx.trx_status || '').toLowerCase();
            const isSuccessful = statusLower === 'successful' || statusLower === 'success';

            return {
                success: true,
                verified: isSuccessful,
                status: trx.trx_status,
                trxId: trx.trx_id || params.trxId || null,
                paymentAmount: trx.payment_amount,
                payerMobile: trx.payer_mobile_no,
                paymentMethod: trx.payment_method,
                orderDateTime: trx.order_date_time,
                invoiceNumber: trx.invoice_number,
                environment: config.environment,
                data: trx,
                raw: data
            };
        }

        return {
            success: false,
            verified: false,
            error: data?.message || 'Transaction could not be verified by PayStation',
            raw: data
        };
    } catch (err) {
        console.error('[PayStation] Verify transaction error:', err);
        return {
            success: false,
            verified: false,
            error: err.message || 'Network error verifying transaction with PayStation'
        };
    }
}

module.exports = {
    getPaystationConfig,
    initiatePayment,
    verifyPayment,
    DEFAULT_SANDBOX_MERCHANT_ID,
    DEFAULT_SANDBOX_PASSWORD
};
