import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('../lib/server.ts',import.meta.url),'utf8');
const sql=source.match(/prepare\('(INSERT INTO budgets \(user,window,count\) SELECT [^']+)'\)/)?.[1];
assert(sql,'Budget query exists');
const db=new DatabaseSync(':memory:');db.exec('CREATE TABLE budgets (user TEXT PRIMARY KEY, window INTEGER NOT NULL,count INTEGER NOT NULL)');
const statement=db.prepare(sql),cap=25_000_000;
let accepted=0;for(let i=0;i<100;i++){if(statement.get('spend:lifetime',1_000_000,1_000_000,cap,cap))accepted++;}
assert.equal(accepted,25);assert.equal(db.prepare('SELECT count FROM budgets').get().count,cap);
assert.equal(statement.get('spend:lifetime',1,1,cap,cap),undefined);
assert.equal(statement.get('another-ledger',cap+1,cap+1,cap,cap),undefined);
console.log('PASS: lifetime allowance stops exactly at cap; rejected reservations do not increase it');
