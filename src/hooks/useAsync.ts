/**
 * One async read, with the three states every screen has to draw.
 *
 * `loading` starts true so a section can reserve its space rather than flash empty; a reload keeps
 * the previous data visible while it refreshes; and an abort on unmount or on a dependency change
 * means a slow response can never overwrite a newer one.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../lib/api/client';

export type AsyncState<T> = {
  data: T | undefined;
  loading: boolean;
  /** `error.unreachable` separates "the store is down" from "this request was refused". */
  error: ApiError | undefined;
  reload: () => void;
};

type State<T> = { data?: T; loading: boolean; error?: ApiError };

export const useAsync = <T>(
  loader: (signal: AbortSignal) => Promise<T>,
  deps: unknown[] = [],
): AsyncState<T> => {
  const [state, setState] = useState<State<T>>({ loading: true });
  const [attempt, setAttempt] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setState((previous) => ({ data: previous.data, loading: true }));

    loaderRef
      .current(controller.signal)
      .then((data) => {
        if (active) setState({ data, loading: false });
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setState({
          loading: false,
          error:
            error instanceof ApiError
              ? error
              : new ApiError('خطای غیرمنتظره در ارتباط با فروشگاه.', 0),
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
    // `deps` belong to the caller; `attempt` is what `reload()` bumps.
  }, [...deps, attempt]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);

  return { data: state.data, loading: state.loading, error: state.error, reload };
};
