const express = require('express');
const Profile = require('../models/profile');
const Experience = require('../models/experience');
const Formation = require('../models/Formation');
const Hobby = require('../models/hobby');
const Message = require('../models/Message');

const router = express.Router();

router.get('/api/cv', async (req, res, next) => {
  try {
    const profile = await Profile.findOne().lean();
    const experiences = await Experience.find().sort({ order: 1, createdAt: -1 }).lean();
    const formations = await Formation.find().sort({ order: 1, createdAt: -1 }).lean();
    const hobbies = await Hobby.find().sort({ order: 1, createdAt: -1 }).lean();
    res.json({ profile, experiences, formations, hobbies });
  } catch (err) {
    next(err);
  }
});

router.post('/api/contact', async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ success: false, error: 'Missing fields' });
    await Message.create({ name, email, message });
    res.json({ success: true, message: 'Message reçu' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

 