import { it, expect } from "vitest";
import { createSemaphore } from "./index.js";

it("Usage with single permit (mutex)", async () => {
  const semaphore = createSemaphore(1);

  const taskManager = createTaskManager();

  const taskA = taskManager.createTask("A");
  const taskB = taskManager.createTask("B");
  const taskC = taskManager.createTask("C");

  const promiseA = semaphore.run(taskA);
  const promiseB = semaphore.run(taskB);
  const promiseC = semaphore.run(taskC);

  expect(taskManager.getTaskStatus("A")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("B")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("C")).toBe("UNSTARTED");

  await taskManager.fulfillTask("A");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("C")).toBe("UNSTARTED");

  await taskManager.fulfillTask("B");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("RUNNING");

  await taskManager.fulfillTask("C");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("FULFILLED");

  await Promise.all([promiseA, promiseB, promiseC]);
});

it("Usage with multiple permits", async () => {
  const semaphore = createSemaphore(3);

  const taskManager = createTaskManager();

  const taskA = taskManager.createTask("A");
  const taskB = taskManager.createTask("B");
  const taskC = taskManager.createTask("C");
  const taskD = taskManager.createTask("D");
  const taskE = taskManager.createTask("E");
  const taskF = taskManager.createTask("F");
  const taskG = taskManager.createTask("G");

  const promiseA = semaphore.run(taskA);
  const promiseB = semaphore.run(taskB);
  const promiseC = semaphore.run(taskC);
  const promiseD = semaphore.run(taskD);
  const promiseE = semaphore.run(taskE);
  const promiseF = semaphore.run(taskF);
  const promiseG = semaphore.run(taskG);

  expect(taskManager.getTaskStatus("A")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("B")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("C")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("D")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("E")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("F")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("G")).toBe("UNSTARTED");

  await taskManager.fulfillTask("B");

  expect(taskManager.getTaskStatus("A")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("D")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("E")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("F")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("G")).toBe("UNSTARTED");

  await taskManager.fulfillTask("C");

  expect(taskManager.getTaskStatus("A")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("D")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("E")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("F")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("G")).toBe("UNSTARTED");

  await taskManager.fulfillTask("A");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("D")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("E")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("F")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("G")).toBe("UNSTARTED");

  await taskManager.fulfillTask("F");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("D")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("E")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("F")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("G")).toBe("RUNNING");

  await taskManager.fulfillTask("G");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("D")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("E")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("F")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("G")).toBe("FULFILLED");

  await taskManager.fulfillTask("E");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("D")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("E")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("F")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("G")).toBe("FULFILLED");

  await taskManager.fulfillTask("D");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("D")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("E")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("F")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("G")).toBe("FULFILLED");

  await Promise.all([
    promiseA,
    promiseB,
    promiseC,
    promiseD,
    promiseE,
    promiseF,
    promiseG,
  ]);
});

it("Works when some tasks errors out", async () => {
  const semaphore = createSemaphore(3);

  const taskManager = createTaskManager();

  const taskA = taskManager.createTask("A");
  const taskB = taskManager.createTask("B");
  const taskC = taskManager.createTask("C");
  const taskD = taskManager.createTask("D");
  const taskE = taskManager.createTask("E");
  const taskF = taskManager.createTask("F");
  const taskG = taskManager.createTask("G");

  const promiseA = semaphore.run(taskA).catch(() => {
    // Ignore
  });
  const promiseB = semaphore.run(taskB).catch(() => {
    // Ignore
  });
  const promiseC = semaphore.run(taskC).catch(() => {
    // Ignore
  });
  const promiseD = semaphore.run(taskD).catch(() => {
    // Ignore
  });
  const promiseE = semaphore.run(taskE).catch(() => {
    // Ignore
  });
  const promiseF = semaphore.run(taskF).catch(() => {
    // Ignore
  });
  const promiseG = semaphore.run(taskG).catch(() => {
    // Ignore
  });

  expect(taskManager.getTaskStatus("A")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("B")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("C")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("D")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("E")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("F")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("G")).toBe("UNSTARTED");

  await taskManager.fulfillTask("B");

  expect(taskManager.getTaskStatus("A")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("D")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("E")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("F")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("G")).toBe("UNSTARTED");

  await taskManager.rejectTask("C");

  expect(taskManager.getTaskStatus("A")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("D")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("E")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("F")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("G")).toBe("UNSTARTED");

  await taskManager.fulfillTask("A");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("D")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("E")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("F")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("G")).toBe("UNSTARTED");

  await taskManager.rejectTask("F");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("D")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("E")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("F")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("G")).toBe("RUNNING");

  await taskManager.fulfillTask("G");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("D")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("E")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("F")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("G")).toBe("FULFILLED");

  await taskManager.fulfillTask("E");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("D")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("E")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("F")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("G")).toBe("FULFILLED");

  await taskManager.rejectTask("D");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("D")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("E")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("F")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("G")).toBe("FULFILLED");

  await Promise.all([
    promiseA,
    promiseB,
    promiseC,
    promiseD,
    promiseE,
    promiseF,
    promiseG,
  ]);
});

