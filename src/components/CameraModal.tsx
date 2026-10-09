import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
  title?: string;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Take Photo with Camera',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileFallbackRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Start camera when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setCameraError(null);
      return;
    }

    startCamera(facingMode);

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const startCamera = async (mode: 'environment' | 'user') => {
    stopCamera();
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser.');
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to access camera';
      setCameraError(message);
    }
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      handleClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setCameraError(null);
    onClose();
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleFallbackFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setCapturedImage(result);
          stopCamera();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#1a1b1e] text-white rounded-2xl shadow-2xl border border-white/10 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1a73e8] text-white flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight">{title}</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 text-white/70 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview */}
        <div className="relative bg-black aspect-4/3 flex items-center justify-center overflow-hidden">
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured snapshot"
              className="w-full h-full object-contain bg-black"
            />
          ) : cameraError ? (
            <div className="p-6 text-center space-y-3 max-w-sm">
              <div className="w-12 h-12 bg-white/10 text-amber-400 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">Camera Access Notice</p>
                <p className="text-xs text-white/70 leading-relaxed">
                  {cameraError.includes('denied') || cameraError.includes('Permission')
                    ? 'Camera access was blocked by browser permissions.'
                    : 'Unable to stream live video feed. You can still take a picture using your device photo capture.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileFallbackRef.current?.click()}
                className="px-4 py-2 text-xs font-bold bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg shadow-sm cursor-pointer"
              >
                Use Device Camera / Gallery
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Viewfinder target guides */}
              <div className="absolute inset-6 border border-white/30 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                <div className="flex justify-between text-[10px] text-white/70 font-mono">
                  <span>VIT CAM</span>
                  <span>READY</span>
                </div>
                <div className="text-center text-[11px] text-white/80 bg-black/40 px-2 py-0.5 rounded-full mx-auto backdrop-blur-xs">
                  Center the item in the frame
                </div>
              </div>
            </>
          )}

          {/* Hidden canvas and fallback input */}
          <canvas ref={canvasRef} className="hidden" />
          <input
            ref={fileFallbackRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFallbackFile}
            className="hidden"
          />
        </div>

        {/* Footer controls */}
        <div className="p-4 bg-black/60 border-t border-white/10 flex items-center justify-between gap-3">
          {capturedImage ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2 text-xs font-semibold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2 text-xs font-bold text-white bg-[#006e2c] hover:bg-[#005320] rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Use This Photo</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleCameraFacing}
                title="Switch front/back camera"
                disabled={Boolean(cameraError)}
                className="p-2.5 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-xl cursor-pointer transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleCaptureSnapshot}
                disabled={Boolean(cameraError)}
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#1a73e8] hover:bg-[#1557b0] disabled:bg-white/20 disabled:text-white/40 rounded-xl flex items-center gap-2 shadow-md cursor-pointer transition-colors"
              >
                <div className="w-3 h-3 rounded-full bg-white animate-ping" />
                <span>Capture Snapshot</span>
              </button>

              <button
                type="button"
                onClick={() => fileFallbackRef.current?.click()}
                className="px-3 py-2 text-[11px] font-medium text-white/70 hover:text-white bg-white/10 rounded-xl cursor-pointer"
              >
                File Picker
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
