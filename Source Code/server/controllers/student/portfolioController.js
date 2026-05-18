const StudentPortfolio = require('../../models/learning/portfolio/StudentPortfolio');

exports.getMyPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;
    let portfolio = await StudentPortfolio.findOne({ user: userId }).lean();
    if (!portfolio) {
      portfolio = await StudentPortfolio.create({ user: userId, skills: [], projects: [] });
      portfolio = portfolio.toObject();
    }
    res.json({ success: true, data: portfolio });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMyPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;
    const { headline, bio, skills, projects, visibility } = req.body || {};
    const update = {};
    if (headline !== undefined) update.headline = String(headline).slice(0, 200);
    if (bio !== undefined) update.bio = String(bio).slice(0, 2000);
    if (Array.isArray(skills)) update.skills = skills.map(s => ({
      name: String(s.name || '').slice(0, 60),
      level: Math.max(0, Math.min(100, Number(s.level || 0))),
      color: String(s.color || 'indigo')
    }));
    if (Array.isArray(projects)) update.projects = projects.map(p => ({
      title: String(p.title || '').slice(0, 120),
      description: String(p.description || '').slice(0, 1000),
      link: String(p.link || ''),
      tech: Array.isArray(p.tech) ? p.tech.slice(0, 12).map(t => String(t)) : []
    }));
    if (visibility) update.visibility = visibility === 'public' ? 'public' : 'private';

    const portfolio = await StudentPortfolio.findOneAndUpdate(
      { user: userId },
      { $set: update },
      { new: true, upsert: true }
    ).lean();

    res.json({ success: true, data: portfolio });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPublicPortfolio = async (req, res) => {
  try {
    const { studentId } = req.params;
    const portfolio = await StudentPortfolio.findOne({ user: studentId, visibility: 'public' })
      .select('-_id headline bio skills projects visibility updatedAt createdAt')
      .lean();
    if (!portfolio) return res.status(404).json({ success: false, message: 'Portfolio not found or private' });
    res.json({ success: true, data: portfolio });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
