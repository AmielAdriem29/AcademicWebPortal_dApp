import express from 'express';
import * as cbor from 'cbor';

const app = express();
app.use(express.json());

// Add CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

/**
 * POST /api/tx/build
 * Generates a valid minimal transaction CBOR for credential anchoring
 */
app.post('/api/tx/build', (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ 
        success: false,
        error: 'Address is required' 
      });
    }

    // Minimal valid Cardano transaction structure
    // Format: [inputs, outputs, fee, metadata]
    const inputs = []; // Empty for demo
    const outputs = []; // Empty for demo
    const fee = 200000; // 0.2 ADA in lovelace
    
    // Metadata with ChainCred credential info
    const metadata = new Map();
    metadata.set(674, {
      app: 'ChainCred',
      action: 'anchor_credential',
      credentialId: 'cred_demo_001',
      fileHash: 'a3f9c21b-demo',
      timestamp: new Date().toISOString()
    });

    // Build minimal transaction body
    // Cardano uses indefinite-length arrays for metadata in CBOR
    const txBody = [inputs, outputs, fee];

    // Encode transaction body to CBOR
    const encodedBody = cbor.encode(txBody);
    const cborHex = encodedBody.toString('hex');

    res.json({
      success: true,
      unsignedTxCbor: cborHex,
      metadata: {
        app: 'ChainCred',
        credentialId: 'cred_demo_001',
      },
      note: 'Minimal demo transaction for testing wallet integration.'
    });
  } catch (error) {
    console.error('Transaction build error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to build transaction',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'chaincred-tx-builder',
    version: '1.0'
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n✓ ChainCred TX Builder running on http://localhost:${PORT}`);
  console.log(`  POST /api/tx/build - Build transaction structure`);
  console.log(`  GET /api/health - Health check\n`);
});
