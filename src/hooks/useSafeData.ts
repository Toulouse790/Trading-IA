
import { useCallback } from 'react';

interface SafeDataOptions<T> {
  fallback: T;
  validate?: (data: any) => boolean;
}

export function useSafeData<T>() {
  const getSafeData = useCallback(<T>(
    data: any,
    options: SafeDataOptions<T>
  ): T => {
    try {
      // Si les données sont nulles ou undefined
      if (data === null || data === undefined) {
        console.warn('Data is null or undefined, using fallback');
        return options.fallback;
      }

      // Validation personnalisée si fournie
      if (options.validate && !options.validate(data)) {
        console.warn('Data validation failed, using fallback');
        return options.fallback;
      }

      return data as T;
    } catch (error) {
      console.error('Error in getSafeData:', error);
      return options.fallback;
    }
  }, []);

  const getSafeArray = useCallback(<T>(
    data: any,
    fallback: T[] = []
  ): T[] => {
    return getSafeData(data, {
      fallback,
      validate: (data) => Array.isArray(data)
    });
  }, [getSafeData]);

  const getSafeNumber = useCallback((
    data: any,
    fallback: number = 0
  ): number => {
    return getSafeData(data, {
      fallback,
      validate: (data) => typeof data === 'number' && !isNaN(data)
    });
  }, [getSafeData]);

  const getSafeString = useCallback((
    data: any,
    fallback: string = ''
  ): string => {
    return getSafeData(data, {
      fallback,
      validate: (data) => typeof data === 'string'
    });
  }, [getSafeData]);

  return {
    getSafeData,
    getSafeArray,
    getSafeNumber,
    getSafeString
  };
}
