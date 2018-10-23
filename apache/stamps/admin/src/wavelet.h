#ifndef WAVELET_H
#define WAVELET_H

#include <math.h>
#include "rank.h"
#include <fstream>

class wavelet {
    public:
        wavelet(char* text, int length, ulong* alphabet);
        ~wavelet();
        inline int get_rank(const int i, const ulong c) const{
            const int cell = c >> shift;
            const int pos = c & mask;
            const ulong l_mask = one << pos;
            const bool left = (alphabet_left[cell] & l_mask) > zero;
            
            
            int result = (i >= 0) ? rkg->get_rank(i, left) : 0;
            if (result) {
                if (left && left_child) return left_child->get_rank(result - one, c);
                else if (!left && right_child) return right_child->get_rank(result - one, c);
            }
            return result;
        }
        
        
        inline void get_rank(int &l, int &r, const int c) const{
            const int cell = c >> shift;
            const int pos = c & mask;
            const ulong l_mask = one << pos;
            const bool left = (alphabet_left[cell] & l_mask) > zero;
            
            l = (l >= 0) ? rkg->get_rank(l, left) : 0;
            r = (r >= 0) ? rkg->get_rank(r, left) : 0;
            
            if (l + one <= r){
                if (left && left_child) left_child->get_rank(--l, --r, c);
                else if (!left && right_child) right_child->get_rank(--l, --r, c);
            }
        }
        
        int* create_less_table();
        
        int length;
        ranking* rkg;
        ulong alphabet[2];
        int len_alphabet;
        ulong alphabet_left[2];
        wavelet* left_child;
        wavelet* right_child;
};

#endif