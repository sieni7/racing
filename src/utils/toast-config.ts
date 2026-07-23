import toast from 'react-hot-toast';

export const showSuccess = (message: string) => {
  toast.success(message, {
    icon: '✅',
    style: { borderLeft: '4px solid #22c55e', background: '#f0fdf4' },
  });
};

export const showError = (message: string) => {
  toast.error(message, {
    icon: '❌',
    style: { borderLeft: '4px solid #dc2626', background: '#fef2f2' },
  });
};
