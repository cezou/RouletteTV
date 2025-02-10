const prizes = ['$1000', '$500', '$100', '$50', '$10', 'Try Again'];
let isSpinning = false;

document.getElementById('spin').addEventListener('click', async () => {
    if (isSpinning) return;
    
    const username = document.getElementById('username').value;
    if (!username) {
        alert('Please enter your name first!');
        return;
    }

    isSpinning = true;
    const prize = await spinWheel();
    await saveResult(username, prize);
    isSpinning = false;
});

async function spinWheel() {
    // Wheel animation logic here
    return prizes[Math.floor(Math.random() * prizes.length)];
}

async function saveResult(username, prize) {
    try {
        const response = await fetch('/api/save-result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, prize })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Save successful:', data);
    } catch (error) {
        console.error('Failed to save result:', error);
    }
}