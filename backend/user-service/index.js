const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    workerId: { type: String, required: true },
    role: { type: String, default: 'worker' }
});

const User = mongoose.model('User', UserSchema);

app.post('/register', async (req, res) => {
    try {
        const { email, password, name, workerId } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, name, workerId });
        await user.save();
        res.status(201).json({ message: "User created" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user: { name: user.name, role: user.role, email: user.email } });
});

app.get('/me', async (req, res) => {
    // Middleware in gateway sets user header or we decode again
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    res.json(user);
});

app.listen(3001, () => console.log('User service running on 3001'));
