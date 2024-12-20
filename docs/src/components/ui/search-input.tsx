import React from 'react';
import {Search} from 'lucide-react';

type SearchInputProps = React.InputHTMLAttributes<HTMLInputElement>

export function SearchInput({className = '', ...props}: SearchInputProps) {
    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5"/>
            <input
                type="text"
                className={`pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${className}`}
                {...props}
            />
        </div>
    );
}