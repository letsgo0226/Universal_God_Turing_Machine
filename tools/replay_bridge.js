#!/usr/bin/env node
'use strict';
// Replays the real browser interpreter from docs/index.html in an isolated VM.
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('docs/index.html', 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if (!script) throw new Error('browser implementation not found');
const elements = Object.create(null);
const document = {getElementById(id) {return elements[id] ||= {value:'',textContent:'',className:'',onclick:null,click(){if(this.onclick)this.onclick();}};}};
const context = vm.createContext({document,TextEncoder,TextDecoder,console});
vm.runInContext(script, context, {timeout:5000});
const input = JSON.parse(fs.readFileSync(0, 'utf8'));
const cases = input.cases.map(test => {
  context.test = test;
  const certificate = vm.runInContext('simulate(test.program, Uint8Array.from(test.input), test.max_steps)',context,{timeout:5000});
  context.certificate = certificate;
  vm.runInContext('(typeof check === "function" ? check : verifyDoc)(certificate)',context,{timeout:5000});
  return certificate;
});
const payloads = input.payloads.map(hex => {
  context.payload = hex;
  return vm.runInContext('(()=>{const b=fromHex(payload);const n=(typeof G === "function" ? G : gEncode)(b);return {godel:n.toString(),hex: Array.from((typeof D === "function" ? D : gDecode)(n),v=>v.toString(16).padStart(2,"0")).join("")};})()',context,{timeout:5000});
});
process.stdout.write(JSON.stringify({cases,payloads}));
