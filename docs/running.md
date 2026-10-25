# Running CMIL programs

CMIL interprets programs itself: a program never runs as JavaScript, so it can only print, read input, and compute with numbers, texts, booleans, lists and its own functions. The interpreter also limits every program:

| Limit | Value | Error |
|---|---|---|
| Steps in one call of `run()` or `input()` | 1,000,000, or the session's `maxSteps` | `timeout` |
| Length of one text | 1,000,000 characters | `memoryLimit` |
| Length of one list | 1,000,000 items | `memoryLimit` |
| Output of one call of `run()` or `input()` | 10,000,000 characters | `memoryLimit` |
| Nesting of blocks or expressions | 100 levels | `syntaxError` |
| Calls of functions inside each other | 1,000 | `recursionLimit` |

The values are in `src/constants/index.ts`. 1,000,000 steps take about half a second; a session can allow fewer or more:

```js
const session = new Session(sourceCode, 'en', {maxSteps: 100000});
```

A program runs synchronously, so while it runs it holds the thread that called `run()` or `input()`. Run sessions off the main thread, so a long program doesn't block a server or a page, and stop a worker that takes too long by the clock: CMIL counts steps, not time.

## On a server

Run each session in a [worker thread](https://nodejs.org/api/worker_threads.html). `resourceLimits` caps its memory as an extra layer of protection.

`session-worker.mjs`:
```js
import {parentPort, workerData} from 'node:worker_threads';
import {Session} from 'cmil';

const session = new Session(workerData.sourceCode, workerData.language);

const send = step => {
  parentPort.postMessage(step);
  if (step.state === 'end') parentPort.close();
};

parentPort.on('message', input => send(session.input(input)));
send(session.run());
```

The server:
```js
import {Worker} from 'node:worker_threads';
import {messageOf} from 'cmil';

const worker = new Worker(new URL('./session-worker.mjs', import.meta.url), {
  workerData: {sourceCode: 'print("Your name?")\nname = input()\nprint("Hello, " + name)', language: 'en'},
  resourceLimits: {maxOldGenerationSizeMb: 64}
});

//a worker that doesn't answer for 3 seconds is stopped
let timer = setTimeout(() => worker.terminate(), 3000);

worker.on('message', step => {
  clearTimeout(timer);
  step.output.forEach(line => console.log(line));

  if (step.state === 'input') {
    worker.postMessage('Ani');
    timer = setTimeout(() => worker.terminate(), 3000);
  } else if (step.error) {
    console.error(messageOf(step.error, 'en'));
  }
});
```

## In a browser

Bundle cmil with your bundler and run each session in a [Web Worker](https://developer.mozilla.org/docs/Web/API/Web_Workers_API), with the same messages as above. Then a long program doesn't freeze the page. CMIL declares that its modules have no side effects, so a worker that imports only `Session` gets the interpreter without the converters.
