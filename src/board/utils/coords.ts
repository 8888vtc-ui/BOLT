import { PipIndex } from '../types';

// Board dimensions - designed for 2:1 aspect ratio
export const BOARD_WIDTH = 1000;
export const BOARD_HEIGHT = 500;
export const BAR_WIDTH = 60;
export const HOME_WIDTH = 80;
export const TRIANGLE_WIDTH = (BOARD_WIDTH - BAR_WIDTH - HOME_WIDTH * 2) / 12;
export const TRIANGLE_HEIGHT = BOARD_HEIGHT * 0.42;
export const CHECKER_RADIUS = TRIANGLE_WIDTH * 0.42; // Slightly smaller for better spacing

// Maximum checkers before stacking compression kicks in
const MAX_VISIBLE_STACK = 5;
const CHECKER_SPACING = CHECKER_RADIUS * 1.85; // Slight overlap for aesthetics

/**
 * Get the SVG coordinates for a checker at a given pip and stack position
 */
export const getPipCoordinates = (
    pip: PipIndex | 'bar' | 'borne', 
    z: number = 0,
    color?: 'light' | 'dark'
): { x: number; y: number } => {
    
    // === BAR ===
    if (pip === 'bar') {
        const barCenterX = HOME_WIDTH + 6 * TRIANGLE_WIDTH + BAR_WIDTH / 2;
        
        // Split bar by color: light on bottom half, dark on top half
        const isLight = color === 'light';
        const baseY = isLight 
            ? BOARD_HEIGHT * 0.75 // Bottom half
            : BOARD_HEIGHT * 0.25; // Top half
        
        // Stack vertically from base
        const stackOffset = z * CHECKER_RADIUS * 1.5;
        const y = isLight 
            ? baseY - stackOffset 
            : baseY + stackOffset;
        
        return { x: barCenterX, y };
    }

    // === BORNE (Home/Off) ===
    if (pip === 'borne') {
        // Light checkers bear off to the right side
        // Dark checkers bear off to the left side
        const isLight = color === 'light';
        const x = isLight 
            ? BOARD_WIDTH - HOME_WIDTH / 2 
            : HOME_WIDTH / 2;
        
        // Stack horizontally in the home zone
        const baseY = BOARD_HEIGHT / 2;
        const stackOffset = (z - 7) * CHECKER_RADIUS * 0.5; // Center around 7 checkers
        const y = baseY + stackOffset;
        
        return { x, y };
    }

    // === BOARD POINTS (1-24) ===
    const i = pip as number;
    const isTop = i >= 13; // Points 13-24 are on top
    const isLeftHalf = (i >= 7 && i <= 12) || (i >= 13 && i <= 18);

    // Calculate X position
    let x: number;
    if (isLeftHalf) {
        // Left half of board (between left home and bar)
        const idx = isTop ? (i - 13) : (12 - i);
        x = HOME_WIDTH + idx * TRIANGLE_WIDTH + TRIANGLE_WIDTH / 2;
    } else {
        // Right half of board (between bar and right home)
        const idx = isTop ? (i - 19) : (6 - i);
        x = HOME_WIDTH + 6 * TRIANGLE_WIDTH + BAR_WIDTH + idx * TRIANGLE_WIDTH + TRIANGLE_WIDTH / 2;
    }

    // Calculate Y position with smart stacking
    let y: number;
    const baseOffset = CHECKER_RADIUS + 2; // Small padding from edge
    
    if (z < MAX_VISIBLE_STACK) {
        // Normal stacking
        const stackOffset = z * CHECKER_SPACING;
        y = isTop 
            ? baseOffset + stackOffset 
            : BOARD_HEIGHT - baseOffset - stackOffset;
    } else {
        // Compressed stacking for 6+ checkers
        // First 5 checkers stack normally, then compress remaining
        const normalHeight = (MAX_VISIBLE_STACK - 1) * CHECKER_SPACING;
        const extraCheckers = z - MAX_VISIBLE_STACK + 1;
        const compressedSpacing = CHECKER_RADIUS * 0.6; // Tighter spacing
        const compressedOffset = extraCheckers * compressedSpacing;
        
        y = isTop
            ? baseOffset + normalHeight + compressedOffset
            : BOARD_HEIGHT - baseOffset - normalHeight - compressedOffset;
        
        // Ensure we don't overflow the triangle
        const maxY = isTop ? TRIANGLE_HEIGHT - CHECKER_RADIUS : BOARD_HEIGHT - TRIANGLE_HEIGHT + CHECKER_RADIUS;
        if (isTop && y > maxY) {
            y = maxY;
        } else if (!isTop && y < maxY) {
            y = maxY;
        }
    }

    return { x, y };
};

/**
 * Get the pip index from SVG coordinates (for drop detection)
 */
export const getPipFromCoordinates = (
    x: number, 
    y: number
): PipIndex | 'bar' | 'borne' | null => {
    // Check if in bar area
    const barLeft = HOME_WIDTH + 6 * TRIANGLE_WIDTH;
    const barRight = barLeft + BAR_WIDTH;
    if (x >= barLeft && x <= barRight) {
        return 'bar';
    }

    // Check if in home zones
    if (x < HOME_WIDTH) {
        return 'borne'; // Left home (dark)
    }
    if (x > BOARD_WIDTH - HOME_WIDTH) {
        return 'borne'; // Right home (light)
    }

    // Determine if top or bottom half
    const isTop = y < BOARD_HEIGHT / 2;

    // Determine if left or right of bar
    const isLeftHalf = x < barLeft;

    // Calculate triangle index
    let triangleIdx: number;
    if (isLeftHalf) {
        triangleIdx = Math.floor((x - HOME_WIDTH) / TRIANGLE_WIDTH);
    } else {
        triangleIdx = Math.floor((x - barRight) / TRIANGLE_WIDTH);
    }

    // Clamp to valid range
    triangleIdx = Math.max(0, Math.min(5, triangleIdx));

    // Convert to pip number
    let pip: number;
    if (isTop) {
        pip = isLeftHalf ? (13 + triangleIdx) : (19 + triangleIdx);
    } else {
        pip = isLeftHalf ? (12 - triangleIdx) : (6 - triangleIdx);
    }

    // Validate pip range
    if (pip >= 1 && pip <= 24) {
        return pip as PipIndex;
    }

    return null;
};

/**
 * Check if coordinates are within a specific pip's clickable area
 */
export const isWithinPip = (
    x: number, 
    y: number, 
    pip: PipIndex
): boolean => {
    const pipCoords = getPipCoordinates(pip, 0);
    const halfWidth = TRIANGLE_WIDTH / 2;
    const isTop = pip >= 13;
    
    // Check X bounds
    if (x < pipCoords.x - halfWidth || x > pipCoords.x + halfWidth) {
        return false;
    }
    
    // Check Y bounds (within triangle height)
    if (isTop) {
        return y >= 0 && y <= TRIANGLE_HEIGHT;
    } else {
        return y >= BOARD_HEIGHT - TRIANGLE_HEIGHT && y <= BOARD_HEIGHT;
    }
};
