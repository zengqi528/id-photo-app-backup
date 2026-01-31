import React, { useRef, useEffect, useState } from "react";
import Moveable from "react-moveable";

export interface ClothState {
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
}

interface ClothLayerProps {
    src: string;
    containerWidth: number;
    containerHeight: number;
    onChange: (state: ClothState) => void;
}

export const ClothLayer: React.FC<ClothLayerProps> = ({
    src,
    containerWidth,
    containerHeight,
    onChange,
}) => {
    const targetRef = useRef<HTMLImageElement>(null);

    // Initial state setup to center the cloth mostly
    const [clothState, setClothState] = useState<ClothState>({
        src,
        x: 0,
        y: 0,
        width: 200, // Initial reasonable width
        height: 200, // Placeholder, will update on load
        rotation: 0,
    });

    // Reset when src changes
    useEffect(() => {
        // Smart Auto-Fit Logic
        // Assumption: Shoulders are roughly 80-90% of the ID photo width
        // Position: Shoulders start around 45-55% down the image
        const initialWidth = containerWidth * 0.85;

        setClothState((prev) => ({
            ...prev,
            src,
            x: (containerWidth - initialWidth) / 2, // Center horizontally
            y: containerHeight * 0.45, // Place at ~45% height (shoulder line)
            width: initialWidth,
            height: initialWidth, // Will adjust by aspect ratio later
            rotation: 0
        }));
    }, [src, containerWidth, containerHeight]);

    // Report changes up
    useEffect(() => {
        onChange(clothState);
    }, [clothState, onChange]);

    // Handle initial image load to set aspect ratio
    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        const aspect = img.naturalWidth / img.naturalHeight;
        // Keep width 200, adjust height
        const newHeight = 200 / aspect;
        setClothState(prev => ({ ...prev, height: newHeight }));
    };

    return (
        <div className="absolute inset-0 overflow-hidden"
            style={{ width: containerWidth, height: containerHeight }}>
            <img
                ref={targetRef}
                src={src}
                alt="cloth"
                onLoad={onImageLoad}
                className="absolute origin-center pointer-events-auto cursor-move touch-none"
                style={{
                    left: 0,
                    top: 0,
                    width: `${clothState.width}px`,
                    height: `${clothState.height}px`,
                    transform: `translate(${clothState.x}px, ${clothState.y}px) rotate(${clothState.rotation}deg)`,
                }}
            />

            <Moveable
                target={targetRef}
                draggable={true}
                throttleDrag={0}
                resizable={true}
                throttleResize={0}
                rotatable={true}
                throttleRotate={0}
                keepRatio={true} // Maintain aspect ratio for clothes

                // Hide control lines for cleaner look, show corners
                renderDirections={["nw", "ne", "sw", "se"]}

                onDrag={({ beforeTranslate }) => {
                    setClothState((prev) => ({
                        ...prev,
                        x: beforeTranslate[0],
                        y: beforeTranslate[1],
                    }));
                }}
                onResize={({ width, height, drag }) => {
                    // Update internal state
                    setClothState((prev) => ({
                        ...prev,
                        width,
                        height,
                        x: drag.beforeTranslate[0],
                        y: drag.beforeTranslate[1],
                    }));
                }}
                onRotate={({ beforeRotate }) => {
                    setClothState((prev) => ({
                        ...prev,
                        rotation: beforeRotate,
                    }));
                }}
            />
        </div>
    );
};
