import { useState, useEffect } from 'react';

export interface DeviceInfo {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    orientation: 'portrait' | 'landscape';
    width: number;
    height: number;
}

/**
 * Hook to detect device type and orientation
 */
export function useDevice(): DeviceInfo {
    const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
        // Initial values
        const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
        const height = typeof window !== 'undefined' ? window.innerHeight : 768;
        const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
        
        return {
            isMobile: width < 768 || isTouch,
            isTablet: width >= 768 && width < 1024,
            isDesktop: width >= 1024,
            orientation: width > height ? 'landscape' : 'portrait',
            width,
            height
        };
    });

    useEffect(() => {
        const updateDeviceInfo = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            
            setDeviceInfo({
                isMobile: width < 768 || isTouch,
                isTablet: width >= 768 && width < 1024,
                isDesktop: width >= 1024,
                orientation: width > height ? 'landscape' : 'portrait',
                width,
                height
            });
        };

        // Initial update
        updateDeviceInfo();

        // Listen for resize events
        window.addEventListener('resize', updateDeviceInfo);
        window.addEventListener('orientationchange', updateDeviceInfo);

        return () => {
            window.removeEventListener('resize', updateDeviceInfo);
            window.removeEventListener('orientationchange', updateDeviceInfo);
        };
    }, []);

    return deviceInfo;
}

