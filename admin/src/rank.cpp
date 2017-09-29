#include "rank.h"

ranking::ranking(char* text, ulong _length, ulong* _alphabet){
    ulong alphabet[2];
    alphabet[0] = _alphabet[0];
    alphabet[1] = _alphabet[1];
    length = _length;
    ulong len_alphabet = __builtin_popcountll(alphabet[0]) + __builtin_popcountll(alphabet[1]);
    ulong half = (len_alphabet - 1) >> 1;
    ulong cnt = 0;
    
    for (ulong i = 0; i < 128 && cnt <= half; ++i){
        ulong cell = i >> 6ull;
        ulong pos = i & 63ull;
        cnt += (alphabet[cell] >> pos) & 1ull;
        alphabet[cell] &= ~(1ull << pos);
    }
        
    ulong field_len = (length >> 6ull) + 1ull;
    bitfield = new ulong[field_len];
    sums = new uint[field_len];
    sums[0] = 0ull;
            
    
    for (ulong i = 0ull; i < length; ++i){
        ulong cell = i >> 6ull;
        ulong pos = i & 63ull;
        if (!pos) bitfield[cell] = 0ull;
        ulong bit = (alphabet[text[i] >> 6ull] >> (text[i] & 63ull)) & 1ull;
        bitfield[cell] |= (bit << pos);
        
        if (!pos  && i) {
            sums[cell] = sums[cell - 1ull] + __builtin_popcountll(bitfield[cell - 1ull]);
        }
    }
}

ranking::ranking(ulong length_load, char* bitfield_load, char* sums_load){
    length = length_load;
    ulong field_len = (length_load >> 6ull) + 1ull;
    bitfield = new ulong[field_len];
    sums = new uint[field_len];
    memcpy(bitfield, bitfield_load, field_len * 8);
    memcpy(sums, sums_load, field_len * 4);
}
    

ranking::~ranking(){
    delete []bitfield;
    delete []sums;
}


    