# Project Overview

This project is a "GasPass" application that allows users to manage their gas fees on different blockchains. It consists of a Vue.js frontend, a Solidity smart contract, and a Node.js backend for testing.

The core of the project is the `GasPass.sol` smart contract, which is an ERC3525 semi-fungible token. Each token represents a "GasPass" that can be used to pay for gas fees. The contract allows users to set up "refuel policies" that automatically top up their gas on a target chain when the balance falls below a certain threshold. The contract also supports meta-transactions, allowing a relayer to submit transactions on behalf of the user.

The frontend is a Vue.js application that provides a user interface for interacting with the `GasPass` smart contract. It uses `ethers.js`, `wagmi`, and `web3modal` to connect to the user's wallet and interact with the blockchain.

The `testScript` directory contains a Node.js application that is used for testing the integration with Lit Protocol's Vincent, a cross-chain messaging and liquidity network.

## Building and Running

### Frontend

To run the frontend, navigate to the `frontend` directory and run the following commands:

```bash
npm install
npm run dev
```

To build the frontend, run:

```bash
npm run build
```

### Smart Contract

The smart contract is a Foundry project. To build and test the contract, navigate to the `contract` directory and use the following commands:

```bash
forge build
forge test
```

### Test Server

To run the test server, navigate to the `testScript` directory and run the following commands:

```bash
npm install
npm run server
```

## Development Conventions

*   The frontend code is written in Vue.js and uses the Composition API with `<script setup>`.
*   The smart contract code is written in Solidity and uses the Foundry framework.
*   The project uses `npm` for package management.
*   The code follows the standard JavaScript and Solidity style guides.
