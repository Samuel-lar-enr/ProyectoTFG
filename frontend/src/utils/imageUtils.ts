export const getImageUrl = (imgUrl: string | null | undefined) => {
    if (!imgUrl) return undefined;
    if (imgUrl.startsWith('data:')) return imgUrl; // Base64 previews
    if (imgUrl.startsWith('http')) return imgUrl;  // External URLs
    
    // For local uploads starting with /uploads/
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${imgUrl}`;
};
