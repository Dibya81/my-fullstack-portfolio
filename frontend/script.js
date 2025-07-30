// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu Functionality ---
    const menuButton = document.getElementById('menu-button');
    const sidebar = document.querySelector('.sidebar');
    if (menuButton && sidebar) {
        menuButton.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            const icon = menuButton.querySelector('i');
            if (sidebar.classList.contains('open')) { icon.setAttribute('data-lucide', 'x'); } else { icon.setAttribute('data-lucide', 'menu'); }
            lucide.createIcons();
        });
        document.addEventListener('click', (event) => {
            if (sidebar.classList.contains('open') && !sidebar.contains(event.target) && !menuButton.contains(event.target)) {
                 sidebar.classList.remove('open');
                 const icon = menuButton.querySelector('i');
                 if (icon) { icon.setAttribute('data-lucide', 'menu'); lucide.createIcons(); }
            }
        });
    }

    // --- Contact Form Submission ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formStatus = document.getElementById('form-status');
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const formData = { name: document.getElementById('name').value, email: document.getElementById('email').value, message: document.getElementById('message').value };
            submitButton.disabled = true;
            submitButton.querySelector('span').textContent = 'Sending...';
            formStatus.textContent = '';
            formStatus.className = '';
            try {
                const response = await fetch('http://localhost:3000/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
                const result = await response.json();
                if (response.ok) {
                    formStatus.textContent = result.message;
                    formStatus.classList.add('success');
                    contactForm.reset();
                } else { throw new Error(result.message || 'An error occurred.'); }
            } catch (error) {
                formStatus.textContent = 'Failed to send message. Please try again later.';
                formStatus.classList.add('error');
                console.error('Form submission error:', error);
            } finally {
                submitButton.disabled = false;
                submitButton.querySelector('span').textContent = 'Send Message';
            }
        });
    }

    // ======================================================================
    // Photo & Video Gallery Logic
    // ======================================================================
    const galleryButtons = document.querySelectorAll('.gallery-button');
    const modal = document.getElementById('gallery-modal');
    const galleryContentHost = document.getElementById('gallery-content-host');
    const closeModalBtn = document.querySelector('.modal-close');
    const prevBtn = document.querySelector('.modal-prev');
    const nextBtn = document.querySelector('.modal-next');

    // --- IMPORTANT: Add your image and video paths here! ---
    // This code now automatically handles spaces and special characters.
    const galleries = {
        cricket: [
            { type: 'image', src: 'cricket/WhatsApp Image 2025-07-27 at 16.20.35 (1).jpeg' },
            { type: 'video', src: 'cricket/WhatsApp Video 2025-07-27 at 16.20.12.mp4' },
            { type: 'image', src: 'cricket/WhatsApp Image 2025-07-27 at 16.20.35.jpeg' },
            { type: 'image', src: 'cricket/WhatsApp Image 2025-07-27 at 16.20.36.jpeg' },
            { type: 'video', src: 'cricket/WhatsApp Video 2025-07-27 at 16.20.06.mp4' },
            { type: 'video', src: 'cricket/WhatsApp Video 2025-07-27 at 16.20.08.mp4' },
            { type: 'video', src: 'cricket/WhatsApp Video 2025-07-27 at 16.19.58.mp4' },
        ],
        photography: [
            { type: 'image', src: 'photography/WhatsApp Image 2025-07-27 at 16.18.11.jpeg' },
            { type: 'image', src: 'photography/WhatsApp Image 2025-07-27 at 16.18.12.jpeg' },
            { type: 'image', src: 'photography/WhatsApp Image 2025-07-27 at 16.18.13 (1).jpeg' },
            { type: 'image', src: 'photography/WhatsApp Image 2025-07-27 at 16.18.13.jpeg' },
            { type: 'image', src: 'photography/WhatsApp Image 2025-07-27 at 16.18.17 (1).jpeg' },
            { type: 'image', src: 'photography/WhatsApp Image 2025-07-27 at 16.18.17.jpeg' },
            { type: 'image', src: 'photography/WhatsApp Image 2025-07-27 at 16.18.18.jpeg' },
            { type: 'image', src: 'photography/WhatsApp Image 2025-07-27 at 16.18.19 (1).jpeg' },
            { type: 'image', src: 'photography/WhatsApp Image 2025-07-27 at 16.18.19 (2).jpeg' },
            { type: 'image', src: 'photography/WhatsApp Image 2025-07-27 at 16.18.19.jpeg' },
            { type: 'image', src: 'photography/WhatsApp Image 2025-07-27 at 16.18.21 (1).jpeg' },
            { type: 'image', src: 'photography/WhatsApp Image 2025-07-27 at 16.18.21.jpeg' },
            { type: 'image', src: 'photography/WhatsApp Image 2025-07-27 at 16.18.22 (1).jpeg' },
            { type: 'image', src: 'photography/WhatsApp Image 2025-07-27 at 16.18.22.jpeg' },
            { type: 'image', src: 'photography/WhatsApp Image 2025-07-27 at 16.18.23.jpeg' },
            { type: 'image', src: 'photography/WhatsApp Image 2025-07-27 at 16.18.24.jpeg' },
            { type: 'image', src: 'photography/WhatsApp Image 2025-07-27 at 16.18.25.jpeg' },
            { type: 'image', src: 'photography/WhatsApp Image 2025-07-27 at 16.18.26 (1).jpeg' },
            { type: 'image', src: 'photography/WhatsApp Image 2025-07-27 at 16.18.26.jpeg' },
        ]
    };

    let currentGallery = [];
    let currentIndex = 0;

    function updateMedia() {
        galleryContentHost.innerHTML = '';
        const media = currentGallery[currentIndex];
        const mediaPath = encodeURI(media.src); // Encodes the path to handle special characters

        if (media.type === 'image') {
            const img = document.createElement('img');
            img.src = mediaPath;
            galleryContentHost.appendChild(img);
        } else if (media.type === 'video') {
            const video = document.createElement('video');
            video.src = mediaPath;
            video.controls = true;
            video.autoplay = true;
            video.muted = true;
            video.loop = true;
            galleryContentHost.appendChild(video);
        }
    }

    function openModal(galleryName) {
        currentGallery = galleries[galleryName];
        if (!currentGallery || currentGallery.length === 0) {
            alert('This media gallery is empty. Please add content paths in script.js.');
            return;
        }
        currentIndex = 0;
        updateMedia();
        modal.classList.add('visible');
        document.body.classList.add('modal-open');
    }

    function closeModal() {
        modal.classList.remove('visible');
        document.body.classList.remove('modal-open');
        galleryContentHost.innerHTML = '';
    }

    function showNextMedia() {
        currentIndex = (currentIndex + 1) % currentGallery.length;
        updateMedia();
    }

    function showPrevMedia() {
        currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
        updateMedia();
    }

    if (modal) {
        galleryButtons.forEach(button => {
            button.addEventListener('click', () => {
                const galleryName = button.dataset.gallery;
                openModal(galleryName);
            });
        });
        closeModalBtn.addEventListener('click', closeModal);
        nextBtn.addEventListener('click', showNextMedia);
        prevBtn.addEventListener('click', showPrevMedia);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) { closeModal(); }
        });
        document.addEventListener('keydown', (e) => {
            if (modal.classList.contains('visible')) {
                if (e.key === 'ArrowRight') showNextMedia();
                else if (e.key === 'ArrowLeft') showPrevMedia();
                else if (e.key === 'Escape') closeModal();
            }
        });
    }
});
