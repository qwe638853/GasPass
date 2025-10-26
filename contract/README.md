#  GasPass — Cross-Chain Programmable Gas Card

### Overview
**GasPass** is a semi-fungible ERC-3525 token that allows users to pre-deposit stablecoins (e.g., USDC) and automatically refuel native gas on multiple blockchains according to programmable policies.  
It combines **EIP-712 typed data signatures**, **EIP-2612 stablecoin permits**, and **cross-chain bridging via Bungee**, enabling a smooth, gas-abstracted UX for both manual and automated refueling.

---

## Core Features

| Feature | Description |
|----------|-------------|
| **ERC-3525 Gas Card** | Each token (`tokenId`) holds a value balance representing pre-deposited USDC. |
| **Permit-Based Mint & Deposit** | Supports `permit()` from EIP-2612-compatible stablecoins for gas-less minting and deposits. |
| **EIP-712 Signature Flows** | All operations (mint, deposit, set/cancel policies) are signed off-chain and relayed on-chain for gasless UX. |
| **Auto-Refuel Policies** | Users can set automatic gas top-up rules (`gasAmount`, `threshold`, `agent`) per chain. |
| **Agent-to-Wallet Mapping** | Agents (e.g., backend services or Vincent agents) are securely bound to user wallets. |
| **Bungee Integration** | Uses Bungee Inbox & Gateway for cross-chain bridging of stablecoins to native gas. |
| **Relayer Execution** | All EIP-712 signed actions (mint/deposit/policy ops) are submitted by a trusted relayer. |
| **Withdrawable Fees** | Accumulated service fees can be withdrawn by contract owner. |

---

## Contract Architecture

GasPass is a modular ERC-3525-based system that lets users store stablecoins (e.g. USDC) and automatically convert them into cross-chain gas through programmable policies. The contract is structured into four layers: Token, Signature, Policy, and Bridge Execution.

---

### Core Layers

#### 1. Token Layer — ERC-3525 Core

- Each `tokenId` is a **Gas Card**, and its `value` represents stored USDC
- Handles minting, depositing, and burning via `_mint`, `_mintValue`, `_burnValue`
- Uses a single `slotId = 0` (future versions can define per-chain or multi-token slots)

---

#### 2. Signature Layer — Gasless UX (EIP-712 + EIP-2612)

- All operations (`mintWithSig`, `depositWithSig`, `setRefuelPolicyWithSig`) are signed off-chain
- **EIP-712**: verifies typed signatures
- **EIP-2612**: allows gasless stablecoin approval
- Executed by a trusted `relayer`; protected by nonces to prevent replay

---

#### 3. Policy Layer — Automated Refueling

- Each token can store per-chain refuel policies in `chainPolicies`
- A policy defines `gasAmount`, `threshold`, and assigned `agent`
- Agents are securely mapped via `agentToWallet`
- Supports on-chain setup or signed setup through relayer

---

#### 4. Bridge Execution Layer — Cross-Chain via Bungee

- When gas is low, the bound `agent` triggers `autoRefuel()`
- Burns stored USDC → approves `bungeeInbox` → calls `IBungeeInbox.createRequest()`
- `BungeeGateway` bridges and swaps it into native gas (ETH, MATIC, etc.)
- Uses `BungeeInboxRequest.createSORHash()` to verify integrity
- Manual refills via `manualRefuelByAgent()` (no policy check)

---
## Slot Design — Future Expansion

GasPass currently uses a **single slot (slotId = 0)** for all cards, meaning every GasPass represents the same type of prepaid gas card.  
However, the ERC-3525 design allows **slot-based categorization**, which enables future extensibility.

### Possible Slot Use Cases
| Slot Example | Description |
|---------------|-------------|
| `slot = 1` | **Chain-Specific Card** — A GasPass dedicated to Arbitrum gas refueling. |
| `slot = 2` | **Subscription Card** — A monthly refueling plan where top-ups are rate-limited. |
| `slot = 3` | **Corporate Card** — Shared among multiple agents (team wallets). |
| `slot = 4` | **NFT-Linked Card** — Used as an energy source for NFT game assets or DAO membership. |
| `slot = 5` | **Dynamic Pricing Card** — Uses oracles to adjust gas purchase cost automatically. |
| `slot = 6` | **Multi-Token GasPass** — Supports different stablecoins (e.g.USDT, DAI) as funding sources, enabling users to choose preferred currencies.
> *In the current implementation, `slot = 0` is used for all cards to keep compatibility and simplify UX.  
> Future upgrades can assign unique slot IDs for different GasPass types without changing the core logic.*

---

## Key Functions

| Function | Description |
|-----------|-------------|
| `mintWithSig()` | Mint a GasPass card by signature + permit. |
| `mintBatchWithSig()` | Batch mint multiple cards of equal value. |
| `depositWithSig()` | Deposit more stablecoins into an existing GasPass token. |
| `setAgentToWalletWithSig()` | Bind a backend agent to a user wallet. |
| `setRefuelPolicyWithSig()` | Define automated gas top-up parameters (chain, amount, threshold, agent). |
| `cancelRefuelPolicyWithSig()` | Cancel a refuel policy by signature. |
| `autoRefuel()` | Executed by agent when threshold is reached; burns value and forwards USDC to Bungee Inbox. |

---

## Security Logic

- **EIP-712 Typed Signatures:** prevent replay attacks via `nonces` and `ownerNonces`.  
- **Agent Authorization:** only agents mapped to token owners can trigger `autoRefuel`.  
- **Relayer Restriction:** only the designated relayer can submit user-signed actions.  
- **Permit Validation:** integrates stablecoin `permit()` before any transfer.  
- **Hash Verification:** ensures `BungeeInboxRequest.createSORHash(req)` matches expected data.  

---

## Contract Parameters

| Variable | Purpose |
|-----------|----------|
| `stablecoin` | EIP-2612 compatible stablecoin (e.g., USDC). |
| `relayer` | Authorized relayer for executing signed actions. |
| `bungeeGateway` | Address of Bungee Gateway contract. |
| `bungeeInbox` | Address of Bungee Inbox contract. |
| `agentToWallet` | Mapping between backend agent and wallet owner. |
| `chainPolicies` | Refuel policies per `tokenId` per chain. |

---

## Deployment Example

```bash
forge create GasPass   --rpc-url https://arb-sepolia.g.alchemy.com/v2/XXX   --private-key $PRIVATE_KEY   --constructor-args   0xaf88d065e77c8cC2239327C5EDb3A432268e5831 \   # USDC
  0x1234567890abcdef1234567890abcdef12345678 \   # Relayer
  0xCdEa28Ee7BD5bf7710B294d9391e1b6A318d809a \   # Bungee Gateway
  0x0000000000000000000000000000000000000000     # Bungee Inbox
```
---

## License
SPDX-License-Identifier: **UNLICENSED**  
Developed by [@your-team-name](https://github.com/your-handle)
