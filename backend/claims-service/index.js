const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

const ClaimSchema = new mongoose.Schema({
    userId: String,
    policyId: String,
    amount: Number,
    status: { type: String, default: 'PENDING' },
    fraudScore: Number,
    timestamp: { type: Date, default: Date.now }
});

const Claim = mongoose.model('Claim', ClaimSchema);

app.post('/submit', async (req, res) => {
    const { userId, policyId, gps, orders, ip } = req.body;

    try {
        // 1. Call Fraud Service
        const fraudResponse = await axios.post(`${process.env.FRAUD_SERVICE_URL}/score`, {
            worker_id: userId,
            gps_lat: gps.lat,
            gps_long: gps.long,
            order_count_last_4h: orders,
            ip_address: ip
        });

        const { fraud_score, recommendation } = fraudResponse.data;

        // 2. Decision Engine Logic
        let status = 'PENDING_REVIEW';
        let payoutAmount = 0;

        if (recommendation === 'APPROVE') {
            status = 'APPROVED';
            payoutAmount = 500; // Fixed parametric payout
        } else if (recommendation === 'BLOCK') {
            status = 'REJECTED';
        }

        const claim = new Claim({
            userId,
            policyId,
            amount: payoutAmount,
            status,
            fraudScore: fraud_score
        });

        await claim.save();

        // 3. Trigger Payout if approved
        if (status === 'APPROVED') {
            await axios.post(`${process.env.PAYOUT_SERVICE_URL}/process`, {
                claimId: claim._id,
                amount: payoutAmount,
                userId
            });
        }

        res.json({ claim, fraud_analysis: fraudResponse.data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Workflow failed" });
    }
});

app.get('/history', async (req, res) => {
    const claims = await Claim.find().sort({ timestamp: -1 });
    res.json(claims);
});

app.listen(3003, () => console.log('Claims service running on 3003'));
