#include "rank.h"

ranking::ranking(char* text, int _length, ulong* _alphabet){
    ulong alphabet[2];
    alphabet[0] = _alphabet[0];
    alphabet[1] = _alphabet[1];
    length = _length;
    int len_alphabet = __builtin_popcountll(alphabet[0]) + __builtin_popcountll(alphabet[1]);
    int half = (len_alphabet - 1) >> 1;
    int cnt = 0;
    
    for (int i = 0; i < 128 && cnt <= half; ++i){
        int cell = i >> 6;
        int pos = i & 63;
        cnt += (alphabet[cell] >> pos) & 1;
        alphabet[cell] &= ~(1ull << pos);
    }
        
    int field_len = (length >> 6) + 1;
    bitfield = new ulong[field_len];
    sums = new uint[field_len];
    sums[0] = 0ull;
    
    for (int i = 0; i < field_len; ++i) bitfield[i] = 0;
    
    for (int i = 0; i < length; ++i){
        int cell = i >> 6;
        int pos = i & 63;
        ulong bit = (alphabet[text[i] >> 6] >> (text[i] & 63)) & one;
        bitfield[cell] |= (bit << pos);
        
        if (!pos  && i) {
            sums[cell] = sums[cell - 1] + __builtin_popcountll(bitfield[cell - 1]);
        }
    }
}
    

ranking::~ranking(){
    delete []bitfield;
    delete []sums;
}


    