it("Works for synchronous tasks", async () => {
  const semaphore = createSemaphore(3);

  // Due to the tasks syncrhonous nature,
  // they will run only one at a time anyways

  const taskStore = new Map<string, string>();

  const createTaskThatWillFulfill = (id: string) => {
    taskStore.set(id, "UNSTARTED");

    const task = () => {
      taskStore.set(id, "FULFILLED");
    };

    return task;
  };

  const createTaskThatWillReject = (id: string) => {
    taskStore.set(id, "UNSTARTED");

    const task = () => {
      taskStore.set(id, "REJECTED");

      throw new Error("Error");
    };

    return task;
  };

  const taskA = createTaskThatWillFulfill("A");
  const taskB = createTaskThatWillFulfill("B");
  const taskC = createTaskThatWillReject("C");
  const taskD = createTaskThatWillFulfill("D");
  const taskE = createTaskThatWillFulfill("E");
  const taskF = createTaskThatWillReject("F");
  const taskG = createTaskThatWillReject("G");

  semaphore.run(taskA).catch(() => {
    // No Op
  });
  semaphore.run(taskB).catch(() => {
    // No Op
  });
  semaphore.run(taskC).catch(() => {
    // No Op
  });
  semaphore.run(taskD).catch(() => {
    // No Op
  });
  semaphore.run(taskE).catch(() => {
    // No Op
  });
  semaphore.run(taskF).catch(() => {
    // No Op
  });
  semaphore.run(taskG).catch(() => {
    // No Op
  });

  expect(taskStore.get("A")!).toBe("FULFILLED");
  expect(taskStore.get("B")!).toBe("FULFILLED");
  expect(taskStore.get("C")!).toBe("REJECTED");
  expect(taskStore.get("D")!).toBe("FULFILLED");
  expect(taskStore.get("E")!).toBe("FULFILLED");
  expect(taskStore.get("F")!).toBe("REJECTED");
  expect(taskStore.get("G")!).toBe("REJECTED");
});

it("Works when adding new tasks halfway through", async () => {
  const semaphore = createSemaphore(3);

  const taskManager = createTaskManager();

  const taskA = taskManager.createTask("A");
  const taskB = taskManager.createTask("B");
  const taskC = taskManager.createTask("C");
  const taskD = taskManager.createTask("D");
  const taskE = taskManager.createTask("E");
  const taskF = taskManager.createTask("F");
  const taskG = taskManager.createTask("G");

  const promiseA = semaphore.run(taskA).catch(() => {
    // No Op
  });
  const promiseB = semaphore.run(taskB).catch(() => {
    // No Op
  });
  const promiseC = semaphore.run(taskC).catch(() => {
    // No Op
  });
  const promiseD = semaphore.run(taskD).catch(() => {
    // No Op
  });

  expect(taskManager.getTaskStatus("A")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("B")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("C")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("D")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("E")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("F")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("G")).toBe("UNSTARTED");

  await taskManager.fulfillTask("A");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("C")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("D")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("E")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("F")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("G")).toBe("UNSTARTED");

  await taskManager.fulfillTask("B");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("D")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("E")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("F")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("G")).toBe("UNSTARTED");

  await taskManager.rejectTask("C");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("D")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("E")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("F")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("G")).toBe("UNSTARTED");

  await taskManager.rejectTask("D");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("D")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("E")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("F")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("G")).toBe("UNSTARTED");

  const promiseE = semaphore.run(taskE).catch(() => {
    // No Op
  });

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("D")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("E")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("F")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("G")).toBe("UNSTARTED");

  const promiseF = semaphore.run(taskF).catch(() => {
    // No op
  });

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("D")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("E")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("F")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("G")).toBe("UNSTARTED");

  await taskManager.fulfillTask("E");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("D")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("E")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("F")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("G")).toBe("UNSTARTED");

  const promiseG = semaphore.run(taskG).catch(() => {
    // No Op
  });

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("D")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("E")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("F")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("G")).toBe("RUNNING");

  await taskManager.fulfillTask("F");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("D")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("E")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("F")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("G")).toBe("RUNNING");

  await taskManager.fulfillTask("G");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("D")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("E")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("F")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("G")).toBe("FULFILLED");

  await Promise.all([
    promiseA,
    promiseB,
    promiseC,
    promiseD,
    promiseE,
    promiseF,
    promiseG,
  ]);
});

