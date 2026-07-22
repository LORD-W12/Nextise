import React from 'react';

interface LoaderProps {
    fullScreen?: boolean;
    message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ fullScreen = false, message = 'Loading...' }) => {
    const content = (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            {message && <p className="text-gray-500 font-medium animate-pulse">{message}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                {content}
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center p-8">
            {content}
        </div>
    );
};
