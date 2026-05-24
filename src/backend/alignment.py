import numpy as np
from Bio.Align import substitution_matrices

def get_blosum62():
    # Load BLOSUM62 langsung dari biopython
    return substitution_matrices.load("BLOSUM62")

def get_score(matrix, a, b):
    # Mengambil skor substitusi. Jika ada karakter tak dikenal (misal 'X' atau '*'), set penalti
    try:
        return matrix[a, b]
    except KeyError:
        try:
            return matrix[b, a]
        except KeyError:
            return -4  # Penalti default untuk karakter invalid/mismatch tak terdaftar

def needleman_wunsch_affine(seq1, seq2, gap_open=-10, gap_extend=-0.5):
    m, n = len(seq1), len(seq2)
    matrix = get_blosum62()
    
    # 1. Inisialisasi Matriks DP (M, X, Y)
    M = np.full((m + 1, n + 1), -np.inf) # Matriks Match/Mismatch
    X = np.full((m + 1, n + 1), -np.inf) # Matriks Gap di seq2 (Insertion)
    Y = np.full((m + 1, n + 1), -np.inf) # Matriks Gap di seq1 (Deletion)
    
    M[0, 0] = 0
    for i in range(1, m + 1):
        X[i, 0] = gap_open + (i - 1) * gap_extend
    for j in range(1, n + 1):
        Y[0, j] = gap_open + (j - 1) * gap_extend
        
    # 2. Pengisian Matriks (Forward Pass)
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            match_score = get_score(matrix, seq1[i-1], seq2[j-1])
            
            # Update gap matrices
            X[i, j] = max(M[i-1, j] + gap_open, X[i-1, j] + gap_extend)
            Y[i, j] = max(M[i, j-1] + gap_open, Y[i, j-1] + gap_extend)
            
            # Update match matrix
            M[i, j] = match_score + max(M[i-1, j-1], X[i-1, j-1], Y[i-1, j-1])
            
    # 3. Proses Traceback (Mencari Jalur Optimal dari Ujung Kanan Bawah)
    aligned_seq1 = []
    aligned_seq2 = []
    
    i, j = m, n
    
    # Tentukan darimana kita mulai (M=0, X=1, Y=2)
    scores = [M[i, j], X[i, j], Y[i, j]]
    state = scores.index(max(scores))
    final_score = max(scores)
    
    while i > 0 or j > 0:
        if state == 0: # Berada di status Match/Mismatch (Diagonal)
            if i > 0 and j > 0:
                aligned_seq1.append(seq1[i-1])
                aligned_seq2.append(seq2[j-1])
                match_score = get_score(matrix, seq1[i-1], seq2[j-1])
                
                # Lacak darimana diagonal ini berasal
                if M[i, j] == match_score + M[i-1, j-1]: state = 0
                elif M[i, j] == match_score + X[i-1, j-1]: state = 1
                else: state = 2
                
                i -= 1; j -= 1
            else:
                state = 1 if i > 0 else 2
                
        elif state == 1: # Berada di status Gap seq2 (Atas)
            if i > 0:
                aligned_seq1.append(seq1[i-1])
                aligned_seq2.append('-')
                
                if X[i, j] == M[i-1, j] + gap_open: state = 0
                else: state = 1
                
                i -= 1
            else:
                state = 2
                
        elif state == 2: # Berada di status Gap seq1 (Kiri)
            if j > 0:
                aligned_seq1.append('-')
                aligned_seq2.append(seq2[j-1])
                
                if Y[i, j] == M[i, j-1] + gap_open: state = 0
                else: state = 2
                
                j -= 1
            else:
                state = 1

    # Balik array karakter dan gabungkan jadi string utuh
    aligned_seq1 = "".join(reversed(aligned_seq1))
    aligned_seq2 = "".join(reversed(aligned_seq2))
    
    return final_score, aligned_seq1, aligned_seq2

# ----- BLOK TESTER (Dijalankan hanya jika file ini dieksekusi langsung) -----
if __name__ == "__main__":
    print("Menguji Algoritma Alignment...")
    s1 = "HEAGAWGHEE"
    s2 = "PAWHEAE"
    
    score, al1, al2 = needleman_wunsch_affine(s1, s2)
    print(f"Sekuens 1: {s1}")
    print(f"Sekuens 2: {s2}")
    print(f"Skor Akhir: {score}")
    print("Hasil Alignment:")
    print(al1)
    print(al2)
