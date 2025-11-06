#!/usr/bin/env node

const pkgName = process.argv[2];
const fname = process.argv[3];

try {
  var pkg = require(pkgName);
} catch (e) {
  console.error("Error loading package:", e.message);
  process.exit(1);
}

if (!fname || fname === "--help" || fname === "-h") {
  showHelp();
  process.exit(0);
}

const func = fname === '.' ? pkg : pkg[fname];

if (typeof func !== "function") {
  console.error(`Function '${fname}' not found in package '${pkgName}'.`);
  console.error(`Use 'glic ${pkgName} --help' to list available functions.`);
  process.exit(1);
}

const args = process.argv.slice(4);
try {
  const result = func(...args);
  if (result !== undefined) {
    if (typeof result === "object") {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(result);
    }
  }
} catch (e) {
  console.error("Error:", e.message);
  process.exit(1);
}

function showHelp() {
  function parseFunc(func) {
    const funcStr = func.toString();

    let params = [];
    // Regular functions
    const match = funcStr.match(/^\s*(?:function\s+)?[A-Za-z_$][\w$]*\s*\(([^)]*)\)/);
    if (match && match[1]) {
      params = match[1]
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p);
    }

    // Arrow functions
    const arrowMatch = funcStr.match(/^\\(([^)]*)\\)\\s*=>/);
    if (arrowMatch && arrowMatch[1]) {
      params = arrowMatch[1]
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p);
    }

    // Single param arrow functions
    const singleArrowMatch = funcStr.match(/^(\\w+)\\s*=>/);
    if (singleArrowMatch && singleArrowMatch[1]) {
      params = [singleArrowMatch[1]];
    }

    return { params: params, arity: func.length };
  }

  const functions = [];

  if (typeof pkg === "function") {
    const func = pkg;
    functions.push({ name: ".", ...parseFunc(func) });
  }

  for (const key in pkg) {
    if (typeof pkg[key] === "function") {
      const func = pkg[key];
      functions.push({ name: key, ...parseFunc(func) });
    }
  }

  functions.sort((a, b) => a.name.localeCompare(b.name));

  functions.forEach((f) => {
    const paramStr =
      f.params.length > 0 ? f.params.join(", ") : `arg1, ..., arg${f.arity}`;
    console.log(`${f.name}(${paramStr})`);
  });

  if (functions.length === 0) {
    console.error(`No functions found in package '${pkgName}'.`);
  }
}
