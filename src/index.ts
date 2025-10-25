export const createSemaphore = (maxPermits: number) => {
  let permitsIssued = 0;

  const queue: Array<() => void> = [];

  const run = async <T>(fn: () => T) => {
    if (permitsIssued === maxPermits) {
      await waitForTurn();
    }

    permitsIssued++;

    try {
      const result = fn();

      if (isPromise<T>(result)) {
        return await result;
      }

      return result;
    } finally {
      permitsIssued--;

      callNextInTurn();
    }
  };

  const wrap =
    <Input extends Array<any>, Output>(fn: (...args: Input) => Output) =>
    (...args: Input) =>
      run(() => fn(...args));

  const waitForTurn = () => {
    return new Promise<void>((resolve) => {
      queue.push(resolve);
    });
  };

  const callNextInTurn = () => {
    const nextResolver = queue.shift();

    nextResolver?.();
  };

  return {
    run,
    wrap,
  };
};

const isPromise = <T>(object: unknown): object is Promise<T> =>
  typeof object === "object" &&
  object !== null &&
  "then" in object &&
  typeof object.then === "function";
