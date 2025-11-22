"use client";

import "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";
import { useState } from "react";

function Recognize() {

    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [predictions, setPredictions] = useState(null);
    const [error, setError] = useState(null);

    const handleImageChange = (e) => {
        try {
            const file = e.target.files[0];
            if (file) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    setError("Please upload a valid image file");
                    return;
                }

                // Validate file size (max 10MB)
                if (file.size > 10 * 1024 * 1024) {
                    setError("Image size should be less than 10MB");
                    return;
                }

                const image = URL.createObjectURL(file);
                setImageUrl(image);
                setPredictions(null);
                setError(null);
            }
        } catch (err) {
            setError("Failed to load image. Please try again.");
            console.error("Image load error:", err);
        }
    };

    const handleClassify = async () => {
        try {
            setLoading(true);
            setError(null);

            const imgElement = document.querySelector("#uploaded-image");
            
            if (!imgElement) {
                throw new Error("Image element not found");
            }

            // Wait for image to fully load
            if (!imgElement.complete) {
                await new Promise((resolve, reject) => {
                    imgElement.onload = resolve;
                    imgElement.onerror = reject;
                });
            }

            const model = await mobilenet.load();
            const prediction = await model.classify(imgElement);
            setPredictions(prediction);

        } catch (err) {
            setError("Failed to classify image. Please try again.");
            console.error("Classification error:", err);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="h-screen w-full bg-indigo-400 flex flex-col gap-4 justify-center items-center pt-16">
            <label className="cursor-pointer hover:bg-indigo-500 transition-colors">
                <span className="border-2 border-dashed rounded p-3 bg-white/10 text-white font-semibold">
                    📁 Upload Image
                </span>
                <input type="file" accept="image/*" onChange={handleImageChange} hidden />
            </label>

            {error && (
                <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg max-w-md text-center">
                    <p className="font-semibold">⚠️ {error}</p>
                </div>
            )}

            {imageUrl && (
                <>
                    <img 
                        id="uploaded-image" 
                        className="w-[300px] rounded-xl shadow-lg" 
                        src={imageUrl} 
                        alt="Uploaded preview"
                    />
                    <button 
                        onClick={handleClassify} 
                        disabled={loading}
                        className="px-6 py-3 rounded-lg bg-white text-indigo-600 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "🔄 Classifying..." : "🎯 Classify Image"}
                    </button>
                </>
            )}

            {predictions && predictions.length > 0 && (
                <div className="bg-white/90 rounded-lg p-4 shadow-lg">
                    <h3 className="font-bold text-indigo-600 mb-2">Results:</h3>
                    {predictions.map((prediction) => (
                        <div key={prediction.className} className="flex font-semibold gap-3 items-center py-1">
                            <div className="text-gray-800">{prediction.className}</div>
                            <div className="text-indigo-600">
                                {(prediction.probability * 100).toFixed(1)}%
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Recognize;