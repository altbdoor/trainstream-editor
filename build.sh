#!/bin/bash

CURRENT_DIR=$( cd "$(dirname "${BASH_SOURCE}")" ; pwd -P )
cd "$CURRENT_DIR"

original_remote=$(git config --get remote.origin.url)

./jekyll b
cd _site

git init
git remote add origin "${original_remote}"

git add .
timestamp=$(date '+%Y-%m-%dT%H:%M:%S%z')
git commit -m "[build] updated gh-pages on $timestamp"

git branch -m gh-pages
git push --force origin gh-pages
