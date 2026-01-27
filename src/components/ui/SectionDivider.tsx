import React from 'react';

interface SectionDividerProps {
    text: string;
    className?: string;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({
    text,
    className = '',
}) => {
    return (
        <div className={`section-divider ${className}`}>
            <span className="section-divider-text">{text}</span>
        </div>
    );
};
