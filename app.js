#!/usr/bin/env node

console.log('starting Bottlenose!');
global.__rootDir = __dirname;
require('bottlenose-core')();
