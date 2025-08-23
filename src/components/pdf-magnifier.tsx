
"use client";

import React, { useRef, useEffect, useState } from 'react';

interface PdfMagnifierProps {
  targetRef: HTMLDivElement | null;
  mousePosition: { x: number; y: number } | null;
  zoomLevel: number;
  magnification?: number;
  size?: number;
}

const PdfMagnifier: React.FC<PdfMagnifierProps> = ({
  targetRef,
  mousePosition,
  zoomLevel,
  magnification = 2,
  size = 150,
}) => {
  const magnifierRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!targetRef || !mousePosition || !magnifierRef.current) return;

    const sourceCanvas = targetRef.querySelector('canvas');
    if (!sourceCanvas) return;
    
    const magCtx = magnifierRef.current.getContext('2d');
    if (!magCtx) return;

    const { x, y } = mousePosition;
    
    // Adjust mouse position based on zoomLevel to get coordinates on the source canvas
    const sourceX = x / zoomLevel;
    const sourceY = y / zoomLevel;

    magCtx.clearRect(0, 0, size, size);
    
    // Draw the magnified image
    magCtx.drawImage(
      sourceCanvas,
      sourceX - size / (2 * magnification * zoomLevel), // source x
      sourceY - size / (2 * magnification * zoomLevel), // source y
      size / (magnification * zoomLevel), // source width
      size / (magnification * zoomLevel), // source height
      0, // destination x
      0, // destination y
      size, // destination width
      size // destination height
    );

  }, [targetRef, mousePosition, magnification, size, zoomLevel]);

  if (!mousePosition) return null;

  return (
    <canvas
      ref={magnifierRef}
      width={size}
      height={size}
      style={{
        position: 'absolute',
        left: `${mousePosition.x - size / 2}px`,
        top: `${mousePosition.y - size / 2}px`,
        borderRadius: '50%',
        border: '3px solid hsl(var(--primary))',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        pointerEvents: 'none',
        zIndex: 50,
      }}
      className="hidden md:block" // Only show on larger screens where mouse is available
    />
  );
};

export default PdfMagnifier;
