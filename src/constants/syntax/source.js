module.exports = [{
  command: '^([\\d\\D]*)$',
  definition: '\n      (() => {\n        let output = \'\';\n        $1\n        return output;\n      })();'
}];