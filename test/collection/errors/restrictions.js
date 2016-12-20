module.exports = [{
  group: 'restrictions',
  sources: [{
    title: 'hack attempt',
    code: 'eval("console.log("hello world");")',
    errorId: 'hackAttempt',
    errorParam: {
      ip: '127.0.0.1'
    }
  }]
}];