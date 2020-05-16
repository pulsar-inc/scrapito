#!/bin/bash

if [[ "$1" == "help" ]]; then
  npm version --help;
  exit 0;
fi

if [[ $(git diff --stat) != '' ]]; then
  echo 'Git working directory not clean.';
  exit 1;
fi

if [[ "$#" != "1" ]]; then
  echo 'Bad argument number.';
  exit 1;
fi

PATHS=$(find . -name 'package.json' -not -path '*node_modules*' | xargs dirname)

for path in $PATHS; do
  npm -C $path version $1
done;