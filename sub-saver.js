const API_URL = "https://3jmrw7e420.execute-api.us-east-1.amazonaws.com/SaveSubscription";

async function addSubscription() {
    const nameInput = document.getElementById('sub-name');
    const dateInput = document.getElementById('sub-date');
    const apiStatus = document.getElementById('api-status');
    const subList = document.getElementById('sub-list');

    // Basic validation to ensure fields aren't empty
    if (nameInput.value === '' || dateInput.value === '') {
        alert("Please enter a service name and renewal date.");
        return;
    }

    // Show loading state in the UI
    apiStatus.classList.remove('hidden');
    apiStatus.style.background = '#fef08a';
    apiStatus.style.color = '#854d0e';
    apiStatus.innerText = "POST /api/subs - Executing Lambda...";

    // 1. Prepare the data payload to send to AWS
    const payload = {
        serviceName: nameInput.value,
        renewalDate: dateInput.value
    };

    try {
        // 2. Make the real network call to your API Gateway
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        // 3. Handle the response from AWS
        if (response.ok) {
            // Success State
            apiStatus.style.background = '#dcfce7';
            apiStatus.style.color = '#166534';
            apiStatus.innerText = "✅ 200 OK: Written to DynamoDB";

            // Calculate days until renewal for the UI
            const today = new Date();
            const endDate = new Date(dateInput.value);
            const timeDiff = endDate.getTime() - today.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            const daysText = daysDiff > 0 ? `Renews in ${daysDiff} days` : "Renews today";

            // Add the new item to the visual list on the screen
            const newItem = document.createElement('div');
            newItem.className = 'sub-item';
            newItem.innerHTML = `
                <div class="sub-info">
                    <strong>${nameInput.value}</strong>
                    <small>${daysText}</small>
                </div>
                <span class="status-badge new">Tracking Live</span>
            `;
            subList.insertBefore(newItem, subList.firstChild);

            // Clear the input fields
            nameInput.value = '';
            dateInput.value = '';
        } else {
            throw new Error("API returned an error");
        }
    } catch (error) {
        // Error State
        apiStatus.style.background = '#fee2e2';
        apiStatus.style.color = '#991b1b';
        apiStatus.innerText = "❌ 500 Error: Failed to reach AWS";
        console.error("AWS Connection Error:", error);
    }

    // Hide the status message after 4 seconds
    setTimeout(() => {
        apiStatus.classList.add('hidden');
    }, 4000);
}

const DEMO_POST_URL = "https://3jmrw7e420.execute-api.us-east-1.amazonaws.com/prod/SendDemoAlert";
const DEMO_GET_URL = "https://3jmrw7e420.execute-api.us-east-1.amazonaws.com/prod/GetDemoUsers";

// A bank of random, tech-focused thank you messages
const thankYouMessages = [
    "successfully triggered the serverless pipeline! 🚀",
    "verified the AWS SES integration. Thank you! ✉️",
    "just tested the DynamoDB write capacity! 💾",
    "woke up the Lambda functions. Thanks! ⚡",
    "pinged the API Gateway. Architecture confirmed! 🌐"
];

async function sendDemoEmail() {
    const emailInput = document.getElementById('demo-email');
    const usernameInput = document.getElementById('demo-username');
    const demoStatus = document.getElementById('demo-status');

    if (emailInput.value === '' || !emailInput.value.includes('@')) {
        alert("Please enter a valid email address.");
        return;
    }

    demoStatus.classList.remove('hidden');
    demoStatus.style.background = '#fef08a';
    demoStatus.style.color = '#854d0e';
    demoStatus.innerText = "Triggering AWS SES & DynamoDB...";

    const payload = {
        recipientEmail: emailInput.value,
        username: usernameInput.value // Send the username to Lambda
    };

    try {
        const response = await fetch(DEMO_POST_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            demoStatus.style.background = '#dcfce7';
            demoStatus.style.color = '#166534';
            demoStatus.innerText = "✅ Pipeline Success! Check your inbox.";
            emailInput.value = '';
            usernameInput.value = '';
            
            // Refresh the feed to show the new user instantly!
            fetchLiveFeed(); 
        } else {
            throw new Error("API Error");
        }
    } catch (error) {
        demoStatus.style.background = '#fee2e2';
        demoStatus.style.color = '#991b1b';
        demoStatus.innerText = "❌ Connection Error";
        console.error("Demo Error:", error);
    }
    setTimeout(() => { demoStatus.classList.add('hidden'); }, 5000);
}

// --- NEW LIVE FEED LOGIC ---

async function fetchLiveFeed() {
    try {
        const response = await fetch(DEMO_GET_URL);
        const users = await response.json();
        
        const scrollBox = document.getElementById('feed-scroll-box');
        scrollBox.innerHTML = ''; // Clear old data

        if (users.length === 0) {
            scrollBox.innerHTML = '<div style="font-size:0.8rem; color:#64748b; text-align:center; padding-top:20px;">No tests run yet. Be the first!</div>';
            return;
        }

        // Generate the HTML for each user
        users.forEach(user => {
            const randomMsg = thankYouMessages[Math.floor(Math.random() * thankYouMessages.length)];
            const timeAgo = new Date(user.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            const itemHTML = `
                <div style="background: white; padding: 10px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border-left: 3px solid #0284c7;">
                    <span style="font-weight: bold; color: #0f172a; font-size: 0.85rem;">${user.username}</span>
                    <span style="font-size: 0.75rem; color: #94a3b8; float: right;">${timeAgo}</span>
                    <div style="font-size: 0.8rem; color: #475569; margin-top: 4px;">...${randomMsg}</div>
                </div>
            `;
            scrollBox.innerHTML += itemHTML;
        });

        startAutoScroll();
    } catch (error) {
        console.error("Failed to load feed:", error);
    }
}

// Auto-scrolling animation logic
let scrollInterval;
function startAutoScroll() {
    const scrollBox = document.getElementById('feed-scroll-box');
    let currentPosition = 0;
    
    // Clear any existing intervals so they don't overlap
    if(scrollInterval) clearInterval(scrollInterval);
    
    scrollInterval = setInterval(() => {
        // Scroll up slowly
        currentPosition -= 0.5;
        scrollBox.style.transform = `translateY(${currentPosition}px)`;
        
        // Reset to top if it scrolls past the content height
        if (Math.abs(currentPosition) > scrollBox.scrollHeight - 150) {
            currentPosition = 0;
        }
    }, 30);
}

// Fetch the feed immediately when the page loads
window.onload = () => {
    fetchLiveFeed();
};