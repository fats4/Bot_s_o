const express = require('express');
const router = express.Router();
const solanaWeb3 = require('@solana/web3.js');
const bs58 = require('bs58');

router.post('/', async (req, res) => {
    const { secretKeyBase58, destinationPublicKeyString } = req.body;

    try {
        const secretKey = bs58.decode(secretKeyBase58);
        const fromWallet = solanaWeb3.Keypair.fromSecretKey(secretKey);
        const destinationPublicKey = new solanaWeb3.PublicKey(destinationPublicKeyString);
        const customRpcUrl = 'https://devnet.sonic.game';
        const connection = new solanaWeb3.Connection(customRpcUrl, 'confirmed');

        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: fromWallet.publicKey,
                toPubkey: destinationPublicKey,
                lamports: solanaWeb3.LAMPORTS_PER_SOL * 0.01, // Send 0.01 SOL
            }),
        );

        const signature = await solanaWeb3.sendAndConfirmTransaction(connection, transaction, [fromWallet]);
        res.status(200).json({ signature });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/balance', async (req, res) => {
    const { secretKeyBase58 } = req.body;

    try {
        const secretKey = bs58.decode(secretKeyBase58);
        const fromWallet = solanaWeb3.Keypair.fromSecretKey(secretKey);
        const customRpcUrl = 'https://devnet.sonic.game';
        const connection = new solanaWeb3.Connection(customRpcUrl, 'confirmed');

        const balance = await connection.getBalance(fromWallet.publicKey);
        const balanceInSOL = balance / solanaWeb3.LAMPORTS_PER_SOL;

        res.status(200).json({ balance: balanceInSOL });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
