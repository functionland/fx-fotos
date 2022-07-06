import { useEffect, useRef, useState } from 'react';

export interface IUseFetchProps<TData, TParams> {
  initialLoading?: boolean;
  initialError?: Error;
  initialData?: TData | null;
  apiMethod: (params: TParams | null) => Promise<TData | null>;
  params?: TParams | null;
  mungResponse?: (data: Awaited<TData>) => undefined | null;
}

export const useFetch = <TData, TParams>({
  initialLoading = true,
  initialError = null,
  initialData = null,
  apiMethod,
  params: initialParams = null,
  mungResponse = null,
}: IUseFetchProps<TData, TParams>) => {
  const [loading, setLoading] = useState<boolean>(initialLoading);
  const [error, setError] = useState<Error>(initialError);
  const [data, setData] = useState<TData | null>(initialData);
  const params = useRef(initialParams);

  const fetch = async () => {
    try {
      const response = await apiMethod(params.current);

      setError(null);
      if (mungResponse) {
        setData(mungResponse(response));
      } else {
        setData(response);
      }
    } catch (err) {
      setError(err);
      setData(null);
    }
  };

  const fetchWithLoading = async (): Promise<void> => {
    setLoading(true);
    await fetch();
    setLoading(false);
  };

  const refetch = async ({
    params: nextParams,
    withLoading = true,
  }: {
    params?: TParams;
    withLoading?: boolean;
  } = {}): Promise<void> => {
    if (nextParams) {
      params.current = nextParams;
    }

    if (withLoading) {
      await fetchWithLoading();
    } else {
      await fetch();
    }
  };

  useEffect(() => {
    if (initialLoading) fetchWithLoading();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { loading, error, data, refetch };
};
