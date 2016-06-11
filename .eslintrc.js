module.exports = {
  "rules": {
    "no-console": 0,
    "indent": [2, 2, {"SwitchCase": 1}],
    "linebreak-style": [2, "windows"],
    "semi": [2, "always"]
  },
  "env": {
    "node": true,
    "es6": true,
    "browser": true
  },
  "extends": "eslint:recommended",
  "ecmaFeatures": {
    "experimentalObjectRestSpread": true
  }
};