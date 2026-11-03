import {
  Observable,
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  of,
  switchMap,
} from 'rxjs';

export interface TypeaheadOptions {
  debounceMs?: number;
  minLength?: number;
}

export type SearchResult = { query: string; items: string[]; error?: string };

/**
 * Turns a stream of raw keystrokes into a stream of search results.
 *
 * debounceTime waits for the user to pause, map/filter normalise the query,
 * distinctUntilChanged drops repeats, and switchMap cancels the request for a
 * query that is no longer current. catchError sits inside switchMap so one
 * failed request does not kill the whole search box.
 */
export function typeahead(
  input$: Observable<string>,
  search: (query: string) => Observable<string[]>,
  { debounceMs = 300, minLength = 2 }: TypeaheadOptions = {},
): Observable<SearchResult> {
  return input$.pipe(
    debounceTime(debounceMs),
    map((raw) => raw.trim().toLowerCase()),
    filter((query) => query.length >= minLength),
    distinctUntilChanged(),
    switchMap((query) =>
      search(query).pipe(
        map((items): SearchResult => ({ query, items })),
        catchError((err: unknown) =>
          of<SearchResult>({ query, items: [], error: err instanceof Error ? err.message : String(err) }),
        ),
      ),
    ),
  );
}
