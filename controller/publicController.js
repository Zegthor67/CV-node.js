const Profile = require('../models/profile');
const Experience = require('../models/experience');
const Formation = require('../models/formation');
const Hobby = require('../models/hobby');
const Message = require('../models/Message');

// Profil par défaut si aucun en base
const defaultProfile = {
    fullName: 'Votre Nom',
    headline: 'Développeur / Data / Gestion de projet',
    photo: 'https://picsum.photos/300/300',
    summary: "Résumé professionnel (à personnaliser dans l'espace Admin).",
    email: 'email@example.com',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: ''
};

// Helper : charger le profil
const getProfile = async () => {
    const profile = await Profile.findOne().lean();
    return profile || defaultProfile;
};

// Helper : charger une collection triée
const getCollection = (Model) => Model.find().sort({ order: 1, createdAt: -1 }).lean();

// Helper : wrapper try/catch pour les routes async
const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// Helper : render une page avec le profil
const renderPage = async (res, view, title, extraData = {}) => {
    const profile = await getProfile();
    res.render(view, { title, profile, ...extraData });
};

module.exports = {
    // Page d'accueil
    home: asyncHandler(async (req, res) => {
        const [profile, experiences, formations, hobbies] = await Promise.all([
            getProfile(),
            getCollection(Experience),
            getCollection(Formation),
            getCollection(Hobby)
        ]);
        res.render('public/home', { title: 'Accueil', profile, experiences, formations, hobbies });
    }),

    // Page expériences
    experience: asyncHandler(async (req, res) => {
        await renderPage(res, 'public/experience', 'Expériences', {
            experiences: await getCollection(Experience)
        });
    }),

    // Page formations
    formation: asyncHandler(async (req, res) => {
        await renderPage(res, 'public/formation', 'Formation', {
            formations: await getCollection(Formation)
        });
    }),

    // Page loisirs
    loisirs: asyncHandler(async (req, res) => {
        await renderPage(res, 'public/loisirs', 'Loisirs', {
            hobbies: await getCollection(Hobby)
        });
    }),

    // Page contact (GET)
    showContact: asyncHandler(async (req, res) => {
        await renderPage(res, 'public/contact', 'Contact', {
            form: {}, success: null, error: null
        });
    }),

    // Page contact (POST)
    submitContact: asyncHandler(async (req, res) => {
        const profile = await getProfile();
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).render('public/contact', {
                title: 'Contact', profile,
                form: { name, email, message },
                success: null,
                error: 'Merci de remplir tous les champs.'
            });
        }

        await Message.create({
            nom: name,
            email,
            message,
            sujet: 'Message depuis le formulaire de contact',
            date: new Date().toISOString(),
            dateLisible: new Date().toLocaleString('fr-FR'),
            lu: false,
            repondu: false
        });

        res.render('public/contact', {
            title: 'Contact', profile,
            form: {},
            success: 'Message envoyé. Merci !',
            error: null
        });
    })
};
