module.exports = [{
  group: 'restrictions',
  sources: [{
    title: 'hack attempt',
    code: 'եթե 4 > 2\n    տպել(«4 > 2»)\nայլապես եթե 4 > 6\n    տպել(«4 > 6»)\nայլապես\n    տպել(«4 == 4»)',
    output: '4 > 2'
  }]
}];
