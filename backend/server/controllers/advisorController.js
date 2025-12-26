const advisorModel = require('../models/advisorModel');

const getAdvisorLoadDistribution = async (req, res) => {
    try {
        const data = await advisorModel.getAdvisorsWithLoad();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching advisor load:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

module.exports = {
    getAdvisorLoadDistribution,
};
