// js/media.js

// Channel Links
const news11 = `<iframe class="news" width="100%" height="100%" src="https://www.kan.org.il/live/" frameborder="0" allowfullscreen id="mainScreen" autoplay></iframe>`;
const news12 = `<iframe class="news" width="100%" height="100%" src="https://www.mako.co.il/AjaxPage?jspName=embedHTML5video.jsp&galleryChannelId=3bf5c3a8e967f510VgnVCM2000002a0c10acRCRD&videoChannelId=8bf955222beab610VgnVCM100000700a10acRCRD&vcmid=1e2258089b67f510VgnVCM2000002a0c10acRCRD" frameborder="0" allowfullscreen id="mainScreen" autoplay></iframe>`;
const news13 = `<iframe class="news" width="100%" height="100%" src="https://13tv.co.il/live/" frameborder="0" allowfullscreen id="mainScreen" autoplay></iframe>`;
const news14 = `<iframe class="news" width="100%" height="100%" src="https://gurutv.online/ch14.html#google_vignette" frameborder="0" allowfullscreen id="mainScreen" autoplay></iframe>`;

function initMedia() {
    const pickChanels = document.getElementById('pickChanels');
    const chanels = document.getElementById('chanels');
    const close2 = document.getElementById('close2');
    const videoChanel = document.getElementById('videoChanel');

    const chanel11 = document.getElementById('11');
    const chanel12 = document.getElementById('12');
    const chanel13 = document.getElementById('13');
    const chanel14 = document.getElementById('14');

    if (!pickChanels || !chanels || !close2) return;

    // Toggle Menu
    pickChanels.addEventListener("click", () => {
        chanels.classList.remove("chanels-hide");
        chanels.classList.add("chanels-show");
    });

    close2.addEventListener("click", () => {
        chanels.classList.remove("chanels-show");
        chanels.classList.add("chanels-hide");
    });

    // Select Channels
    chanel11.addEventListener("click", () => {
        videoChanel.innerHTML = news11;
        chanels.classList.add("chanels-hide");
    });

    chanel12.addEventListener("click", () => {
        videoChanel.innerHTML = news12;
        chanels.classList.add("chanels-hide");
    });

    chanel13.addEventListener("click", () => {
        videoChanel.innerHTML = news13;
        chanels.classList.add("chanels-hide");
    });

    chanel14.addEventListener("click", () => {
        videoChanel.innerHTML = news14;
        chanels.classList.add("chanels-hide");
    });
}

window.initMedia = initMedia;
