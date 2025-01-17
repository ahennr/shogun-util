#!/usr/bin/env node
/* eslint-disable require-jsdoc */
/* eslint-disable no-console */

'use strict';

const fs = require('fs-extra');
const path = require('path');
const watch = require('watch');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const curDir = process.cwd();

if (process.argv.length < 3) {
  console.log('please specify target path');
  console.log('for example ../shogun-gis-client/node_modules/@terrestris/shogun-util/');
  process.exit(0);
}

const sourcePath = path.join(curDir, 'src');
const distPath = path.join(curDir, 'dist');
const targetDistPath = path.join(curDir, process.argv[2], 'dist');

if (!fs.existsSync(targetDistPath) ) {
  throw new Error('target does not exist');
}

async function buildAndCopy() {
  console.log('run build');

  try {
    const { stdout, stderr} = await exec('npm run build');
    console.log(stdout);
    console.log(stderr);

    console.log('copy dist');
    await fs.copy(distPath, targetDistPath);

    console.log('done');
  } catch (error) {
    console.log('error');
    const { stdout, stderr } = error;
    console.log(stdout);
    console.log(stderr);
  }
}

buildAndCopy();

let timeout;

function throttle(callback, time) {
  if (!timeout) {
    timeout = setTimeout(function () {
      timeout = null;
      callback();
    }, time);
  }
}

// eslint-disable-next-line no-unused-vars
watch.watchTree(sourcePath, function (f, curr, prev) {
  if (typeof f === 'object') {
    console.log('watching');
  } else {
    throttle(buildAndCopy, 1000);
  }
});
