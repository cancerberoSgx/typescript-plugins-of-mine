module.exports =  {
  "extends": "@istanbuljs/nyc-config-typescript",
    "reporter": [
      "html", 'lcov', 'text-summary'
    ],
}