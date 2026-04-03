const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

const PolicySchema = new mongoose.Schema({
    userId: String,
    type: { type: String, default: 'Weather Disruption' },
    status: { type: String, default: 'ACTIVE' },
    premiumWeekly: Number,
    coverageAmount: Number,
    startDate: { type: Date, default: Date.now }
});

const Policy = mongoose.model('Policy', PolicySchema);

app.get('/', async (req, res) => {
    const userId = req.headers['x-user-id']; // Injected by gateway logic usually
    const policies = await Policy.find(); // Simplified for demo
    res.json(policies);
});

app.post('/purchase', async (req, res) => {
    const policy = new Policy({
        userId: req.body.userId,
        premiumWeekly: 150,
        coverageAmount: 5000
    });
    await policy.save();
    res.json(policy);
});

app.listen(3002, () => console.log('Policy service running on 3002'));
