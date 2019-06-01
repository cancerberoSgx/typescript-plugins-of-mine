module.exports =  {
  "extends": "@istanbuljs/nyc-config-typescript",
  // "all": true,
    "reporter": [
      "html", 'lcov', 'text-summary'
    ],
  "check-coverage": true
}