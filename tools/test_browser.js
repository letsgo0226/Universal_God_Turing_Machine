#!/usr/bin/env node
// Smoke test the deployed browser JavaScript with Node's built-in VM.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('docs/index.html', 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, 'inline script missing');
const values = { program: '++++++++[>++++++++++<-]>+++.', in: '', limit: '3000', payload: 'S' };
const nodes = {};
const document = {
  getElementById: id => nodes[id] ||= {
    value: values[id] || '', textContent: '', className: '',
    onclick: null, click() { if (this.onclick) this.onclick(); }
  }
};
const ctx = vm.createContext({ document, TextEncoder, TextDecoder, console });
vm.runInContext(script, ctx, { timeout: 5000 });
const examples = [
  ['++++++++[>++++++++++<-]>+++.', '', '53', 'HALTED'],
  [',.', 'A', '41', 'HALTED'],
  ['[+].', '', '00', 'HALTED'],
  ['<+.', '', '01', 'HALTED'],
  ['+[]', '', '', 'STEP_LIMIT']
];
for (const [code, input, output, status] of examples) {
  const doc = vm.runInContext('simulate(' + JSON.stringify(code) + ',new TextEncoder().encode(' + JSON.stringify(input) + '),3000)', ctx);
  assert.equal(doc.output_hex, output);
  assert.equal(doc.status, status);
  ctx.certificate = doc;
  vm.runInContext('check(certificate)', ctx);
  const corrupted = JSON.parse(JSON.stringify(doc));
  corrupted.trace[0][2] = 77;
  ctx.certificate = corrupted;
  assert.throws(() => vm.runInContext('check(certificate)', ctx));
}
assert.equal(vm.runInContext('G(new TextEncoder().encode("S")).toString()', ctx), '341');
const certificate = vm.runInContext('simulate("++++++++[>++++++++++<-]>+++.",new Uint8Array(),3000)', ctx);
fs.writeFileSync('/tmp/ugtm-browser-certificate.json', JSON.stringify(certificate));
console.log('PASS: 5 browser traces, 5 tampered rejected, G257 S=341');
