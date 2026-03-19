'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface IDUploaderProps {
    onFileSelected: (file: File) => void;
    label: string;
    hint: string;
}

export function IDUploader({ onFileSelected, label, hint }: IDUploaderProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (!file) return;

            // Create local preview URL
            const url = URL.createObjectURL(file);
            setPreview(url);
            setFileName(file.name);
            onFileSelected(file);
        },
        [onFileSelected],
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/jpeg': [], 'image/png': [] },
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024, // 5MB
    });

    return (
        <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-white/70">{label}</p>

            <div
                {...getRootProps()}
                className={`dropzone rounded-xl p-6 cursor-pointer transition-all
                    duration-200 ${isDragActive ? 'dropzone-active' : ''}`}
            >
                <input {...getInputProps()} />

                <AnimatePresence mode="wait">
                    {preview ? (
                        // Preview of uploaded image
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-3"
                        >
                            <div className="relative w-full h-36 rounded-lg overflow-hidden">
                                <Image
                                    src={preview}
                                    alt="Preview"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <p className="text-xs text-white/40 truncate max-w-full">
                                {fileName}
                            </p>
                            <p className="text-xs text-indigo-400">
                                Click or drag to replace
                            </p>
                        </motion.div>
                    ) : (
                        // Empty drop zone
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-3 py-4"
                        >
                            <div
                                className="w-12 h-12 rounded-full flex items-center
                           justify-center text-2xl"
                                style={{ background: 'rgba(99,102,241,0.1)' }}
                            >
                                📎
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-white/60 font-medium">
                                    {isDragActive ? 'Drop it here' : 'Drop image or click to upload'}
                                </p>
                                <p className="text-xs text-white/30 mt-1">{hint}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}