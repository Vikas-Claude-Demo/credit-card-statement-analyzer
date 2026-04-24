/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Lock, Unlock, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { PDFDocument } from "pdf-lib";
import * as pdfjs from 'pdfjs-dist';

// Configure PDF.js worker using unpkg which is more reliable for specific npm versions
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface FileUploadProps {
  onUpload: (input: { base64?: string; text?: string }) => Promise<void>;
  isProcessing: boolean;
}

export function FileUpload({ onUpload, isProcessing }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [password, setPassword] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [progress, setProgress] = useState(0);

  // Sync progress with states
  React.useEffect(() => {
    let interval: any;
    if (isProcessing || isDecrypting) {
      setProgress(10);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + (prev < 50 ? 5 : 2);
        });
      }, 500);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isProcessing, isDecrypting]);

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    setError(null);
    setFile(file);
    setIsEncrypted(false);
    setPassword("");

    const arrayBuffer = await file.arrayBuffer();
    try {
      // Step 1: Attempt to load the PDF normally to check if it's password protected
      await PDFDocument.load(arrayBuffer);
      
      // If we reach here, it's not encrypted, proceed to upload
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          if (!base64) throw new Error("Could not read file data");
          await onUpload({ base64 });
        } catch (err: any) {
          setError(err.message || "Failed to process the statement.");
        }
      };
      
      reader.onerror = () => {
        setError("Error reading the file from disk.");
      };
      
      reader.readAsDataURL(blob);
    } catch (err: any) {
      const errorMsg = (err.message || "").toLowerCase();
      // Most banks use standard PDF encryption that throws specific messages
      if (errorMsg.includes("password") || errorMsg.includes("encrypted") || errorMsg.includes("decrypt") || errorMsg.includes("code 4")) {
        setIsEncrypted(true);
      } else {
        setError("This PDF file could not be read. It may be corrupted or use advanced security features.");
        console.error("PDF Detection Error:", err);
      }
    }
  }, [onUpload]);

  const handleUnlock = async () => {
    if (!file || !password) return;
    setIsDecrypting(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      let text = "";
      try {
        // Method 1: Try pdf-lib to get decrypted base64 (Best for AI)
        const pdfDoc = await PDFDocument.load(arrayBuffer, { password } as any);
        const decryptedPdfBytes = await pdfDoc.save();
        const blob = new Blob([decryptedPdfBytes], { type: 'application/pdf' });
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          try {
            const base64 = (reader.result as string).split(',')[1];
            if (!base64) throw new Error("Could not encode decrypted data");
            await onUpload({ base64 });
            setIsEncrypted(false);
            setPassword("");
          } catch (err: any) {
            console.error("Analysis Error after Decryption:", err);
            setError("Decryption succeeded, but analysis failed: " + (err.message || "Unknown error"));
          } finally {
            setIsDecrypting(false);
          }
        };
        reader.readAsDataURL(blob);
      } catch (pdfLibErr: any) {
        // Method 2: Fallback to pdfjs text extraction (Better decryption support)
        try {
          const loadingTask = pdfjs.getDocument({
            data: arrayBuffer,
            password: password,
            verbosity: 0
          });
          const pdf = await loadingTask.promise;
          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(" ");
            fullText += pageText + "\n";
          }
          
          if (!fullText.trim()) throw new Error("EMPTY_TEXT");
          
          await onUpload({ text: fullText });
          setIsEncrypted(false);
          setPassword("");
          setIsDecrypting(false);
        } catch (pdfjsErr: any) {
          const msg = (pdfjsErr.message || "").toLowerCase();
          if (msg.includes("password") || msg.includes("incorrect") || pdfjsErr.name === "PasswordException") {
            setError("Incorrect password. Please verify and try again.");
          } else if (msg.includes("empty_text")) {
            setError("Unlocked but could not find readable text. The statement might be an image.");
          } else {
            console.error("Decryption System Error:", pdfjsErr);
            setError("This PDF uses an advanced encryption method not supported by this browser.");
          }
          setIsDecrypting(false);
        }
      }
    } catch (err: any) {
      console.error("General Decryption Error:", err);
      setError("An unexpected error occurred during decryption.");
      setIsDecrypting(false);
    }
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-2 sm:px-0">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-3xl p-10 transition-all duration-300 flex flex-col items-center justify-center text-center overflow-hidden",
          dragActive ? "border-bento-accent bg-blue-50/50 scale-[1.02]" : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300",
          isProcessing || isEncrypted ? "border-slate-300 bg-white shadow-sm" : "",
          error ? "border-red-200 bg-red-50/30" : ""
        )}
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
      >
        {(isProcessing || isDecrypting) && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="absolute top-0 left-0 h-1.5 bg-bento-accent transition-all duration-500 ease-out z-20"
          />
        )}
        {!isEncrypted && !isProcessing && (
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={onChange}
            accept=".pdf"
          />
        )}
        
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center py-4"
            >
              <div className="relative mb-6">
                <div className="absolute -inset-4 bg-bento-accent/5 rounded-full animate-pulse" />
                <Loader2 className="w-12 h-12 text-bento-accent animate-spin" />
              </div>
              <p className="text-sm font-black text-bento-primary uppercase tracking-tighter">AI Analysis in Progress</p>
              <p className="text-[11px] text-bento-muted mt-2 font-bold tracking-widest uppercase opacity-60">Step: Data Extraction • {progress}%</p>
            </motion.div>
          ) : isEncrypted ? (
            <motion.div
              key="encrypted"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center w-full max-w-sm py-2"
            >
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-amber-100/50">
                <Lock className="w-7 h-7" />
              </div>
              <p className="text-sm font-black text-bento-primary uppercase tracking-tight">Statement Protected</p>
              <p className="text-[11px] text-bento-muted mt-1 mb-8 font-medium">To maintain security, please enter the file password.</p>
              
              <div className="flex w-full gap-2 relative z-20 px-4">
                <input
                  type="password"
                  placeholder="Enter PDF Password"
                  className="flex-1 px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-bento-accent/5 transition-all shadow-sm placeholder:text-slate-300 font-mono"
                  value={password}
                  autoFocus
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                />
                <button
                  onClick={handleUnlock}
                  disabled={!password || isDecrypting}
                  className="bg-bento-primary text-white px-6 rounded-2xl hover:bg-black disabled:opacity-50 transition-all shadow-lg active:scale-95 flex items-center justify-center min-w-[64px]"
                >
                  {isDecrypting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ArrowRight className="w-6 h-6" />
                  )}
                </button>
              </div>
              <button 
                onClick={() => { setFile(null); setIsEncrypted(false); setError(null); }}
                className="mt-8 text-[10px] font-black uppercase tracking-widest text-bento-muted hover:text-bento-accent transition-colors"
              >
                ← Choose a different file
              </button>
            </motion.div>
          ) : file ? (
            <motion.div
              key="file-ready"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-4"
            >
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-6 border border-emerald-100 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-bento-primary uppercase tracking-tight">Statement Ready</p>
                <p className="text-[11px] font-bold text-bento-accent bg-emerald-50/50 px-3 py-1 rounded-full">{file.name}</p>
              </div>
              <button 
                onClick={() => { setFile(null); setError(null); }}
                className="mt-8 text-[10px] font-black uppercase tracking-widest text-bento-muted hover:text-red-500 transition-colors"
              >
                Change File
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="upload-prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className={cn(
                "w-20 h-20 rounded-[2.5rem] flex items-center justify-center mb-6 transition-all duration-500",
                dragActive ? "bg-bento-accent text-white rotate-12 scale-110 shadow-2xl" : "bg-white text-bento-muted border border-bento-border shadow-sm"
              )}>
                <Upload className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 px-6">
                <p className="text-sm font-black text-bento-primary uppercase tracking-tighter">Analyze your statement</p>
                <p className="text-[11px] font-medium text-bento-muted leading-relaxed">Drag your PDF here or click to browse. <br />Private and secure AI analysis.</p>
              </div>
              <div className="mt-10 flex items-center space-x-2.5 px-5 py-2.5 bg-white border border-bento-border rounded-2xl shadow-sm text-bento-muted group">
                <FileText className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Select Card Statement</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 p-5 bg-red-50 border border-red-100 rounded-[2rem] flex items-start space-x-4 shadow-sm"
          >
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0 border border-red-100">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1 pt-1">
              <p className="text-[10px] font-black text-red-800 uppercase tracking-widest mb-1">Analysis Error</p>
              <p className="text-xs text-red-600 font-medium leading-relaxed">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 transition-colors pt-1"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
