/**
 * HeyGen API Service for Video Coach Avatar
 * Generates video avatars with personalized coaching scripts
 */

const HEYGEN_API_URL = import.meta.env.VITE_HEYGEN_API_URL || 'https://api.heygen.com/v1/video.generate';
const HEYGEN_API_KEY = import.meta.env.VITE_HEYGEN_API_KEY;

// Cache for generated videos (avoid regeneration)
const videoCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export type Personality = 'strategist' | 'humorist';

/**
 * Generate coach video using HeyGen API
 */
export async function generateCoachVideo(
    script: string,
    personality: Personality = 'strategist'
): Promise<string | null> {
    if (!HEYGEN_API_KEY) {
        console.warn('HeyGen API key not configured');
        return null;
    }

    // Check cache first
    const cacheKey = `${personality}-${script.slice(0, 50)}`;
    const cached = videoCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.url;
    }

    try {
        // Get avatar ID based on personality
        const avatarId = personality === 'strategist' 
            ? import.meta.env.VITE_HEYGEN_AVATAR_STRATEGIST || 'default-strategist'
            : import.meta.env.VITE_HEYGEN_AVATAR_HUMORIST || 'default-humorist';

        const response = await fetch(HEYGEN_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': HEYGEN_API_KEY
            },
            body: JSON.stringify({
                video_input: {
                    character: {
                        type: 'avatar',
                        avatar_id: avatarId
                    },
                    background: {
                        type: 'color',
                        value: '#000000'
                    }
                },
                audio_input: script,
                dimension: {
                    width: 512,
                    height: 512
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`HeyGen API error: ${response.status} ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const videoUrl = data.data?.video_url || data.video_url;

        if (videoUrl) {
            // Cache the result
            videoCache.set(cacheKey, {
                url: videoUrl,
                timestamp: Date.now()
            });
            return videoUrl;
        }

        return null;
    } catch (error: any) {
        console.error('HeyGen API error:', error);
        return null;
    }
}

/**
 * Check video generation status (for async generation)
 */
export async function checkVideoStatus(videoId: string): Promise<{ status: string; url?: string } | null> {
    if (!HEYGEN_API_KEY) return null;

    try {
        const response = await fetch(`${HEYGEN_API_URL}/${videoId}`, {
            headers: {
                'X-Api-Key': HEYGEN_API_KEY
            }
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return {
            status: data.status || 'unknown',
            url: data.video_url
        };
    } catch (error) {
        console.error('Error checking video status:', error);
        return null;
    }
}

