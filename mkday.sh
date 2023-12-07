#!/bin/bash

zpd=$(printf "%02d" $1)
mkdir day$zpd
cat template.ts | sed s/'{{ day }}'/${1}/g > day${1}/day${1}.ts

# Download input
# Put this in .cookie.txt
#  # Netscape HTTP Cookie File
#  .adventofcode.com	TRUE	/	FALSE	0	session	<token-copied-from-browser-devtools>
curl -o day$zpd/input.txt --cookie .cookie.txt -A "mkday.sh by github.com/aastrand via cURL" https://adventofcode.com/2021/day/$1/input
