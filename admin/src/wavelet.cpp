#include "wavelet.h"

wavelet::wavelet(char* text, int length, ulong* _alphabet){
    ulong alphabet_right[2];
    
    alphabet_right[0] = alphabet[0] = _alphabet[0];
    alphabet_right[1] = alphabet[1] = _alphabet[1];
    alphabet_left[0] = alphabet_left[1] = 0ull;
    left_child = 0;
    right_child = 0;
    
    len_alphabet = __builtin_popcountll(alphabet[0]) + __builtin_popcountll(alphabet[1]);
    int half = (len_alphabet - 1) >> 1;
    int cnt = 0;
    for (int i = 0; cnt <= half; ++i){
        int cell = i >> shift;
        int pos = i & mask;
        ulong bit = (alphabet[cell] >> pos) & one;
        cnt += bit;
        alphabet_right[cell] &= ~(one << pos);
        alphabet_left[cell] |= bit << pos;
    }
    rkg = new ranking(text, length, alphabet_right);
    
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
    
    for (int i = 0; i < length; ++i){
        const int cell = text[i] >> shift;
        const int pos = text[i] & mask;
        const ulong letter = alphabet_right[cell] >> pos;
        const int bit = letter & one;
        texts[bit][lj * !bit + rj * bit] = text[i];
        lj += !bit;
        rj += bit;
    }
    
    if (len_alphabet_left > 1) left_child = new wavelet(text_left, len_text_left, alphabet_left);
    delete []text_left;
        
    if (len_alphabet_right > 1) right_child = new wavelet(text_right, len_text_right, alphabet_right);
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
        if ((alphabet[i >> shift] >> (i & mask)) & 1){
            cumulative += get_rank(rkg->length - 1, i);
        }
    }
    return less;
}