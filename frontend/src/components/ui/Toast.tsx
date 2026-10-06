import React from 'react';
import { toast, Toaster as SonnerToaster } from 'sonner';

export const Toaster = () => {
  return (
    <SonnerToaster
      theme="dark"
      toastOptions={{
        className: 'bg-[#1E293B] border border-white/[0.12] text-[#E2E8F0]',
        style: {
          background: '#1E293B',
          border: '1px solid rgba(148,163,184,0.12)',
          color: '#E2E8F0'
        }
      }}
    />
  );
};

export const showToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
  switch (type) {
    case 'success':
      toast.success(message, {
        style: { borderLeft: '4px solid #34D399' }
      });
      break;
    case 'error':
      toast.error(message, {
        style: { borderLeft: '4px solid #F87171' }
      });
      break;
    case 'warning':
      toast.warning(message, {
        style: { borderLeft: '4px solid #FBBF24' }
      });
      break;
    case 'info':
      toast.info(message, {
        style: { borderLeft: '4px solid #60A5FA' }
      });
      break;
  }
};
