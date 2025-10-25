# Easy Semaphore

Simple and practical semaphore implementation that works both on the browser and the server.

A [**semaphore**](<https://en.wikipedia.org/wiki/Semaphore_(programming)>) is a pattern for **limiting the amount of concurrent tasks** that will be run at once.

Basic usage:

```ts
const concurrencyLimit = 5;
const semaphore = createSemaphore(concurrencyLimit);

const result = await semaphore.run(() => asyncTask());

// `semaphore.run` automatically waits for a permit to
// be available before starting the task, then it
// acquires a permit at the start of the task
// and releases it when the task finishes.
// It also returns whatever `() => asyncTask()` does
// and propagates exceptions.
```

Semaphores are useful whenever you need to limit concurrent accesss to a given resource, like accessing this resource is computationally expensive and you want to avoid overloading the systems that grant access to it.

Example:

```ts
// Let's say we want to fetch all the posts of a given user
// but the API only offers us paginated responses, so
// we'll have to make several requests but we also
// don't want to either overload the API or get rate limited

// List of all the pages we need to fetch
const pageList = Array.from({ length: lastPage }).map((_, index) => index + 1);

// We'll fetch at most 10 pages at a time
const semaphore = createSemaphore(10);

const responses = await Promise.all(
  pageList.map((pageNumber) =>
    semaphore.run(() => fetchPosts(user, pageNumber)),
  ),
);
```

Alternatively, we can use the `wrap` method, that decorates our task:

```ts
const pageList = Array.from({ length: lastPage }).map((_, index) => index + 1);

const semaphore = createSemaphore(10);

const limitedFetchPosts = semaphore.wrap(fetchPosts);

const responses = await Promise.all(
  pageList.map((pageNumber) => limitedFetchPosts(user, pageNumber)),
);
```

It can also be used as a [**mutex**](https://en.wikipedia.org/wiki/Mutual_exclusion), simply by setting the concurrency limit to 1:

```ts
const semaphore = createSemaphore(1);

// Only a single task will run at a time
semaphore.run(() => task1());
semaphore.run(() => task2());
```

## API

### `createSemaphore: (permits: number) => Semaphore`

Creates a semaphore with a given number of `permits`, which determines how many concurrent tasks will be run at a given time.

Keep in mind that each semaphore instance is **independent**, so a task that is run "within" a semaphore, is isolated and won't count towards the concurrency limit of **another** semaphore instance.

### `semaphore.run: <T>(task: () => T) => Promise<T>`

Runs a given task within a semaphore instance.

### `semaphore.wrap: <Input, Output>(fn: (...args: Input) => Output) => (...args: Input) => Promise<Output>`

Creates a decorated version of a given function that will be run within the context of a given semaphore instance.
