// Function to pause between movements
const delay = ms => new Promise(res => setTimeout(res, ms));

async function runSimulation(type) {
    const packet = document.getElementById('packet');
    const status = document.getElementById('sim-status');
    
    // Reset packet
    packet.classList.remove('hidden');
    
    if (type === 'pos-to-server') {
        // Step 1: Start at Register 1
        status.innerText = "Initiating ping from Register 1 (10.0.10.5)...";
        packet.style.left = '95px';
        packet.style.top = '320px';
        await delay(800);

        // Step 2: Move to POS Switch
        status.innerText = "ARP Request to Default Gateway via Switch A (VLAN 10)...";
        packet.style.left = '145px';
        packet.style.top = '220px';
        await delay(800);

        // Step 3: Move to Core
        status.innerText = "Traversing 802.1Q Trunk link to Core Switch...";
        packet.style.left = '295px';
        packet.style.top = '120px';
        await delay(800);

        // Step 4: Move to Router
        status.innerText = "Gateway Router routing packet from VLAN 10 to VLAN 20...";
        packet.style.left = '295px';
        packet.style.top = '20px';
        packet.style.background = '#f59e0b'; // Change color to show routing
        packet.style.boxShadow = '0 0 10px #f59e0b, 0 0 20px #f59e0b';
        await delay(800);

        // Step 5: Back to Core
        status.innerText = "Packet routed. Descending to Core Switch...";
        packet.style.left = '295px';
        packet.style.top = '120px';
        await delay(800);

        // Step 6: To Office Switch
        status.innerText = "Forwarding to Switch B (VLAN 20)...";
        packet.style.left = '445px';
        packet.style.top = '220px';
        await delay(800);

        // Step 7: To Server
        status.innerText = "ICMP Echo Request received by Inv Server (10.0.20.100). Success!";
        packet.style.left = '495px';
        packet.style.top = '320px';
        
        await delay(2000);
        packet.classList.add('hidden');
        packet.style.background = '#22c55e'; // Reset color
        packet.style.boxShadow = '0 0 10px #22c55e, 0 0 20px #22c55e';
        status.innerText = "System Ready...";
    }
    
    if (type === 'guest-to-wan') {
        status.innerText = "Guest Traffic isolated. Routing directly to WAN...";
        // You can add a second path logic here later!
        await delay(1500);
        packet.classList.add('hidden');
        status.innerText = "System Ready...";
    }
}