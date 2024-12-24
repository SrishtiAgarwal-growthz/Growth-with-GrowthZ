export const rgbToArray = (rgbString) => {
    const matches = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (matches) {
        return [
            parseInt(matches[1], 10),
            parseInt(matches[2], 10),
            parseInt(matches[3], 10)
        ];
    }
    // If it's a hex color
    if (rgbString.startsWith('#')) {
        const hex = rgbString.replace('#', '');
        return [
            parseInt(hex.substring(0, 2), 16),
            parseInt(hex.substring(2, 4), 16),
            parseInt(hex.substring(4, 6), 16)
        ];
    }
    throw new Error('Invalid color format');
};

export const areColorsSimilar = (color1, color2, threshold = 30) => {
    try {
        const rgb1 = rgbToArray(color1);
        const rgb2 = rgbToArray(color2);

        const difference = Math.sqrt(
            Math.pow(rgb1[0] - rgb2[0], 2) +
            Math.pow(rgb1[1] - rgb2[1], 2) +
            Math.pow(rgb1[2] - rgb2[2], 2)
        );

        return difference < threshold;
    } catch (error) {
        console.error('Error comparing colors:', error);
        return false;
    }
};

export const isColorCloserToWhite = (color) => {
    try {
        const rgb = rgbToArray(color);
        const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
        return brightness > 128;
    } catch (error) {
        console.error('Error checking color brightness:', error);
        return true; // Default to treating as white for safety
    }
};

export const getContrastingColor = (backgroundColor) => {
    return isColorCloserToWhite(backgroundColor) ? '#000000' : '#FFFFFF';
};

export const getOptimalTextColor = (backgroundColor) => {
    try {
        const bgIsLight = isColorCloserToWhite(backgroundColor);

        // For light backgrounds, return dark text
        if (bgIsLight) {
            return '#000000';
        }
        // For dark backgrounds, return light text
        return '#FFFFFF';
    } catch (error) {
        console.error('Error determining optimal text color:', error);
        return '#000000'; // Default to black text for safety
    }
};
