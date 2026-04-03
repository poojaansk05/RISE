const express = require('express');
const mongoose = require('mongoose');
const redis = require('redis');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);
const client = redis.createClient({ url: process.env.REDIS_URL });
client.connect().catch(console.error);

const TransactionSchema = new mongoose.Schema({
    claimId: String,
    userId: String,
    amount: Number,
    status: { type: String, default: 'PROCESSING' },
    txHash: String
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

app.post('/process', async (req, res) => {
    const { claimId, amount, userId } = req.body;
    
    const tx = new Transaction({ claimId, amount, userId });
    await tx.save();

    // Simulate async payment processing via Redis
    await client.lPush('payout_queue', JSON.stringify({ txId: tx._id, claimId }));

    res.json({ status: 'QUEUED', txId: tx._id });
});

// Worker simulation for processing queue
setInterval(async () => {
    try {
        const task = await client.rPop('payout_queue');
        if (task) {
            const { txId } = JSON.parse(task);
            await Transaction.findByIdAndUpdate(txId, { 
                status: 'COMPLETED', 
                txHash: '0x' + Math.random().toString(16).slice(2) 
            });
            console.log(`Processed Payout for TX: ${txId}`);
        }
    } catch (e) {}
}, 5000);

app.get('/logs', async (req, res) => {
    const logs = await Transaction.find();
    res.json(logs);
});

app.listen(3004, () => console.log('Payout service running on 3004'));
