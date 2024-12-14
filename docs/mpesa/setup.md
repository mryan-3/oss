---
sidebar_position: 2
title: Setup
---

# Installation

#### npm

```bash
npm install @zenetralabs/mpesa
```

#### yarn

```bash
yarn add @zenetralabs/mpesa
```

#### pnpm

```bash
pnpm add @zenetralabs/mpesa
```

## Setup

:::caution To use the mpesa sdk, you need to initialize it with your credentials. Consider storing all these credentials in a `.env` file and using `dotenv` to load them into your application.

:::

```typescript title="Setting up the mpesa sdk"
import { Mpesa } from '@zenetralabs/mpesa'

export const mpesa = new Mpesa({
    env: 'sandbox', // "sandbox" or "live"
    type: 4, // 2 or 4
    shortcode: 4657849,
    store: 4657849,
    key: 'MPESA_B2C_CONSUMER_KEY',
    secret: 'MPESA_B2C_CONSUMER_SECRET',
    username: 'USER_NAME',
    password: 'PASSWORD',
    certFolderPath: 'CERT_FOLDER_ABSOLUTE_PATH',
    passkey: 'MPESA_PASSKEY'
})

// STK Push code
// B2C code
// Check Transaction Status code
// etc
```

## API Reference

| **Parameter**    | **Type** | **Required** | **Description**                                                                                                   | **Example**                   |
| ---------------- | -------- | ------------ | ----------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `env`            | `string` | Yes          | Specifies the M-Pesa environment to use. Can be either `"sandbox"` for testing or `"live"`.                       | `"sandbox"` or `"live"`       |
| `type`           | `number` | Yes          | Determines the type of transaction. Use `2` for C2B (Customer-to-Business) or `4` for B2C (Business-to-Customer). | `2`, `4`                      |
| `shortcode`      | `number` | Yes          | The M-Pesa shortcode associated with your business.                                                               | `4657849`                     |
| `store`          | `number` | Yes          | Alias for `shortcode`, used to identify the business account receiving payments.                                  | `4657849`                     |
| `key`            | `string` | Yes          | Consumer Key from your M-Pesa API credentials.                                                                    | `"MPESA_B2C_CONSUMER_KEY"`    |
| `secret`         | `string` | Yes          | Consumer Secret from your M-Pesa API credentials.                                                                 | `"MPESA_B2C_CONSUMER_SECRET"` |
| `username`       | `string` | No           | Username required for certain B2B or B2C operations, depending on your M-Pesa account setup.                      | `"USER_NAME"`                 |
| `password`       | `string` | No           | Password required for specific B2B or B2C operations, depending on your M-Pesa account setup.                     | `"PASSWORD"`                  |
| `certFolderPath` | `string` | No           | Absolute path to the folder containing SSL certificates for secure requests (if required).                        | `"/path/to/certs"`            |
| `passkey`        | `string` | Yes          | The M-Pesa passkey for generating secure payment requests, typically used in C2B transactions.                    | `"MPESA_PASSKEY"`             |

---

### Notes:

- Ensure your **consumer key**, **consumer secret**, and **passkey** match the environment you are using (`sandbox` or `live`).
- `certFolderPath` is required for environments that mandate SSL/TLS certificate-based authentication.
- `type` determines the context of the operations. Using the correct type is critical for accurate integration.
