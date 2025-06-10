const WebSocket = require('ws');
const wss = new WebSocket('ws://192.168.4.199:8080');

wss.onopen = () => {
    console.log('Connected to WebSocket server');
};

wss.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received data:', data);

    if (typeof data === 'object' && data !== null) {
        for (const [key, value] of Object.entries(data)) {
            console.log(`${key} : ${typeof value}`);
        }
    } else {
        console.log('Data is not an object:', typeof data);
    }
};

wss.onclose = () => {
    console.log('WebSocket connection closed');
};