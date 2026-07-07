"use client";

import { useEffect, useRef, useState } from "react";

export function ShrinkableLine({ text, minFontSize = 20, defaultFontSize = 24 }: { text: string; minFontSize?: number; defaultFontSize?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const checkSize = () => {
      if (!containerRef.current || !textRef.current) return;
      
      // Reset scale to measure natural width
      setScale(1);
      
      requestAnimationFrame(() => {
        if (!containerRef.current || !textRef.current) return;
        
        const containerWidth = containerRef.current.clientWidth;
        const textWidth = textRef.current.scrollWidth;
        
        if (textWidth > containerWidth && containerWidth > 0) {
          // Calculate scale needed to fit
          const newScale = containerWidth / textWidth;
          
          // Constrain by min font size ratio
          const minScale = minFontSize / defaultFontSize;
          
          setScale(Math.max(newScale, minScale));
        }
      });
    };

    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, [text, minFontSize, defaultFontSize]);

  // Use scale transform so layout doesn't bounce.
  // Origin is center since text is centered.
  return (
    <div ref={containerRef} className="w-full flex justify-center overflow-visible h-[2.5em] items-center">
      <span 
        ref={textRef} 
        className="whitespace-nowrap inline-block"
        style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: 'center center',
          transition: 'transform 0.1s ease-out'
        }}
      >
        {text}
      </span>
    </div>
  );
}
