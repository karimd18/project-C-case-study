import React, { useRef, useEffect, useState } from "react";

/**
 * HtmlSlidePreview
 *
 * Renders raw HTML/CSS/JS content safely within an iframe.
 * This ensures full style isolation and correct execution of vanilla JS scripts.
 *
 * @param {string} htmlContent - The complete HTML string to render
 */
export default function HtmlSlidePreview({ htmlContent }) {
  const iframeRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef(null);
  
  // Virtual viewport size (Standard HD)
  const VIRTUAL_WIDTH = 1280;
  const VIRTUAL_HEIGHT = 720;

  // Inject viewport styles into the HTML
  const thumbnailSrc = htmlContent.replace(
    "</head>",
    `<style>
      body {
        width: ${VIRTUAL_WIDTH}px;
        height: ${VIRTUAL_HEIGHT}px;
        overflow: hidden;
        margin: 0;
        transform-origin: top left;
      }
    </style></head>`
  );

  // Calculate scale factor for main preview
  const [scale, setScale] = useState(1);
  
  useEffect(() => {
    const handleResize = () => {
        if(containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth;
            const newScale = containerWidth / VIRTUAL_WIDTH;
            setScale(newScale);
        }
    };
    
    // Initial calc + debounced resize
    handleResize(); 
    const observer = new ResizeObserver(handleResize);
    if(containerRef.current) observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div 
        ref={containerRef}
        className="w-full relative bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden cursor-zoom-in group transition-all hover:shadow-xl"
        style={{ height: VIRTUAL_HEIGHT * scale }} // Dynamic height based on scaled aspect ratio
        onClick={() => setIsModalOpen(true)}
      >
        <iframe
          ref={iframeRef}
          srcDoc={thumbnailSrc}
          title="Slide Preview"
          className="absolute top-0 left-0 border-none pointer-events-none" // Disable pointer events to allow click-through
          style={{
              width: VIRTUAL_WIDTH,
              height: VIRTUAL_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: 'top left'
          }}
          sandbox="allow-scripts allow-same-origin"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 bg-white/90 text-navy px-3 py-1.5 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                Click to Expand
            </div>
        </div>
      </div>

      {/* Modal */}
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}>
            <div className="relative w-full max-w-[90vw] aspect-video bg-white rounded-xl overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <button 
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white text-navy p-2 rounded-full shadow-md backdrop-blur transition-all"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <iframe
                    srcDoc={htmlContent
                        // Inject Styles and Script
                        .replace("</head>", `
                            <style>
                                html, body { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; }
                                body { display: flex; align-items: center; justify-content: center; background: #f8fafc; }
                                #slide-container {
                                    width: 1280px;
                                    height: 720px;
                                    flex-shrink: 0;
                                    background: white;
                                    transform-origin: center center;
                                    overflow: hidden;
                                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                                }
                            </style>
                            <script>
                                function fit() {
                                    const container = document.getElementById('slide-container');
                                    if (!container) return;
                                    
                                    const targetW = 1280;
                                    const targetH = 720;
                                    const winW = window.innerWidth;
                                    const winH = window.innerHeight;
                                    
                                    // Calculate scale with small padding buffer
                                    const scale = Math.min(winW / targetW, winH / targetH) * 0.95;
                                    
                                    container.style.transform = 'scale(' + scale + ')';
                                }
                                window.addEventListener('resize', fit);
                                window.addEventListener('load', fit);
                                setInterval(fit, 500);
                            </script>
                        </head>`)
                        // Wrap Body Content
                        .replace(/<body([^>]*)>/i, '<body$1><div id="slide-container">')
                        .replace(/<\/body>/i, '</div></body>')
                    }
                    className="w-full h-full border-none"
                    title="Full Slide View"
                    sandbox="allow-scripts allow-same-origin"
                />
            </div>
        </div>
      )}
    </>
  );
}
