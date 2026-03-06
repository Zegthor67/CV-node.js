const express = require('express');
const { requireAuth } = require('../middleware/auth');
const Profile = require('../modelsprofile');
const Experience = require('../models/experience');
const Formation = require('../models/Formation');
const Hobby = require('../models/hobby');
const Message = require('../models/Message');

const router = express.Router();

router.use(requireAuth);

router.get('/admin', async (req, res, next) => {
  try {
    const profile = await Profile.findOne().lean();
    const expCount = await Experience.countDocuments();
    const formCount = await Formation.countDocuments();
    const hobbyCount = await Hobby.countDocuments();
    const msgCount = await Message.countDocuments();
    res.render('admin/dashboard', {
      title: 'Admin',
      profile,
      stats: { expCount, formCount, hobbyCount, msgCount }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/admin/profile', async (req, res, next) => {
  try {
    const profile = (await Profile.findOne().lean()) || {};
    res.render('admin/profile', { title: 'Profil', profile, error: null });
  } catch (err) {
    next(err);
  }
});

router.post('/admin/profile', async (req, res, next) => {
  try {
    const payload = {
      fullName: req.body.fullName || '',
      headline: req.body.headline || '',
      photo: req.body.photo || '',
      summary: req.body.summary || '',
      email: req.body.email || '',
      phone: req.body.phone || '',
      location: req.body.location || '',
      website: req.body.website || ''
    };
    await Profile.findOneAndUpdate({}, payload, { upsert: true, new: true });
    res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

/** EXPERIENCES */
router.get('/admin/experiences', async (req, res, next) => {
  try {
    const experiences = await Experience.find().sort({ order: 1, createdAt: -1 }).lean();
    res.render('admin/experiences/list', { title: 'Gérer les expériences', experiences });
  } catch (err) {
    next(err);
  }
});

router.get('/admin/experiences/new', (req, res) => {
  res.render('admin/experiences/form', {
    title: 'Nouvelle expérience',
    action: '/admin/experiences',
    method: 'POST',
    item: {}
  });
});

router.post('/admin/experiences', async (req, res, next) => {
  try {
    await Experience.create({
      title: req.body.title,
      company: req.body.company,
      location: req.body.location || '',
      startDate: req.body.startDate || '',
      endDate: req.body.endDate || '',
      description: req.body.description || '',
      order: Number(req.body.order || 0)
    });
    res.redirect('/admin/experiences');
  } catch (err) {
    next(err);
  }
});

router.get('/admin/experiences/:id/edit', async (req, res, next) => {
  try {
    const item = await Experience.findById(req.params.id).lean();
    if (!item) return res.redirect('/admin/experiences');
    res.render('admin/experiences/form', {
      title: 'Modifier expérience',
      action: `/admin/experiences/${item._id}?_method=PUT`,
      method: 'PUT',
      item
    });
  } catch (err) {
    next(err);
  }
});

router.put('/admin/experiences/:id', async (req, res, next) => {
  try {
    await Experience.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      company: req.body.company,
      location: req.body.location || '',
      startDate: req.body.startDate || '',
      endDate: req.body.endDate || '',
      description: req.body.description || '',
      order: Number(req.body.order || 0)
    });
    res.redirect('/admin/experiences');
  } catch (err) {
    next(err);
  }
});

router.delete('/admin/experiences/:id', async (req, res, next) => {
  try {
    await Experience.findByIdAndDelete(req.params.id);
    res.redirect('/admin/experiences');
  } catch (err) {
    next(err);
  }
});

/** FORMATIONS */
router.get('/admin/formations', async (req, res, next) => {
  try {
    const formations = await Formation.find().sort({ order: 1, createdAt: -1 }).lean();
    res.render('admin/formations/list', { title: 'Gérer les formations', formations });
  } catch (err) {
    next(err);
  }
});

router.get('/admin/formations/new', (req, res) => {
  res.render('admin/formations/form', {
    title: 'Nouvelle formation',
    action: '/admin/formations',
    method: 'POST',
    item: {}
  });
});

router.post('/admin/formations', async (req, res, next) => {
  try {
    await Formation.create({
      school: req.body.school,
      degree: req.body.degree,
      location: req.body.location || '',
      startDate: req.body.startDate || '',
      endDate: req.body.endDate || '',
      description: req.body.description || '',
      order: Number(req.body.order || 0)
    });
    res.redirect('/admin/formations');
  } catch (err) {
    next(err);
  }
});

router.get('/admin/formations/:id/edit', async (req, res, next) => {
  try {
    const item = await Formation.findById(req.params.id).lean();
    if (!item) return res.redirect('/admin/formations');
    res.render('admin/formations/form', {
      title: 'Modifier formation',
      action: `/admin/formations/${item._id}?_method=PUT`,
      method: 'PUT',
      item
    });
  } catch (err) {
    next(err);
  }
});

router.put('/admin/formations/:id', async (req, res, next) => {
  try {
    await Formation.findByIdAndUpdate(req.params.id, {
      school: req.body.school,
      degree: req.body.degree,
      location: req.body.location || '',
      startDate: req.body.startDate || '',
      endDate: req.body.endDate || '',
      description: req.body.description || '',
      order: Number(req.body.order || 0)
    });
    res.redirect('/admin/formations');
  } catch (err) {
    next(err);
  }
});

router.delete('/admin/formations/:id', async (req, res, next) => {
  try {
    await Formation.findByIdAndDelete(req.params.id);
    res.redirect('/admin/formations');
  } catch (err) {
    next(err);
  }
});

/** LOISIRS */
router.get('/admin/loisirs', async (req, res, next) => {
  try {
    const hobbies = await Hobby.find().sort({ order: 1, createdAt: -1 }).lean();
    res.render('admin/loisirs/list', { title: 'Gérer les loisirs', hobbies });
  } catch (err) {
    next(err);
  }
});

router.get('/admin/loisirs/new', (req, res) => {
  res.render('admin/loisirs/form', {
    title: 'Nouveau loisir',
    action: '/admin/loisirs',
    method: 'POST',
    item: {}
  });
});

router.post('/admin/loisirs', async (req, res, next) => {
  try {
    await Hobby.create({
      name: req.body.name,
      details: req.body.details || '',
      order: Number(req.body.order || 0)
    });
    res.redirect('/admin/loisirs');
  } catch (err) {
    next(err);
  }
});

router.get('/admin/loisirs/:id/edit', async (req, res, next) => {
  try {
    const item = await Hobby.findById(req.params.id).lean();
    if (!item) return res.redirect('/admin/loisirs');
    res.render('admin/loisirs/form', {
      title: 'Modifier loisir',
      action: `/admin/loisirs/${item._id}?_method=PUT`,
      method: 'PUT',
      item
    });
  } catch (err) {
    next(err);
  }
});

router.put('/admin/loisirs/:id', async (req, res, next) => {
  try {
    await Hobby.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      details: req.body.details || '',
      order: Number(req.body.order || 0)
    });
    res.redirect('/admin/loisirs');
  } catch (err) {
    next(err);
  }
});

router.delete('/admin/loisirs/:id', async (req, res, next) => {
  try {
    await Hobby.findByIdAndDelete(req.params.id);
    res.redirect('/admin/loisirs');
  } catch (err) {
    next(err);
  }
});

/** MESSAGES */
router.get('/admin/messages', async (req, res, next) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).lean();
    res.render('admin/messages', { title: 'Messages', messages });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
 