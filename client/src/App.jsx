// client/src/App.jsx - FULL CODE

import React, { useState } from 'react';
import './App.css'; // You'll need to add the @keyframes gradient to your App.css

const aspectRatios = [
    { label: 'Square (1:1)', value: '1:1' },
    { label: 'Portrait (4:3)', value: '4:3' },
    { label: 'Widescreen (16:9)', value: '16:9' },
];

function App() {
    const [prompt, setPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setImageUrl('');
        setError(null);

        try {
            // **DO NOT CHANGE** (This is the correct network path)
            const response = await fetch('http://localhost:5000/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Send new parameters to the backend
                body: JSON.stringify({ 
                    prompt, 
                    aspectRatio, 
                    negativePrompt: negativePrompt.trim() 
                }),
            });

            if (!response.ok) {
                let errorMessage = 'Failed to generate image due to server error.';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    errorMessage = `Server returned an unexpected response (Status: ${response.status}).`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            setImageUrl(data.imageUrl);
        } catch (err) {
            console.error("Error generating image:", err);
            setError(err.message || 'An unknown error occurred. Check network connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        // 🎨 Interactive Background added using Tailwind and the custom CSS class
        <div className="min-h-screen flex flex-col items-center justify-center p-4 animated-gradient"> 
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-3xl"> 
                <h1 className="text-4xl font-extrabold text-indigo-700 mb-8 text-center">
                    AI Image Generator Studio
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Prompt Input */}
                    <div>
                        <label htmlFor="prompt" className="block text-lg font-semibold text-gray-700 mb-2">
                            Describe the image you want to create (Positive Prompt):
                        </label>
                        <textarea
                            id="prompt"
                            rows="3"
                            className="mt-1 block w-full border-2 border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg resize-none p-3 rounded-lg"
                            placeholder="e.g., A majestic lion wearing a suit, digital art"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    {/* Options Row (Aspect Ratio & Negative Prompt) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Aspect Ratio Dropdown */}
                        <div>
                            <label htmlFor="aspectRatio" className="block text-md font-semibold text-gray-700 mb-2">
                                Aspect Ratio:
                            </label>
                            <select
                                id="aspectRatio"
                                className="w-full border-2 border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 rounded-lg"
                                value={aspectRatio}
                                onChange={(e) => setAspectRatio(e.target.value)}
                            >
                                {aspectRatios.map(ratio => (
                                    <option key={ratio.value} value={ratio.value}>
                                        {ratio.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Negative Prompt Input */}
                        <div>
                            <label htmlFor="negativePrompt" className="block text-md font-semibold text-gray-700 mb-2">
                                Negative Prompt (Optional):
                            </label>
                            <input
                                type="text"
                                id="negativePrompt"
                                className="w-full border-2 border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 rounded-lg"
                                placeholder="e.g., blurry, watermark, low quality"
                                value={negativePrompt}
                                onChange={(e) => setNegativePrompt(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 px-4 rounded-lg text-xl transition duration-300 ease-in-out flex items-center justify-center shadow-md hover:shadow-lg"
                        disabled={loading || !prompt.trim()}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Generating Image...
                            </>
                        ) : (
                            'Generate Image'
                        )}
                    </button>
                </form>

                {/* Error Display */}
                {error && (
                    <div className="mt-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg font-medium">
                        <p className="font-bold">Generation Error:</p>
                        <p>{error}</p>
                    </div>
                )}

                {/* Image Display */}
                {imageUrl && (
                    <div className="mt-8 text-center">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            Your Result:
                        </h2>
                        <div className="bg-gray-100 p-3 rounded-lg shadow-inner max-h-[600px] overflow-hidden">
                            <img
                                src={imageUrl}
                                alt="Generated by AI"
                                className="w-full h-auto rounded-md object-contain"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;


