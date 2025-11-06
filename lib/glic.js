#!/usr/bin/env node

const pkgName = process.argv[2]; 
const fname = process.argv[3];

try {
  var pkg = require(pkgName);
} catch (e) {
  console.error('Error loading package:', e.message);
  process.exit(1);
}

if (typeof pkg[fname] !== 'function') {
    console.error(`Function '${fname}' not found in package '${pkgName}'.`);
    console.error(`Use 'glic ${pkgName} --help' to list available functions.`);
    process.exit(1);
}

const args = process.argv.slice(4);
try {
  const result = pkg[fname](...args);
  if (result !== undefined) {
    if (typeof result === 'object') {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(result);
    }
  }
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
}

process.exit(0);

// TODO: Restore --help functionality
  
const functions = [];

for (const key in pkg) {
  if (typeof pkg[key] === 'function') {
    const func = pkg[key];
    const funcStr = func.toString();
    
    let params = [];
    const match = funcStr.match(/^(?:function\\s*)?(?:\\w+)?\\s*\\(([^)]*)\\)/);
    if (match && match[1]) {
      params = match[1].split(',').map(p => p.trim()).filter(p => p);
    }
    
    // For arrow functions
    const arrowMatch = funcStr.match(/^\\(([^)]*)\\)\\s*=>/);
    if (arrowMatch && arrowMatch[1]) {
      params = arrowMatch[1].split(',').map(p => p.trim()).filter(p => p);
    }
    
    // Single param arrow function
    const singleArrowMatch = funcStr.match(/^(\\w+)\\s*=>/);
    if (singleArrowMatch && singleArrowMatch[1]) {
      params = [singleArrowMatch[1]];
    }
    
    functions.push({ name: key, params: params, arity: func.length });
  }
}

functions.sort((a, b) => a.name.localeCompare(b.name));

functions.forEach(f => {
  const paramStr = f.params.length > 0 ? f.params.join(', ') : `arg1, ..., arg${f.arity}`;
  console.log(`${f.name}(${paramStr})`);
});

if (functions.length === 0) {
  console.error(`No functions found in package '${pkgName}'.`);
}
