#include "wavelet.h"

wavelet::wavelet(char* text, int length, ulong* _alphabet){
    ulong alphabet_right[2];
    
    alphabet_right[0] = alphabet[0] = _alphabet[0];
    alphabet_right[1] = alphabet[1] = _alphabet[1];
    alphabet_left[0] = alphabet_left[1] = 0ull;
    rkg = new ranking(text, length, alphabet);
    left_child = 0;
    right_child = 0;
    
    len_alphabet = __builtin_popcountll(alphabet[0]) + __builtin_popcountll(alphabet[1]);
    int half = (len_alphabet - 1) >> 1;
    int cnt = 0;
    for (int i = 0; cnt <= half; ++i){
        int cell = i >> 6;
        int pos = i & 63;
        ulong bit = (alphabet[cell] >> pos) & one;
        cnt += bit;
        alphabet_right[cell] &= ~(1ull << pos);
        alphabet_left[cell] |= bit << pos;
    }
    
    int len_alphabet_left = __builtin_popcountll(alphabet_left[0]) + __builtin_popcountll(alphabet_left[1]);
    int len_alphabet_right = __builtin_popcountll(alphabet_right[0]) + __builtin_popcountll(alphabet_right[1]);
    
    int lj = 0, rj = 0;
    int len_text_left = rkg->get_rank_left(length - 1);
    char *text_left = new char[len_text_left + 1];
    text_left[len_text_left] = 0;
    
    
    int len_text_right = rkg->get_rank_right(length - 1);
    char *text_right = new char[len_text_right + 1];
    text_right[len_text_right] = 0;
    char** texts = new char*[2]{text_left, text_right};
    
    int masks[2] = {0, ~0};
    
    
    for (int i = 0; i < length; ++i){
        const int cell = text[i] >> 6;
        const int pos = text[i] & 63;
        const ulong letter = alphabet_right[cell] >> pos;
        const int bit = letter & one;
        texts[bit][lj * !bit + rj * bit] = text[i];
        lj += !bit;
        rj += bit;
    }
    
    if (len_alphabet_left > 1) left_child = new wavelet(text_left, len_text_left, alphabet_left);
    if (len_alphabet_right > 1) right_child = new wavelet(text_right, len_text_right, alphabet_right);
    
    delete []text_left;
    delete []text_right;
    delete []texts;
}


wavelet::~wavelet(){
    delete rkg;
    delete left_child;
    delete right_child;
}


int* wavelet::create_less_table(){
    int* less = new int[128];
    int cumulative = 0;
    for (int i = 0; i < 128; ++i){
        less[i] = cumulative;
        if ((alphabet[i >> 6] >> (i & 63)) & 1){
            cumulative += get_rank(rkg->length - 1, i);
        }
    }
    return less;
}