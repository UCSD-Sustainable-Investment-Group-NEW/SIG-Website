// Instagram Feed Integration for SIG Website
// Supports multiple methods for loading Instagram content

class InstagramFeed {
    constructor(options = {}) {
        this.username = options.username || 'ucsdsig';
        this.containerId = options.containerId || 'instagram-feed';
        this.limit = options.limit || 6;
        this.accessToken = options.accessToken || null;
        this.useProxy = options.useProxy || true;
    }

    async loadFeed() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error('Instagram feed container not found');
            return;
        }

        // Show loading state
        this.showLoading(container);

        try {
            // Try Instagram Basic Display API first (if access token available)
            if (this.accessToken) {
                await this.loadFromAPI();
            } else {
                // Fallback to web scraping method
                await this.loadFromWebScraping();
            }
        } catch (error) {
            console.error('Failed to load Instagram feed:', error);
            this.showError(container);
        }
    }

    async loadFromAPI() {
        const response = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink&access_token=${this.accessToken}&limit=${this.limit}`);
        
        if (!response.ok) {
            throw new Error('Instagram API request failed');
        }

        const data = await response.json();
        this.renderFeed(data.data);
    }

    async loadFromWebScraping() {
        // Using a public Instagram proxy service (cors-anywhere or similar)
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const instagramUrl = `https://www.instagram.com/${this.username}/`;
        
        try {
            const response = await fetch(`${proxyUrl}${encodeURIComponent(instagramUrl)}`);
            const data = await response.json();
            const html = data.contents;
            
            // Extract Instagram data from HTML
            const posts = this.extractPostsFromHTML(html);
            this.renderFeed(posts.slice(0, this.limit));
        } catch (error) {
            // If web scraping fails, show static placeholder
            this.showPlaceholder();
        }
    }

    extractPostsFromHTML(html) {
        try {
            // Extract JSON data from Instagram page
            const scriptRegex = /window\._sharedData\s*=\s*({.+?});/;
            const match = html.match(scriptRegex);
            
            if (match) {
                const sharedData = JSON.parse(match[1]);
                const posts = sharedData.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges;
                
                return posts.map(edge => ({
                    id: edge.node.id,
                    media_url: edge.node.display_url,
                    thumbnail_url: edge.node.thumbnail_src,
                    caption: edge.node.edge_media_to_caption.edges[0]?.node.text || '',
                    permalink: `https://www.instagram.com/p/${edge.node.shortcode}/`,
                    media_type: edge.node.is_video ? 'VIDEO' : 'IMAGE'
                }));
            }
        } catch (error) {
            console.error('Failed to extract Instagram data:', error);
        }
        
        return [];
    }

    renderFeed(posts) {
        const container = document.getElementById(this.containerId);
        const instagramGrid = container.querySelector('.instagram-grid');
        
        if (!instagramGrid) {
            console.error('Instagram grid container not found');
            return;
        }

        // Clear existing content
        instagramGrid.innerHTML = '';

        if (posts.length === 0) {
            this.showPlaceholder();
            return;
        }

        posts.forEach(post => {
            const postElement = this.createPostElement(post);
            instagramGrid.appendChild(postElement);
        });

        // Update CTA button
        this.updateCTAButton(container);
    }

    createPostElement(post) {
        const postDiv = document.createElement('div');
        postDiv.className = 'instagram-post';
        
        const imageUrl = post.thumbnail_url || post.media_url;
        const caption = post.caption ? post.caption.substring(0, 100) + '...' : '';
        
        postDiv.innerHTML = `
            <img src="${imageUrl}" alt="Instagram post" loading="lazy">
            <div class="instagram-overlay">
                <div class="instagram-content">
                    <i class="fab fa-instagram"></i>
                    ${caption ? `<p class="instagram-caption">${caption}</p>` : ''}
                </div>
            </div>
        `;

        // Add click handler to open Instagram post
        postDiv.addEventListener('click', () => {
            window.open(post.permalink, '_blank');
        });

        return postDiv;
    }

    showLoading(container) {
        const instagramGrid = container.querySelector('.instagram-grid');
        if (instagramGrid) {
            instagramGrid.innerHTML = `
                <div class="instagram-loading">
                    <div class="loading-spinner"></div>
                    <p>Loading Instagram posts...</p>
                </div>
            `;
        }
    }

    showError(container) {
        const instagramGrid = container.querySelector('.instagram-grid');
        if (instagramGrid) {
            instagramGrid.innerHTML = `
                <div class="instagram-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Unable to load Instagram posts at this time.</p>
                    <a href="https://www.instagram.com/ucsdsig/" target="_blank" class="btn btn-primary">
                        Visit Our Instagram
                    </a>
                </div>
            `;
        }
    }

    showPlaceholder() {
        const container = document.getElementById(this.containerId);
        const instagramGrid = container.querySelector('.instagram-grid');
        
        if (instagramGrid) {
            // Keep existing placeholder posts but make them clickable
            const placeholderPosts = instagramGrid.querySelectorAll('.instagram-post');
            placeholderPosts.forEach(post => {
                post.addEventListener('click', () => {
                    window.open('https://www.instagram.com/ucsdsig/', '_blank');
                });
            });
        }
    }

    updateCTAButton(container) {
        const ctaButton = container.querySelector('.instagram-cta .btn');
        if (ctaButton) {
            ctaButton.href = `https://www.instagram.com/${this.username}/`;
            ctaButton.textContent = `Follow @${this.username}`;
        }
    }
}

