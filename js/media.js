// js/media.js

const channels = [
    { id: '11', name: 'כאן 11', icon: '🌐', url: 'https://www.kan.org.il/live/' },
    { id: '12', name: 'קשת 12', icon: '📺', url: 'https://www.mako.co.il/AjaxPage?jspName=embedHTML5video.jsp&galleryChannelId=3bf5c3a8e967f510VgnVCM2000002a0c10acRCRD&videoChannelId=8bf955222beab610VgnVCM100000700a10acRCRD&vcmid=1e2258089b67f510VgnVCM2000002a0c10acRCRD' },
    { id: '13', name: 'רשת 13', icon: '📺', url: 'https://13tv.co.il/live/' },
    { id: '14', name: 'ערוץ 14', icon: '📡', url: 'https://gurutv.online/ch14.html#google_vignette' }
];

function initMedia() {
    const grid = document.getElementById('channel-grid');
    if (!grid) return;
    grid.innerHTML = '';

    channels.forEach(ch => {
        const card = document.createElement('div');
        card.className = 'channel-card';
        card.innerHTML = `
            <div class="channel-icon">${ch.icon}</div>
            <div class="channel-name">${ch.name}</div>
        `;
        card.onclick = (e) => selectChannel(ch, e.currentTarget);
        grid.appendChild(card);
    });
}

function selectChannel(channel, element) {
    const screen = document.getElementById('main-screen-content');
    const cards = document.querySelectorAll('.channel-card');

    // Highlight selected card
    cards.forEach(c => c.classList.remove('active'));
    if (element) element.classList.add('active');

    // Update Screen
    screen.innerHTML = `
        <iframe src="${channel.url}" width="100%" height="100%" frameborder="0" allowfullscreen style="border-radius: 8px;"></iframe>
    `;
}

// Export for main
window.initMedia = initMedia;
