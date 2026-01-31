/**
 * Refines the edges of a transparent image to remove halos (erosion) and smooth jaggedness (feathering).
 * @param imageBlob The source image blob
 * @param erodeRadius The amount to shrink the mask (in pixels). Helps remove white/color halos.
 * @param featherRadius The amount to soften the edge (in pixels).
 */
export async function refineEdges(imageBlob: Blob, erodeRadius: number = 0, featherRadius: number = 0): Promise<Blob> {
    const bitmap = await createImageBitmap(imageBlob);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) throw new Error('Could not get canvas context');

    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    // 1. Draw original to get data
    ctx.drawImage(bitmap, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Create a temporary canvas for alpha manipulation
    const alphaCanvas = document.createElement('canvas');
    alphaCanvas.width = canvas.width;
    alphaCanvas.height = canvas.height;
    const alphaCtx = alphaCanvas.getContext('2d', { willReadFrequently: true });
    if (!alphaCtx) throw new Error('No alpha ctx');

    // Extract alpha channel
    const alphaImgData = alphaCtx.createImageData(canvas.width, canvas.height);
    const alphaData = alphaImgData.data;

    for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        // HARD CUT Strategy:
        // Identify the core. If it's not super dense, kill it immediately to remove wispy hair.
        // We use a temporary high-contrast mask.
        alphaData[i] = 0;
        alphaData[i + 1] = 0;
        alphaData[i + 2] = 0;
        // Strict threshold: If the AI wasn't 98% sure it's foreground, we discard it.
        alphaData[i + 3] = a > 250 ? 255 : 0;
    }
    alphaCtx.putImageData(alphaImgData, 0, 0);

    // 2. EROSION (Shrink Mask)
    // If we want to erode, we can blur then threshold.
    if (erodeRadius > 0) {
        // Blur the alpha mask
        alphaCtx.globalCompositeOperation = 'source-over';
        alphaCtx.filter = `blur(${erodeRadius}px)`;
        alphaCtx.drawImage(alphaCanvas, 0, 0);
        alphaCtx.filter = 'none'; // reset

        // Shrink by cutting off the fade
        const erodedData = alphaCtx.getImageData(0, 0, canvas.width, canvas.height);
        const eData = erodedData.data;
        for (let i = 0; i < eData.length; i += 4) {
            // Keep only the very core of the blurred mask
            // This shrinks the shape effectively
            if (eData[i + 3] < 240) {
                eData[i + 3] = 0;
            } else {
                eData[i + 3] = 255;
            }
        }
        alphaCtx.putImageData(erodedData, 0, 0);
    }

    // 3. FEATHERING (Soften Edge)
    if (featherRadius > 0) {
        // Apply gaussian blur to the hopefully eroded mask
        // We need to draw it onto a clean buffer to avoid accumulation artifacts if we strictly reused
        const tempC = document.createElement('canvas');
        tempC.width = canvas.width;
        tempC.height = canvas.height;
        const tempCtx = tempC.getContext('2d');
        if (tempCtx) {
            tempCtx.filter = `blur(${featherRadius}px)`;
            tempCtx.drawImage(alphaCanvas, 0, 0);

            // Get the final soft alpha
            const finalAlphaData = tempCtx.getImageData(0, 0, canvas.width, canvas.height).data;

            // Apply back to main image
            for (let i = 0; i < data.length; i += 4) {
                data[i + 3] = finalAlphaData[i + 3];
            }
        }
    } else {
        // If no feathering but erosion happened, apply the hard eroded mask
        if (erodeRadius > 0) {
            const finalAlphaData = alphaCtx.getImageData(0, 0, canvas.width, canvas.height).data;
            for (let i = 0; i < data.length; i += 4) {
                data[i + 3] = finalAlphaData[i + 3];
            }
        }
    }

    // Put modified pixels back
    ctx.putImageData(imageData, 0, 0);

    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas to Blob failed'));
        }, 'image/png');
    });
}

