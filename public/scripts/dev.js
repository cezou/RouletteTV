/**
 * @brief Flag to determine if we're running locally via Live Server
 */
const isLocalDev = window.location.port === '5500' || window.location.port === '5501';

/**
 * @brief Set up API mocking for local development
 */
if (isLocalDev) {
    console.log('Running in local development mode - API calls will be mocked');
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (url.startsWith('/api/')) {
            console.log(`Mocking API call to: ${url}`);
            if (url === '/api/save-result') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ 
                        success: true,
                        message: 'Result saved (mocked)' 
                    })
                });
            }
            if (url === '/api/get-history') {
                const mockHistory = [
                    {
                        username: 'Test User 1',
                        prize: 'Cheveu de Yago',
                        timestamp: Date.now() - 300000
                    },
                    {
                        username: 'Test User 2',
                        prize: 'Seringue utilisée',
                        timestamp: Date.now() - 600000
                    },
                    {
                        username: 'Test User 3',
                        prize: 'Rhumberto Blanc',
                        timestamp: Date.now() - 900000
                    }
                ];
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ 
                        success: true,
                        history: mockHistory 
                    })
                });
            }
        }
        return originalFetch(url, options);
    };
}
