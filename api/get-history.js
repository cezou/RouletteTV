const redis = require('./redis');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        const results = await redis.lrange('results', 0, 49);
        // Les résultats sont déjà des objets, pas besoin de JSON.parse
        console.log('Raw results:', results);

        return res.status(200).json({
            success: true,
            history: results
        });
    } catch (error) {
        console.error('Fetch error:', error.message);
        return res.status(500).json({
            error: 'Failed to fetch history',
            details: error.message
        });
    }
};