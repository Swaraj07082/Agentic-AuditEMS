'use client';

import React from "react"

import { useState } from 'react';
import { Upload, CheckCircle, FileText, Loader2, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

export default function DocumentUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter((file) => {
      const isValidType = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'image/jpeg',
        'image/png',
        'image/webp'
      ].includes(file.type);

      if (!isValidType) {
        toast.error(`File type not supported: ${file.name}`);
      }
      return isValidType;
    });

    const newUploadedFiles: UploadedFile[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 11),
      file,
      progress: 100, // We mark them as 100% since they are locally selected
      status: 'completed',
    }));

    setFiles((prev) => [...prev, ...newUploadedFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
    // Reset input value so the same file can be selected again if removed
    e.target.value = '';
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsAnalyzing(true);

    try {
      // Create FormData adding all files
      const formData = new FormData();
      files.forEach((fileObj) => {
        // Appending each file. Note: if the backend only supports one file, 
        // this might need to be adjusted or requests sent sequentially.
        // Usually, multiple files are sent under the same key or distinct keys.
        // Assuming backend 'file' field as seen in fastapi_server.py
        formData.append('file', fileObj.file);
      });

      // Based on fastapi_server.py, the endpoint is /ocr/ (with trailing slash)
      // And it runs on port 4000 usually, but here we assume relative path or proxy
      const response = await fetch("http://127.0.0.1:4000/ocr", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('OCR Response:', data);
      toast.success('Documents processed successfully');

      // Optionally clear files after successful analysis
      // setFiles([]);

    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to process documents');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <section
      id="upload"
      className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-accent/10 rounded-full filter blur-3xl opacity-50"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Intelligent Document Processing
          </h2>
          <p className="text-lg text-foreground/60">
            Upload multiple documents and let AI handle the analysis
          </p>
        </div>

        {/* Upload area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-16 text-center transition-all duration-300 animate-fade-in-scale ${isDragging
            ? 'border-primary/60 bg-primary/10'
            : 'border-border/50 bg-card/50 hover:border-border'
            }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all ${isDragging
                ? 'bg-primary/20'
                : 'bg-primary/10 group-hover:bg-primary/15'
                }`}
            >
              <Upload
                className={`w-8 h-8 transition-colors ${isDragging ? 'text-primary' : 'text-primary/60'
                  }`}
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {isDragging ? 'Drop files here' : 'Drag & drop your documents'}
              </h3>
              <p className="text-foreground/60 mb-4">
                or click below to select files
              </p>
            </div>
            <label className="cursor-pointer">
              <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white h-10 px-4 py-2">
                Browse Files
              </div>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            <p className="text-sm text-foreground/40 mt-4">
              Supported: PDF, DOCX, TXT, Excel, Images (Max 50MB each)
            </p>
          </div>
        </div>

        {/* Uploaded files list */}
        {files.length > 0 && (
          <div className="mt-12 space-y-3 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Selected Documents ({files.length})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFiles([])}
                className="text-foreground/50 hover:text-foreground"
              >
                Clear All
              </Button>
            </div>
            {files.map((file) => (
              <div
                key={file.id}
                className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 hover:border-primary/30 transition-colors group"
              >
                <FileText className="w-5 h-5 text-primary/60 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-medium text-foreground truncate">
                      {file.file.name}
                    </p>
                    <span className="text-sm text-foreground/50 flex-shrink-0">
                      {formatFileSize(file.file.size)}
                    </span>
                  </div>
                  {file.status === 'uploading' && (
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {file.status === 'uploading' && (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  )}
                  {file.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  )}
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  disabled={isAnalyzing}
                  className="p-1 hover:bg-muted rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-0"
                >
                  <X className="w-5 h-5 text-foreground/50" />
                </button>
              </div>
            ))}

            {/* Analysis button */}
            <Button
              onClick={uploadFiles}
              className="w-full mt-8 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white h-12 font-semibold shadow-lg shadow-primary/20"
              disabled={isAnalyzing || files.length === 0}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing Documents...
                </>
              ) : (
                'Analyze Documents'
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
