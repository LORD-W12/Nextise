import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyle = 'inline-flex justify-center items-center font-medium rounded-lg shadow-sm focus:outline-none transition-all duration-200';

    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 border border-transparent',
        secondary: 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300',
        danger: 'bg-red-600 text-white hover:bg-red-700 border border-transparent',
        success: 'bg-green-600 text-white hover:bg-green-700 border border-transparent',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    const finalStyle = `${baseStyle} ${variants[variant]} ${sizes[size]} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`;

    return (
        <button className={finalStyle} disabled={disabled || isLoading} {...props}>
            {isLoading && (
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                </svg>
            )}
            {children}
        </button>
    );
};
