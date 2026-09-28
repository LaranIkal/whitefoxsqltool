#!/bin/bash

# 1. Rename all .js files to .jss
find . -type f -name "*.jsc" -exec sh -c 'mv "$1" "${1%.js}.jss"' _ {} \;

# Update all references in html, css, and jss files
find . -type f \( -name "*.html" -o -name "*.css" -o -name "*.jss" \) \
  -exec sed -i 's/\.jsc"/\.jss"/g; s/\.jsc'"'"'/\.jss'"'"'/g; s/\.jsc`/\.jss`/g' {} \;   

