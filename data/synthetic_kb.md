# Project Panopticon Synthetic Knowledge Base

## Payment Gateway Failover
Tags: payment, gateway, failover, outage, enterprise

If a customer reports that payment gateway traffic is down, first confirm whether they are using the current Payments API v3. The supported workaround is to enable `gateway_failover=true` on the Payments API v3 route and retry failed transactions with the documented idempotency key header `Idempotency-Key`.

Standard tier customers can use regional retry queues. Enterprise tier customers also receive active-active failover across `us-east-1` and `us-west-2`, plus a named incident bridge.

Do not recommend legacy API keys. The header `X-LEGACY-API-KEY` was removed on 2025-02-01 and must never be used in customer instructions.

## Current API Authentication
Tags: api, authentication, keys, token

All current API calls authenticate with short-lived OAuth client credentials. The supported header is `Authorization: Bearer <access_token>`. Tokens are issued by `/oauth/token` and expire after 15 minutes.

Support engineers should never ask customers to paste secrets into chat. Rotate credentials only through the Admin Console under Settings > API access.

## Incident Status Checks
Tags: outage, status, incident, api

Customers can verify live platform status from the Status API at `/v3/status/incidents`. A payment incident response should include the incident ID when known, the current workaround, and an expected next checkpoint.

When the customer mentions money loss or failed payments, recommend pausing automated dunning for the affected invoices until retries complete.

## Legacy SQL Database
Tags: database, sql, legacy

Project Panopticon does not operate or support a legacy SQL database product. If a user asks how to restart a legacy SQL database, the support response must say that the knowledge base does not contain a supported restart procedure and offer to route the case to a human database specialist.

## Pricing And SLA Credits
Tags: billing, sla, credit, pricing

Customer Care may offer a 20% SLA credit for the current month when a customer reports churn intent, production outage, failed payment processing, or measurable revenue loss.

Credits above 20%, cash refunds, or multi-month discounts require executive approval and must not be promised automatically.

Enterprise upgrade make-good offers can include the first three months at no additional platform fee when the stated technical problem maps directly to Enterprise resiliency features.

## Tier Capabilities
Tags: free, standard, enterprise, support, failover

Free tier includes community support, one sandbox workspace, and best-effort retry queues.

Standard tier includes production API access, regional retry queues, email support, and standard monthly SLA reporting.

Enterprise tier includes active-active payment failover, dedicated incident bridge, named customer engineer, audit logs, custom rate limits, and priority support.
