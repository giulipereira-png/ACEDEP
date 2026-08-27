import React, { useEffect } from 'react';

export const AdminPage: React.FC = () => {
  useEffect(() => {
    window.location.href = '/';
  }, []);

  return (
    <div className="min-h-screen bg-[#060e1c] flex items-center justify-center text-white text-sm">
      Carregando painel...
    </div>
  );
};