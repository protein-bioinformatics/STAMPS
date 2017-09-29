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
            const ulong mask = one << pos;
            const bool left = (alphabet_left[cell] & mask) > 0;
            
            
            int result = (i >= 0) ? rkg->get_rank(i, left) : 0;
            if (!result) return zero;
            
            
            if (left && left_child){
                return left_child->get_rank(result - one, c);
            }
            else if (!left && right_child){
                return right_child->get_rank(result - one, c);
            }
            return result;
        }
        
        /*
        inline int* get_rank(const int l, const int r, const int c) const{
            const int cell = c >> shift;
            const int pos = c & mask;
            const ulong mask = one << pos;
            const bool left = (alphabet_left[cell] & mask) > 0;
            
            
            int result_left = (l >= 0) ? rkg->get_rank(l, left) : 0;
            int result_right = (r >= 0) ? rkg->get_rank(r, left) : 0;
            
            
            if (left && left_child){
                return left_child->get_rank(result_left - one, result_right - one, c);
            }
            else if (!left && right_child){
                return right_child->get_rank(result_left - one, result_right - one, c);
            }
            return new int[2]{result_left, result_right};
        }*/
        
        int* create_less_table();
        
        ranking* rkg;
        ulong alphabet[2];
        int len_alphabet;
        ulong alphabet_left[2];
        wavelet* left_child;
        wavelet* right_child;
};

#endif