// Enhanced Instagram Feed with Hashtag Filtering
class EnhancedInstagramFeed extends InstagramFeed {
    constructor(options = {}) {
        super(options);
        this.hashtags = options.hashtags || ['#sustainableinvesting', '#sig', '#ucsd'];
        this.excludeHashtags = options.excludeHashtags || [];
    }

    filterPostsByHashtags(posts) {
        return posts.filter(post => {
            const caption = (post.caption || '').toLowerCase();
            
            // Check if post contains any desired hashtags
            const hasDesiredHashtag = this.hashtags.some(tag => 
                caption.includes(tag.toLowerCase())
            );
            
            // Check if post contains any excluded hashtags
            const hasExcludedHashtag = this.excludeHashtags.some(tag => 
                caption.includes(tag.toLowerCase())
            );
            
            return hasDesiredHashtag && !hasExcludedHashtag;
        });
    }

    renderFeed(posts) {
        // Filter posts by hashtags before rendering
        const filteredPosts = this.filterPostsByHashtags(posts);
        super.renderFeed(filteredPosts);
    }
}

// Initialize Instagram feed when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a page with Instagram feed
    if (document.getElementById('instagram-feed')) {
        
        // Try to get access token from environment or config
        const accessToken = getInstagramAccessToken();
        
        const instagramFeed = new EnhancedInstagramFeed({
            username: 'sigatucsd',
            containerId: 'instagram-feed',
            limit: 6,
            accessToken: accessToken,
            hashtags: ['#sustainableinvesting', '#sig', '#ucsd', '#esg'],
            excludeHashtags: ['#private', '#test']
        });

        // Load the feed
        instagramFeed.loadFeed();

        // Refresh feed every 30 minutes
        setInterval(() => {
            instagramFeed.loadFeed();
        }, 30 * 60 * 1000);
    }
});

// Function to get Instagram access token
function getInstagramAccessToken() {
    // In production, this should come from environment variables or secure config
    // For now, we'll use a placeholder that can be replaced
    return localStorage.getItem('instagram_access_token') || null;
}

// Function to set Instagram access token (for admin use)
function setInstagramAccessToken(token) {
    localStorage.setItem('instagram_access_token', token);
    console.log('Instagram access token updated');
}

// Expose functions for admin use
window.InstagramFeed = InstagramFeed;
window.setInstagramAccessToken = setInstagramAccessToken;
