const express = require('express');
const User = require('../models/User');

const router = express.Router();

router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Inscription', error: null, form: {} });
});

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, passwordConfirm } = req.body;

    if (!email || !password || !passwordConfirm) {
      return res.status(400).render('auth/register', { title: 'Inscription', error: 'Tous les champs sont requis.', form: { email } });
    }
    if (password.length < 8) {
      return res.status(400).render('auth/register', { title: 'Inscription', error: 'Le mot de passe doit contenir au moins 8 caractères.', form: { email } });
    }
    if (password !== passwordConfirm) {
      return res.status(400).render('auth/register', { title: 'Inscription', error: 'Les mots de passe ne correspondent pas.', form: { email } });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).render('auth/register', { title: 'Inscription', error: 'Cet email est déjà utilisé.', form: { email } });
    }

    const user = new User({ email: email.toLowerCase().trim(), passwordHash: 'temp' });
    await user.setPassword(password);
    await user.save();

    req.session.userId = user._id.toString();
    req.session.userEmail = user.email;

    return res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Connexion', error: null, form: {} });
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).render('auth/login', { title: 'Connexion', error: 'Email et mot de passe requis.', form: { email } });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).render('auth/login', { title: 'Connexion', error: 'Identifiants invalides.', form: { email } });
    }

    const ok = await user.validatePassword(password);
    if (!ok) {
      return res.status(401).render('auth/login', { title: 'Connexion', error: 'Identifiants invalides.', form: { email } });
    }

    req.session.userId = user._id.toString();
    req.session.userEmail = user.email;

    return res.redirect('/admin');
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;