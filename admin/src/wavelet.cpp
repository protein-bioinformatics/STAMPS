#include "wavelet.h"

wavelet::wavelet(char* text, ulong length, ulong* _alphabet){
    ulong alphabet_left[2];
    ulong alphabet_right[2];
    
    alphabet_right[0] = alphabet[0] = _alphabet[0];
    alphabet_right[1] = alphabet[1] = _alphabet[1];
    alphabet_left[0] = alphabet_left[1] = 0ull;
    rkg = new ranking(text, length, alphabet);
    left_child = 0;
    right_child = 0;
    
    len_alphabet = __builtin_popcountll(alphabet[0]) + __builtin_popcountll(alphabet[1]);
    half = (len_alphabet - 1) >> 1;
    ulong cnt = 0;
    for (ulong i = 0; i < 128 && cnt <= half; ++i){
        ulong cell = i >> 6ull;
        ulong pos = i & 63ull;
        ulong bit = (alphabet[cell] >> pos) & 1ull;
        cnt += bit;
        alphabet_right[cell] &= ~(1ull << pos);
        alphabet_left[cell] |= bit << pos;
    }
    
    
    
    ulong len_alphabet_left = __builtin_popcountll(alphabet_left[0]) + __builtin_popcountll(alphabet_left[1]);
    ulong len_alphabet_right = __builtin_popcountll(alphabet_right[0]) + __builtin_popcountll(alphabet_right[1]);
    
    if (len_alphabet_left > 1){
        ulong len_text_left = 0;
        for (ulong i = 0; i < length; ++i){
            ulong cell = text[i] >> 6ull;
            ulong pos = text[i] & 63ull;
            len_text_left += (alphabet_left[cell] >> pos) & 1ull;
        }
        char *text_left = new char[len_text_left + 1];
        text_left[len_text_left] = 0;
        ulong j = 0;
        for (ulong i = 0; i < length; ++i){
            ulong cell = text[i] >> 6ull;
            ulong pos = text[i] & 63ull;
            ulong bit = (alphabet_left[cell] >> pos) & 1ull;
            if (bit){
                text_left[j] = text[i];
                ++j;
            }
        }
        left_child = new wavelet(text_left, len_text_left, alphabet_left);
        delete []text_left;
    }
    
    if (len_alphabet_right > 1){
        ulong len_text_right = 0;
        for (ulong i = 0; i < length; ++i){
            ulong cell = text[i] >> 6ull;
            ulong pos = text[i] & 63ull;
            len_text_right += (alphabet_right[cell] >> pos) & 1ull;
        }
        char *text_right = new char[len_text_right + 1];
        text_right[len_text_right] = 0;
        ulong j = 0;
        for (ulong i = 0; i < length; ++i){
            ulong cell = text[i] >> 6ull;
            ulong pos = text[i] & 63ull;
            ulong bit = (alphabet_right[cell] >> pos) & 1ull;
            if (bit){
                text_right[j] = text[i];
                ++j;
            }
        }
        right_child = new wavelet(text_right, len_text_right, alphabet_right);
        delete []text_right;
    }
}


wavelet::wavelet(){
    rkg = 0;
    len_alphabet = 0;
    half = 0;
    left_child = 0;
    right_child = 0;
}

wavelet::wavelet(string filename){
        
    ifstream is(filename.c_str(), ios::binary);
    is.seekg (0, ios::end);
    ulong size = is.tellg();
    is.seekg (0, ios::beg);
    char* input = new char[size];
    is.read (input, size);
    is.close();
    char* ipt = load(input, 0, 0);
    delete []input;
}

char* wavelet::load(char* input, ulong depth, ulong max_depth){
    ulong length = ((ulong*)input)[0];
    rkg = 0;
    len_alphabet = 0;
    half = 0;
    left_child = 0;
    right_child = 0;
    alphabet[0] = ((ulong*)input)[1];
    alphabet[1] = ((ulong*)input)[2];
    input += 24;
    len_alphabet = __builtin_popcountll(alphabet[0]) + __builtin_popcountll(alphabet[1]);
    half = (len_alphabet - 1) >> 1;
    if (!max_depth){
        max_depth = ceil(log2(len_alphabet)) - 1;
    }
    ulong field_len = (length >> 6ull) + 1ull;
    rkg = new ranking(length, input, input + field_len * 8);
    input += field_len * 8 + field_len * 4;
    if (depth == max_depth){
            return input;
    }
    ulong length_next = ((ulong*)input)[0];
    if (length_next){
        left_child = new wavelet();
        input = left_child->load(input, depth + 1, max_depth);
    }
    else {
        input += 8;
    }
    length_next = ((ulong*)input)[0];
    if (length_next){
        right_child = new wavelet();
        input = right_child->load(input, depth + 1, max_depth);
    }
    else {
        input += 8;
    }
    
    return input;
}

wavelet::~wavelet(){
    delete rkg;
    delete left_child;
    delete right_child;
}


void wavelet::store(string filename){
    ulong size = compute_store(0, ceil(log2(len_alphabet)) - 1); // alphabetsize
    char* output = new char[size];
    char* otp = store(output, 0, ceil(log2(len_alphabet)) - 1);
    ofstream wrt(filename.c_str(), ios::binary);
    wrt.write(output, size);
    wrt.close();
    delete []output;
}

ulong wavelet::compute_store(ulong depth, ulong max_depth){
    ulong l = 0;
    char* b = 0;
    char* s = 0;
    rkg->store(l, &b, &s);
    ulong field_len = (l >> 6ull) + 1ull;
    ulong size = 24 + field_len * 8 + field_len * 4;
    
    if (depth == max_depth){
        return size;
    }
    if (left_child){
        size += left_child->compute_store(depth + 1, max_depth);
    }
    else {
        size += 8;
    }
    if (right_child){
        size += right_child->compute_store(depth + 1, max_depth);
    }
    else {
        size += 8;
    }
    return size;
}


char* wavelet::store(char* output, ulong depth, ulong max_depth){
    ulong l = 0;
    char* b = 0;
    char* s = 0;
    rkg->store(l, &b, &s);
    ((ulong*)output)[0] = l;
    ((ulong*)output)[1] = alphabet[0];
    ((ulong*)output)[2] = alphabet[1];
    output += 24;
    ulong field_len = (l >> 6ull) + 1ull;
    char* op = output + field_len * 8;
    memcpy(output, b, field_len * 8);
    memcpy(op, s, field_len * 4);
    output += field_len * 8 + field_len * 4;
    if (depth == max_depth){
        return output;
    }
    if (left_child){
        output = left_child->store(output, depth + 1, max_depth);
    }
    else {
        ((ulong*)output)[0] = 0;
        output += 8;
    }
    if (right_child){
        output = right_child->store(output, depth + 1, max_depth);
    }
    else {
        ((ulong*)output)[0] = 0;
        output += 8;
    }
    return output;
}


ulong* wavelet::create_less_table(){
    ulong* less = new ulong[128];
    ulong cumulative = 0;
    for (ulong i = 0; i < 128; ++i){
        less[i] = cumulative;
        if ((alphabet[i >> 6] >> (i & 63)) & 1){
            cumulative += get_rank(rkg->length - 1, i);
        }
    }
    return less;
}