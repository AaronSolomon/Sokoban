#!/usr/bin/python3.12
# Done: maze014.txt misses last character of last line

import sys
if len(sys.argv) != 2:
    print("Usage: {} FILENAME".format(sys.argv[0]))
    sys.exit(1)

char1 = ' HWBDC+'
char2 = ' #@$.*+'
# # = Wall
# @ = Player
# $ = Box
# . = Goal
# * = Box on Goal
# + = Player on Goal
with open(sys.argv[1]) as infile:
    for line in infile:
        if line[-1] == '\n':
            line = line[:-1]
        for c in line:
            i = char1.find(c)
            if i >= 0:
                print(char2[i], end='')
            else:
                print(char1[i], end='')
        print()
