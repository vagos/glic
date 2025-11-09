#!/bin/sh

set -eu

run_test() {
  test_name=$1
  expected=$2
  actual=$3

  if [ "$actual" = "$expected" ]; then
    echo "[OK] $test_name"
  else
    echo "[FAIL] $test_name: expected '$expected', got '$actual'"
    exit 1
  fi
}

run_contains_test() {
  test_name=$1
  needle=$2
  haystack=$3

  case "$haystack" in
    *"$needle"*)
      echo "[OK] $test_name"
      ;;
    *)
      echo "[FAIL] $test_name: expected '$needle' in output"
      echo "Output:"
      echo "$haystack"
      exit 1
      ;;
  esac
}

run_order_test() {
  test_name=$1
  haystack=$2
  first=$3
  second=$4
  third=$5

  case "$haystack" in
    *"$first"*"$second"*"$third"*)
      echo "[OK] $test_name"
      ;;
    *)
      echo "[FAIL] $test_name: expected '$first', '$second', '$third' in order"
      echo "Output:"
      echo "$haystack"
      exit 1
      ;;
  esac
}

top=$(git rev-parse --show-toplevel)
cd "$top"

camel_output=$(./glic -l nodejs lodash camelCase "hello_world")
run_test "lodash camelCase converts snake_case" "helloWorld" "$camel_output"

start_case_output=$(./glic -l nodejs lodash startCase "hello_world")
run_test "lodash startCase inserts spaces" "Hello World" "$start_case_output"

help_output=$(./glic -l nodejs lodash --help)
run_contains_test "help lists camelCase" "camelCase(string)" "$help_output"
run_contains_test "help lists startCase" "startCase(string)" "$help_output"
run_order_test "functions appear alphabetically" "$help_output" "camelCase(string)" "capitalize(string)" "startCase(string)"

slugify_output=$(./glic -l nodejs slugify . "Hello, World!")
run_test "slugify default export uses dot notation" "Hello-World!" "$slugify_output"

qs_output=$(./glic -l nodejs qs parse "topic=glic&count=2")
expected_qs=$(cat <<'EOF'
{
  "topic": "glic",
  "count": "2"
}
EOF
)
run_test "qs parse prints JSON" "$expected_qs" "$qs_output"

# test for error handling
if error_output=$(./glic -l nodejs lodash missing 2>&1); then
  echo "[FAIL] missing function should fail"
  exit 1
else
  run_contains_test "missing function surfaces message" "Function 'missing' not found in package 'lodash'." "$error_output"
fi
