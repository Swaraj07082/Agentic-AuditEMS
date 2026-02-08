'use client';

import React from "react"

import { useState } from 'react';
import { Upload, CheckCircle, FileText, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

export default function DocumentUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const formdata = new FormData()
  const simulateUpload = (file: File) => {
    // console.log(file)
    formdata.append(`${file.name}` , file);
    console.log(formdata.getAll(`${file.name}`))
    // console.log(formdata)
    const id = Math.random().toString(36);
    const newFile: UploadedFile = {
      id,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading',
    };

    setFiles((prev) => [...prev, newFile]);

    // Simulate upload progress
    const interval = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                progress: Math.min(f.progress + Math.random() * 30, 100),
              }
            : f
        )
      );
    }, 200);

    // Complete upload
    setTimeout(() => {
      clearInterval(interval);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, progress: 100, status: 'completed' }
            : f
        )
      );
    }, 2000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach((file) => {
      if (
        file.type === 'application/pdf' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'text/plain'
      ) {
        simulateUpload(file);
      }
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    selectedFiles.forEach((file) => {
      simulateUpload(file);
    });
    uploadFiles();
  };

  const uploadFiles = async() => {
    // console.log(formdata)
    const response = await fetch("/ocr" , {
      method : "POST",
      body : formdata
    })

    const data = await response.json()
    console.log(data)
  }


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
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-16 text-center transition-all duration-300 animate-fade-in-scale ${
            isDragging
              ? 'border-primary/60 bg-primary/10'
              : 'border-border/50 bg-card/50 hover:border-border'
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all ${
                isDragging
                  ? 'bg-primary/20'
                  : 'bg-primary/10 group-hover:bg-primary/15'
              }`}
            >
              <Upload
                className={`w-8 h-8 transition-colors ${
                  isDragging ? 'text-primary' : 'text-primary/60'
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
            <label>
              <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white">
                Browse Files
              </Button>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                // className="hidden"
              />
            </label>
            <p className="text-sm text-foreground/40 mt-4">
              Supported: PDF, DOCX, DOC, TXT (Max 50MB each)
            </p>
          </div>
        </div>

        {/* Uploaded files list */}
        {files.length > 0 && (
          <div className="mt-12 space-y-3 animate-fade-in-up">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              Uploaded Documents ({files.length})
            </h3>
            {files.map((file) => (
              <div
                key={file.id}
                className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 hover:border-primary/30 transition-colors group"
              >
                <FileText className="w-5 h-5 text-primary/60 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="font-medium text-foreground truncate">
                      {file.name}
                    </p>
                    <span className="text-sm text-foreground/50 flex-shrink-0">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                  {file.status === 'uploading' && (
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
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
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-1 hover:bg-muted rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-5 h-5 text-foreground/50" />
                </button>
              </div>
            ))}

            {/* Analysis button */}
            <Button
              className="w-full mt-8 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white h-12 font-semibold"
              disabled={files.some((f) => f.status === 'uploading')}
            >
              Analyze Documents
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
