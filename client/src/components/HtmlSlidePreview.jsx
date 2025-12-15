import React, { useRef, useEffect, useState } from "react";

/**
 * HtmlSlidePreview
 * * Renders raw HTML/CSS/JS content.
 * FIX: Uses absolute positioning + translation to center content 
 * effectively preventing any clipping (cropping) of edges.
 */
export default function HtmlSlidePreview({ htmlContent }) {
  const iframeRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  
  // Constants
  const VIRTUAL_WIDTH = 1280;
  const VIRTUAL_HEIGHT = 720;

  // --- THUMBNAIL LOGIC ---
  const thumbnailSrc = htmlContent.replace(
    "</head>",
    `<style>
      body {
        width: ${VIRTUAL_WIDTH}px;
        height: ${VIRTUAL_HEIGHT}px;
        overflow: hidden;
        margin: 0;
        transform: scale(1);
        transform-origin: top left;
        background-color: white;
      }
    </style></head>`
  );
  
  useEffect(() => {
    const handleResize = () => {
        if(containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth;
            setScale(containerWidth / VIRTUAL_WIDTH);
        }
    };
    handleResize(); 
    const observer = new ResizeObserver(handleResize);
    if(containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* --- THUMBNAIL CARD --- */}
      <div 
        ref={containerRef}
        className="w-full relative bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden cursor-zoom-in group transition-all hover:shadow-xl"
        style={{ height: VIRTUAL_HEIGHT * scale }}
        onClick={() => setIsModalOpen(true)}
      >
        <iframe
          ref={iframeRef}
          srcDoc={thumbnailSrc}
          title="Slide Preview"
          className="absolute top-0 left-0 border-none pointer-events-none"
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

      {/* --- EXPANDED MODAL --- */}
      {isModalOpen && (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" 
            onClick={() => setIsModalOpen(false)}
        >
            {/* Container: Expanded to full available width */ }
            <div 
                className="relative w-[98vw] h-[95vh] max-w-full bg-white rounded-xl overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200" 
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button 
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-4 right-4 z-20 bg-gray-100 hover:bg-gray-200 text-gray-800 p-2 rounded-full shadow-md transition-all"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <iframe
                    className="w-full h-full border-none bg-gray-50"
                    title="Full Slide View"
                    sandbox="allow-scripts allow-same-origin"
                    srcDoc={htmlContent
                        // INJECT ROBUST SCALING LOGIC
                        .replace("</head>", `
                            <style>
                                html { 
                                    margin: 0; 
                                    padding: 0; 
                                    width: 100%; 
                                    height: 100%; 
                                    overflow: hidden; 
                                    background-color: #1f2937; /* Dark Gray (Gray-800) matching modal */
                                }
                                body {
                                    /* Force the slide to be the exact target size width-wise */
                                    /* WIDTH INCREASED TO 1600px */
                                    width: 1600px !important;
                                    min-height: 780px;
                                    height: auto !important;
                                    
                                    /* ABSOLUTE CENTERING */
                                    position: absolute;
                                    top: 50%;
                                    left: 50%;
                                    
                                    /* Initial transformation (centered) */
                                    transform: translate(-50%, -50%);
                                    transform-origin: center center;
                                    
                                    /* Shadow to pop against dark bg */
                                    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.5);
                                    overflow: visible;
                                }
                            </style>
                            <script>
                                function fit() {
                                    const body = document.body;
                                    
                                    // Reset transform to get accurate natural dimensions (temporarily)
                                    // Actually, scrollHeight works on un-transformed element better? 
                                    // But we are in a loop.
                                    
                                    const targetW = 1600; /* Updated target width */
                                    
                                    // Robust Height Calculation:
                                    // Max of min-height (780), scrollHeight (content), and offsetHeight
                                    const contentH = Math.max(780, body.scrollHeight, body.offsetHeight);
                                    
                                    const winW = window.innerWidth;
                                    const winH = window.innerHeight;
                                    
                                    // Scale Factor: 0.85 allows nice breathing room and avoids cutoff
                                    const scale = Math.min(winW / targetW, winH / contentH) * 0.85;
                                    
                                    // Re-apply center + scale
                                    body.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
                                }
                                
                                window.addEventListener('resize', fit);
                                window.addEventListener('load', fit);
                                setInterval(fit, 100);
                            </script>
                        </head>`)
                    }
                />
            </div>
        </div>
      )}
    </>
  );
}