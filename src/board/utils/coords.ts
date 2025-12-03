import { PipIndex, Color } from '../types';

export const BOARD_WIDTH = 1000;
export const BOARD_HEIGHT = 500;
export const BAR_WIDTH = 60;
export const HOME_WIDTH = 80;
export const TRIANGLE_WIDTH = (BOARD_WIDTH - BAR_WIDTH - HOME_WIDTH * 2) / 12;
export const TRIANGLE_HEIGHT = BOARD_HEIGHT * 0.42;
export const CHECKER_RADIUS = TRIANGLE_WIDTH * 0.42;
export const CHECKER_SPACING = CHECKER_RADIUS * 1.85; // Slight overlap for stacking
export const MAX_VISIBLE_STACK = 5; // After this, show count instead of stacking

/**
 * Calculate the center coordinates for a checker at a given position
 * @param pip - The pip index (1-24), 'bar', or 'borne'
 * @param z - The stack position (0 = bottom)
 * @param color - The checker color (needed for bar/borne positioning)
 */
export const getPipCoordinates = (
    pip: PipIndex | 'bar' | 'borne', 
    z: number = 0,
    color?: Color
): { x: number; y: number } => {
    
    // Bar - split by color, light on top half, dark on bottom half
    if (pip === 'bar') {
        const x = HOME_WIDTH + 6 * TRIANGLE_WIDTH + BAR_WIDTH / 2;
        const isLight = color === 'light';
        
        // Stack from center outward
        const baseY = isLight 
            ? BOARD_HEIGHT * 0.25  // Top quarter for light
            : BOARD_HEIGHT * 0.75; // Bottom quarter for dark
        
        // Stack toward center
        const stackOffset = isLight 
            ? z * CHECKER_SPACING 
            : -z * CHECKER_SPACING;
        
        return { x, y: baseY + stackOffset };
    }

    // Borne (Home) - stack horizontally in home zone
    if (pip === 'borne') {
        const isLight = color === 'light';
        
        // Light bears off to bottom-right, Dark to top-right (standard orientation)
        const x = isLight 
            ? BOARD_WIDTH - HOME_WIDTH / 2 
            : HOME_WIDTH / 2;
        
        // Stack vertically in home zone
        const baseY = isLight 
            ? BOARD_HEIGHT - CHECKER_RADIUS - 10
            : CHECKER_RADIUS + 10;
        
        // Horizontal stacking for borne checkers (laid flat)
        const stackY = isLight
            ? baseY - z * (CHECKER_RADIUS * 0.4) // Stack upward
            : baseY + z * (CHECKER_RADIUS * 0.4); // Stack downward
        
        return { x, y: stackY };
    }

    // Regular pip (1-24)
    const i = pip as number;
    const isTop = i >= 13;
    const isLeftHalf = (i >= 7 && i <= 12) || (i >= 13 && i <= 18);

    // Calculate X position
    let x: number;
    if (isLeftHalf) {
        const idx = isTop ? (i - 13) : (12 - i);
        x = HOME_WIDTH + idx * TRIANGLE_WIDTH + TRIANGLE_WIDTH / 2;
    } else {
        const idx = isTop ? (i - 19) : (6 - i);
        x = HOME_WIDTH + 6 * TRIANGLE_WIDTH + BAR_WIDTH + idx * TRIANGLE_WIDTH + TRIANGLE_WIDTH / 2;
    }

    // Calculate Y position with smart stacking
    let y: number;
    const effectiveZ = Math.min(z, MAX_VISIBLE_STACK - 1);
    
    if (isTop) {
        // Top triangles: stack downward from top
        const baseY = CHECKER_RADIUS + 8;
        y = baseY + effectiveZ * CHECKER_SPACING;
        
        // Compress if stack would exceed triangle height
        const maxY = TRIANGLE_HEIGHT - CHECKER_RADIUS;
        if (y > maxY) {
            // Redistribute spacing to fit
            const availableSpace = maxY - baseY;
            const neededSpace = effectiveZ * CHECKER_SPACING;
            const compressionRatio = availableSpace / neededSpace;
            y = baseY + effectiveZ * CHECKER_SPACING * compressionRatio;
        }
    } else {
        // Bottom triangles: stack upward from bottom
        const baseY = BOARD_HEIGHT - CHECKER_RADIUS - 8;
        y = baseY - effectiveZ * CHECKER_SPACING;
        
        // Compress if stack would exceed triangle height
        const minY = BOARD_HEIGHT - TRIANGLE_HEIGHT + CHECKER_RADIUS;
        if (y < minY) {
            const availableSpace = baseY - minY;
            const neededSpace = effectiveZ * CHECKER_SPACING;
            const compressionRatio = availableSpace / neededSpace;
            y = baseY - effectiveZ * CHECKER_SPACING * compressionRatio;
        }
    }

    return { x, y };
};

/**
 * Get the pip index from screen coordinates (for drop detection)
 */
export const getPipFromCoordinates = (
    screenX: number, 
    screenY: number,
    svgRect: DOMRect
): PipIndex | 'bar' | 'borne' | null => {
    // Convert screen coords to SVG coords
    const x = (screenX - svgRect.left) / svgRect.width * BOARD_WIDTH;
    const y = (screenY - svgRect.top) / svgRect.height * BOARD_HEIGHT;
    
    // Check bar
    const barLeft = HOME_WIDTH + 6 * TRIANGLE_WIDTH;
    const barRight = barLeft + BAR_WIDTH;
    if (x >= barLeft && x <= barRight) {
        return 'bar';
    }
    
    // Check home zones
    if (x < HOME_WIDTH) return 'borne'; // Left home
    if (x > BOARD_WIDTH - HOME_WIDTH) return 'borne'; // Right home
    
    // Determine which triangle
    const isTop = y < BOARD_HEIGHT / 2;
    const isLeftHalf = x < barLeft;
    
    let triangleIndex: number;
    if (isLeftHalf) {
        const localX = x - HOME_WIDTH;
        const idx = Math.floor(localX / TRIANGLE_WIDTH);
        triangleIndex = isTop ? (13 + idx) : (12 - idx);
    } else {
        const localX = x - barRight;
        const idx = Math.floor(localX / TRIANGLE_WIDTH);
        triangleIndex = isTop ? (19 + idx) : (6 - idx);
    }
    
    // Validate range
    if (triangleIndex >= 1 && triangleIndex <= 24) {
        return triangleIndex as PipIndex;
    }
    
    return null;
};
