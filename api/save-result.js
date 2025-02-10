const redis = require('./redis');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { username, prize } = req.body;
        
        const entry = {
            username,
            prize,
            timestamp: Date.now()
        };

        // Sauvegarder l'objet directement (Redis le sérialisera correctement)
        await redis.lpush('results', entry);
        console.log('Saved entry:', entry);

        return res.status(200).json({ 
            success: true,
            message: 'Result saved successfully'
        });
    } catch (error) {
        console.error('Save error:', error);
        return res.status(500).json({ 
            error: 'Failed to save result',
            details: error.message
        });
    }
};