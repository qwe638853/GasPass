### GasPass

｜GasPass — An ERC-3525-based stored-value “gas card” that automatically or manually refuels gas across multiple EVM chains.

---
##  Table of Contents

Overview

Architecture

Features

Smart Contract

Tech Stack

How It Works

Deployment

Integrations

Roadmap

License

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


<img width="779" height="428" alt="截圖 2025-10-26 凌晨1 27 06" src="https://github.com/user-attachments/assets/c7eee6e8-a3a1-4581-8f49-ab3d8762fdd9" />

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
