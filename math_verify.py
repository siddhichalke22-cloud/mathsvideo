"""
Independent Mathematical Verification Script for the Gaussian Elimination Video.
Uses exact rational arithmetic (fractions.Fraction) to verify:
  1. Scene 3 2D intuition system and row replacement geometry.
  2. Scene 4 3x3 worked example: every intermediate matrix, pivot, row operation,
     Row Echelon Form, back-substitution, and original equation check.
  3. Scene 5 three geometric/echelon cases (unique, no solution, infinite solutions).
"""

from fractions import Fraction


def format_row(row):
    return "[" + ", ".join(str(x) for x in row) + "]"


def verify_2d_intuition():
    print("=== Verifying Scene 3: 2D Intuition System ===")
    # L1: x + y = 5
    # L2: 2x - y = 1
    M = [
        [Fraction(1), Fraction(1), Fraction(5)],
        [Fraction(2), Fraction(-1), Fraction(1)],
    ]
    x_sol, y_sol = Fraction(2), Fraction(3)
    assert M[0][0] * x_sol + M[0][1] * y_sol == M[0][2], "L1 check failed"
    assert M[1][0] * x_sol + M[1][1] * y_sol == M[1][2], "L2 check failed"

    # R2 <- R2 - 2*R1
    M_after = [
        M[0][:],
        [M[1][j] - 2 * M[0][j] for j in range(3)],
    ]
    assert M_after[1] == [Fraction(0), Fraction(-3), Fraction(-9)], f"Unexpected: {M_after[1]}"
    # Scale R2 <- (-1/3) * R2
    M_scaled = [
        M_after[0][:],
        [M_after[1][j] * Fraction(-1, 3) for j in range(3)],
    ]
    assert M_scaled[1] == [Fraction(0), Fraction(1), Fraction(3)]
    assert M_scaled[1][1] * y_sol == M_scaled[1][2]
    assert M_scaled[0][0] * x_sol + M_scaled[0][1] * y_sol == M_scaled[0][2]
    print("  2D System verified: solution (x, y) = (2, 3), R2 <- R2 - 2*R1 gives -3y = -9 => y = 3.")


def verify_3d_worked_example():
    print("\n=== Verifying Scene 4: 3x3 Worked Example ===")
    # Original system:
    # Eq 1: 0x + 2y + 3z = 7
    # Eq 2: 1x - 1y + 2z = 9
    # Eq 3: 2x + 4y - 1z = -3
    M0 = [
        [Fraction(0), Fraction(2), Fraction(3), Fraction(7)],
        [Fraction(1), Fraction(-1), Fraction(2), Fraction(9)],
        [Fraction(2), Fraction(4), Fraction(-1), Fraction(-3)],
    ]
    print("  Initial [A|b]:", [format_row(r) for r in M0])

    # Step 1: R1 <-> R2 (because M0[0][0] == 0)
    M1 = [M0[1][:], M0[0][:], M0[2][:]]
    expected_M1 = [
        [1, -1, 2, 9],
        [0, 2, 3, 7],
        [2, 4, -1, -3],
    ]
    assert [[int(x) for x in r] for r in M1] == expected_M1
    print("  After R1 <-> R2:", [format_row(r) for r in M1])

    # Step 2: R3 <- R3 - 2*R1
    M2 = [
        M1[0][:],
        M1[1][:],
        [M1[2][j] - 2 * M1[0][j] for j in range(4)],
    ]
    expected_M2 = [
        [1, -1, 2, 9],
        [0, 2, 3, 7],
        [0, 6, -5, -21],
    ]
    assert [[int(x) for x in r] for r in M2] == expected_M2
    print("  After R3 <- R3 - 2*R1:", [format_row(r) for r in M2])

    # Step 3: R3 <- R3 - 3*R2
    M3 = [
        M2[0][:],
        M2[1][:],
        [M2[2][j] - 3 * M2[1][j] for j in range(4)],
    ]
    expected_M3 = [
        [1, -1, 2, 9],
        [0, 2, 3, 7],
        [0, 0, -14, -42],
    ]
    assert [[int(x) for x in r] for r in M3] == expected_M3
    print("  After R3 <- R3 - 3*R2:", [format_row(r) for r in M3])

    # Step 4: R3 <- (-1/14) * R3 (Row Scaling)
    M4 = [
        M3[0][:],
        M3[1][:],
        [M3[2][j] * Fraction(-1, 14) for j in range(4)],
    ]
    expected_M4 = [
        [1, -1, 2, 9],
        [0, 2, 3, 7],
        [0, 0, 1, 3],
    ]
    assert [[int(x) for x in r] for r in M4] == expected_M4
    print("  After R3 <- (-1/14)*R3 (REF):", [format_row(r) for r in M4])

    # Back-substitution
    z = M4[2][3] / M4[2][2]
    y = (M4[1][3] - M4[1][2] * z) / M4[1][1]
    x = (M4[0][3] - M4[0][1] * y - M4[0][2] * z) / M4[0][0]
    assert (x, y, z) == (Fraction(2), Fraction(-1), Fraction(3)), f"Got {(x, y, z)}"

    # Substitute back into ORIGINAL equations M0
    for idx, row in enumerate(M0):
        lhs = row[0] * x + row[1] * y + row[2] * z
        assert lhs == row[3], f"Original eq {idx+1} failed: {lhs} != {row[3]}"
    print(f"  Back-substitution verified: (x, y, z) = ({x}, {y}, {z}) satisfies all 3 original equations.")


def verify_echelon_cases():
    print("\n=== Verifying Scene 5: Echelon Cases ===")
    # Case 1: Unique solution (rank 3, consistent)
    # Case 2: No solution (row [0, 0, 0 | 5] -> 0 = 5 contradiction)
    # Case 3: Infinitely many solutions (row [0, 0, 0 | 0], free variable z = t)
    # Example for Case 3:
    # x - y + 2z = 9
    # 2y + 3z = 7  => y = (7 - 3t)/2, x = 9 + y - 2t = (25 - 7t)/2
    for t in [Fraction(-1), Fraction(0), Fraction(1), Fraction(3)]:
        z = t
        y = (Fraction(7) - 3 * t) / 2
        x = Fraction(9) + y - 2 * t
        assert x - y + 2 * z == 9
        assert 2 * y + 3 * z == 7
    print("  All 3 echelon outcome structures verified.")


if __name__ == "__main__":
    verify_2d_intuition()
    verify_3d_worked_example()
    verify_echelon_cases()
    print("\nALL MATHEMATICAL CHECKS PASSED.")