it("`wrap` works", async () => {
  const semaphore = createSemaphore(3);

  const taskManager = createTaskManager();

  const taskA = taskManager.createTask("A");
  const taskB = taskManager.createTask("B");
  const taskC = taskManager.createTask("C");
  const taskD = taskManager.createTask("D");
  const taskE = taskManager.createTask("E");
  const taskF = taskManager.createTask("F");
  const taskG = taskManager.createTask("G");

  const wrappedA = semaphore.wrap(taskA);
  const wrappedB = semaphore.wrap(taskB);
  const wrappedC = semaphore.wrap(taskC);
  const wrappedD = semaphore.wrap(taskD);
  const wrappedE = semaphore.wrap(taskE);
  const wrappedF = semaphore.wrap(taskF);
  const wrappedG = semaphore.wrap(taskG);

  const promiseA = wrappedA().catch(() => {
    // No Op
  });
  const promiseB = wrappedB().catch(() => {
    // No Op
  });
  const promiseC = wrappedC().catch(() => {
    // No Op
  });
  const promiseD = wrappedD().catch(() => {
    // No Op
  });

  expect(taskManager.getTaskStatus("A")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("B")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("C")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("D")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("E")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("F")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("G")).toBe("UNSTARTED");

  await taskManager.fulfillTask("A");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("C")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("D")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("E")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("F")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("G")).toBe("UNSTARTED");

  await taskManager.fulfillTask("B");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("D")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("E")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("F")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("G")).toBe("UNSTARTED");

  await taskManager.rejectTask("C");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("D")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("E")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("F")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("G")).toBe("UNSTARTED");

  await taskManager.rejectTask("D");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("D")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("E")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("F")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("G")).toBe("UNSTARTED");

  const promiseE = wrappedE().catch(() => {
    // No Op
  });

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("D")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("E")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("F")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("G")).toBe("UNSTARTED");

  const promiseF = wrappedF().catch(() => {
    // No op
  });

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("D")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("E")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("F")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("G")).toBe("UNSTARTED");

  await taskManager.fulfillTask("E");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("D")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("E")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("F")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("G")).toBe("UNSTARTED");

  const promiseG = wrappedG().catch(() => {
    // No Op
  });

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("D")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("E")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("F")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("G")).toBe("RUNNING");

  await taskManager.fulfillTask("F");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("D")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("E")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("F")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("G")).toBe("RUNNING");

  await taskManager.fulfillTask("G");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("D")).toBe("REJECTED");
  expect(taskManager.getTaskStatus("E")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("F")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("G")).toBe("FULFILLED");

  await Promise.all([
    promiseA,
    promiseB,
    promiseC,
    promiseD,
    promiseE,
    promiseF,
    promiseG,
  ]);
});

it("Doesn't let a new caller bypass a queued waiter when a permit is released", async () => {
  const semaphore = createSemaphore(2);

  const taskManager = createTaskManager();

  const taskA = taskManager.createTask("A");
  const taskB = taskManager.createTask("B");
  const taskC = taskManager.createTask("C");
  const taskD = taskManager.createTask("D");

  const promiseA = taskA();

  // Here's the race condition where
  // the new task D runs right after
  // promise A resolves, but before other enqueued stuff
  semaphore.run(() => promiseA);
  promiseA.then(() => semaphore.run(taskD));

  semaphore.run(taskB);
  semaphore.run(taskC);

  expect(taskManager.getTaskStatus("A")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("B")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("C")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("D")).toBe("UNSTARTED");

  const fulfillAPromise = taskManager.fulfillTask("A");
  await promiseA;

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("C")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("D")).toBe("UNSTARTED");

  await fulfillAPromise;

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("C")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("D")).toBe("UNSTARTED");

  await taskManager.fulfillTask("C");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("C")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("D")).toBe("RUNNING");

  await taskManager.fulfillTask("D");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("C")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("D")).toBe("FULFILLED");

  await taskManager.fulfillTask("B");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("D")).toBe("FULFILLED");
});

