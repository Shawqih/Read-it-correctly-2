import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw, Download, Eraser, Sparkles, Volume2 } from 'lucide-react';
import { audioEngine } from '../../utils/audioEngine';

interface AlphabetTracingCanvasProps {
  letterChar: string;
  letterName: string;
  tracingHint: string;
  onDrawCompleted?: () => void;
}

export const AlphabetTracingCanvas: React.FC<AlphabetTracingCanvasProps> = ({
  letterChar,
  letterName,
  tracingHint,
  onDrawCompleted,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#2563eb'); // Default vibrant blue
  const [brushSize, setBrushSize] = useState(14);
  const [isEraser, setIsEraser] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const colors = [
    { name: 'أزرق', hex: '#2563eb' },
    { name: 'أخضر', hex: '#16a34a' },
    { name: 'برتقالي', hex: '#ea580c' },
    { name: 'أحمر', hex: '#dc2626' },
    { name: 'بنفسجي', hex: '#9333ea' },
    { name: 'وردي', hex: '#db2777' },
  ];

  // Set up canvas sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    setHasDrawn(false);
  }, [letterChar]);

  // Start Drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);

    audioEngine.playClickSound();
  };

  // Draw Stroke
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = brushSize;
    ctx.strokeStyle = isEraser ? '#ffffff' : brushColor;

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // Stop Drawing
  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      onDrawCompleted?.();
    }
  };

  // Clear Canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasDrawn(false);
    audioEngine.playClickSound();
  };

  // Download artwork
  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a new canvas with background to combine ghost and strokes
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const expCtx = exportCanvas.getContext('2d');
    if (!expCtx) return;

    // Fill white background
    expCtx.fillStyle = '#ffffff';
    expCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Draw the letter guide in light watermark
    expCtx.fillStyle = '#e2e8f0';
    expCtx.font = `bold ${exportCanvas.height * 0.55}px 'Tajawal', sans-serif`;
    expCtx.textAlign = 'center';
    expCtx.textBaseline = 'middle';
    expCtx.fillText(letterChar, exportCanvas.width / 2, exportCanvas.height / 2);

    // Draw child strokes
    expCtx.drawImage(canvas, 0, 0);

    // Add signature footer
    expCtx.fillStyle = '#1e3a8a';
    expCtx.font = `bold ${exportCanvas.height * 0.04}px 'Tajawal', sans-serif`;
    expCtx.fillText(`تطبيق أقرأها صح - رسم حرف (${letterName})`, exportCanvas.width / 2, exportCanvas.height * 0.94);

    const link = document.createElement('a');
    link.download = `رسم_حرف_${letterName}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
    audioEngine.playSuccessSound();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-md transition-colors">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              لوحة رسم وتتبع حرف ({letterChar})
            </h3>
            <button
              onClick={() => audioEngine.speak(`ارسم حرف ${letterName}. ${tracingHint}`)}
              className="p-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition cursor-pointer"
              title="استمع للتعليمات"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            💡 <span className="font-semibold text-blue-700 dark:text-blue-400">طريقة الرسم:</span> {tracingHint}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={clearCanvas}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
            title="مسح اللوحة"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>مسح</span>
          </button>
          <button
            onClick={downloadDrawing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold transition cursor-pointer border border-blue-200 dark:border-blue-800"
            title="حفظ الرسمة"
          >
            <Download className="w-3.5 h-3.5" />
            <span>حفظ اللوحة</span>
          </button>
        </div>
      </div>

      {/* Interactive Canvas Container with Ghost Letter Guide */}
      <div className="relative w-full h-72 sm:h-84 md:h-96 rounded-2xl bg-radial from-slate-50 to-slate-100/80 dark:from-slate-900 dark:to-slate-950 border-2 border-dashed border-blue-200 dark:border-blue-900/60 overflow-hidden flex items-center justify-center select-none touch-none shadow-inner">
        {/* Ghost Letter Watermark (Guide for Tracing) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="text-[160px] sm:text-[220px] md:text-[250px] font-black text-slate-200/90 dark:text-slate-800/80 leading-none select-none tracking-normal transition-colors">
            {letterChar}
          </span>
        </div>

        {/* Tracing Dotted Guide Line for kids */}
        <div className="absolute bottom-16 inset-x-8 border-b-2 border-dashed border-red-300 dark:border-red-500/40 pointer-events-none opacity-40"></div>

        {/* Drawing Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full cursor-crosshair z-10"
        />

        {/* Instruction overlay when canvas is empty */}
        {!hasDrawn && (
          <div className="absolute top-4 left-4 bg-white/80 dark:bg-slate-800/90 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-bold text-slate-500 dark:text-slate-300 pointer-events-none border border-slate-200 dark:border-slate-700 flex items-center gap-1 z-20">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>حرّك إصبعك أو الفأرة لتتبع ورسم الحرف</span>
          </div>
        )}
      </div>

      {/* Tools & Colors Palette */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        {/* Colors */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">الألوان:</span>
          {colors.map((c) => (
            <button
              key={c.hex}
              onClick={() => {
                setBrushColor(c.hex);
                setIsEraser(false);
                audioEngine.playClickSound();
              }}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-transform cursor-pointer shadow-xs ${
                !isEraser && brushColor === c.hex
                  ? 'scale-120 ring-3 ring-offset-2 ring-blue-500'
                  : 'hover:scale-110 opacity-80'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}

          {/* Eraser Toggle */}
          <button
            onClick={() => {
              setIsEraser(!isEraser);
              audioEngine.playClickSound();
            }}
            className={`p-1.5 sm:p-2 rounded-xl border text-xs font-bold flex items-center gap-1 cursor-pointer transition ml-1 ${
              isEraser
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Eraser className="w-4 h-4" />
            <span className="hidden sm:inline">ممحاة</span>
          </button>
        </div>

        {/* Brush Size */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">حجم الخط:</span>
          {[8, 14, 22].map((size) => (
            <button
              key={size}
              onClick={() => {
                setBrushSize(size);
                audioEngine.playClickSound();
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                brushSize === size
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {size === 8 ? 'رفيع' : size === 14 ? 'متوسط' : 'عريض'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
