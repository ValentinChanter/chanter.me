import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ page: string }> }
) {
    const { page } = await params;
    
    if (!page) {
        return NextResponse.json({ error: "Page parameter is required" }, { status: 400 });
    }
    
    try {
        // Properly encode the page name for the Wikipedia URL
        const encodedPage = encodeURIComponent(page);
        
        // Fetch the Wikipedia page content
        const response = await fetch(`https://fr.wikipedia.org/wiki/${encodedPage}`);
        
        if (!response.ok) {
            return NextResponse.json({ error: "Failed to fetch Wikipedia content" }, { status: response.status });
        }
        
        let htmlContent = await response.text();
        
        const pageUrl = response.url;
        const baseTag = `<base href="${pageUrl}">`;
        htmlContent = htmlContent.replace('<head>', `<head>${baseTag}`);
        
        // List of classes that should be greyed out and have links disabled
        const greyedOutClasses = [
            'infobox',
            'vector-header-start',
            'vector-menu',
            'vector-header-end',
            'vector-dropdown-checkbox',
            'vector-dropdown-label',
            'mw-indicators',
            'bandeau-niveau-ebauche',
            'mw-editsection',
            'mw-references-wrap', // "Notes" and "Références" in "Notes et références"
            'bandeau-portail',
            'catlinks',
            'mw-footer',
            'bandeau-niveau-information',
            'thumb',
            'DebutCarte',
            'autres-projets',
            'indicateur-langue',
            'notheme',
            'mw-file-description', // Class for image description boxes
            'external', // Class for individual reference text (or the whole reference, depending on the page), at the bottom of the page
            'cachelinks', // Class for the little [archive]
            'extiw', // Class for "modifier Wikidata"
            'tnavbar', // Class for the "v . m" on the navbox
            'noviewer', // Little pencil in infobox
            'wd_p625' // Coordinates in infobox
        ];

        // Generate CSS selectors for each class
        const greyedOutSelectors = greyedOutClasses.map(className => `.${className}`).join(', ');
        
        // Remove selector for <ul> elements with no id or class - we don't want to grey these out anymore
        
        // Add selector for elements with typeof="mw:File/Thumb"
        const typeofSelectors = '[typeof="mw:File/Thumb"]';
        
        // Combine all selectors - no longer including unlabeled ul elements
        const combinedSelectors = `${greyedOutSelectors}, ${typeofSelectors}`;
        const overlayClassname = 'wikipedia-proxy-overlay';
        
        // Add CSS for overlay to the head section - Fix specificity issues
        const overlayStyles = `
        <style>
            /* Position relative for all elements that will have overlays */
            ${combinedSelectors} {
                position: relative !important;
            }
            
            /* Overlay styling */
            .${overlayClassname} {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(128, 128, 128, 0.6);
                z-index: 1000;
                cursor: not-allowed;
            }
            
            /* Disable links individually for each class and for elements without attributes - removed ul selector */
            ${greyedOutClasses.map(className => `.${className} a`).join(', ')}, ${typeofSelectors} a, a.new {
                pointer-events: none !important;
                cursor: default !important;
                color: inherit !important;
                text-decoration: none !important;
            }

            /* Specific styling for "new" class links (red links to non-existent pages) */
            a.new {
                opacity: 0.5 !important;
                color: #ba0000 !important;
                cursor: not-allowed !important;
            }
            
            /* Custom URL status bar */
            #wikipedia-url-status {
                position: fixed;
                bottom: 0;
                left: 0;
                background-color: rgba(240, 240, 240, 0.9);
                color: #333;
                padding: 2px 8px;
                font-size: 12px;
                border-top-right-radius: 4px;
                max-width: 80%;
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
                z-index: 10000;
                font-family: system-ui, -apple-system, sans-serif;
                display: none;
                border: 1px solid #ccc;
                border-left: none;
                border-bottom: none;
            }
        </style>`;
        
        htmlContent = htmlContent.replace('</head>', `${overlayStyles}</head>`);

        // Get the correct origin - use request origin directly to avoid mismatches
        const origin = process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_BASE_URL : "http://localhost:3000"
        
        // Properly escape the page name for use in JavaScript
        const escapedPage = page.replace(/['\\]/g, '\\$&');
        
        // Create JSON string of classes to grey out for use in script
        const classesJSON = JSON.stringify(greyedOutClasses);
        
        // Inject our tracking script at the end of the body
        const trackingScript = `
        <script>
            (function() {
                try {
                    // For debugging origin issues
                    console.log('Current iframe origin:', window.location.origin);
                    console.log('Target parent origin:', '${origin}');
                    
                    // Create URL status bar element
                    function createStatusBar() {
                        const statusBar = document.createElement('div');
                        statusBar.id = 'wikipedia-url-status';
                        document.body.appendChild(statusBar);
                        return statusBar;
                    }
                    
                    const statusBar = createStatusBar();
                    
                    // Prevent keyboard usage
                    function preventKeyboardUsage() {
                        // Prevent all keyboard events
                        document.addEventListener('keydown', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                        }, true);
                        
                        document.addEventListener('keyup', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                        }, true);
                        
                        document.addEventListener('keypress', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                        }, true);
                    }
                    
                    // Prevent navigation to previous page
                    function preventNavigation() {
                        // Override history methods
                        history.pushState(null, document.title, window.location.href);
                        
                        // Prevent going back
                        window.addEventListener('popstate', function() {
                            history.pushState(null, document.title, window.location.href);
                        });
                        
                        // Disable back/forward methods
                        const disabledFunc = function() { return false; };
                        history.back = disabledFunc;
                        history.forward = disabledFunc;
                        history.go = disabledFunc;
                    }
                    
                    // Apply prevention methods
                    preventKeyboardUsage();
                    preventNavigation();
                    
                    // Add handler for simulated clicks from parent window
                    window.addEventListener('message', function(event) {
                        try {
                            // Only accept messages from our own origin
                            if (event.origin !== '${origin}') {
                                console.log('Origin mismatch. Expected:', '${origin}', 'Got:', event.origin);
                                return;
                            }
                            
                            if (event.data && event.data.type === 'simulateClick') {
                                const x = event.data.x;
                                const y = event.data.y;
                                
                                // Find the element at this position
                                const element = document.elementFromPoint(x, y);
                                
                                if (element) {
                                    // Simulate click on the element
                                    const clickEvent = new MouseEvent('click', {
                                        bubbles: true,
                                        cancelable: true,
                                        view: window,
                                        clientX: x,
                                        clientY: y
                                    });
                                    element.dispatchEvent(clickEvent);
                                }
                            }
                            
                            // Handle scroll events
                            else if (event.data && event.data.type === 'simulateScroll') {
                                // Create and dispatch wheel event
                                const wheelEvent = new WheelEvent('wheel', {
                                    deltaX: event.data.deltaX,
                                    deltaY: event.data.deltaY,
                                    deltaMode: event.data.deltaMode,
                                    bubbles: true,
                                    cancelable: true
                                });
                                document.dispatchEvent(wheelEvent);
                                
                                // Also perform actual scrolling since some sites handle this differently
                                window.scrollBy({
                                    top: event.data.deltaY,
                                    left: event.data.deltaX,
                                    behavior: 'auto'
                                });
                            }
                            
                            // Track cursor for proper styling
                            else if (event.data && event.data.type === 'trackCursor') {
                                const x = event.data.x;
                                const y = event.data.y;
                                
                                // Find the element at this position
                                const element = document.elementFromPoint(x, y);
                                
                                if (element) {
                                    // Get the computed style for cursor
                                    const style = window.getComputedStyle(element);
                                    const cursor = style.cursor;
                                    
                                    // Send cursor style back to parent
                                    window.parent.postMessage({
                                        type: 'cursorStyle',
                                        cursor: cursor
                                    }, '${origin}');
                                }
                            }
                        } catch (err) {
                            console.log('Error handling simulated event:', err);
                        }
                    });
                    
                    // Function to handle Wikipedia page URLs that may contain slashes
                    function handleWikiPageUrl(url) {
                        if (!url) return '';
                        
                        // Extract the page name from the URL
                        let page = '';
                        
                        if (url.startsWith('/wiki/')) {
                            page = url.substring(6); // Remove '/wiki/'
                        } else if (url.includes('/wiki/')) {
                            const matches = url.match(/\\/wiki\\/([^#?]*)/);
                            if (matches && matches[1]) {
                                page = matches[1];
                            }
                        }
                        
                        // If the page contains a slash, truncate at the slash
                        if (page.includes('/')) {
                            // Option 1: Encode the slash (commented out)
                            // page = encodeURIComponent(page);
                            
                            // Option 2: Truncate at the slash
                            page = page.split('/')[0];
                        }
                        
                        return page;
                    }
                    
                    // Function to track all link clicks
                    function setupLinkTracking() {
                        try {
                            // Process all wiki links
                            Array.prototype.forEach.call(document.querySelectorAll('a[href^="/wiki/"]'), function(link) {
                                try {
                                    // Skip links with class "new" (red links to non-existent pages)
                                    if (link.classList.contains('new')) {
                                        return;
                                    }
                                    
                                    // Store the original Wikipedia URL in a data attribute
                                    const href = link.getAttribute('href');
                                    if (href && href.startsWith('/wiki/')) {
                                        const originalUrl = 'https://fr.wikipedia.org' + href;
                                        link.setAttribute('data-original-url', originalUrl);
                                        
                                        // Add hover event listeners to show the original URL
                                        link.addEventListener('mouseenter', function(e) {
                                            statusBar.textContent = originalUrl;
                                            statusBar.style.display = 'block';
                                        });
                                        
                                        link.addEventListener('mouseleave', function(e) {
                                            statusBar.style.display = 'none';
                                        });
                                    }
                                    
                                    link.addEventListener('click', function(e) {
                                        try {
                                            const href = this.getAttribute('href');
                                            if (href && href.startsWith('/wiki/')) {
                                                const page = handleWikiPageUrl(href);
                                                
                                                // Send message to parent window with correct origin
                                                window.parent.postMessage({
                                                    type: 'wikipediaNavigation',
                                                    page: page
                                                }, '${origin}');
                                                
                                                // Update URL to use our proxy instead
                                                e.preventDefault();
                                                window.location.href = '${origin}/api/bingo/proxy/' + page;
                                            }
                                        } catch (err) {
                                            console.log('Error handling link click:', err);
                                        }
                                    });
                                } catch (err) {
                                    console.log('Error setting up link listener:', err);
                                }
                            });
                            
                            // Add overlays to elements that should be greyed out
                            try {
                                // List of classes to grey out
                                var classesToGreyOut = ${classesJSON};
                                
                                // Process each class
                                classesToGreyOut.forEach(function(className) {
                                    // Find all elements with this class
                                    var elements = document.querySelectorAll('.' + className);
                                    
                                    // Process each element
                                    Array.prototype.forEach.call(elements, function(element) {
                                        try {
                                            // Create and add overlay
                                            var overlay = document.createElement('div');
                                            overlay.className = '${overlayClassname}';
                                            element.appendChild(overlay);
                                        } catch (err) {
                                            console.log('Error processing element with class ' + className + ':', err);
                                        }
                                    });
                                });
                                
                                // Remove the code for handling unlabeled <ul> elements - we want these to be interactive now
                                
                                // Also handle elements with typeof="mw:File/Thumb"
                                var thumbElements = document.querySelectorAll('[typeof="mw:File/Thumb"]');
                                Array.prototype.forEach.call(thumbElements, function(element) {
                                    try {
                                        // Create and add overlay
                                        var overlay = document.createElement('div');
                                        overlay.className = '${overlayClassname}';
                                        element.appendChild(overlay);
                                    } catch (err) {
                                        console.log('Error processing thumb element:', err);
                                    }
                                });
                            } catch (err) {
                                console.log('Error handling greyed out elements:', err);
                            }
                        } catch (err) {
                            console.log('Error in query selector:', err);
                        }
                        
                        // Delegate handler for dynamically added links
                        try {
                            document.body.addEventListener('click', function(e) {
                                try {
                                    var target = e.target;
                                    while (target && target.tagName !== 'A') {
                                        target = target.parentNode;
                                        if (!target || target === document.body) break;
                                    }
                                    
                                    // Skip links with class "new" (red links to non-existent pages)
                                    if (target && target.classList.contains('new')) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        return;
                                    }
                                    
                                    if (target && target.tagName === 'A' && target.href && target.href.includes('/wiki/')) {
                                        var url;
                                        try {
                                            url = new URL(target.href);
                                        } catch (urlErr) {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            return;
                                        }
                                        
                                        if (url.pathname.startsWith('/wiki/')) {
                                            const page = handleWikiPageUrl(url.pathname);
                                            
                                            // Send message to parent window with correct origin
                                            window.parent.postMessage({
                                                type: 'wikipediaNavigation',
                                                page: page
                                            }, '${origin}');
                                            
                                            // Update URL to use our proxy instead
                                            e.preventDefault();
                                            window.location.href = '${origin}/api/bingo/proxy/' + page;
                                        }
                                    }
                                } catch (err) {
                                    console.log('Error in click handler:', err);
                                }
                            });
                        } catch (err) {
                            console.log('Error setting up delegate handler:', err);
                        }

                        // Fix any broken image URLs
                        try {
                            Array.prototype.forEach.call(document.querySelectorAll('img'), function(img) {
                                try {
                                    if (img.src && img.src.includes('fr.wikipedia.org//upload.wikimedia.org')) {
                                        img.src = img.src.replace('fr.wikipedia.org//', '');
                                    }
                                    if (img.srcset) {
                                        img.srcset = img.srcset.replace(/fr\\.wikipedia\\.org\\/\\/upload\\.wikimedia\\.org/g, 'upload.wikimedia.org');
                                    }
                                } catch (err) {
                                    console.log('Error fixing image URL:', err);
                                }
                            });
                        } catch (err) {
                            console.log('Error processing images:', err);
                        }
                    }
                    
                    // Run when page loads
                    if (document.readyState === 'loading') {
                        document.addEventListener('DOMContentLoaded', setupLinkTracking);
                    } else {
                        // DOM is already loaded
                        setupLinkTracking();
                    }
                    
                    // Inform parent that we've loaded this page - use correct origin
                    window.parent.postMessage({
                        type: 'wikipediaNavigation',
                        page: "${escapedPage}"
                    }, '${origin}');
                    
                } catch (err) {
                    console.log('Error in tracking script:', err);
                }
            })();
        </script>
        `;
        
        htmlContent = htmlContent.replace('</body>', `${trackingScript}</body>`);
        
        return new NextResponse(htmlContent, {
        headers: {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'X-Frame-Options': 'SAMEORIGIN'
        },
        });
    } catch (error) {
        console.error('Error proxying Wikipedia content:', error);
        return NextResponse.json({ error: "Failed to proxy Wikipedia content" }, { status: 500 });
    }
}