it("Doesn't leak permits across queued task hand-offs", async () => {
  const semaphore = createSemaphore(2);

  const taskManager = createTaskManager();

  const taskA = taskManager.createTask("A");
  const taskB = taskManager.createTask("B");
  const taskC = taskManager.createTask("C");
  const taskD = taskManager.createTask("D");
  const taskE = taskManager.createTask("E");

  const promiseA = semaphore.run(taskA);
  const promiseB = semaphore.run(taskB);
  const promiseC = semaphore.run(taskC);
  const promiseD = semaphore.run(taskD);

  expect(taskManager.getTaskStatus("A")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("B")).toBe("RUNNING");
  expect(taskManager.getTaskStatus("C")).toBe("UNSTARTED");
  expect(taskManager.getTaskStatus("D")).toBe("UNSTARTED");

  // Drain all four tasks. C and D enter the running set via the
  // queued hand-off path (the one where the released permit is
  // "transferred" to the next waiter rather than freed and reacquired).
  await taskManager.fulfillTask("A");
  await taskManager.fulfillTask("B");
  await taskManager.fulfillTask("C");
  await taskManager.fulfillTask("D");

  expect(taskManager.getTaskStatus("A")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("B")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("C")).toBe("FULFILLED");
  expect(taskManager.getTaskStatus("D")).toBe("FULFILLED");

  // Nothing is in flight, so a fresh task must be able to start
  // immediately. If the hand-off path leaks permits, the internal
  // counter is still pinned at maxPermits and E will deadlock here.
  const promiseE = semaphore.run(taskE);

  await new Promise((resolve) => setTimeout(resolve, 0));

  expect(taskManager.getTaskStatus("E")).toBe("RUNNING");

  await taskManager.fulfillTask("E");

  await Promise.all([promiseA, promiseB, promiseC, promiseD, promiseE]);
});

it("Resolves with the value returned by the task", async () => {
  const semaphore = createSemaphore(2);

  const syncResult = await semaphore.run(() => 42);
  expect(syncResult).toBe(42);

  const asyncResult = await semaphore.run(async () => "hello");
  expect(asyncResult).toBe("hello");
});

it("Propagates errors thrown by the task", async () => {
  const semaphore = createSemaphore(2);

  await expect(
    semaphore.run(() => {
      throw new Error("boom");
    }),
  ).rejects.toThrow("boom");

  await expect(
    semaphore.run(async () => {
      throw new Error("boom async");
    }),
  ).rejects.toThrow("boom async");
});

type TaskRecord = {
  id: string;
  status: "UNSTARTED" | "RUNNING" | "REJECTED" | "FULFILLED";
  resolver: () => void;
  rejecter: (error: Error) => void;
};

const createTaskManager = () => {
  const taskStore = new Map<TaskRecord["id"], TaskRecord>();

  const createTask = (id: string) => {
    const { promise, reject, resolve } = Promise.withResolvers<void>();

    const task = () => {
      taskStore.get(id)!.status = "RUNNING";

      return promise;
    };

    taskStore.set(id, {
      id,
      status: "UNSTARTED",
      resolver: resolve,
      rejecter: reject,
    });

    return task;
  };

  const fulfillTask = async (id: string) => {
    const record = taskStore.get(id);

    if (!record) {
      throw new Error(`No task with id ${id}!`);
    }

    if (record.status !== "RUNNING") {
      throw new Error(
        `Can only fulfill tasks that are RUNNING, but this one is ${record.status}!`,
      );
    }

    record.status = "FULFILLED";
    record.resolver();

    await waitForMicrotasks();
  };

  const rejectTask = async (id: string) => {
    const record = taskStore.get(id);

    if (!record) {
      throw new Error(`No task with id ${id}!`);
    }

    if (record.status !== "RUNNING") {
      throw new Error(
        `Can only reject tasks that are RUNNING, but this one is ${record.status}!`,
      );
    }

    record.status = "REJECTED";
    record.rejecter(new Error("Error!"));

    await waitForMicrotasks();
  };

  const getTaskStatus = (id: string) => {
    const record = taskStore.get(id);

    if (!record) {
      throw new Error(`No task with id ${id}!`);
    }

    return record.status;
  };

  const waitForMicrotasks = () =>
    new Promise((resolve) => setTimeout(resolve, 0));

  return {
    createTask,
    rejectTask,
    fulfillTask,
    getTaskStatus,
  };
};
