---
sidebar_position: 3
title: Usage
---

# Usage

### STK Push

STK Push is a service that allows you to receive payments on the go from your customers. It is a simple and secure way to receive payments from customers using M-Pesa. The service is available on the
Paybill and Buy Goods and Services platforms.

```typescript
import { Mpesa } from '@zenetralabs/mpesa'

// mpesa Config setup here

const { error, data } = await mpesa.stkPush({
    phone: '254712345678',
    product: `Shown in stk push message`,
    amount: 400,
    CallBackURL: `https://todo.com/api/v1/pay/stk/callback`, // Must be https secure
    description: `Description of this payment`
})
```

### B2C

B2C is a service that allows you to send money to any mpesa mobile number in Kenya.

```typescript
import { Mpesa } from '@zenetralabs/mpesa'

// mpesa Config setup here

const { data, error } = await mpesa.sendB2C({
    PartyB: '254712345678',
    Amount: 5,
    CommandID: 'BusinessPayment',
    Occasion: 'Some message here',
    Remarks: `Some remarks here`,
    ResultURL: `https://todo.com/api/v1/pay/b2c/callback`,
    QueueTimeOutURL: `https://todo.com/api/v1/pay/b2c/timeout`
})
```

### Check Transaction Status

Check the status of a transaction using the `TransactionID` returned from the `B2C` or `STK Push` request.

```typescript
import { Mpesa } from '@zenetralabs/mpesa'

// mpesa Config setup here

const { data, error } = await mpesa.checkStatus({
    code: 'SJDK98K8H',
    QueueTimeOutURL: `https://todo.com/api/v1/pay/status/timeout`,
    ResultURL: `https://todo.com/api/v1/pay/status/callback`
})
```

### Check mpesa business accounts Balance

Check the balance of your business account

```typescript
import { Mpesa } from '@zenetralabs/mpesa'

// mpesa Config setup here

const { data, error } = await mpesa.accountBalance({
    QueueTimeOutURL: `https://todo.com/api/v1/pay/balance/timeout`,
    ResultURL: `https://todo.com/api/v1/pay/balance/callback`
})
```
