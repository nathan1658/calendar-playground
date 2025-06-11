import type { ToastProps } from '~/components/ToastNotification.vue';

interface Toast extends ToastProps {
  id: string;
}

export const useToast = () => {
  const toasts = ref<Toast[]>([]);

  const showToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
    };
    
    toasts.value.push(newToast);
    
    // Auto-remove after timeout
    if (toast.timeout !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.timeout || 5000);
    }
    
    return id;
  };

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  const clearAllToasts = () => {
    toasts.value = [];
  };

  // Convenience methods
  const success = (title: string, message?: string, options?: Partial<ToastProps>) => {
    return showToast({
      type: 'success',
      title,
      message,
      ...options,
    });
  };

  const error = (title: string, message?: string, options?: Partial<ToastProps>) => {
    return showToast({
      type: 'error',
      title,
      message,
      ...options,
    });
  };

  const warning = (title: string, message?: string, options?: Partial<ToastProps>) => {
    return showToast({
      type: 'warning',
      title,
      message,
      ...options,
    });
  };

  const info = (title: string, message?: string, options?: Partial<ToastProps>) => {
    return showToast({
      type: 'info',
      title,
      message,
      ...options,
    });
  };

  return {
    toasts: readonly(toasts),
    showToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
  };
};