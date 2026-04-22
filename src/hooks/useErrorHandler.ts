import useErrorStore from '@/store/errorStore';

export const useErrorHandler = () => {
  const { setError, clearError } = useErrorStore();

  const handleError = (error: Error) => {
    console.error('Handled error:', error);
    setError(error.toString());
  };

  return { handleError, clearError };
};