interface BoundingBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
}

/**
 * Scans the alpha channel to find the bounding box of the non-transparent subject.
 */
function getSubjectBounds(data: Uint8ClampedArray, width: number, height: number): BoundingBox {
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const alpha = data[(y * width + x) * 4 + 3];
            if (alpha > 10) { // Threshold for "visible"
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }

    return {
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX,
        height: maxY - minY
    };
}

/**
 * Smartly crops and positions the subject into a target ID photo size.
 * Rules:
 * - Center horizontally.
 * - Position head top at ~6-10% from the top (Standard ID Photo requirement: 3-5mm).
 * - Scale strategy: "Fill the Frame". 
 *   We calculate scale required to fill Width (85%) vs height (Bottom fit).
 *   We take the LARGER scale to ensure no empty space remains.
 */
export async function smartCrop(
    imageBlob: Blob,
    targetWidth: number = 413, // Standard 2 inch @ 300dpi approx
    targetHeight: number = 579
): Promise<Blob> {
    const bitmap = await createImageBitmap(imageBlob);

    // 1. Analyze original
    const analyzeCanvas = document.createElement('canvas');
    analyzeCanvas.width = bitmap.width;
    analyzeCanvas.height = bitmap.height;
    const ctx = analyzeCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('No ctx');

    ctx.drawImage(bitmap, 0, 0);
    const data = ctx.getImageData(0, 0, analyzeCanvas.width, analyzeCanvas.height).data;

    const bounds = getSubjectBounds(data, analyzeCanvas.width, analyzeCanvas.height);

    // Safety check: Empty image?
    if (bounds.width <= 0 || bounds.height <= 0) {
        return imageBlob; // ROI fail, return original
    }

    // 2. Calculate Parameters

    // Standard ID Photo Top Margin: ~4mm. On a 48mm height, that's ~8%.
    const topMargin = targetHeight * 0.07;

    // Scale A: Fit by Width
    // We want shoulders to assume approx 65-85% of width. 
    // If we assume bounds.width IS the shoulders, we target ~80%.
    const scaleToFitWidth = (targetWidth * 0.85) / bounds.width;

    // Scale B: Fit by Height
    // We want the Visible Bottom (bounds.maxY) to hit the Canvas Bottom (targetHeight).
    // And bounds.minY to hit topMargin.
    // So visible height (maxY - minY) must map to (targetHeight - topMargin).
    const visibleHeight = bounds.maxY - bounds.minY;
    const scaleToFitHeight = (targetHeight - topMargin) / visibleHeight;

    // DECISION: Max-Fill Strategy
    // If we pick the smaller scale, we risk leaving empty space. 
    // If we pick the larger scale, we crop content (sides or bottom). 
    // For ID photos, cropping sides (torso) or bottom (legs) is standard. 
    // Leaving blue void is unacceptable.
    const scale = Math.max(scaleToFitWidth, scaleToFitHeight);

    // 3. Draw
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = targetWidth;
    outputCanvas.height = targetHeight;
    const outCtx = outputCanvas.getContext('2d');
    if (!outCtx) throw new Error('No output ctx');

    outCtx.clearRect(0, 0, targetWidth, targetHeight);

    outCtx.save();

    // Move origin to Anchor Point (Top Center)
    outCtx.translate(targetWidth / 2, topMargin);

    // Apply Scale
    outCtx.scale(scale, scale);

    // Align Source Head Top Center to Origin
    const sourceHeadX = bounds.minX + bounds.width / 2;
    const sourceHeadY = bounds.minY;
    outCtx.translate(-sourceHeadX, -sourceHeadY);

    outCtx.drawImage(bitmap, 0, 0);

    outCtx.restore();

    return new Promise((resolve, reject) => {
        outputCanvas.toBlob(blob => {
            if (blob) resolve(blob);
            else reject(new Error('Crop failed'));
        }, 'image/png');
    });
}
