export type Semaphore = ReturnType<typeof createSemaphore>;

export const createSemaphore = (maxPermits: number) => {
  let permitsIssued = 0;

  const queue: Array<() => void> = [];

  const run = async <T>(fn: () => T) => {
    if (permitsIssued === maxPermits) {
      await waitForTurn();
      // Permit was transferred to us by the releasing task,
      // so we must NOT increment here.
    } else {
      permitsIssued++;
    }

    try {
      const result = fn();

      if (isPromise<T>(result)) {
        return await result;
      }

      return result;
    } finally {
      const nextResolver = queue.shift();

      if (nextResolver) {
        // "Transfer" permit to the next waiter without releasing it,
        // so a synchronous newcomer can't slip into the freed slot.
        nextResolver();
      } else {
        permitsIssued--;
      }
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
