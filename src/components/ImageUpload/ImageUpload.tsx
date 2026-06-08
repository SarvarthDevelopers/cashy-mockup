import React, { useState, useRef } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageUploadProps {
    label?: string;
    onUpload?: (images: string[]) => void;
    maxImages?: number;
    disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    label,
    onUpload,
    maxImages = 5,
    disabled = false
}) => {
    const [images, setImages] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        if (e.target.files) {
            const files = Array.from(e.target.files);
            uploadImages(files);
        }
    };

    const uploadImages = (files: File[]) => {
        if (disabled) return;
        setIsUploading(true);
        
        // Simulate upload and conversion to data URL
        const promises = files.slice(0, maxImages - images.length).map(file => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setTimeout(() => resolve(reader.result as string), 1000);
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(promises).then(newImages => {
            const updatedImages = [...images, ...newImages];
            setImages(updatedImages);
            setIsUploading(false);
            onUpload?.(updatedImages);
        });
    };

    const removeImage = (index: number) => {
        if (disabled) return;
        const updatedImages = images.filter((_, i) => i !== index);
        setImages(updatedImages);
        onUpload?.(updatedImages);
    };

    return (
        <div className="flex flex-col gap-2">
            {label && (
                <label className="text-xs font-bold text-[#131518] uppercase tracking-wider">
                    {label}
                </label>
            )}

            <div className="flex flex-wrap gap-4">
                <AnimatePresence>
                    {images.map((img, index) => (
                        <motion.div
                             key={index}
                             initial={{ opacity: 0, scale: 0.8 }}
                             animate={{ opacity: 1, scale: 1 }}
                             exit={{ opacity: 0, scale: 0.8 }}
                             className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-100 shadow-sm group"
                        >
                            <img src={img} alt="Uploaded" className="w-full h-full object-cover" />
                            {!disabled && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => removeImage(index)}
                                        className="p-1.5 bg-white rounded-full text-red-500 hover:scale-110 transition-transform"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {images.length < maxImages && (
                    <button
                        onClick={() => !disabled && fileInputRef.current?.click()}
                        disabled={isUploading || disabled}
                        className={`
                            w-24 h-24 rounded-xl border-2 border-dashed
                            flex flex-col items-center justify-center gap-1
                            transition-all duration-300
                            ${disabled ? 'bg-gray-100/50 border-gray-200 cursor-not-allowed opacity-60' : 
                              isUploading ? 'bg-gray-50 border-gray-100 cursor-not-allowed' : 
                              'bg-gray-50/30 border-gray-200 hover:border-[#4649E5] hover:bg-white hover:shadow-md'}
                        `}
                    >
                        {isUploading ? (
                            <Loader2 size={20} className="text-[#4649E5] animate-spin" />
                        ) : (
                            <>
                                <Camera size={20} className="text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Add Photo</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                multiple
                disabled={disabled}
                className="hidden"
            />
        </div>
    );
};
