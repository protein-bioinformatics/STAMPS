#ifndef WAVELET_H
#define WAVELET_H

#include <math.h>
#include "rank.h"
#include <fstream>

class wavelet {
    public:
        wavelet(char* text, ulong length, ulong* alphabet);
        wavelet(string filename);
        wavelet();
        ~wavelet();
        //ulong get_rank(ulong pos, ulong c);
        inline ulong get_rank(const ulong i, const ulong c) const{
            const ulong cell = c >> shift;
            const ulong pos = c & mask;
            const ulong masked = mask - pos;
            const ulong active_ones = alphabet[cell] << masked;
            ulong p = __builtin_popcountll(active_ones);
            p += cell * __builtin_popcountll(*alphabet);
            p -= one;
            const bool left = (p <= half);
            ulong result = rkg->get_rank(i, left);
            if (!result) return zero;
            
            
            if (left && left_child){
                return left_child->get_rank(result - one, c);
            }
            else if (!left && right_child){
                return right_child->get_rank(result - one, c);
            }
            return result;
        }
        
        void store(string filename);
        ulong compute_store(ulong depth, ulong max_depth);
        char* store(char* output, ulong depth, ulong max_depth);
        char* load(char* output, ulong depth, ulong max_depth);
        ulong* create_less_table();
        
        ranking* rkg;
        ulong alphabet[2];
        ulong len_alphabet;
        ulong half;
        wavelet* left_child;
        wavelet* right_child;
};

#endif