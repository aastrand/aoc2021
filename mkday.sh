#!/bin/bash

zpd=$(printf "%02d" $1)
mkdir day$zpd
cp -R template.ts "day${zpd}/day${zpd}.ts"

# Download input
# Put this in .cookie.txt
#  # Netscape HTTP Cookie File
#  .adventofcode.com	TRUE	/	FALSE	0	session	<token-copied-from-browser-devtools>
curl -o day$zpd/input.txt --cookie .cookie.txt https://adventofcode.com/2021/day/$1/input
