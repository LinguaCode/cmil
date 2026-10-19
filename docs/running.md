# Running CMIL programs

CMIL interprets programs itself: a program never runs as JavaScript, so it can only print, read input and compute with numbers, texts and booleans. The interpreter also limits every program:

| Limit | Value | Error |
|---|---|---|
| Time between two inputs | 666 ms | `timeout` |
| Steps between two inputs | 100,000 | `timeout` |
| Length of one text | 1,000,000 characters | `memoryLimit` |
| Output waiting to be sent | 10,000,000 characters | `memoryLimit` |
| Nesting of blocks or expressions | 100 levels | `syntaxError` |

The values are in `src/constants/index.js`.

A program runs synchronously, so for up to 666 ms it holds the thread that called `execute()` or `inputEmitter`. Run sessions off the main thread, so a long program doesn't block a server or a page.

## On a server

Run each session in a [worker thread](https://nodejs.org/api/worker_threads.html). `resourceLimits` caps its memory as an extra layer of protection.

`session-worker.js`:
```js
const {parentPort, workerData} = require('node:worker_threads');
const CodeSubmit = require('cmil');

const codeSubmit = new CodeSubmit(workerData.sourceCode, workerData.language);
parentPort.on('message', input => codeSubmit.inputEmitter(input));

codeSubmit
  .onOutput(text => parentPort.postMessage({type: 'output', text}))
  .onInputRequest(() => parentPort.postMessage({type: 'input'}))
  .onSessionEnd(result => {
    parentPort.postMessage({type: 'end', result});
    parentPort.close();
  })
  .execute();
```

The server:
```js
const {Worker} = require('node:worker_threads');

const worker = new Worker('./session-worker.js', {
  workerData: {sourceCode: 'input name\noutput "Hello, " + name', language: 'en'},
  resourceLimits: {maxOldGenerationSizeMb: 64}
});

worker.on('message', message => {
  if (message.type === 'output') console.log(message.text);
  if (message.type === 'input') worker.postMessage('Ani');
  if (message.type === 'end') console.log(message.result);
});
```

## In a browser

Bundle cmil with your bundler and run each session in a [Web Worker](https://developer.mozilla.org/docs/Web/API/Web_Workers_API), with the same messages as above. Then a long program doesn't freeze the page.
