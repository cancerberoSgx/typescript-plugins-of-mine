myCustomPi = 3.14;

const simpleVariable4 = 'lorem ipsum';
simpleVariable4 = 'hello world';

let treeMagic = 1;
let treeMagic = 's';

function(n) {
  return [...Array(n + 1).keys()]
    .slice(1).reduce((acc, cur) => acc * cur, 1);
}

const underscore = require('underscore'), moment = require('moment'),
  handlebars = require('handlebars'), gulp = require('gulp');

const root1: { n: number }
const tree = buildTree(root1, { leaveCount: 50, depth: [98] })
