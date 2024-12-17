document.addEventListener('DOMContentLoaded', () => {
    const videos = document.querySelectorAll('#intro video, #one video, #two video');

    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.play();
            } else {
                entry.target.pause();
            }
        });
    }, {
        threshold: 0.1 // Trigger when at least 10% of the video is visible
    });

    // Observe each video
    videos.forEach(video => {
        videoObserver.observe(video);
    });
});