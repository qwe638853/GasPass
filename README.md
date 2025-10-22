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

---

## Smart Contract Summary
GasPass.sol

Implements an ERC-3525 Semi-Fungible Token, representing a refillable gas card.

Key Functions:

 — Mint a GasPass card using EIP-712 signature.

depositWithSig() — Deposit USDC/USDT using ERC-20 Permit or Permit2.

setRefuelPolicy() — Define the auto-refuel threshold and strategy.

cancelRefuelPolicy() — Cancel an existing refuel policy.

withdraw() — Withdraw remaining stablecoins.

Security & Standards:

All signatures verified under EIP-712 domain separator.

Uses OpenZeppelin modules: ECDSA, SafeERC20, Ownable.

Supports Permit2 for seamless gasless approval flows.


---

## Vision

“Every wallet deserves a self-refueling experience.”

GasPass aims to become the gas subscription layer for cross-chain Web3 users.
Through ERC-3525 + Lit Protocol + Avail, we make gas management:

- Refillable

- Delegated

- Cross-chain aware

- User-friendly

---

## License

MIT License © 2025 GasPass Team

🔗 References

ERC-3525 Semi-Fungible Token Standard

Lit Protocol Vincent Abilities

Avail Nexus SDK

Alchemy Gas Manager

Socket Bungee v2 API

