# Transaction Builder Setup

This backend service generates valid unsigned Cardano transactions for ChainCred.

## Quick Start

### 1. Terminal 1 - Run Transaction Builder
```bash
node tx-builder.mjs
```
This starts the backend on `http://localhost:3001`

### 2. Terminal 2 - Run your dApp dev server
```bash
npm run dev
```

## API Endpoint

**POST** `/api/tx/build`

**Request:**
```json
{
  "address": "addr_test1vpnlxv...",
  "credentialId": "cred_demo_001",
  "fileHash": "a3f9c21b-demo"
}
```

**Response:**
```json
{
  "unsignedTxCbor": "84a4008182582001...",
  "metadata": {
    "app": "ChainCred",
    "credentialId": "cred_demo_001"
  }
}
```

## Usage in dApp

1. Navigate to **Proof Page** in your dApp
2. Click **⚙️ Generate Unsigned Tx** (requires wallet connected)
3. The button calls `/api/tx/build` and populates the CBOR textarea with a valid transaction
4. Click **Sign & Submit Transaction**
5. Approve in your wallet
6. See the tx hash on-chain

## Troubleshooting

- **Port 3001 in use?** Change the port in `tx-builder.mjs` and update ProofPage fetch URL
- **CORS errors?** Add CORS middleware to tx-builder.mjs or run both behind a reverse proxy
- **Connection refused?** Make sure tx-builder is running before clicking "Generate"
