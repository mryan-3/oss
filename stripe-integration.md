# Stripe Integration Documentation

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Setup](#setup)
4. [Implementation Details](#implementation-details)
5. [Webhook Handling](#webhook-handling)
6. [Database Models](#database-models)
7. [Key-Value Store](#key-value-store)
8. [Testing](#testing)
9. [Production Deployment](#production-deployment)
10. [Troubleshooting](#troubleshooting)

## Overview

This documentation covers the implementation of Stripe payment processing for subscription and one-time payments. The system supports:
- Subscription-based payments with different plan tiers
- One-time payments (e.g., VIP purchases)
- Webhook handling for real-time payment updates
- Database synchronization
- Secure payment processing

## Prerequisites

1. Stripe Account Setup:
   - Create a Stripe account at https://stripe.com
   - Get your API keys from the Stripe Dashboard
   - Set up your products and price plans in Stripe

2. Environment Variables:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3000
```

## Setup

### Local Development Setup

1. Install Stripe CLI:
```bash
# For macOS
brew install stripe/stripe-cli/stripe

# For Windows (using scoop)
scoop install stripe

# For Linux
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe
```

2. Login to Stripe CLI:
```bash
stripe login
```

3. Start webhook forwarding:
```bash
stripe listen --forward-to localhost:8001/api/v1/payments/webhook
```

### Production Setup

1. Configure webhook endpoint in Stripe Dashboard:
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/v1/payments/webhook`
   - Select events to listen for (see [Webhook Events](#webhook-events))
   - Save the webhook signing secret

## Implementation Details

### Express App Setup

Here's how to properly set up your Express application to handle Stripe webhooks:

1. **Main App Configuration** (`app.ts`):
```typescript
import express from 'express'
import cors from 'cors'
import { verifyStripeWebhook } from './middleware/stripe-webhook.middleware'
import { handleWebhook } from './controllers/payment.Controller'
import router from './router/router' // Your main router

const app = express()

// CORS configuration - include stripe-signature header
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Origin',
      'X-Requested-With',
      'Accept',
      'stripe-signature', // Important for Stripe webhooks
    ],
  }),
)

// Standard middleware
app.use(express.json()) // This will parse most requests as JSON
app.use(express.urlencoded({ extended: true }))

// Your routes (including payment routes)
app.use('/', router)
```

2. **Payment Router Setup** (`router/v1/paymentGroup.ts`):
```typescript
import express from 'express'
import { Router } from 'express'
import {
  createCheckoutSession,
  createVipCheckoutSession,
  syncAfterSuccess,
  handleWebhook,
  getUserSubscriptionInfo
} from '../../controllers/payment.Controller'
import { verifyStripeWebhook } from '../../middleware/stripe-webhook.middleware'

const router = Router()

// Standard payment endpoints (use JSON parsing)
router.post('/create-checkout-session', createCheckoutSession)
router.post('/create-vip-checkout-session', createVipCheckoutSession)
router.post('/sync', syncAfterSuccess)
router.get('/:userId/subscription', getUserSubscriptionInfo)

// Webhook endpoint with raw body parsing
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }), // Critical: Parse as raw Buffer
  verifyStripeWebhook,                        // Verify signature
  handleWebhook                              // Handle the event
)

export default router
```

3. **Critical Setup Notes:**
   - **Route Order**: The webhook route with `express.raw()` must be defined **after** `express.json()` in your app
   - **Selective Raw Parsing**: Only the webhook route should use `express.raw()` - other routes should use JSON parsing
   - **Headers**: Ensure `stripe-signature` is included in your CORS allowed headers
   - **URL Path**: The webhook URL in your Stripe dashboard should match your route exactly

### API Endpoints

1. Create Checkout Session (Subscription):
```typescript
POST /api/v1/payments/create-checkout-session
Body: {
  priceId: string;  // Stripe Price ID
  userId: string;   // Your system's user ID
}
```

2. Create VIP Checkout Session (One-time payment):
```typescript
POST /api/v1/payments/create-vip-checkout-session
Body: {
  priceId: string;     // Stripe Price ID
  userId: string;      // Your system's user ID
  vipOptionId: string; // VIP package identifier
}
```

3. Sync Subscription Data:
```typescript
POST /api/v1/payments/sync
Body: {
  userId: string;
}
```

4. Get User Subscription:
```typescript
GET /api/v1/payments/:userId/subscription
```

### Key-Value (KV) Store Usage

The KV store is used for fast access to user-stripe relationships and subscription data:

1. User to Stripe Customer Mapping:
```typescript
// Store
await kv.set(`stripe:user:${userId}`, stripeCustomerId);

// Retrieve
const stripeCustomerId = await kv.get<string>(`stripe:user:${userId}`);
```

2. Subscription Data:
```typescript
// Store
await kv.set(`stripe:customer:${customerId}`, subscriptionData);

// Retrieve
const subData = await kv.get<STRIPE_SUB_CACHE>(`stripe:customer:${customerId}`);
```

## Key-Value Store Implementation

### Overview
The Key-Value (KV) store is used as a fast, in-memory cache layer between Stripe and our database. We provide two implementations:
1. Redis-based (for production)
2. Node-Cache (for development or smaller applications)

### Implementation Option 1: Redis

1. KV Store Setup (`utils/kv-store.ts`):
```typescript
import { Redis } from 'ioredis';
import { Logger } from 'borgen';

// Initialize Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
});

// KV Store class for type-safe operations
export class KVStore {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      Logger.error({ message: `KV Store get error: ${error}` });
      return null;
    }
  }

  async set(key: string, value: any, expirySeconds?: number): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      if (expirySeconds) {
        await redis.setex(key, expirySeconds, stringValue);
      } else {
        await redis.set(key, stringValue);
      }
    } catch (error) {
      Logger.error({ message: `KV Store set error: ${error}` });
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      Logger.error({ message: `KV Store delete error: ${error}` });
    }
  }
}

export const kv = new KVStore();
```

2. Subscription Cache Type (`utils/stripe.ts`):
```typescript
export interface STRIPE_SUB_CACHE {
  subscriptionId?: string;
  status: 'active' | 'canceled' | 'none';
  priceId?: string;
  currentPeriodEnd?: number;
  currentPeriodStart?: number;
  cancelAtPeriodEnd: boolean;
  paymentMethod?: {
    brand: string | null;
    last4: string | null;
  } | null;
}
```

### Usage Examples

1. Customer ID Mapping:
```typescript
// Store customer mapping when creating new customer
const newCustomer = await stripe.customers.create({
  metadata: { userId: userId }
});
await kv.set(`stripe:user:${userId}`, newCustomer.id);

// Retrieve customer ID
const customerId = await kv.get<string>(`stripe:user:${userId}`);
if (!customerId) {
  // Handle case where mapping doesn't exist
}
```

2. Subscription Data Caching:
```typescript
// Store subscription data
const subData: STRIPE_SUB_CACHE = {
  subscriptionId: subscription.id,
  status: subscription.status,
  priceId: subscription.items.data[0].price.id,
  currentPeriodEnd: subscription.current_period_end,
  currentPeriodStart: subscription.current_period_start,
  cancelAtPeriodEnd: subscription.cancel_at_period_end,
  paymentMethod: {
    brand: subscription.default_payment_method?.card?.brand ?? null,
    last4: subscription.default_payment_method?.card?.last4 ?? null,
  }
};
await kv.set(`stripe:customer:${customerId}`, subData);

// Retrieve subscription data
const cachedSub = await kv.get<STRIPE_SUB_CACHE>(`stripe:customer:${customerId}`);
```

### Implementation Option 2: Node-Cache

1. KV Store Setup with Node-Cache (`utils/kv-store.ts`):
```typescript
import NodeCache from 'node-cache';
import { Logger } from 'borgen';

// Initialize NodeCache with default TTL of 1 hour
const nodeCache = new NodeCache({
  stdTTL: 3600, // Default TTL in seconds
  checkperiod: 120, // Check for expired keys every 120 seconds
  useClones: false, // For better performance
});

// KV Store class for type-safe operations
export class KVStore {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = nodeCache.get<T>(key);
      return value || null;
    } catch (error) {
      Logger.error({ message: `KV Store get error: ${error}` });
      return null;
    }
  }

  async set(key: string, value: any, expirySeconds?: number): Promise<void> {
    try {
      nodeCache.set(key, value, expirySeconds);
    } catch (error) {
      Logger.error({ message: `KV Store set error: ${error}` });
    }
  }

  async delete(key: string): Promise<void> {
    try {
      nodeCache.del(key);
    } catch (error) {
      Logger.error({ message: `KV Store delete error: ${error}` });
    }
  }

  // Additional utility methods
  async flush(): Promise<void> {
    try {
      nodeCache.flushAll();
    } catch (error) {
      Logger.error({ message: `KV Store flush error: ${error}` });
    }
  }

  async getStats(): Promise<any> {
    return nodeCache.getStats();
  }
}

export const kv = new KVStore();
```

2. Installation:
```bash
npm install node-cache
# or
yarn add node-cache
# or
pnpm add node-cache
```

### Usage Examples with Node-Cache

1. Basic Usage:
```typescript
// Store data with default TTL (1 hour)
await kv.set('key', { some: 'data' });

// Store with custom TTL (5 minutes)
await kv.set('key', { some: 'data' }, 300);

// Retrieve data
const data = await kv.get('key');
```

2. Customer ID Mapping:
```typescript
// Store customer mapping
await kv.set(`stripe:user:${userId}`, customerId, 86400); // 24 hour TTL

// Retrieve customer ID
const customerId = await kv.get<string>(`stripe:user:${userId}`);
```

3. Subscription Data Caching:
```typescript
// Store subscription data
const subData: STRIPE_SUB_CACHE = {
  subscriptionId: subscription.id,
  status: subscription.status,
  priceId: subscription.items.data[0].price.id,
  currentPeriodEnd: subscription.current_period_end,
  currentPeriodStart: subscription.current_period_start,
  cancelAtPeriodEnd: subscription.cancel_at_period_end,
  paymentMethod: {
    brand: subscription.default_payment_method?.card?.brand ?? null,
    last4: subscription.default_payment_method?.card?.last4 ?? null,
  }
};

// Store with TTL set to 1 hour before subscription end
const ttl = Math.floor((subscription.current_period_end - Date.now() / 1000) - 3600);
await kv.set(`stripe:customer:${customerId}`, subData, ttl);
```

4. Cache Statistics and Monitoring:
```typescript
// Get cache statistics
const stats = await kv.getStats();
console.log('Cache Stats:', {
  keys: stats.keys,        // Total number of keys
  hits: stats.hits,        // Cache hits
  misses: stats.misses,    // Cache misses
  ksize: stats.ksize,      // Key storage size
  vsize: stats.vsize       // Value storage size
});

// Clear all cache
await kv.flush();
```

### Choosing Between Redis and Node-Cache

1. **Use Redis when**:
   - Running in production
   - Need persistence across server restarts
   - Have multiple server instances
   - Need advanced features like pub/sub
   - Have high traffic/data volume

2. **Use Node-Cache when**:
   - Developing locally
   - Running a single server instance
   - Have simpler caching needs
   - Want to avoid external dependencies
   - Have lower traffic/data volume

3. **Migration Considerations**:
   - Both implementations use the same interface
   - Switching between them requires only changing the implementation
   - No changes needed in business logic
   - Consider data migration when switching in production

## Webhook Handling

### Webhook Events
```typescript
const allowedEvents = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
  "customer.subscription.pending_update_applied",
  "customer.subscription.pending_update_expired",
  "customer.subscription.trial_will_end",
  "invoice.paid",
  "invoice.payment_failed",
  "invoice.payment_action_required",
  "invoice.upcoming",
  "invoice.marked_uncollectible",
  "invoice.payment_succeeded",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.canceled"
];
```

### Webhook Middleware

The webhook processing uses Express's built-in raw body parser and a signature verification middleware:

1. **Route-Level Raw Body Parsing** (in payment router):
```typescript
// In paymentGroup.ts
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }), // Parse raw body as Buffer
  verifyStripeWebhook,
  handleWebhook
);
```

2. **Webhook Signature Verification Middleware**:
```typescript
// In stripe-webhook.middleware.ts
export const verifyStripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the signature from the headers
    const signature = req.headers['stripe-signature'];
    
    if (!signature) {
      Logger.error({ message: 'Missing Stripe signature' });
      return res.status(400).send('Missing Stripe signature');
    }
    
    // Get the raw body (should be a Buffer from express.raw())
    const rawBody = req.body;
    
    if (!rawBody) {
      Logger.error({ message: 'Missing raw body for Stripe signature verification' });
      return res.status(400).send('Missing raw body');
    }
    
    // Verify the signature and construct the event
    req.body = stripe.webhooks.constructEvent(
      rawBody,
      signature as string,
      Config.STRIPE_WEBHOOK_SECRET
    );
    
    next();
  } catch (err: any) {
    Logger.error({ message: `Webhook signature verification failed: ${err.message}` });
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }
};
```

**Key Implementation Notes:**
- The webhook route uses `express.raw({ type: 'application/json' })` to parse the request body as a Buffer
- This must be applied **only** to the webhook route to avoid interfering with JSON parsing on other routes
- The verification middleware expects `req.body` to contain the raw Buffer
- After verification, `req.body` is replaced with the constructed Stripe event object

## Database Models

### Subscription Model
```typescript
interface ISubscription {
  userId: Types.ObjectId;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  planId: string;
  planType: PlanType;
  planName: string;
  priceId: string;
  amount: number;
  currency: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  metadata: {
    paymentMethodBrand?: string | null;
    paymentMethodLast4?: string | null;
  };
}
```

### VIP Purchase Model
```typescript
interface IVipPurchase {
  userId: Types.ObjectId;
  stripeCustomerId: string;
  vipOptionId: string;
  status: 'active' | 'expired';
  startTime: Date;
  endTime: Date;
  purchaseDate: Date;
}
```

## Testing

1. Test Webhook Locally:
```bash
# Start webhook forwarding
stripe listen --forward-to localhost:8001/api/v1/payments/webhook

# Trigger test events
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created
```

2. Test Checkout Flow:
   - Create a test product and price in Stripe Dashboard
   - Use test card numbers:
     - Success: 4242 4242 4242 4242
     - Failure: 4000 0000 0000 0002

## Production Deployment

1. Update Environment Variables:
   - Use production Stripe API keys
   - Set proper FRONTEND_URL
   - Set production webhook secret

2. Configure Stripe Webhook:
   - Set up production webhook endpoint
   - Configure proper event subscriptions
   - Store webhook secret securely

3. Security Considerations:
   - Enable HTTPS
   - Set proper CORS headers
   - Implement rate limiting
   - Use environment-specific API keys

## Troubleshooting

### Common Issues and Solutions:

1. **Webhook Signature Verification Failed:**
   ```
   Error: "Webhook signature verification failed"
   ```
   **Solutions:**
   - Check `STRIPE_WEBHOOK_SECRET` is correct in your environment variables
   - Ensure `express.raw({ type: 'application/json' })` is applied to the webhook route
   - Verify the webhook URL in Stripe Dashboard matches your route exactly
   - Check that `stripe-signature` header is included in CORS `allowedHeaders`
   - Ensure no other middleware is parsing the body before the webhook verification

2. **Raw Body Not Available:**
   ```
   Error: "Missing raw body for Stripe signature verification"
   ```
   **Solutions:**
   - Make sure `express.raw({ type: 'application/json' })` is the first middleware in your webhook route
   - Verify the Content-Type header is `application/json`
   - Check that no other body parsing middleware is interfering

3. **Payment Not Recorded:**
   ```
   Webhook received but payment not processed
   ```
   **Solutions:**
   - Check webhook logs in your application
   - Verify event type is in `allowedEvents` array
   - Check database connection and write operations
   - Verify customer ID mapping in KV store
   - Check for errors in the webhook handler function

4. **Subscription Status Not Updated:**
   ```
   Webhook processed but subscription status unchanged
   ```
   **Solutions:**
   - Check KV store data and operations
   - Verify webhook delivery in Stripe Dashboard
   - Check subscription event handling logic
   - Verify database write operations
   - Ensure event contains expected subscription data

5. **CORS Issues with Webhooks:**
   ```
   Error: "CORS policy blocked the request"
   ```
   **Solutions:**
   - Add `stripe-signature` to CORS `allowedHeaders`
   - Ensure webhook endpoint allows POST method
   - Check if preflight OPTIONS requests are handled properly

6. **Missing Customer Data:**
   ```
   Customer not found or mapping missing
   ```
   **Solutions:**
   - Ensure proper customer creation with metadata
   - Check userId to stripeCustomerId mapping in KV store
   - Verify KV store operations and connectivity
   - Check customer creation in checkout session completion

### Development vs Production Issues:

**Local Development:**
- Use Stripe CLI for webhook forwarding: `stripe listen --forward-to localhost:8001/api/v1/payments/webhook`
- Check that webhook secret from CLI matches your environment variable
- Verify local server is accessible and running

**Production:**
- Ensure HTTPS is enabled for webhook endpoint
- Check webhook endpoint is publicly accessible
- Verify production webhook secret in Stripe Dashboard
- Monitor webhook delivery attempts in Stripe Dashboard

### Debugging Steps:

1. **Check Server Logs:**
   ```bash
   # Look for webhook-related errors
   grep -i "webhook\|stripe" server.log
   ```

2. **Verify Webhook Delivery in Stripe Dashboard:**
   - Go to Developers → Webhooks
   - Check delivery attempts and responses
   - Review failed delivery details

3. **Test Webhook Signature Verification:**
   ```typescript
   // Add this to your webhook middleware for debugging
   console.log('Webhook signature:', req.headers['stripe-signature'])
   console.log('Raw body type:', typeof req.body)
   console.log('Raw body length:', req.body?.length)
   ```

4. **Verify Database Records:**
   - Check if subscription records are created/updated
   - Verify customer mappings in your database
   - Check KV store entries

5. **Test Event Processing:**
   ```bash
   # Trigger test events with Stripe CLI
   stripe trigger customer.subscription.created
   stripe trigger checkout.session.completed
   ```

For persistent issues:
1. Enable debug logging in your webhook handler
2. Check Stripe Dashboard for webhook delivery status
3. Verify all environment variables are set correctly
4. Test with Stripe's webhook testing tool
5. Review Stripe API logs in the Dashboard 