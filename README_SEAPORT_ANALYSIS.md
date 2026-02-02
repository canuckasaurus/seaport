# Seaport on Hedera: Analysis & Deployment Plan

This document provides a detailed analysis of the Seaport protocol codebase, specifically tailored for deployment on the Hedera network. It also answers your specific questions about fee customization and wallet integration.

## 1. Contract Analysis

The Seaport protocol consists of a core exchange contract supported by infrastructure contracts for token approvals and order validation.

### Core Contracts
*   **`contracts/Seaport.sol`**: This is the main entry point for the protocol. It handles:
    *   Order fulfillment (`fulfillOrder`, `matchOrders`, etc.).
    *   Signature verification (EIP-712).
    *   Transfer execution.
    *   It is a thin wrapper around `lib/seaport-core/src/lib/Consideration.sol`, which contains the bulk of the logic.
    *   **Deployment:** Requires the address of a deployed `ConduitController`.

### Infrastructure Contracts
*   **`contracts/conduit/ConduitController.sol`**: A registry and factory for "Conduits".
    *   **Role:** Users approve this controller (or conduits deployed by it) to spend their tokens. This allows users to approve a single contract for all future trading on your marketplace, rather than approving `Seaport` directly every time it upgrades.
    *   **Deployment:** First contract to be deployed.
*   **`contracts/conduit/Conduit.sol`**: A simple proxy contract that actually holds the token allowances. `ConduitController` deploys these.

### Helper Contracts (Optional but Recommended)
*   **`contracts/helpers/SeaportRouter.sol`**: A wrapper contract often used by frontends.
    *   **Role:** It simplifies interactions by handling ETH wrapping/unwrapping and routing orders to the correct Seaport version if you run multiple.
*   **`contracts/zones/`**:
    *   **Zones** are optional contracts that can perform extra validation checks on orders. You likely won't need to deploy these immediately unless you have specific advanced needs (like restricting who can buy an NFT).

## 2. Fee Customization & Wallet Integration

**Q: Can I plug in my own wallets to make sure I am the one earning the fees?**

**A: YES.** Seaport is designed natively to support this. You do not need to modify the contract code to collect fees.

### How it works:
In Seaport, an "Order" is defined by two main arrays:
1.  **`OFFER`**: What the user is giving up (e.g., 1 NFT).
2.  **`CONSIDERATION`**: What the user must receive for the order to be valid.

**To collect a fee, you simply add your wallet to the `CONSIDERATION` array.**

#### Example Scenario:
*   **Seller** wants to sell an NFT for **100 HBAR**.
*   **Marketplace** wants a **2.5% fee**.

When your frontend creates the order for the user to sign, it constructs the `consideration` array like this:

1.  **Item 1:** 97.5 HBAR -> Goes to **Seller**.
2.  **Item 2:** 2.5 HBAR -> Goes to **Your Marketplace Wallet**.

The Seaport contract ensures that *both* transfers happen atomically. If the buyer doesn't pay your fee, the trade fails. This is the standard way OpenSea and other marketplaces use Seaport.

## 3. Hedera Deployment Plan

Hedera is EVM-compatible, so the deployment process is nearly identical to Ethereum, provided you use the JSON-RPC relay.

### Prerequisites
1.  **Hedera Account:** An ECDSA-enabled account is highly recommended for compatibility with Ethereum tools (Hardhat/Foundry).
2.  **RPC Provider:** Use a Hedera JSON-RPC endpoint (e.g., from Hashio, Arkhia, or a local node).
3.  **Wallet/Keys:** Your private key exported for use in the deployment script.
4.  **Gas:** Ensure your account holds HBAR to pay for deployment gas.

### Step-by-Step Deployment

#### 1. Setup Environment
Ensure your `hardhat.config.ts` is configured with the Hedera network details.
```typescript
// Add this to your hardhat.config.ts inside the config object
networks: {
  hedera: {
    url: "https://mainnet.hashio.io/api", // For Mainnet
    // url: "https://testnet.hashio.io/api", // For Testnet
    accounts: [process.env.PRIVATE_KEY], // Ensure PRIVATE_KEY is in your .env file
    chainId: 295 // Mainnet (Use 296 for Testnet)
  }
}
```

#### 2. Run Deployment Script
I have created a convenient script `deploy/deploy_all.ts` that handles the entire flow for you.

*   **Command:** `npx hardhat run deploy/deploy_all.ts --network hedera`

This script will:
1.  Deploy `ConduitController`.
2.  Automatically use that address to deploy `Seaport`.
3.  Log both addresses to your console.

**Alternative: Step-by-Step Deployment**
If you prefer to deploy them one by one:
1.  **Deploy Controller:** `npx hardhat run deploy/deploy_conduit.ts --network hedera`
2.  **Deploy Seaport:**
    *   Set the address: `set CONDUIT_CONTROLLER_ADDRESS=0xYourAddress` (Windows) or `export CONDUIT_CONTROLLER_ADDRESS=0xYourAddress` (Mac/Linux)
    *   Run: `npx hardhat run deploy/deploy_seaport.ts --network hedera`

### Verification
After deployment, verify your contracts on HashScan (or the relevant Hedera explorer) to ensure users can read the code.

## 4. Next Steps

1.  **Create Deployment Scripts:** I can assist you in writing the specific Hardhat deployment scripts for Hedera if you wish.
2.  **Test on Testnet:** Deploy to Hedera Testnet first to verify transaction flows and fee collection.
3.  **Frontend Integration:** Update your marketplace frontend to point to your new `Seaport` contract address and ensure it constructs orders with your fee wallet in the `consideration` array.
