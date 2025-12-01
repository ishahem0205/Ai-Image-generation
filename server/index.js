// server/index.js - FULL CODE

import express from 'express';
import cors from 'cors';
// Removed: import Replicate from 'replicate'; 
// Replaced with: 
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables (dotenv is now imported, so we keep this)
dotenv.config();

console.log('API Key Status:', process.env.GEMINI_API_KEY ? 'Loaded' : 'NOT FOUND');

// Removed: Replicate initialization
// Added: Gemini API Client Initialization
// NOTE: This client automatically looks for the GEMINI_API_KEY environment variable
const ai = new GoogleGenAI({});

const app = express();
const PORT = process.env.PORT || 5000;

// CORS settings - DO NOT CHANGE
const corsOptions = {
    origin: 'http://localhost:5173',
    methods: 'GET,POST',
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Root test route
app.get('/', (req, res) => {
    res.send('Backend is connected and running!');
});

// Helper function to map aspect ratio to Imagen 3 dimensions
// NOTE: Imagen 3 supports specific sizes. We map ratios to the closest supported sizes.
const getDimensions = (ratio) => {
    switch (ratio) {
        case '1:1': return '1024x1024'; // Square
        case '4:3': return '1536x1024'; // Landscape (Closest supported)
        case '16:9': return '1792x1024'; // Wide Landscape
        default: return '1024x1024'; // Default to square
    }
};

// Image Generation Endpoint
app.post('/generate-image', async (req, res) => {
    // Extract new fields from the frontend request body
    const { prompt, aspectRatio, negativePrompt } = req.body;
    
    // Get the supported size string for the Imagen 3 API
    const size = getDimensions(aspectRatio);

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
    }

    try {
        console.log(`Generating image for prompt: "${prompt}" with ${size} size.`);

        const response = await ai.models.generateImages({
            model:'imagen-generate-002', // The Imagen 3 model for image generation
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: size, // Use the mapped size string
                // The negative prompt input field for Imagen 3 is called 'negativePrompt'
                ...(negativePrompt && { negativePrompt: negativePrompt }),
            },
        });
        
        // Imagen 3 returns an array of base64 image data in the 'generatedImages' array
        if (response.generatedImages && response.generatedImages.length > 0) {
            // The frontend needs a standard URL or a data URL (base64)
            // We convert the base64 data to a Data URL
            const base64Data = response.generatedImages[0].image.imageBytes;
            const imageUrl = `data:image/png;base64,${base64Data}`;
            
            console.log('Image generated successfully.');
            res.json({ imageUrl });
        } else {
            console.error('Gemini API returned no image output.');
            res.status(500).json({ error: 'Failed to generate image: No output.' });
        }

    } catch (error) {
        console.error('Error calling Gemini API:', error.message);
        
        let message = 'AI service error. Check API key and service status.';
        
        // This handles API errors (e.g., policy violations, rate limits)
        if (error.status === 400 && error.message.includes("content has been blocked")) {
             message = "Content was blocked by safety settings. Try a different prompt.";
        }
        
        res.status(500).json({
            error: message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
