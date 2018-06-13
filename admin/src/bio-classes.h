
#include <string>
#include <zlib.h>
#include <vector>
#include <set>
#include <sstream>
#include <cstring>
#include <math.h>
#include <sys/time.h>
#include "rank.h"

using namespace std;

vector<string> split(string str, char delimiter);
void replaceAll(std::string& str, const std::string& from, const std::string& to);
void strip(string &str);
bool is_integer_number(const string& string);
string cleanFasta(string str);
int binarySearch(int* array, int length, int key);
string remove_newline(string str);
string compress_string(const string& str, int compressionlevel = Z_BEST_COMPRESSION);
float compute_mass(string protein_seq);
float predict_isoelectric_point(string protein_seq);
static timeval start_timeval, end_timeval;

static void start_time(){gettimeofday(&start_timeval, 0);}
static void stop_time(){gettimeofday(&end_timeval, 0);}
static long get_time(){
    long stime = start_timeval.tv_sec * 1000000 + start_timeval.tv_usec;
    long etime = end_timeval.tv_sec * 1000000 + end_timeval.tv_usec;
    return etime - stime;
}
static long elapsed_time(){
    gettimeofday(&end_timeval, 0);
    long stime = start_timeval.tv_sec * 1000000 + start_timeval.tv_usec;
    long etime = end_timeval.tv_sec * 1000000 + end_timeval.tv_usec;
    return etime - stime;
}

static float acids[] = {
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
0,
71.037110, // A
0,
103.009190,
115.026940,
129.042590,
147.068410,
57.021460,
137.058910,
113.084060,
0,
128.094960,
113.084060,
131.040490,
114.042930,
0,
97.052760,
128.058580,
156.101110,
87.032030,
101.047680,
0,
99.068410, // Z
186.079310,
0,
163.063330,
0, // Z
0, 0, 0, 0, 0, 0, 0, 0,
160.030654, // c
0, 0, 0, 0, 0, 0, 0, 0, 0,
147.035404,
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
};


static ulong abc[2] = {(one << '/') | (one << '$'),
    (one << ('A' & mask)) |
    (one << ('B' & mask)) |
    (one << ('C' & mask)) |
    (one << ('D' & mask)) |
    (one << ('E' & mask)) |
    (one << ('F' & mask)) |
    (one << ('G' & mask)) |
    (one << ('H' & mask)) |
    (one << ('I' & mask)) |
    (one << ('J' & mask)) |
    (one << ('K' & mask)) |
    (one << ('L' & mask)) |
    (one << ('M' & mask)) |
    (one << ('N' & mask)) |
    (one << ('O' & mask)) |
    (one << ('P' & mask)) |
    (one << ('Q' & mask)) |
    (one << ('R' & mask)) |
    (one << ('S' & mask)) |
    (one << ('T' & mask)) |
    (one << ('U' & mask)) |
    (one << ('V' & mask)) |
    (one << ('W' & mask)) |
    (one << ('X' & mask)) |
    (one << ('Y' & mask)) |
    (one << ('Z' & mask))};


static float aa_coefficients[][3] = {
{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
{}, {}, {}, 
{8.00,  8.28,  9.00}, // C
{3.57,  4.07,  4.57}, // D
{4.15,  4.45,  4.75}, // E
{}, {},
{4.89,  6.08,  6.89}, // H
{}, {}, 
{10.00,  9.80, 10.30}, // K
{}, {}, {}, {}, {}, {},
{11.50, 12.50, 11.50}, // R
{}, {}, 
{5.20,  5.43,  5.60}, // U
{}, {}, {},
{9.34,  9.84, 10.34}, // Y
{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}};

static long coeff_set[2] = {0, (1l << ('C' & 63)) | (1l << ('D' & 63)) | (1l << ('E' & 63)) | (1l << ('H' & 63)) | (1l << ('K' & 63)) | (1l << ('R' & 63)) | (1l << ('U' & 63)) | (1l << ('Y' & 63))};


static float aa_coefficients_middle[][2] = {
{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
{},
{7.58, 3.75}, // A
{7.46, 3.57},
{8.12, 3.10},
{7.70, 3.50},
{7.19, 3.50},
{6.96, 3.98},
{7.50, 3.70},
{7.18, 3.17},
{7.48, 3.72},
{7.46, 3.73},
{6.67, 3.40},
{7.46, 3.73},
{6.98, 3.68},
{7.22, 3.64},
{7.00, 3.50}, 
{8.36, 3.40},
{6.73, 3.57},
{6.76, 3.41},
{6.86, 3.61},
{7.02, 3.57},
{5.20, 5.60},   
{7.44, 3.69},
{7.11, 3.78},
{7.26, 3.57},
{6.83, 3.60},
{6.96, 3.535}, // Z
{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}};


class spectrum {
    public:
        int id;
        const string str_id;
        string charge = "0";
        string mass = "0";
        string confidence = "0";
        string mod_sequence = "A";
        string tissues = "-";
        string tissue_numbers = "1";
        
        
        spectrum(string _id);
        string to_string();
};


class peptide {
    public:
        string peptide_seq;
        int start_pos;
        set<string> tissues;
        vector<spectrum*> spectra;
        
        peptide(string ps, int pos);
        string to_string();
};

class protein {
    public:
        int id;
        const string str_id;
        string name;
        string definition;
        float mass;
        string accession;
        string ec_number;
        string kegg;
        string fasta;
        float pI;
        vector<peptide*> peptides;
        int proteome_start_pos;
        
        protein(string _id);
        string to_string();
};