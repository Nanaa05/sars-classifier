import numpy as np
from Bio.Align import substitution_matrices

def get_blosum62():
    return substitution_matrices.load("BLOSUM62")

def get_score(matrix, a, b):
    try:
        return matrix[a, b]
    except KeyError:
        try:
            return matrix[b, a]
        except KeyError:
            return -4

def needleman_wunsch_affine(seq1, seq2, gap_open=-10, gap_extend=-0.5):
    m, n = len(seq1), len(seq2)
    matrix = get_blosum62()
    
    M = np.full((m + 1, n + 1), -np.inf)
    X = np.full((m + 1, n + 1), -np.inf)
    Y = np.full((m + 1, n + 1), -np.inf)
    
    M[0, 0] = 0
    for i in range(1, m + 1):
        X[i, 0] = gap_open + (i - 1) * gap_extend
    for j in range(1, n + 1):
        Y[0, j] = gap_open + (j - 1) * gap_extend
        
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            match_score = get_score(matrix, seq1[i-1], seq2[j-1])
            X[i, j] = max(M[i-1, j] + gap_open, X[i-1, j] + gap_extend)
            Y[i, j] = max(M[i, j-1] + gap_open, Y[i, j-1] + gap_extend)
            M[i, j] = match_score + max(M[i-1, j-1], X[i-1, j-1], Y[i-1, j-1])
            
    aligned_seq1 = []
    aligned_seq2 = []
    
    i, j = m, n
    scores = [M[i, j], X[i, j], Y[i, j]]
    state = scores.index(max(scores))
    final_score = max(scores)
    
    while i > 0 or j > 0:
        if state == 0:
            if i > 0 and j > 0:
                aligned_seq1.append(seq1[i-1])
                aligned_seq2.append(seq2[j-1])
                match_score = get_score(matrix, seq1[i-1], seq2[j-1])
                
                if M[i, j] == match_score + M[i-1, j-1]: state = 0
                elif M[i, j] == match_score + X[i-1, j-1]: state = 1
                else: state = 2
                
                i -= 1; j -= 1
            else:
                state = 1 if i > 0 else 2
                
        elif state == 1:
            if i > 0:
                aligned_seq1.append(seq1[i-1])
                aligned_seq2.append('-')
                if X[i, j] == M[i-1, j] + gap_open: state = 0
                else: state = 1
                i -= 1
            else:
                state = 2
                
        elif state == 2:
            if j > 0:
                aligned_seq1.append('-')
                aligned_seq2.append(seq2[j-1])
                if Y[i, j] == M[i, j-1] + gap_open: state = 0
                else: state = 2
                j -= 1
            else:
                state = 1

    aligned_seq1 = "".join(reversed(aligned_seq1))
    aligned_seq2 = "".join(reversed(aligned_seq2))
    
    return final_score, aligned_seq1, aligned_seq2

def smith_waterman_affine(seq1, seq2, gap_open=-10, gap_extend=-0.5):
    m, n = len(seq1), len(seq2)
    matrix = get_blosum62()
    
    M = np.zeros((m + 1, n + 1))
    X = np.zeros((m + 1, n + 1))
    Y = np.zeros((m + 1, n + 1))
    
    max_score = 0
    max_i, max_j = 0, 0
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            match_score = get_score(matrix, seq1[i-1], seq2[j-1])
            
            X[i, j] = max(0, M[i-1, j] + gap_open, X[i-1, j] + gap_extend)
            Y[i, j] = max(0, M[i, j-1] + gap_open, Y[i, j-1] + gap_extend)
            M[i, j] = max(0, match_score + M[i-1, j-1], match_score + X[i-1, j-1], match_score + Y[i-1, j-1])
            
            if M[i, j] > max_score:
                max_score = M[i, j]
                max_i, max_j = i, j
                
    aligned_seq1 = []
    aligned_seq2 = []
    i, j = max_i, max_j
    
    while i > 0 and j > 0 and M[i, j] > 0:
        match_score = get_score(matrix, seq1[i-1], seq2[j-1])
        
        if M[i, j] == match_score + M[i-1, j-1]:
            aligned_seq1.append(seq1[i-1])
            aligned_seq2.append(seq2[j-1])
            i -= 1; j -= 1
        elif M[i, j] == match_score + X[i-1, j-1]:
            aligned_seq1.append(seq1[i-1])
            aligned_seq2.append(seq2[j-1])
            i -= 1; j -= 1
        elif M[i, j] == match_score + Y[i-1, j-1]:
            aligned_seq1.append(seq1[i-1])
            aligned_seq2.append(seq2[j-1])
            i -= 1; j -= 1
        elif M[i, j] == X[i, j]:
            aligned_seq1.append(seq1[i-1])
            aligned_seq2.append('-')
            i -= 1
        elif M[i, j] == Y[i, j]:
            aligned_seq1.append('-')
            aligned_seq2.append(seq2[j-1])
            j -= 1
        else:
            break

    aligned_seq1 = "".join(reversed(aligned_seq1))
    aligned_seq2 = "".join(reversed(aligned_seq2))
    
    return max_score, aligned_seq1, aligned_seq2

if __name__ == "__main__":
    s1 = "HEAGAWGHEE"
    s2 = "PAWHEAE"

    score, al1, al2 = needleman_wunsch_affine(s1, s2)
    print(f"NW global score: {score}\n{al1}\n{al2}")

    score_sw, al1_sw, al2_sw = smith_waterman_affine(s1, s2)
    print(f"\nSW local score: {score_sw}\n{al1_sw}\n{al2_sw}")
