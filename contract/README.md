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

```mermaid
flowchart TD
    %% === User & Relayer Flow ===
    A[Frontend / User Wallet] -->|EIP712 Signature: Mint / Deposit / Policy| B[Relayer]
    B -->|relayUserOp| C[GasPass Contract - ERC3525]

    %% === Minting & Deposit ===
    subgraph Mint_Deposit_Process [Mint & Deposit Process]
        C -->|mintWithSig / depositWithSig| D[Store Stablecoin and Update Token Balance]
        D -->|permit - EIP2612| E[Stablecoin - USDC]
    end

    %% === Refuel Policy Setup ===
    subgraph Policy_Setup [Policy Setup]
        A -->|EIP712 Signature| B2[setRefuelPolicyWithSig]
        B2 --> C
        C -->|Store policy params| F1[chainPolicies[tokenId][chainId]]
        F1 -->|agent = authorized| F2[AgentToWallet Mapping]
    end

    %% === Auto Refuel Execution ===
    subgraph Auto_Refuel [Auto Refuel Process]
        F2 -->|Monitor gas threshold| G1[Backend Monitor / Vincent Agent]
        G1 -->|Trigger autoRefuel| C
        C -->|approve(stablecoin, BungeeInbox, gasAmount)| H1[Bungee Inbox]
        H1 -->|createRequest(req)| H2[Bungee Gateway]
        H2 -->|bridge and swap| H3[Target Chain Wallet - Receive Native Gas]
    end

    %% === Withdraw / Admin ===
    subgraph Admin_Actions [Withdraw & Fee Management]
        C -->|withdrawFees / withdrawAllUSDC| I[Owner / Admin]
    end
```


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
| `withdrawFees()` | Owner withdraws accumulated platform fees. |
| `withdrawAllUSDC()` | Owner of token withdraws remaining USDC (for testing or refunds). |

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

## Example Use Cases
- **Hackathon Sponsorship:** Give developers pre-loaded GasPass cards for instant cross-chain deployment.  
- **Onboarding Campaigns:** Apps airdrop small gas cards to new users for first-time transactions.  
- **Enterprise Giveaways:** Brands distribute GasPass as redeemable cross-chain fuel prizes.  
- **Subscription Refueling:** DApps offer tiered refuel memberships via slot-based GasPass types.  

---

## License
SPDX-License-Identifier: **UNLICENSED**  
Developed by [@your-team-name](https://github.com/your-handle)
