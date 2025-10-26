### GasPass

｜GasPass — An ERC-3525-based stored-value “gas card” that automatically or manually refuels gas across multiple EVM chains.

---
## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Smart Contract](#smart-contract)
- [Tech Stack](#tech-stack)
- [Integration SDK](#Integration-SDK)
- [Use Cases](#Use-Cases)
- [License](#license)


---

##  Overview
Category	Description
Type	ERC-3525 Semi-Fungible Token (SFT)
Purpose	A stored-value gas card for multi-chain gas refueling
Core Concept	Users deposit USDC into an ERC-3525 slot; Vincent Agent automates gas top-ups when balances drop below threshold
Key Technologies	Lit Protocol, Avail XCS, Bungee Bridge API, Alchemy Gas Manager, EIP-712
Status	Cross-chain prototype deployed on Arbitrum & Base testnets

---

##  Architecture
<img width="927" height="518" alt="截圖 2025-10-26 晚上8 01 45" src="https://github.com/user-attachments/assets/0b705ce9-ccb3-4005-b89a-51438cbc0165" />

###  [How It Works]

1. User Deposit
Users deposit USDC into an ERC-3525 slot using MintWithSig.

2. Threshold Monitoring
The Vincent Agent (Lit PKP) monitors target chain gas balances.

3. Auto Refuel Trigger
When the balance drops below a set threshold, the agent triggers an Avail XCS intent.

4. Cross-Chain Execution
Avail executes through Bungee, bridging stablecoins securely.

5. Gas Top-Up
Alchemy Gas Manager or relayer converts bridged tokens to gas and funds the destination wallet.

6. Balance Sync
Updated balances and execution logs are stored on Avail.

---
##  Features

| Feature                  | Description                                                                            |
| ------------------------ | -------------------------------------------------------------------------------------- |
| **ERC-3525 Gas Slot**    | Each slot acts as a semi-fungible “gas wallet” holding USDC/USDT for a specific chain. |
| **Permit-Based Minting** | Supports EIP-712 + ERC-20 Permit2 signatures for gasless onboarding.                   |
| **Vincent Agent (PKP)**  | Automated delegated execution powered by Lit Protocol’s Vincent Abilities.             |
| **Cross-Chain Refuel**   | Uses Avail’s Bridge & Execute and Bungee API for intent-based stablecoin transfers.    |
| **Alchemy Gas Manager**  | Sponsors or triggers gas top-ups via paymaster API.                                    |
| **Unified Slot Balance** | Slot states and refuel logs recorded on Avail for verifiable auditing.                 |

---

##  Smart Contract

Contract: GasPass.sol
Standards: ERC-3525 + EIP-712 

Key Components
| Module              | Functionality                                             |
| ------------------- | --------------------------------------------------------- |
| `MintWithSig`       | Mints a new ERC-3525 token with user signature (EIP-712). |
| `DepositWithSig`    | Deposits USDC/USDT via Permit2 authorization.             |
| `SetRefuelPolicy`   | Defines threshold, chain target, and trigger conditions.  |
| `ExecuteRefuel`     | Called by Vincent Agent once the policy condition is met. |
| `UpdateSlotBalance` | Updates slot’s on-chain value and Avail audit log.        |

---

##  Tech Stack
| Layer                 | Tools & Frameworks                             |
| --------------------- | ---------------------------------------------- |
| **Smart Contracts**   | Solidity, Foundry, OpenZeppelin, Solv ERC-3525 |
| **Cross-Chain Layer** | Avail XCS, Bungee Bridge API                   |
| **Automation Layer**  | Lit Protocol Vincent Abilities (PKP Agent)     |
| **Frontend**          | Vue 3, Vite, Vuetify, Pinia, Viem, Ethers.js   |
| **Backend / Infra**   | Node.js, Express, Alchemy SDK, Avail SDK       |


---

##  Integration SDK

### How GasPass Integrates with Vincent Agent


<img width="7290" height="3667" alt="image" src="https://github.com/user-attachments/assets/c6c72a69-1e6b-4668-9b52-f26318086f8b" />


This sequence diagram illustrates how GasPass, Vincent Agent, and Bungee Bridge collaborate to perform secure, automated cross-chain gas refueling.


###  [Process Overview]

##### 1. Monitoring Loop  
The **Monitor Service** continuously checks each user’s target-chain gas balance according to their on-chain `RefuelPolicy[tokenId][chainId]`.  
This is an **off-chain observation only** — it cannot move funds or call contracts.

##### 2. Trigger Condition  
Once the wallet’s gas balance drops below the threshold, the monitor sends a **signal** to the **Vincent Agent** indicating that a refuel task is needed.

##### 3. Delegated Execution  
The **Vincent Agent (Lit PKP)**, operating under a **user-authorized Ability**, directly calls: 
autoRefuel(tokenId, inbox, req, expectedSorHash, targetChainId)on the **GasPass (ERC-3525)** contract.  
The Agent cannot act outside this Ability’s scope — it’s cryptographically constrained by **user authorization**.

##### 4. On-Chain Enforcement  
Inside **GasPass**, the contract:

- Verifies the executor’s **PKP address** is in the authorized list.  
- Approves only the required amount of **USDC** for the **Bungee Inbox**.  
- Creates a cross-chain refuel request with strict limits (**spend cap**, **nonce**, and **expiry**).

##### 5. Cross-Chain Execution via Bungee  
The **Bungee Inbox** forwards the request to the **Bungee Gateway**, which bridges and swaps stablecoins into native gas.  
The **Destination Wallet** receives the gas directly, completing the automated top-up.


###  [Why Vincent]

In **GasPass**, all deposited **USDC** remains locked inside the **ERC-3525** contract rather than in the user’s wallet.  
An external “wake-up” is still needed to execute `autoRefuel()` when thresholds are breached.

To maintain security, the backend **only signals** that a refuel task is needed — it cannot execute it directly.  
All actual fund movement or contract interaction is performed **only through a Vincent Agent (Lit PKP)** acting within **user-authorized Abilities** — predefined, cryptographically signed execution permissions that precisely define what functions the agent can call and under what conditions.

The contract recognizes the PKP’s address as an **authorized executor** only for those **whitelisted Abilities**.  
Even if the backend or the Vincent service is compromised, any out-of-scope call would fail due to **on-chain policy** and **signature verification**.

###  [Key Properties]

- **User-scoped authorization**  
  Every Ability is derived from explicit user consent and cannot exceed predefined function scopes.

- **Delegated execution**  
  The Vincent Agent executes only `autoRefuel()` or other approved functions within its authorized Ability.

- **Backend isolation**  
  The backend can only trigger the Vincent Agent; it cannot move funds or submit on-chain transactions itself.

- **Contract enforcement**  
  GasPass validates the executor address before allowing any operation.
  
---
### How GasPass Integrates with Avail

###  [Process Overview]

1. User selects “Avail Manual Refill”
From the GasPass frontend, the user chooses Use Avail for Manual Refill and specifies

2. Generate Avail Intent
The frontend builds a verifiable cross-chain intent using nexus-core / nexus-widgets:
Includes guardrails such as minOut, maxSlippage, deadline, gasCeiling.
The intent is encapsulated and signed as a cryptographic hash.

3. Wallet Sign & Submit
The user’s wallet signs and submits the intent to the Avail Network.
Avail automatically selects the optimal route and executes Bridge & Execute.

4. Cross-Chain Execution & Gas Top-Up
Through its built-in Nexus Router + XCS Layer,
Avail performs the bridge and swap, then credits the converted native gas to the target-chain wallet.

5. Status Tracking
Each intent has a unique Intent ID.
The GasPass frontend can query the execution progress, status, and final result via the SDK.

###  [Why Avail]

In GasPass, Avail is the only SDK that satisfies all three critical requirements for manual refueling:
cross-chain execution, verifiable intent, and an open, chain-agnostic interface.

1. Supports “Bridge & Execute”
Other bridge protocols (e.g., Bungee, Axelar) can only transfer assets,
while Avail’s Bridge & Execute allows post-bridge execution in a single flow —
for example, converting bridged USDC directly into native gas.
This enables GasPass to offer a true one-click refill experience.

2. Intent-Based Verification Layer
Avail’s Intent System transforms every cross-chain operation into a verifiable execution intent.
Unlike traditional bridges that simply relay funds, each intent includes:
- Signature verification
- Execution guardrails (slippage, gas ceiling)
- Replay protection (nonce, expiry)
These security primitives align perfectly with GasPass’s safety requirements.

3. Neutral and Open Execution Layer
Avail is chain- and framework-agnostic, integrating seamlessly with the existing
Vue + Node + ERC-3525 architecture of GasPass.
It supports any destination chain — Arbitrum, Base, Polygon, Optimism, and more —
allowing users to refuel from anywhere, to anywhere.

4. Complements the GasPass Automation Layer
Vincent Agent and Avail are complementary, not competing components.
Mode	Execution Path	Description
Auto Mode	Vincent Agent (backend-triggered)	Automated monitoring and refueling with stored USDC
Manual Mode	Avail Nexus SDK (user-initiated)	Direct cross-chain refuel from the user’s wallet
Both share the same policy logic and tracking structure, ensuring consistent system behavior across modes.

### [Key Properties]

- Decentralized, Verifiable Cross-Chain Intents
Each intent is individually signed, auditable, and traceable.

- Bridge & Execute
Instant post-bridge execution without manual relay or backend triggers.

- Anti-Replay & Guardrail Controls
Uses nonce, expiry, and minOut to prevent replay attacks or malicious routing.

- Security + Flexibility
Users can freely choose between automated (Vincent) or self-custodial (Avail) refueling.


---
## Use Cases

- **Hackathon Distribution:**
Distribute GasPass cards to participants, enabling them to instantly deploy smart contracts across multiple chains.

- **Brand Marketing Giveaway:**
Companies can issue GasPass cards as raffle prizes to increase brand engagement and user loyalty.

- **Onboarding Card for New Users:**
Web3 apps can gift GasPass cards to new users to lower the entry barrier and simplify their first on-chain experience.



---
##  License

MIT License © 2025 GasPass Contributors
