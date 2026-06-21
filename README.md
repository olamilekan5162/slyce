# Slyce

**Deferred Collaboration Protocol on Sui**

Slyce solves one specific problem: talented creators cannot access the people they need to succeed because those people require upfront payment, and the creator does not have it yet.

Slyce replaces upfront payment with a guaranteed on-chain agreement. Before any work begins, every collaborator locks in their cut of future earnings. The payout is automatic and atomic the moment earnings arrive. Nobody needs to trust anyone because the protocol enforces the agreement.

This is not a payment splitting tool. This is access infrastructure for creators.

---

## The Problem

Every day, an upcoming artist, filmmaker, or content creator finishes work that has everything it needs to succeed — except the right people behind it.

The producer who can make it sound right. The marketer who can make it travel. The established voice that could bring their audience with them. These people will not show up without being paid first.

And the upcoming creator does not have that money. Not because they are broke. Because the money does not exist yet. The work has not earned it yet.

So the work stays small. Or it never comes out at all.

That is not a talent problem. That is not a money problem. That is a timing problem — and Slyce fixes it.

---

## How It Works

**1. Start a collaboration**
The creator sets up a deal before any work begins. They define the project, add every collaborator they need, and assign each person their agreed cut of future earnings.

**2. Everyone confirms**
Every collaborator reviews the deal and confirms their share. Once all parties confirm, the agreement locks on-chain permanently. No one, including Slyce, can change it.

**3. Earnings arrive, everyone gets paid**
When the project earns money, the protocol releases each collaborator's cut automatically and simultaneously in a single atomic transaction. No chasing. No manual transfers. No arguments. The agreement pays itself.

**4. Earnings keep coming**
A song keeps streaming. A film keeps selling. Every time earnings arrive for the same collaboration, the same automatic payout happens again for every collaborator based on the same agreed cuts — indefinitely.

---

## Key Features

- **Deferred payment agreements** — collaborators commit to work in exchange for a guaranteed future cut, no upfront capital required
- **Mutual confirmation flow** — every collaborator must confirm before any agreement locks, creating a verifiable on-chain record of consent
- **Atomic payouts** — all collaborators receive their earnings simultaneously in a single transaction, powered by Sui's Programmable Transaction Blocks
- **Recurring earnings** — the same agreement automatically handles every future payout for the life of the collaboration
- **Multiple payout triggers** — manual release, automatic threshold, or scheduled recurring payouts
- **Multi-token support** — works with any Sui-supported token
- **Unified dashboard** — every user sees both the collaborations they started and the ones they were invited into, with cumulative earnings tracked across both roles
- **Public collaboration page** — a shareable, verifiable record of every agreement and every payout, open to anyone
- **zkLogin onboarding** — collaborators join with Google, no crypto wallet or blockchain knowledge required
- **No jargon** — built for creators, not crypto natives

---

## Built On Sui

Slyce is built on Sui because Sui makes this product technically honest, not just conceptually possible.

**Programmable Transaction Blocks (PTBs)** allow a single incoming payment to be distributed to every collaborator simultaneously in one atomic transaction. Either everyone gets paid or nobody does. There is no partial settlement.

**Move's object model** means each collaboration deal is a first-class on-chain object with state, ownership, and composability. Other Sui applications can read and build on top of Slyce agreements.

**zkLogin** solves the onboarding problem that kills most Web3 products. A collaborator can confirm a deal and receive earnings using only their Google account. No seed phrases, no wallet setup, no friction.

**Low fees** mean even small earnings are worth releasing. A payout of any size reaches every collaborator without transaction costs eating into what they earned.

---

## Use Cases

Slyce works for any creative collaboration where the right people will not show up without guaranteed payment:

- An upcoming musician bringing in a producer, a marketer, and a featured artist
- An indie filmmaker assembling a crew on deferred pay
- A content creator partnering with an editor, a cinematographer, and a distribution strategist
- Any team building something together where the money comes after the work

---

## Tech Stack

| Layer           | Technology                             |
| --------------- | -------------------------------------- |
| Smart Contracts | Sui Move                               |
| Frontend        | React + Vite + CSS Modules             |
| Authentication  | zkLogin (Google) + Sui Wallet          |
| Transactions    | Programmable Transaction Blocks (PTBs) |
| Network         | Sui Testnet / Mainnet                  |

---

## Submission

**Hackathon:** Sui Overflow 2026
**Track:** DeFi and Payments
**Category:** Programmable Payment Systems and Financial Infrastructure

---

## Getting Started

```bash
git clone https://github.com/olamilekan5162/slyce
cd slyce/slyce_frontend
npm install
npm run dev


cd ../slyce_backend
npm install
npm run start
```

---

## Links

- **Live App:** [Slyce](https://slyce-rho.vercel.app/)
- **Smart Contract:** [Slyce Contract](https://testnet.suivision.xyz/package/0x829200da6102925e460ede524f8cca03c0b76d8009a89222935bc4661bd3abec)

---

_Built in Africa, where this problem is loudest. Designed for the world, because every creator who has ever needed the right people but could not afford them yet deserves a system that makes the offer credible._

_Welcome to Slyce._
