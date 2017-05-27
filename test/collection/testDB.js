module.exports = [{
  group: 'restrictions',
  sources: [{
    title: 'hack attempt',
    code: 'եթե 4 > 2\n    ելք «4 > 2»\nայլապես եթե 4 > 6\n    ելք «4 > 6»\nայլապես\n    ելք «4 == 4»',
    output: '4 > 2'
  }]
}];
