# MANTIS project direction

**Updated:** 8 October 2026 · **Stage:** product design and regulatory feasibility

MANTIS will be a centrally operated prediction market for Greek users, inspired by Kalshi. Its order book and resolution system will be built in house. Crypto, blockchain, decentralized governance, and decentralized oracles are outside scope. Centralized operation is a requirement.

## Product model

The recommended first release uses fully funded binary Yes/No contracts in EUR, price/time priority, and explicit Buy/Sell flows. A sale requires an executable order; exit and its price are not guaranteed. The platform will keep matching, reservations, unit ownership, and financial accounting consistent.

## In-house resolution

MANTIS will control contract rules, official-source collection, evidence review, outcome authorization, and settlement. The intended AI role is to extract and summarize evidence and propose a result for human review. The recommended initial release requires human outcome approval and separate authorization before payout. AI will not have permission to change rules or move customer funds.

## Legal and operating work

The Greek counsel package describes this centralized order-book product. It requests assessment of the instrument, exchange structure, counterparty obligations, funds, clearing, resolution duties, and the exact reform route if required. Kalshi's US permissions do not establish permission for MANTIS in Greece.

Legal entities, permissions, payment/custody providers, fee rates, and launch timing remain open. A sportsbook with operator-set prices is not an equal product alternative in the current plan.

## Implementation status and next steps

The code on main remains a static demo. The alpha branch contains separate prototype work. Current design documents draw on public exchange materials; they do not establish a production-ready system or reproduce a competitor's undisclosed architecture.

Complete legal assessment and the code audit, establish funded liquidity and operating costs, then implement the centralized matching/accounting core, payments, and resolution in stages with integration and recovery evidence. No regulatory clearance, financing amount, approved entity, or launch date is claimed.
