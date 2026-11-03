import { describe, expect, it } from 'vitest';
import { lastValueFrom, of, toArray } from 'rxjs';
import {
  evenSquares,
  firstUser,
  freshTimestamp,
  fromPromiseFactory,
  lookupUser$,
  multiplyBy,
} from '../src/stage2/creation.js';

describe('Stage 2: creation operators and pipe()', () => {
  it('range + filter + map', async () => {
    expect(await lastValueFrom(evenSquares(6).pipe(toArray()))).toEqual([4, 16, 36]);
  });

  it('custom operators compose inside pipe()', async () => {
    const result = await lastValueFrom(of(1, 2, 3).pipe(multiplyBy(2), multiplyBy(5), toArray()));
    expect(result).toEqual([10, 20, 30]);
  });

  it('defer evaluates its factory per subscription', () => {
    let now = 100;
    const ts$ = freshTimestamp(() => now++);
    const seen: number[] = [];
    ts$.subscribe((v) => seen.push(v));
    ts$.subscribe((v) => seen.push(v));
    expect(seen).toEqual([100, 101]);
  });

  it('defer(() => from(promise)) does not start work until subscribe', async () => {
    let calls = 0;
    const user$ = fromPromiseFactory(async () => {
      calls++;
      return 'ok';
    });
    expect(calls).toBe(0);
    expect(await lastValueFrom(user$)).toBe('ok');
    expect(calls).toBe(1);
  });

  it('bindNodeCallback maps the error-first callback to next/error', async () => {
    expect(await firstUser(7)).toBe('user-7');
    await expect(lastValueFrom(lookupUser$(0))).rejects.toThrow('invalid id 0');
  });
});
