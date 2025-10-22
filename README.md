# GasPass — Cross-Chain Auto Gas Card (ERC-3525 + Lit Vincent + Avail)

> “GasPass is like a cross-chain fuel card. It automatically refuels your wallet’s gas balance across chains — safely, seamlessly, and without friction.”

---

## Overview

**GasPass** is an **ERC-3525 Semi-Fungible Token (SFT)**-based "Cross-Chain Gas Prepaid Card" system.

Users can deposit **USDC / USDT** into a GasPass **Slot**, which represents their personal “gas account.”  
When the gas balance on a target chain falls below a defined threshold, GasPass automatically refuels it.

GasPass integrates:
- **Lit Protocol Vincent Agent** — a PKP-powered automation agent for decentralized EVM transaction signing.  
- **Avail Bridge & Execute** — intent-based cross-chain execution with gasless UX.  
- **Bungee Bridge API (Socket.tech)** — handles cross-chain swaps and refuels.  
- **Alchemy Gas Manager / EIP-7702** — enables gas sponsorship and account abstraction.  
- **EIP-712 / Permit2** — allows signature-based minting and deposits with zero gas.

---

## Architecture

```mermaid
graph TD

A[User deposits USDC into GasPass ERC-3525 Slot] --> B[MintWithSig (EIP-712)]
B --> C[Vincent Agent monitors user balances]
C --> D{Balance < threshold?}
D -- Yes --> E[Trigger Avail XCS: Bridge & Execute]
E --> F[Bungee API cross-chain transfer]
F --> G[Alchemy / Relayer refuels gas on target chain]
G --> H[Slot balance updated; execution logs stored on Avail]
D -- No --> I[Idle / Wait for]()


| Layer             | Component                          | Description                                               |
| ----------------- | ---------------------------------- | --------------------------------------------------------- |
| Smart Contract    | **ERC-3525 GasPass.sol**           | SFT 格式的 Gas 卡，可透過 `DepositWithSig`、`RefuelPolicy` 管理跨鏈策略。 |
| Signing Layer     | **Lit Vincent Agent**              | 由 PKP 驅動的 Agent，根據策略自動觸發跨鏈轉帳與補 Gas。                       |
| Cross-Chain Layer | **Avail Bridge & Execute**         | 提供無 Gas 跨鏈執行環境。                                           |
| Bridge Layer      | **Bungee API**                     | 實現跨鏈轉移（ETH ↔ USDC/USDT）。                                  |
| Gasless Layer     | **Alchemy Gas Manager (EIP-7702)** | 提供 Gas Sponsorship。                                       |
| Frontend          | **Vue3 + Vuetify + Pinia + Viem**  | 使用者儲值、查看、手動補 Gas 與設定策略的介面。                                |

