export interface SnackbarOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  timeout?: number;
  actionText?: string;
  onAction?: () => void;
}

interface SnackbarState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  timeout: number;
  actionText?: string;
  onAction?: () => void;
  isVisible: boolean;
}

export const useSnackbarStore = defineStore('snackbar', () => {
  const snackbars = ref<SnackbarState[]>([]);

  const show = (options: SnackbarOptions) => {
    const id = Math.random().toString(36).substr(2, 9);
    const snackbar: SnackbarState = {
      id,
      type: options.type || 'info',
      title: options.title,
      message: options.message,
      timeout: options.timeout || 5000,
      actionText: options.actionText,
      onAction: options.onAction,
      isVisible: true,
    };

    snackbars.value.push(snackbar);

    // Auto-remove after timeout
    if (snackbar.timeout > 0) {
      setTimeout(() => {
        remove(id);
      }, snackbar.timeout);
    }

    return id;
  };

  const remove = (id: string) => {
    const index = snackbars.value.findIndex(s => s.id === id);
    if (index > -1) {
      snackbars.value.splice(index, 1);
    }
  };

  const clear = () => {
    snackbars.value = [];
  };

  // Convenience methods
  const success = (title: string, message?: string, options?: Partial<SnackbarOptions>) => {
    return show({
      type: 'success',
      title,
      message,
      ...options,
    });
  };

  const error = (title: string, message?: string, options?: Partial<SnackbarOptions>) => {
    return show({
      type: 'error',
      title,
      message,
      ...options,
    });
  };

  const warning = (title: string, message?: string, options?: Partial<SnackbarOptions>) => {
    return show({
      type: 'warning',
      title,
      message,
      ...options,
    });
  };

  const info = (title: string, message?: string, options?: Partial<SnackbarOptions>) => {
    return show({
      type: 'info',
      title,
      message,
      ...options,
    });
  };

  return {
    snackbars: readonly(snackbars),
    show,
    remove,
    clear,
    success,
    error,
    warning,
    info,
  };
});