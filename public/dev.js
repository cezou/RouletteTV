// This script will only run during local development with Live Server
// It mocks API responses so you can test the UI without connecting to Vercel

// Flag to determine if we're running locally via Live Server
const isLocalDev = window.location.port === '5500' || window.location.port === '5501';

// If running locally, override the fetch function to mock API responses
if (isLocalDev) {
    console.log('Running in local development mode - API calls will be mocked');
    
    // Store the original fetch function
    const originalFetch = window.fetch;
    
    // Override fetch to intercept API calls
    window.fetch = function(url, options) {
        // If this is an API call
        if (url.startsWith('/api/')) {
            console.log(`Mocking API call to: ${url}`);
            
            // Mock save-result API
            if (url === '/api/save-result') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ 
                        success: true,
                        message: 'Result saved (mocked)' 
                    })
                });
            }
            
            // Mock get-history API
            if (url === '/api/get-history') {
                // Generate some mock history data
                const mockHistory = [
                    {
                        username: 'Test User 1',
                        prize: '<img src="https://picsum.photos/100" width="100" height="100" onerror="alert(\'XSS Test\')" /> Cheveu de Yago',
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
        
        // For all other requests, use the original fetch
        return originalFetch(url, options);
    };
}
