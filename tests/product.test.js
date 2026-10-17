import test from 'node:test';
import assert from 'node:assert/strict';
import * as product from '../product.js';
import {splitExpenses,weightedScore,daysUntil,streak,readingPercent,zoneTime} from '../core.js';
import {today,datePlus,sum,esc} from '../ui.js';
const {config,seed,validateMeta,initialMeta,validateItem}=product;
test('sample workspace satisfies the product field contract',()=>{const ids=new Set();for(const item of seed()){assert.ok(!ids.has(item.id));ids.add(item.id);for(const f of config.fields){assert.ok(f.key in item,f.key);if(f.type==='number')assert.ok(item[f.key]>=(f.min??0)&&item[f.key]<=(f.max??10000000));if(f.options)assert.ok(f.options.includes(item[f.key]));}validateItem?.(item);}if(initialMeta)validateMeta?.(initialMeta());});
test('user-provided text is escaped for HTML attributes and content',()=>{assert.equal(esc('<img src="x" onerror="alert(1)">'), '&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;');});
test('equal splits conserve every cent',()=>{const r=splitExpenses([{payer:'A',people:'A, B, C',amount:10}]);assert.deepEqual(r.balances,{A:666,B:-333,C:-333});assert.equal(Object.values(r.balances).reduce((a,b)=>a+b,0),0);assert.deepEqual(r.transfers,[{from:'B',to:'A',amount:3.33},{from:'C',to:'A',amount:3.33}]);});test('duplicate participants and payer outside the split are supported',()=>{const r=splitExpenses([{payer:'A',people:'B, B, C',amount:.01}]);assert.equal(r.balances.A,1);assert.equal(r.balances.B,-1);assert.equal(r.balances.C,0);});test('balanced payments need no transfers',()=>{assert.equal(splitExpenses([{payer:'A',people:'A, B',amount:10},{payer:'B',people:'A, B',amount:10}]).transfers.length,0);});
