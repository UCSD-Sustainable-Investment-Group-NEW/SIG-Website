// Lightbox functionality for committee images
document.addEventListener('DOMContentLoaded', function() {
    const lightboxTriggers = document.querySelectorAll('[data-lightbox]');
    
    lightboxTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const imageSrc = this.getAttribute('data-image');
            
            // Don't open lightbox for placeholders (empty image src)
            if (!imageSrc || imageSrc === '') {
                return;
            }
            
            openLightbox(imageSrc);
        });
    });
    
    function openLightbox(imageSrc) {
        // Create lightbox overlay
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox-overlay';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
                <img src="${imageSrc}" alt="Committee Photo" class="lightbox-image">
            </div>
        `;
        
        // Add to body
        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Animate in
        setTimeout(() => {
            lightbox.classList.add('active');
        }, 10);
        
        // Close handlers
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const closeLightbox = () => {
            lightbox.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(lightbox);
                document.body.style.overflow = ''; // Restore scrolling
            }, 300);
        };
        
        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeLightbox();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }
});


