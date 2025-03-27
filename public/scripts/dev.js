/**
 * @brief Flag to determine if we're running locally via Live Server
 */
const isLocalDev = window.location.port === '5500' || window.location.port === '5501';

/**
 * @brief Wait for user interaction before initializing mock API
 */
if (isLocalDev) {
    console.log('Development mode detected - waiting for user interaction before enabling mocks');
    
    // Add event listeners to detect user interaction
    const initMockApi = () => {
        console.log('User interaction detected - enabling mock API');
        setupMockApi();
        
        // Remove listeners after initialization
        document.removeEventListener('click', initMockApi);
        document.removeEventListener('keydown', initMockApi);
        document.removeEventListener('touchstart', initMockApi);
    };
    
    document.addEventListener('click', initMockApi);
    document.addEventListener('keydown', initMockApi);
    document.addEventListener('touchstart', initMockApi);
}

/**
 * @brief Set up API mocking for local development
 */
function setupMockApi() {
    console.log('Running in local development mode - API calls will be mocked');
    
    // Maintain state to track if we've already sent mock data
    const mockState = {
        historyFetched: false,
        mockHistory: [
            {
                username: 'Test User 3',
                prize: 'Rhumberto Blanc',
                timestamp: Date.now() - 900000
            },
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
        ]
    };
    
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
                // Only send mock data the first time
                if (!mockState.historyFetched) {
                    mockState.historyFetched = true;
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ 
                            success: true,
                            history: mockState.mockHistory 
                        })
                    });
                } else {
                    // After first fetch, return empty history array
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ 
                            success: true,
                            history: [] 
                        })
                    });
                }
            }
        }
        return originalFetch(url, options);
    };
}
