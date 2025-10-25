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
