import { useState, useCallback } from 'react';

export interface SelectedFile {
    file: File;
    previewUrl: string;
}

export const useFileSelection = () => {
    const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);

    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件');
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setSelectedFile({ file, previewUrl });
    }, []);

    const clearSelection = useCallback(() => {
        if (selectedFile?.previewUrl) {
            URL.revokeObjectURL(selectedFile.previewUrl);
        }
        setSelectedFile(null);
    }, [selectedFile]);

    return {
        selectedFile,
        handleFileSelect,
        clearSelection
    };
};
