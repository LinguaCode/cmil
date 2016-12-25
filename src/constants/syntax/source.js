module.exports = [{
  command: '^([\\d\\D]*)$',
  definition: `
      (() => {
        let output = '';
        $1
        return output;
      })();`
}];