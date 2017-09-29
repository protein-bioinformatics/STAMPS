#ifndef RANK_H
#define RANK_H

#include <string>
#include <iostream>
#include <string.h>
using namespace std;

const ulong shift = 6ull;
const ulong mask = 63ull;
const ulong one = 1ull;
const ulong zero = 0ull;

typedef unsigned long ulong;
typedef unsigned int uint;

class ranking {
    public:
        ranking(ulong, char* bitfield_stored, char* sums_stored);
        ranking(char* text, ulong _length, ulong* alphabet);
        ~ranking();
        //ulong get_rank(ulong i, bool counter = false);
        inline int get_rank(const uint i, const bool counter) const {
            const uint cell = i >> shift;
            const uint pos = i & mask;
            const ulong masked = mask - pos;
            const ulong active_ones = bitfield[cell] << masked;
            uint count_ones = sums[cell];
            count_ones += __builtin_popcountll(active_ones);
            return counter ? i + one - count_ones : count_ones;
        }
        
        ulong length;
        ulong* bitfield;
        uint* sums;
};

#endif