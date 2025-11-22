"use client"
import { useEffect, useRef, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

export default function Home() {

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const runDetection = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access is not supported in your browser");
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: "user" }
      });

      videoRef.current.srcObject = stream;

      // Wait for video metadata to load
      await new Promise((resolve) => {
        videoRef.current.onloadedmetadata = () => {
          resolve();
        };
      });

      // Load the model
      const model = await cocoSsd.load();

      // Start detection (loading will be set to false after first frame)
      detectFrame(videoRef.current, model);

    } catch (err) {
      setLoading(false);
      
      // Handle specific error types
      if (err.name === "NotAllowedError") {
        setError("Camera access denied. Please allow camera permissions and refresh the page.");
      } else if (err.name === "NotFoundError") {
        setError("No camera found on your device.");
      } else if (err.name === "NotReadableError") {
        setError("Camera is already in use by another application.");
      } else {
        setError(err.message || "Failed to start camera. Please try again.");
      }
      console.error("Camera error:", err);
    }
  }

  const detectFrame = (video, model) => {
    model.detect(video).then((predictions) => {
      // Hide loading after first successful detection
      setLoading(false);
      
      renderPredictions(predictions);

      requestAnimationFrame(() => {
        detectFrame(video, model);
      });
    }).catch((err) => {
      console.error("Detection error:", err);
      setLoading(false);
    });
  };

  const renderPredictions = (predictions) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";

    predictions.forEach((prediction) => {
      const [x, y, width, height] = prediction.bbox;

      ctx.strokeStyle = "#818cf8";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);

      ctx.fillStyle = "#818cf8";
      const textWidth = ctx.measureText(prediction.class).width;
      ctx.fillRect(x, y, textWidth + 7, parseInt(font, 10) + 4);

      ctx.fillStyle = "#fff";
      ctx.fillText(prediction.class, x, y);
    });
  };

  useEffect(() => {
    runDetection();

    // Cleanup function to stop video stream
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);


  return (
    <div className="relative h-screen flex justify-center items-center bg-indigo-400 pt-16">
      {loading && (
        <div className="absolute z-20 bg-white/90 px-6 py-4 rounded-lg shadow-lg">
          <p className="text-indigo-600 font-semibold">Loading camera and AI model...</p>
        </div>
      )}

      {error && (
        <div className="absolute z-20 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg max-w-md text-center">
          <p className="font-semibold mb-2">⚠️ Error</p>
          <p>{error}</p>
        </div>
      )}

      {!error && (
        <>
          <video 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-8 border-dashed rounded-xl" 
            width={500} 
            height={350} 
            autoPlay 
            ref={videoRef} 
          />
          <canvas 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" 
            width={500} 
            height={350}
            ref={canvasRef}
          />
        </>
      )}
    </div>
  );
}
