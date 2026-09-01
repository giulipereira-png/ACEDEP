import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'emblem';
}

export const Logo: React.FC<LogoProps> = ({ className = 'h-10', variant = 'full' }) => {
  return (
    <div className="flex items-center gap-2">
      {/* Exibe a sua imagem oficial IMG_3289.png que está na pasta public */}
      <img 
        src="/IMG_3289.png" 
        alt="ACEDEP - Associação Cultural Especial Paradesportiva Paulista" 
        className={`${className} object-contain`}
      />
    </div>
  );
};
