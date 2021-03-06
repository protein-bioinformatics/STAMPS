#include "rank.h"

ranking::ranking(char* text, int length, ulong* _alphabet){
    ulong alphabet[2];
    alphabet[0] = _alphabet[0];
    alphabet[1] = _alphabet[1];
    int len_alphabet = __builtin_popcountll(alphabet[0]) + __builtin_popcountll(alphabet[1]);
    int half = (len_alphabet - 1) >> 1;
    int cnt = 0;
        
    int field_len = (length >> shift) + 1;
    bitfield = new ulong[field_len];
    sums = new uint[field_len];
    sums[0] = 0ull;
    
    for (int i = 0; i < field_len; ++i) bitfield[i] = 0;
    
    for (int i = 0; i < length; ++i){
        int cell = i >> shift;
        int pos = i & mask;
        ulong bit = (alphabet[text[i] >> shift] >> (text[i] & mask)) & one;
        bitfield[cell] |= (bit << pos);
        
        if (!pos && i) {
            sums[cell] = sums[cell - 1] + __builtin_popcountll(bitfield[cell - 1]);
        }
    }
}


ranking::ranking(ulong* _bitfield, int field_len) : bitfield(_bitfield){
    sums = new uint[field_len];
    sums[0] = 0ull;
    for (int i = 1; i < field_len; ++i) sums[i] = sums[i - 1] + __builtin_popcountll(bitfield[i - 1]);
}
    

ranking::~ranking(){
    delete []bitfield;
    delete []sums;
}


    