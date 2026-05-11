import React, { useState, useRef } from 'react';
import { Upload, X, File, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FileUploadProps {
    label?: string;
    description?: string;
    accept?: string;
    multiple?: boolean;
    onUpload?: (files: File[]) => void;
}

interface UploadingFile {
    id: string;
    file: File;
    progress: number;
    status: 'uploading' | 'completed' | 'error';
}

export const FileUpload: React.FC<FileUploadProps> = ({
    label,
    description,
    accept,
    multiple = false,
    onUpload
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        startUpload(files);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            startUpload(files);
        }
    };

    const startUpload = (files: File[]) => {
        const newFiles = files.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            progress: 0,
            status: 'uploading' as const
        }));

        setUploadingFiles(prev => multiple ? [...prev, ...newFiles] : newFiles);

        // Simulate upload for each file
        newFiles.forEach(fileObj => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 30;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    setUploadingFiles(prev => 
                        prev.map(f => f.id === fileObj.id ? { ...f, progress: 100, status: 'completed' } : f)
                    );
                    onUpload?.(files);
                } else {
                    setUploadingFiles(prev => 
                        prev.map(f => f.id === fileObj.id ? { ...f, progress } : f)
                    );
                }
            }, 300);
        });
    };

    const removeFile = (id: string) => {
        setUploadingFiles(prev => prev.filter(f => f.id !== id));
    };

    return (
        <div className="flex flex-col gap-2">
            {label && (
                <label className="text-xs font-bold text-[#131518] uppercase tracking-wider">
                    {label}
                </label>
            )}
            
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                    relative group cursor-pointer
                    border-2 border-dashed rounded-2xl p-8
                    flex flex-col items-center justify-center gap-3
                    transition-all duration-300
                    ${isDragging ? 'border-[#4649E5] bg-[#eeeffe]' : 'border-gray-200 bg-gray-50/30 hover:border-[#4649E5] hover:bg-white'}
                `}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept={accept}
                    multiple={multiple}
                    className="hidden"
                />

                <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${isDragging ? 'bg-[#4649E5] text-white scale-110' : 'bg-white text-gray-400 group-hover:text-[#4649E5] group-hover:scale-110 shadow-sm'}
                `}>
                    <Upload size={24} />
                </div>

                <div className="text-center">
                    <p className="text-sm font-bold text-[#131518] m-0">
                        {isDragging ? 'Drop it here!' : 'Click or drag file to upload'}
                    </p>
                    <p className="text-[11px] font-medium text-gray-400 m-0 mt-1">
                        {description || 'PDF, PNG, JPG up to 10MB'}
                    </p>
                </div>
            </div>

            <AnimatePresence>
                {uploadingFiles.length > 0 && (
                    <div className="mt-4 space-y-3">
                        {uploadingFiles.map((file) => (
                            <motion.div
                                key={file.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 shadow-sm"
                            >
                                <div className={`
                                    w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                                    ${file.status === 'completed' ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-[#4649E5]'}
                                `}>
                                    {file.status === 'completed' ? <CheckCircle2 size={20} /> : <File size={20} />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-[13px] font-bold text-[#131518] truncate m-0">
                                            {file.file.name}
                                        </p>
                                        <span className="text-[11px] font-bold text-gray-400">
                                            {Math.round(file.progress)}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div 
                                            className={`h-full ${file.status === 'completed' ? 'bg-green-500' : 'bg-[#4649E5]'}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${file.progress}%` }}
                                        />
                                    </div>
                                </div>

                                <button 
                                    onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
