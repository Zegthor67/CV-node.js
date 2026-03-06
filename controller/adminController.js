const CV = require('../models/CV');
const Message = require('../models/Message');

// Helper : wrapper async pour éviter les try/catch répétés
const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// Helper : flash messages
const flash = (req, type, message) => { req.session.flash = { type, message }; };
const flashSuccess = (req, message) => flash(req, 'success', message);
const flashError = (req, message) => flash(req, 'error', message);

// Helper : charger le CV
const getCV = () => CV.findOne();

// Helper : render une page admin
const renderAdmin = (res, view, title, data = {}) => res.render(`admin/${view}`, { title, ...data });

// Helper : CRUD générique pour les sous-documents du CV
const createCrudHandlers = (config) => {
    const { field, name, viewList, viewNew, redirect, isArray = false } = config;

    return {
        list: asyncHandler(async (req, res) => {
            const cv = await getCV();
            renderAdmin(res, viewList, `Gérer les ${name}`, {
                [field]: cv ? cv[field] : []
            });
        }),

        newForm: (req, res) => {
            renderAdmin(res, viewNew, `Ajouter ${name.slice(0, -1)}`);
        },

        create: asyncHandler(async (req, res) => {
            const cv = await getCV();
            if (!cv) {
                flashError(req, 'CV non trouvé. Créez d\'abord un CV.');
                return res.redirect(redirect);
            }

            // Pour les loisirs (tableau de strings), on push juste le nom
            isArray ? cv[field].push(req.body.nom) : cv[field].push(req.body);
            await cv.save();

            flashSuccess(req, `${name.slice(0, -1)} ajouté(e)`);
            res.redirect(redirect);
        }),

        delete: asyncHandler(async (req, res) => {
            const cv = await getCV();
            if (cv) {
                if (isArray) {
                    // Pour les loisirs, suppression par index
                    const index = parseInt(req.params.id);
                    if (index >= 0 && index < cv[field].length) {
                        cv[field].splice(index, 1);
                    }
                } else {
                    // Pour les sous-documents, suppression par _id
                    cv[field].pull({ _id: req.params.id });
                }
                await cv.save();
                flashSuccess(req, `${name.slice(0, -1)} supprimé(e)`);
            }
            res.redirect(redirect);
        })
    };
};

// ==================== HANDLERS ====================

// Expériences
const experienceHandlers = createCrudHandlers({
    field: 'experiences',
    name: 'Expériences',
    viewList: 'experiences',
    viewNew: 'experience-new',
    redirect: '/admin/experiences'
});

// Formations
const formationHandlers = createCrudHandlers({
    field: 'formation',
    name: 'Formations',
    viewList: 'formations',
    viewNew: 'formation-new',
    redirect: '/admin/formations'
});

// Loisirs
const loisirHandlers = createCrudHandlers({
    field: 'loisirs',
    name: 'Loisirs',
    viewList: 'loisirs',
    viewNew: 'loisir-new',
    redirect: '/admin/loisirs',
    isArray: true
});

// ==================== EXPORTS ====================

module.exports = {
    // Dashboard
    dashboard: asyncHandler(async (req, res) => {
        const [cv, messageCount, unreadCount] = await Promise.all([
            getCV(),
            Message.countDocuments(),
            Message.countDocuments({ lu: false })
        ]);
        renderAdmin(res, 'dashboard', 'Administration', { cv, messageCount, unreadCount });
    }),

    // Expériences
    listExperiences: experienceHandlers.list,
    newExperienceForm: experienceHandlers.newForm,
    createExperience: experienceHandlers.create,
    deleteExperience: experienceHandlers.delete,

    // Formations
    listFormations: formationHandlers.list,
    newFormationForm: formationHandlers.newForm,
    createFormation: formationHandlers.create,
    deleteFormation: formationHandlers.delete,

    // Loisirs
    listLoisirs: loisirHandlers.list,
    newLoisirForm: loisirHandlers.newForm,
    createLoisir: loisirHandlers.create,
    deleteLoisir: loisirHandlers.delete,

    // Messages
    listMessages: asyncHandler(async (req, res) => {
        const messages = await Message.find().sort({ createdAt: -1 });
        renderAdmin(res, 'messages', 'Messages', { messages });
    }),

    markMessageRead: asyncHandler(async (req, res) => {
        await Message.findByIdAndUpdate(req.params.id, { lu: true });
        res.redirect('/admin/messages');
    }),

    deleteMessage: asyncHandler(async (req, res) => {
        await Message.findByIdAndDelete(req.params.id);
        flashSuccess(req, 'Message supprimé');
        res.redirect('/admin/messages');
    })
};
