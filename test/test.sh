#!/bin/sh

run_test()
{
  test_name=$1
  actual=$2
  expected=$3

  if [ "$actual" = "$expected" ]; then
    echo "[OK] '$test_name'" 
  else
    echo "[FAIL] '$test_name': expected '$expected', got '$actual'"
    exit 1
  fi
}

# test glic
top=$(git rev-parse --show-toplevel)
cd "$top" || exit 1

expected="helloWorld"
actual=$(./glic -l nodejs lodash camelCase "hello_world")

run_test "glic lodash camelCase" "$actual" "$expected"
