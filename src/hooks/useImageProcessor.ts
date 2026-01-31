import { useState } from 'react';
import { removeBackground } from '@imgly/background-removal';
import { refineEdges, smartCrop } from '../utils/imageProcessing';

export function useImageProcessor(originalImageUrl: string | null) {
    const [isProcessing, setIsProcessing] = useState(false);

    // The "Master" transparent blob (Full resolution, cutout)
    const [refinedBlob, setRefinedBlob] = useState<Blob | null>(null);

    // The currently displayed image (could be raw, refined, or refined+cropped)
    // We default to the original URL if no processing has happened.
    const [displaySrc, setDisplaySrc] = useState<string | null>(originalImageUrl);

    // Track what is currently displayed
    // 'original' | 'cutout' | 'cropped'
    const [displayState, setDisplayState] = useState<'original' | 'cutout' | 'cropped'>('original');

    // Helper: lazy-load processing
    // Triggers BG removal only if we haven't done it yet.
    const ensureProcessed = async (url: string): Promise<Blob | null> => {
        if (refinedBlob) return refinedBlob;

        setIsProcessing(true);
        try {
            console.log("Starting background removal...");
            const config: any = {
                model: 'isnet',
                output: { quality: 1.0, format: 'image/png' },
            };
            const blob = await removeBackground(url, config);

            // Hard Cut + Smooth
            const refined = await refineEdges(blob, 5, 1);
            setRefinedBlob(refined);

            return refined;
        } catch (error) {
            console.error('Processing failed:', error);
            alert('处理失败，请重试');
            return null;
        } finally {
            setIsProcessing(false);
        }
    };

    const processBackground = async () => {
        if (!originalImageUrl) return;
        const blob = await ensureProcessed(originalImageUrl);
        if (blob) {
            const url = URL.createObjectURL(blob);
            setDisplaySrc(url);
            setDisplayState('cutout');
        }
    };

    const processCrop = async (width: number, height: number) => {
        if (!originalImageUrl) return;

        // 1. Ensure we have the cutout
        const blob = await ensureProcessed(originalImageUrl);
        if (!blob) return;

        // 2. Crop
        setIsProcessing(true);
        try {
            const cropped = await smartCrop(blob, width, height);
            const url = URL.createObjectURL(cropped);
            setDisplaySrc(url);
            setDisplayState('cropped');
        } catch (e) {
            console.error(e);
            alert("裁切失败");
        } finally {
            setIsProcessing(false);
        }
    };

    const reset = () => {
        setRefinedBlob(null);
        setDisplaySrc(originalImageUrl);
        setDisplayState('original');
    };

    return {
        isProcessing,
        displaySrc,
        displayState,
        processBackground,
        processCrop,
        reset,
        // If we want to force display update manually
        setDisplaySrc
    };
}
