# Narration Script & Scene Timeline

**Topic:** Gaussian Elimination (`Linear Algebra and Calculus M3`)  
**Target Pace:** ~160 WPM with deliberate visual pauses between algebraic steps.

---

## Scene 1: Hook & Context
- **Beat `s1_intro`**: Welcome to Linear Algebra and Calculus M three. Today, we will uncover how Gaussian elimination systematically solves systems of linear equations.
- **Beat `s1_question`**: Imagine three unknown quantities linked by three coupled equations. Substituting variables one by one quickly becomes messy. How can we transform any linear system into a clean staircase where the answer practically reads itself?
- **Beat `s1_bridge`**: That algorithm is Gaussian elimination, and today you will see both the algebra and the geometry behind why it always works.

## Scene 2: Concept Introduction & Notation
- **Beat `s2_objective`**: By the end of this video, you will understand why elementary row operations preserve solutions, reduce an augmented matrix to row echelon form, and recover the solution via back-substitution.
- **Beat `s2_augmented`**: First, let us set up our notation. A system A x equals b can be packaged into a single augmented matrix, separating the coefficient matrix A on the left from the constant vector b on the right.
- **Beat `s2_ops`**: To simplify this matrix without changing its solution, we are allowed only three elementary row operations. First, row swapping, which exchanges two rows. Second, row scaling, which multiplies a row by any nonzero constant. Third, row replacement, which adds a multiple of one row to another.
- **Beat `s2_ref`**: Our target is row echelon form: a staircase where the first nonzero entry in each row, called a pivot, sits strictly to the right of the pivot above it, with all zeros below every pivot.

## Scene 3: Visual Intuition (2D & 3D)
- **Beat `s3_2d_setup`**: Before crunching numbers in three dimensions, let us see why these operations work in two dimensions. Consider x plus y equals five, and two x minus y equals one. These two equations are two lines intersecting at the point two, three.
- **Beat `s3_2d_swap_scale`**: What does swapping rows do geometrically? It only reorders the labels; the two lines stay fixed. What about scaling a row by two? Every point that satisfies x plus y equals five also satisfies two x plus two y equals ten, so the line itself does not move.
- **Beat `s3_2d_replace`**: Now watch row replacement: row two becomes row two minus two times row one. Watch the amber line pivot smoothly around the intersection point two, three until it becomes completely horizontal: negative three y equals negative nine, or y equals three!
- **Beat `s3_2d_why`**: Why did it stay pinned to two, three? Because at the intersection, both equations are true, so any weighted combination of them is also true at that exact point.
- **Beat `s3_3d_planes`**: In three dimensions, each equation represents a flat plane. Gaussian elimination pivots those planes around their shared intersections until the final equation is an axis-aligned horizontal plane, revealing z directly.

## Scene 4: Worked 3×3 Example
- **Beat `s4_setup`**: Now let us solve a three-by-three system step by step: two y plus three z equals seven; x minus y plus two z equals nine; and two x plus four y minus z equals negative three. We write this as an augmented matrix.
- **Beat `s4_swap`**: Look at the top-left entry in row one: it is zero! We cannot use zero as a pivot, so our first step is a row swap: swap row one and row two. Now a clean pivot of one sits in the top-left corner, and row two already has a zero below it.
- **Beat `s4_elim1`**: Next, we eliminate the two in row three, column one. We perform row replacement: row three becomes row three minus two times row one. Computing entry by entry: two minus two is zero; four minus negative two is six; negative one minus four is negative five; and negative three minus eighteen is negative twenty-one.
- **Beat `s4_elim2`**: Column one is cleared! Now we move down-right to our second pivot: the two in row two, column two. To eliminate the six directly below it, replace row three with row three minus three times row two. Six minus six gives zero; negative five minus nine gives negative fourteen; and negative twenty-one minus twenty-one gives negative forty-two.
- **Beat `s4_scale`**: Notice our staircase of pivots: one, two, and negative fourteen, with all zeros below. Let us also apply row scaling to row three by multiplying by negative one over fourteen, turning the third pivot into one and the constant into three.
- **Beat `s4_backsub`**: We have reached row echelon form! Now back-substitution climbs back up the staircase. Row three gives z equals three. Substituting z equals three into row two gives two y plus nine equals seven, so y equals negative one. Finally, row one gives x minus negative one plus six equals nine, so x equals two.
- **Beat `s4_verify`**: Always check by substitution in the original equations: two times negative one plus three times three is seven; two minus negative one plus six is nine; and four minus four minus three is negative three. Every equation checks out!

## Scene 5: Interpretation & Echelon Outcomes
- **Beat `s5_unique`**: What does row echelon form tell us about the geometry? In our example, we found three pivots—one in every variable column—meaning our three planes intersect at a single unique point: two, negative one, three.
- **Beat `s5_cases`**: More generally, inspecting the bottom row of row echelon form reveals all three possibilities for any linear system. If every variable has a pivot, there is one unique solution. If a row reduces to zeros on the left and a nonzero constant on the right, such as zero equals five, the system is inconsistent and has no solution. And if an entire row vanishes to zero equals zero, leaving a free variable, the planes intersect in a line or plane with infinitely many solutions.

## Scene 6: Summary & Credits
- **Beat `s6_takeaways`**: Let us recap three core takeaways. First, elementary row operations—swap, scale, and replace—never alter the solution set. Second, Gaussian elimination clears entries below each pivot to build a staircase called row echelon form. Third, back-substitution solves from the bottom up, while the pivot structure reveals whether a system has one, zero, or infinitely many solutions.
- **Beat `s6_credits`**: Thank you for watching. All animations were programmatically rendered from source code, with mathematical verification and credits displayed on screen.
