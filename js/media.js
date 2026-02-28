// js/media.js

const channels = [
    { id: 'ch12', name: 'ערוץ 12', icon: '📺', category: 'News' },
    { id: 'ch13', name: 'ערוץ 13', icon: '📺', category: 'News' },
    { id: 'ch14', name: 'ערוץ 14', icon: '📡', category: 'News' },
    { id: 'kan11', name: 'כאן 11', icon: '🌐', category: 'News' },
    { id: 'i24', name: 'i24 News', icon: '🌍', category: 'Global' }
];

function initMedia() {
    const grid = document.getElementById('channel-grid');
    if (!grid) return;

    channels.forEach(ch => {
        const card = document.createElement('div');
        card.className = 'channel-card';
        card.innerHTML = `
            <div class="channel-icon">${ch.icon}</div>
            <div class="channel-name">${ch.name}</div>
            <div style="font-size: 0.7em; color: #666; margin-top: 5px;">${ch.category}</div>
        `;
        card.onclick = () => selectChannel(ch);
        grid.appendChild(card);
    });
}

function selectChannel(channel) {
    const screen = document.getElementById('main-screen-content');
    const cards = document.querySelectorAll('.channel-card');

    // Highlight selected card
    cards.forEach(c => c.classList.remove('active'));
    event.currentTarget.classList.add('active');

    // Update Screen
    screen.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
            <div style="font-size: 3rem;">${channel.icon}</div>
            <div style="font-size: 1.5rem; font-weight: bold;">שידור חי: ${channel.name}</div>
            <div style="background: rgba(0, 123, 255, 0.2); padding: 10px 20px; border-radius: 20px; border: 1px solid var(--accent-blue);">
                מתחבר לשרת השידור...
            </div>
            <div style="font-size: 0.8em; color: #555;">ID: ${channel.id}</div>
        </div>
    `;
}

// Export for main
window.initMedia = initMedia;
