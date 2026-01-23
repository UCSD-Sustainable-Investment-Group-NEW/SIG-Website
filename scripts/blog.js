// Blog page specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Generate PDF thumbnails - try PDF.js first, fallback to embed
    function generatePdfThumbnails() {
        const pdfThumbnails = document.querySelectorAll('.pdf-thumbnail');
        
        pdfThumbnails.forEach((container, index) => {
            const pdfPath = container.getAttribute('data-pdf');
            if (!pdfPath) return;

            // Try PDF.js if available
            if (typeof pdfjsLib !== 'undefined') {
                generatePdfThumbnailWithPdfJs(container, pdfPath, index);
            } else {
                // Fallback to embed tag
                generatePdfThumbnailWithEmbed(container, pdfPath);
            }
        });
    }

    function generatePdfThumbnailWithPdfJs(container, pdfPath, index) {
        // Configure PDF.js worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        const containerWidth = container.offsetWidth || 400;
        const containerHeight = 200;
        
        // Create canvas element
        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '200px';
        canvas.style.display = 'block';
        canvas.style.backgroundColor = '#ffffff';
        
        // Set canvas internal resolution
        const dpr = window.devicePixelRatio || 1;
        canvas.width = containerWidth * dpr;
        canvas.height = containerHeight * dpr;

        const context = canvas.getContext('2d');
        context.scale(dpr, dpr);

        // Fill with white background
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, containerWidth, containerHeight);

        container.appendChild(canvas);

        // Load and render PDF
        pdfjsLib.getDocument(pdfPath).promise
            .then(pdf => {
                return pdf.getPage(1);
            })
            .then(page => {
                // Calculate scale to fit
                const viewport = page.getViewport({ scale: 1.0 });
                const scale = Math.min(
                    containerWidth / viewport.width,
                    containerHeight / viewport.height
                ) * 0.95;
                const scaledViewport = page.getViewport({ scale: scale });

                // Clear and redraw white background
                context.fillStyle = '#ffffff';
                context.fillRect(0, 0, containerWidth, containerHeight);

                // Calculate centering
                const xOffset = (containerWidth - scaledViewport.width) / 2;
                const yOffset = (containerHeight - scaledViewport.height) / 2;

                // Render PDF page
                const renderContext = {
                    canvasContext: context,
                    viewport: scaledViewport
                };

                context.save();
                context.translate(xOffset, yOffset);
                
                return page.render(renderContext).promise.then(() => {
                    context.restore();
                });
            })
            .catch(error => {
                console.error('PDF.js failed for', pdfPath, error);
                // Remove canvas and try embed fallback
                if (canvas.parentNode) {
                    canvas.parentNode.removeChild(canvas);
                }
                generatePdfThumbnailWithEmbed(container, pdfPath);
            });
    }

    function generatePdfThumbnailWithEmbed(container, pdfPath) {
        // Use embed tag as fallback
        const embed = document.createElement('embed');
        embed.src = pdfPath + '#page=1&toolbar=0&navpanes=0&scrollbar=0&zoom=page-fit';
        embed.type = 'application/pdf';
        embed.style.width = '100%';
        embed.style.height = '200px';
        embed.style.display = 'block';
        embed.style.backgroundColor = '#ffffff';
        
        container.appendChild(embed);
    }

    // Initialize after a short delay
    setTimeout(generatePdfThumbnails, 300);

    // Blog post filtering functionality
    const filterButtons = document.querySelectorAll('.blog-categories .filter-btn');
    const blogCards = document.querySelectorAll('.blog-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            // Filter blog posts
            blogCards.forEach(card => {
                const cardCategories = card.getAttribute('data-category') || '';
                
                if (filterValue === 'all' || cardCategories.includes(filterValue)) {
                    card.style.display = 'block';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 100);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });

            // Update visible count
            updatePostCount(filterValue);
        });
    });

    // Update post count display
    function updatePostCount(filter) {
        const totalPosts = document.querySelectorAll('.blog-card').length;
        const visiblePosts = filter === 'all' ? totalPosts : 
            document.querySelectorAll(`.blog-card[data-category*="${filter}"]`).length;
        
        // Create or update count display
        let countDisplay = document.querySelector('.post-count');
        if (!countDisplay) {
            countDisplay = document.createElement('p');
            countDisplay.className = 'post-count';
            countDisplay.style.cssText = `
                text-align: center;
                color: var(--text-secondary);
                font-size: var(--font-size-sm);
                margin-bottom: var(--spacing-6);
            `;
            document.querySelector('.posts-grid').parentNode.insertBefore(countDisplay, document.querySelector('.posts-grid'));
        }
        
        countDisplay.textContent = `Showing ${visiblePosts} of ${totalPosts} articles`;
    }

    // Initial count
    updatePostCount('all');

    // Load more functionality
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            // Simulate loading more posts
            this.textContent = 'Loading...';
            this.disabled = true;
            
            setTimeout(() => {
                // Add placeholder posts
                addMorePosts();
                this.textContent = 'Load More Posts';
                this.disabled = false;
                
                // Hide button after loading more
                this.style.display = 'none';
                
                // Show message
                const message = document.createElement('p');
                message.textContent = 'All posts loaded!';
                message.style.cssText = `
                    text-align: center;
                    color: var(--text-secondary);
                    font-style: italic;
                `;
                this.parentNode.appendChild(message);
            }, 1500);
        });
    }

    function addMorePosts() {
        const postsGrid = document.querySelector('.posts-grid');
        const additionalPosts = [
            {
                category: 'research',
                date: 'September 12, 2024',
                title: 'Carbon Credits: Market Dynamics and Investment Opportunities',
                excerpt: 'An in-depth analysis of the carbon credit market and its potential for sustainable investors.',
                author: 'David Park',
                image: 'assets/blog/carbon-credits.jpg'
            },
            {
                category: 'market-analysis',
                date: 'September 5, 2024',
                title: 'The Rise of ESG ETFs: Performance and Prospects',
                excerpt: 'Examining the growth and performance of ESG-focused exchange-traded funds.',
                author: 'Sarah Chen',
                image: 'assets/blog/esg-etfs.jpg'
            }
        ];

        additionalPosts.forEach(post => {
            const postCard = createBlogCard(post);
            postsGrid.appendChild(postCard);
            
            // Animate in
            setTimeout(() => {
                postCard.style.opacity = '1';
                postCard.style.transform = 'translateY(0)';
            }, 100);
        });

        updatePostCount('all');
    }

    function createBlogCard(post) {
        const card = document.createElement('article');
        card.className = `blog-card ${post.category}`;
        card.setAttribute('data-category', post.category);
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s ease';

        card.innerHTML = `
            <div class="blog-image">
                <img src="${post.image}" alt="${post.title}">
            </div>
            <div class="blog-content">
                <div class="post-meta">
                    <span class="post-category">${post.category.replace('-', ' ')}</span>
                    <span class="post-date">${post.date}</span>
                </div>
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <div class="blog-footer">
                    <span class="post-author">${post.author}</span>
                    <a href="#" class="read-more">Read More</a>
                </div>
            </div>
        `;

        return card;
    }

    // Newsletter subscription
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        const newsletterInput = newsletterForm.querySelector('.newsletter-input');
        const newsletterBtn = newsletterForm.querySelector('.newsletter-btn');

        newsletterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const email = newsletterInput.value.trim();
            
            if (email && isValidEmail(email)) {
                // Simulate subscription
                this.textContent = 'Subscribing...';
                this.disabled = true;
                
                setTimeout(() => {
                    this.textContent = 'Subscribed!';
                    newsletterInput.value = '';
                    showNotification('Successfully subscribed to our newsletter!', 'success');
                    
                    setTimeout(() => {
                        this.textContent = 'Subscribe';
                        this.disabled = false;
                    }, 2000);
                }, 1000);
            } else {
                showNotification('Please enter a valid email address', 'error');
            }
        });

        // Enter key support
        newsletterInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                newsletterBtn.click();
            }
        });
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        if (type === 'error') {
            notification.style.backgroundColor = '#ef4444';
        } else if (type === 'success') {
            notification.style.backgroundColor = '#22c55e';
        } else {
            notification.style.backgroundColor = '#3b82f6';
        }

        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // PDF Modal functionality - Define functions first
    let pdfModal, pdfViewer, pdfModalClose;
    
    // Open PDF modal
    function openPdfModal(pdfPath) {
        if (!pdfModal || !pdfViewer) {
            pdfModal = document.getElementById('pdf-modal');
            pdfViewer = document.getElementById('pdf-viewer');
        }
        
        if (!pdfModal || !pdfViewer) {
            console.error('PDF modal elements not found');
            return;
        }
        
        pdfViewer.src = pdfPath;
        pdfModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Animate in
        setTimeout(() => {
            pdfModal.style.opacity = '1';
        }, 10);
    }

    // Close PDF modal
    function closePdfModal() {
        if (!pdfModal) {
            pdfModal = document.getElementById('pdf-modal');
            pdfViewer = document.getElementById('pdf-viewer');
        }
        
        if (!pdfModal || !pdfViewer) return;
        
        pdfModal.style.opacity = '0';
        setTimeout(() => {
            pdfModal.style.display = 'none';
            pdfViewer.src = '';
            document.body.style.overflow = '';
        }, 300);
    }

    // Initialize PDF modal
    pdfModal = document.getElementById('pdf-modal');
    pdfViewer = document.getElementById('pdf-viewer');
    pdfModalClose = document.querySelector('.pdf-modal-close');
    
    if (pdfModal && pdfViewer) {
        // Blog post click handlers - check if it's a PDF link
        const blogReadMoreLinks = document.querySelectorAll('.read-more, .read-more-btn');
        blogReadMoreLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const pdfPath = this.getAttribute('data-pdf');
                
                if (pdfPath) {
                    // Open PDF in modal
                    openPdfModal(pdfPath);
                } else {
                    // Regular blog post modal
                    const postTitle = this.closest('.blog-card, .featured-content')?.querySelector('h3, h2')?.textContent;
                    if (postTitle) {
                        showBlogPostModal(postTitle);
                    }
                }
            });
        });

        // Close modal handlers
        if (pdfModalClose) {
            pdfModalClose.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                closePdfModal();
            });
        }

        // Close modal when clicking outside
        pdfModal.addEventListener('click', function(e) {
            if (e.target === pdfModal) {
                closePdfModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && pdfModal && pdfModal.style.display === 'flex') {
                closePdfModal();
            }
        });
    } else {
        console.warn('PDF modal elements not found in DOM');
    }

    function showBlogPostModal(title) {
        const modal = document.createElement('div');
        modal.className = 'blog-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content blog-modal-content">
                    <div class="modal-header">
                        <h2>${title}</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="blog-post-content">
                            <p><em>This is a preview of the blog post. The full article would be displayed here with rich content, images, and detailed analysis.</em></p>
                            <p>Our blog features in-depth research, market analysis, and insights from industry professionals. Each post is carefully crafted to provide valuable information for students and professionals interested in sustainable investing.</p>
                            <p>To read the full article and access our complete blog archive, please visit our main website or contact us for more information.</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary">Read Full Article</button>
                        <button class="btn btn-secondary modal-close-btn">Close</button>
                    </div>
                </div>
            </div>
        `;

        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        const modalOverlay = modal.querySelector('.modal-overlay');
        modalOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;

        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.cssText = `
            background: white;
            border-radius: 12px;
            max-width: 700px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            transform: scale(0.9);
            transition: transform 0.3s ease;
        `;

        const modalHeader = modal.querySelector('.modal-header');
        modalHeader.style.cssText = `
            padding: 24px 24px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 24px;
        `;

        const modalBody = modal.querySelector('.modal-body');
        modalBody.style.cssText = `
            padding: 0 24px;
            line-height: 1.6;
            color: #374151;
        `;

        const modalFooter = modal.querySelector('.modal-footer');
        modalFooter.style.cssText = `
            padding: 24px;
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            border-top: 1px solid #e5e7eb;
            margin-top: 24px;
        `;

        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #6b7280;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        document.body.appendChild(modal);

        setTimeout(() => {
            modal.style.opacity = '1';
            modalContent.style.transform = 'scale(1)';
        }, 10);

        // Close modal handlers
        function closeModal() {
            modal.style.opacity = '0';
            modalContent.style.transform = 'scale(0.9)';
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        }

        closeBtn.addEventListener('click', closeModal);
        modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
        
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });

        // Read full article button
        modal.querySelector('.btn-primary').addEventListener('click', function() {
            alert('Full article would open here or redirect to detailed blog page.');
        });
    }

    // Instagram feed simulation
    const instagramPosts = document.querySelectorAll('.instagram-post');
    instagramPosts.forEach(post => {
        post.addEventListener('click', function() {
            // Simulate opening Instagram post
            window.open('https://instagram.com/ucsd_sig', '_blank');
        });
    });

    // Add search functionality for blog posts
    function addBlogSearch() {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'blog-search';
        searchContainer.style.cssText = `
            margin-bottom: var(--spacing-6);
            text-align: center;
        `;

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search articles by title, author, or content...';
        searchInput.style.cssText = `
            width: 100%;
            max-width: 500px;
            padding: var(--spacing-3);
            border: 2px solid var(--gray-300);
            border-radius: var(--radius-md);
            font-size: var(--font-size-base);
            transition: border-color 0.3s ease;
        `;

        searchInput.addEventListener('focus', function() {
            this.style.borderColor = 'var(--primary-green)';
        });

        searchInput.addEventListener('blur', function() {
            this.style.borderColor = 'var(--gray-300)';
        });

        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            blogCards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const author = card.querySelector('.post-author')?.textContent.toLowerCase() || '';
                const excerpt = card.querySelector('p')?.textContent.toLowerCase() || '';
                const category = card.querySelector('.post-category')?.textContent.toLowerCase() || '';
                
                const isVisible = title.includes(searchTerm) || 
                                author.includes(searchTerm) || 
                                excerpt.includes(searchTerm) ||
                                category.includes(searchTerm);
                
                if (isVisible) {
                    card.style.display = 'block';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        if (!isVisible) card.style.display = 'none';
                    }, 300);
                }
            });
        });

        searchContainer.appendChild(searchInput);
        
        // Insert search before blog posts
        const blogPosts = document.querySelector('.blog-posts');
        const postsGrid = blogPosts.querySelector('.posts-grid');
        postsGrid.parentNode.insertBefore(searchContainer, postsGrid);
    }

    // Add search functionality
    addBlogSearch();

    // Add hover effects to blog cards
    blogCards.forEach(card => {
        card.style.transition = 'all 0.3s ease';
        
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
            this.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
        });
    });

    console.log('Blog page scripts loaded successfully!');
});
