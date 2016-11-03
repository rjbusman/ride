//generated by tools/lb-gen.dyalog
D.lb={//language bar information
html:"<b class='first last'>←</b> <b class=first>+</b><b>-</b><b>×</b><b>÷</b><b>*</b><b>⍟</b><b>⌹</b><b>○</b><b>!</b><b class=last>?</b> <b class=first>|</b><b>⌈</b><b>⌊</b><b>⊥</b><b>⊤</b><b>⊣</b><b class=last>⊢</b> <b class=first>=</b><b>≠</b><b>≤</b><b>&lt;</b><b>&gt;</b><b>≥</b><b>≡</b><b class=last>≢</b> <b class=first>∨</b><b>∧</b><b>⍲</b><b class=last>⍱</b> <b class=first>↑</b><b>↓</b><b>⊂</b><b>⊃</b><b>⌷</b><b>⍋</b><b class=last>⍒</b> <b class=first>⍳</b><b>⍷</b><b>∪</b><b>∩</b><b>∊</b><b>~</b><b class=last>⍸</b> <b class=first>/</b><b>\\</b><b>⌿</b><b class=last>⍀</b> <b class=first>,</b><b>⍪</b><b>⍴</b><b>⌽</b><b>⊖</b><b class=last>⍉</b> <b class=first>¨</b><b>⍨</b><b>⍣</b><b>.</b><b>∘</b><b class=last>⍤</b> <b class=first>⍞</b><b>⎕</b><b>⍠</b><b>⌸</b><b>⌶</b><b>⍎</b><b class=last>⍕</b> <b class=first>⋄</b><b>⍝</b><b>→</b><b>⍵</b><b>⍺</b><b>∇</b><b class=last>&amp;</b> <b class=first>¯</b><b class=last>⍬</b>",
tips:{
"←":["Left Arrow (←)","Dyadic function:   Assignment\n\n      X←3 5⍴'ABCDEFG'\n      X\nABCDE\nFGABC\nDEFGA\n\n      X,←3 4 5\n      X\nABCDE 3\nFGABC 4\nDEFGA 5"],
"+":["Plus (+)","Monadic function:  Conjugate\n\n      + 3.2 ¯12.666 1j1 2j¯2\n3.2 ¯12.666 1J¯1 2J2\n\nDyadic function:   Plus\n\n      1 2 3 4 + 5 6 7 8\n6 8 10 12"],
"-":["Minus (-)","Monadic function:  Negate\n\n      - 3 2 5.5 ¯7 0\n¯3 ¯2 ¯5.5 7 0\n\nDyadic function:   Minus\n\n      3 7 9 - 5\n¯2 2 4"],
"×":["Times (×)","Monadic function:  Direction\n\n      × 3 2 ¯2 0 8\n1 1 ¯1 0 1\n\nDyadic function:   Times\n\n      2 ¯8 2 5 4 × 3 2 ¯2 0 8\n6 ¯16 ¯4 0 32"],
"÷":["Divide (÷)","Monadic function:  Reciprocal\n\n      ÷ 1 2 3\n1 0.5 0.33333333\n\nDyadic function:   Divide\n\n      1 2 3 4 ÷ 5 6 7 8\n0.2 0.33333333 0.42857143 0.5"],
"*":["Star (*)","Monadic function:  Exponential\n\n      * 2 2⍴1 2 3 4\n 2.7182818  7.3890561\n20.085537  54.59815\n\nDyadic function:   Power\n\n     (2 2⍴1 2 3 4) * 2 2⍴1 2 3 4\n 1   4\n27 256"],
"⍟":["Log (⍟)","Monadic function:  Natural Logarithm\n\n      ⍟ 1 2 3 2.718281828\n0 0.69314718 1.0986123 1\n\nDyadic function:   Logarithm\n\n      10 ⍟ 1 10 100 1000\n0 1 2 3"],
"⌹":["Domino (⌹)","Monadic function:  Matrix Inverse\n\n      ⌹ 2 2⍴1 2 3 4\n¯2    1\n 1.5 ¯0.5\n\nDyadic function:   Matrix Divide\n\n      5 6 ⌹ 2 2⍴1 2 3 4\n¯4 4.5"],
"○":["Circle (○)","Monadic function:  Pi Times\n\n      ○ 0 1 2\n0 3.1415927 6.2831853\n\nDyadic function:   Circular Function\n\n      1 ○ 0 1.5707963 3.1415927\n0 1 ¯4.6410207E¯8\n\nN.B.: Trigonometric function identified by value of left argument."],
"!":["Exclamation Mark (!)","Monadic function:  Factorial\n\n      ! 3 10 ¯0.11\n6 3628800 1.0768307\n\nDyadic function:   Binomial\n\n      2 1 3 ! 3 10 ¯0.11\n3 10 ¯0.0429385"],
"?":["Question Mark (?)","Monadic function:  Roll\n\n      ? 1000 1000 1000 9000\n756 459 533 1971\n\nDyadic function:   Deal\n\n      7 ? 1000\n67 418 687 589 931 847 527"],
"|":["Stile (|)","Monadic function:  Magnitude\n\n      | 2.3 4 ¯2 0\n2.3 4 2 0\n\nDyadic function:   Residue\n\n      2 | 2.3 4 ¯2 0 ¯2.3\n0.3 0 0 0 1.7"],
"⌈":["Upstile (⌈)","Monadic function:  Ceiling\n\n      ⌈ 3.4 2 8.1 ¯3.44 0\n4 2 9 ¯3 0\n\nDyadic function:   Maximum\n\n      3 1.1 ¯2 ⌈ 3.4 8.1 ¯3.44\n3.4 8.1 ¯2"],
"⌊":["Downstile (⌊)","Monadic function:  Floor\n\n      ⌊ 3.4 ¯2.1 8.1 3 0\n3 ¯3 8 3 0\n\nDyadic function:   Minimum\n\n      3  1.1 ¯2 ⌊ 3.4  8.1 ¯3.44\n3 1.1 ¯3.44"],
"⊥":["Up Tack (⊥)","Dyadic function:   Decode\n\n      2 ⊥ 2 3⍴0 1 1 1 0 1\n1 2 3\n\n      2 ⊥ 1 2 3 4\n26"],
"⊤":["Down Tack (⊤)","Dyadic function:   Encode\n\n      2 2 2 2 2 2 ⊤ 8 16 32\n0 0 1\n0 1 0\n1 0 0\n0 0 0\n0 0 0\n0 0 0\n\n      2 ⊤ 1 2 3 4\n1 0 1 0"],
"⊣":["Left Tack (⊣)","Monadic function:  Same\n\n      ⊣  1 2 3\n1 2 3\n\nDyadic function:   Left\n\n      'Left' ⊣ 'Right'\nLeft"],
"⊢":["Right Tack (⊢)","Monadic function:  Same\n\n      ⊢  1 2 3\n1 2 3\n\nDyadic function:   Right\n\n      'Left' ⊢ 'Right'\nRight"],
"=":["Equal (=)","Dyadic function:   Equal To\n\n      2 = 2 2 ¯2 0 8\n1 1 0 0 0"],
"≠":["Not Equal (≠)","Dyadic function:   Not Equal To (XOR)\n\n      3 ≠ 2 2 2⍴1 2 3\n1 1\n0 1\n\n1 0\n1 1\n\n      0 1 0 1 ≠ 0 0 1 1\n0 1 1 0"],
"≤":["Less Than Or Equal To (≤)","Dyadic function:   Less Than or Equal To\n\n      2 ¯8 2 5 4 ≤ 2 2 ¯2 0 8\n1 1 0 0 1"],
"<":["Less Than (<)","Dyadic function:   Less Than\n\n      2 ¯8 2 5 4 < 2 2 ¯2 0 8\n0 1 0 0 1"],
">":["Greater Than (>)","Dyadic function:   Greater Than\n\n      2 ¯8 2 5 4 > 2 2 ¯2 0 8\n0 0 1 1 0"],
"≥":["Greater Than Or Equal To (≥)","Dyadic function:   Greater Than or Equal To\n\n       2 ¯8 2 5 4 ≥ 2 2 ¯2 0 8\n1 0 1 1 0"],
"≡":["Equal Underbar (≡)","Monadic function:  Depth\n\n      ≡ 1 (1 2)('ab' 'def')\n¯3\n\nN.B.: Result is always positive if ⎕ML≥2.\n\nDyadic function:   Match\n\n      'b' 'e' 'x'≡  'bex'\n1"],
"≢":["Equal Underbar Slash (≢)","Monadic function:  Tally\n\n      ≢ 5 4 3⍴0\n5\n\nDyadic function:   Not Match\n\n      'bex' ≢ 'b','e','x'\n0"],
"∨":["Logical OR (∨)","Dyadic function:   Greatest Common Divisor/OR\n\n      0 1 0 1 ∨ 0 0 1 1\n0 1 1 1\n\n      15 1 2 7 ∨ 35 1 4 0\n5 1 2 7"],
"∧":["Logical AND (∧)","Dyadic function:   Lowest Common Multiple/AND\n\n      0 1 0 1 ∧ 0 0 1 1\n0 0 0 1\n\n      15 1 2 7 ∧ 35 1 4 0\n105 1 4 0"],
"⍲":["Logical NAND (⍲)","Dyadic function:   NAND\n\n      0 1 0 1 ⍲ 0 0 1 1\n1 1 1 0"],
"⍱":["Logical NOR (⍱)","Dyadic function:   NOR\n\n      0 1 0 1 ⍱ 0 0 1 1\n1 0 0 0"],
"↑":["Up Arrow (↑)","Monadic function:  ⎕ML ≤ 1 Mix, ⎕ML ≥2 First)\n\n      ⎕ML←0 ⋄ ↑ (6 4) 5 3\n6 4\n5 0\n3 0\n\n      ⎕ML←3 ⋄ ↑ (6 4) 5 3\n6 4\n\nDyadic:   Take\n\n      2 3↑7\n7 0 0\n0 0 0\n\n      ¯5↑1 2 3\n0 0 1 2 3"],
"↓":["Down Arrow (↓)","Monadic function:  Split\n\n      ↓ 3 3⍴1 2 3 4\n 1 2 3  4 1 2  3 4 1\n\nDyadic function:   Drop\n\n      1 1 ↓ 3 3⍴⍳18\n5 6\n8 9\n      ¯1 1 ↓ 3 3⍴⍳18\n2 3\n5 6"],
"⊂":["Left Shoe (⊂)","Monadic function:  Enclose\n\n      ⊂ 1 (2 2) (2 2⍴3)\n 1  2 2  3 3\n         3 3\n\nDyadic function:   ⎕ML ≤ 2 Partitioned Enclose, ⎕ML = 3 Partition\n\n      ⎕ML←0 ⋄ 0 1 0 1 ⊂ 1 2 3 4\n 2 3  4\n\n      ⎕ML←3 ⋄ 0 1 0 1 ⊂ 1 2 3 4\n 2  4"],
"⊃":["Right Shoe (⊃)","Monadic function:  ⎕ML ≤ 1 First, ⎕ML ≥2 Mix\n\n      ⎕ML←0 ⋄ ⊃ (2 2)(3 3 3)\n2 2\n\n      ⎕ML←3 ⋄ ⊃ (2 2)(3 3 3)\n2 2 0\n3 3 3\n\nDyadic function:   Pick\n\n      2 ⊃ (2 2)(2 3⍴3)\n3 3 3\n3 3 3"],
"⌷":["Squad (⌷)","Monadic function:  Materialise\n      ⌷ 1 2 3 4\n1 2 3 4\n\n N.B.  imc.Item≡⌷imc if imc is an instance of a class for\n which Item is the default property\n\nDyadic function:   Index\n\n      2 3⌷4 3⍴⍳12\n6\n\n      2⌷[1]⍳2 3 4\n 2 1 1  2 1 2  2 1 3  2 1 4\n 2 2 1  2 2 2  2 2 3  2 2 4\n 2 3 1  2 3 2  2 3 3  2 3 4"],
"⍋":["Grade Up (⍋)","Monadic function:  Grade Up\n      ⍋ 3 1 4 6 2\n2 5 1 3 4\n\nDyadic function:   Dyadic Grade Up\n\n      'ABCDEFG'⍋'CDEDEDE'\n1 2 4 6 3 5 7"],
"⍒":["Grade Down (⍒)","Monadic function:  Grade Down\n\n      ⍒ 3 1 4 6 2\n4 3 1 5 2\n\nDyadic function:   Dyadic Grade Down\n\n      'ABCDEFG' ⍒ 'CDEDEDE'\n3 5 7 2 4 6 1"],
"⍳":["Iota (⍳)","Monadic function:  Index Generator\n\n      ⍳10\n1 2 3 4 5 6 7 8 9 10\n\nDyadic function:   Index Of\n\n      'ABCDABCDEF' ⍳ 'ACF'\n1 3 10"],
"⍷":["Epsilon Underbar (⍷)","Dyadic function:   Find\n\n      'AN' ⍷ 'BANANA'\n0 1 0 1 0 0\n\n      0 0 ⍷ 4 4⍴0 1 0\n0 0 1 0\n0 1 0 0\n1 0 0 0\n0 0 1 0"],
"∪":["Down Shoe (∪)","Monadic function:  Unique\n\n      ∪ 'ab' 'ba' 'ab' 1 1 2\n ab  ba  1 2\n\nDyadic function:   Union\n\n      'ab' 'cde' 'fg' ∪ 'a' 'ab'\n ab  cde  fg a"],
"∩":["Up Shoe (∩)","Dyadic function:   Intersection\n\n      22 'ab' 'fg' ∩ 'a' 'ab' 22\n22  ab"],
"∊":["Epsilon (∊)","Monadic function:  Enlist (Type if ⎕ML=0)\n\n      ⎕ML←0 ⋄ ∊ 3 3⍴1 'abc'\n   0         0\n        0\n   0         0\n\n      ⎕ML←1 ⋄ ∊ 3 3⍴1 'abc'\n\n1 abc 1 abc 1 abc 1 abc 1\n\nDyadic function:   Membership\n\n      'abc' 1.1 ∊ 1.1 'ab' 'abcd'\n0 1"],
"~":["Tilde (~)","Monadic function:  NOT\n\n      ~ 3 3⍴0 1\n1 0 1\n0 1 0\n1 0 1\n\nDyadic function:   Without\n\n      'ab' 'ce' 'fg' ~ 'ce' 'ab'\n fg"],
"⍸":["Iota Underbar (⍸)","Monadic function:  Where\n\n      ⍸ 1 0 0 1 1\n1 4 5\n\nDyadic function:   Interval Index\n\n      'AEIOU' ⍸ 'DYALOG'\n1 5 1 3 4 2"],
"/":["Slash (/)","Dyadic function:   Replicate\n\n      2 1 3 3 / 3.1 4 1 3.2\n3.1 3.1 4 1 1 1 3.2 3.2 3.2\n\nMonadic operator:  Reduce\n\n      ∧/ 2 3 4⍴1 1 1 1 0\n1 0 0\n0 0 1\n\n      ¯2 -/ 1 3 4 1 ⍝ N-Wise Reduce\n2 1 ¯3"],
"\\":["Backslash (\\)","Dyadic function:   Expand\n\n      3 ¯2 4 \\ 3 2⍴1.1 2.2 3.3\n1.1 1.1 1.1 0 0 2.2 2.2 2.2 2.2\n3.3 3.3 3.3 0 0 1.1 1.1 1.1 1.1\n2.2 2.2 2.2 0 0 3.3 3.3 3.3 3.3\n\nMonadic operator:  Scan\n\n      +\\ 1 2 3 4 5 6 7 8 9 10\n1 3 6 10 15 21 28 36 45 55"],
"⌿":["Slash Bar (⌿)","Dyadic function:   Replicate First\n\n      2 3 ⌿ 2 29⍴'NETHOTSONDS1'\nNETHOTSONDS1NETHOTSONDS1NETHO\nNETHOTSONDS1NETHOTSONDS1NETHO\nTSONDS1NETHOTSONDS1NETHOTSOND\nTSONDS1NETHOTSONDS1NETHOTSOND\nTSONDS1NETHOTSONDS1NETHOTSOND\n\nMonadic operator:  Reduce First\n\n      +⌿ 10 3⍴5\n50 50 50"],
"⍀":["Backslash Bar (⍀)","Dyadic function:   Expand First\n\n      0 1 1 2 ⍀ 3 6⍴'ABCDE'\n\nABCDEA\nBCDEAB\nCDEABC\nCDEABC\n\nMonadic operator:  Scan First\n\n      =⍀ 5 6⍴0 1 0\n0 1 0 0 1 0\n1 1 1 1 1 1\n0 1 0 0 1 0\n1 1 1 1 1 1\n0 1 0 0 1 0\n\n      +⍀2 3 ⍴ ⍳6\n1 2 3\n5 7 9"],
",":["Comma (,)","Monadic function:  Ravel\n\n      , 2 2 2 2⍴3\n3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3\n\nDyadic function:   Catenate/Laminate\n\n      (2 3⍴9) , 2 4⍴8\n9 9 9 8 8 8 8\n9 9 9 8 8 8 8"],
"⍪":["Comma Bar (⍪)","Monadic function:  Table\n      ⍪ 2 3 4\n2\n3\n4\n\nDyadic function:   Catenate First/Laminate\n\n      (3 2⍴9) ⍪ 4 2⍴8\n9 9\n9 9\n9 9\n8 8\n8 8\n8 8\n8 8"],
"⍴":["Rho (⍴)","Monadic function:  Shape\n\n      ⍴ 15 3 7 8 75.53\n5\n\nDyadic function:   Reshape\n\n      2 3 4 ⍴ 15 3 7 8 75.53\n15     3     7     8\n75.53 15     3     7\n 8    75.53 15     3\n\n 7     8    75.53 15\n 3     7     8    75.53\n15     3     7     8"],
"⌽":["Circle Stile (⌽)","Monadic function:  Reverse\n\n      ⌽ 8 2 5 6.6 ¯2\n¯2 6.6 5 2 8\n\n      ⌽ 3 2 ⍴⍳6\n2 1\n4 3\n6 5\n\nDyadic function:   Rotate\n\n      1 2 ¯1 ⌽ 3 3⍴⍳9\n2 3 1\n6 4 5\n9 7 8"],
"⊖":["Circle Bar (⊖)","Monadic function:  Reverse First\n\n      ⊖ 3 2⍴1 2 3 4 5 6\n5 6\n3 4\n1 2\n\n       ⊖ 3 2 ⍴⍳6\n5 6\n3 4\n1 2\n\nDyadic function:   Rotate First\n\n      1 2 ⊖ 3 2⍴1 2 3 4 5 6\n3 6\n5 2\n1 4"],
"⍉":["Transpose (⍉)","Monadic function:  Transpose\n\n      ⍉ 3 3⍴1 2 3 4 5 6 7 8 9\n1 4 7\n2 5 8\n3 6 9\n\nDyadic function:   Dyadic Transpose\n\n      2 1 3 ⍉ 2 3 4⍴⍳24\n 1  2  3  4\n13 14 15 16\n\n 5  6  7  8\n17 18 19 20\n\n 9 10 11 12\n21 22 23 24"],
"¨":["Diaeresis (¨)","Monadic operator:  Each\n\n      ⊃¨ 1 2 3 'ABC' (9 8 7)\n1 2 3 A 9\n\n      3 ↑¨ 1 2 3 (2 3) 'A'\n 1 0 0  2 0 0  3 0 0  2 3 0  A"],
"⍨":["Tilde Diaeresis (⍨)","Monadic operator:  Commute\n\n      3.1243 - 4.1234 1 0   ⍝ ⍺ - ⍵\n¯0.9991 2.1243 3.1243\n\n      3.1243 -⍨ 4.1234 1 0  ⍝ ⍵ - ⍺\n0.9991 ¯2.124 ¯3.124\n\n      ×⍨5\n25"],
"⍣":["Star Diaeresis (⍣)","Dyadic operator:   Power\n\n      (↓ ⍣ 1) 2 2 2 2⍴⎕a    ⍝ split once\n AB  CD\n EF  GH\n\n IJ  KL\n MN  OP\n\n      (↓ ⍣ 2) 2 2 2 2⍴⎕a    ⍝ split twice\n  AB  CD    EF  GH\n  IJ  KL    MN  OP\n\n      (↓ ⍣ 3) 2 2 2 2⍴⎕a    ⍝ split thrice\n   AB  CD    EF  GH      IJ  KL    MN  OP\n\n      f←(32∘+)∘(×∘1.8)      ⍝ Fahrenheit from Celsius\n      f ¯273 ¯40 0 100\n¯459.4 ¯40 32 212\n\n      c←f ⍣ ¯1              ⍝ Inverse: Celsius from Fahrenheit\n      c ¯459.4 ¯40 32 212\n¯273 ¯40 0 100"],
".":["Dot (.)","Dyadic operator:   Inner Product/Outer Product\n\n      1 2 3 +.× 4 5 6\n32\n\n      1 2 3 ∘.× 4 5 6\n 4  5  6\n 8 10 12\n12 15 18"],
"∘":["Jot (∘)","Dyadic operator:   Compose\n\n      (* ∘ 0.5) 1 2 3 4 5\n1 1.4142136 1.7320508 2 2.236068\n\n      1 2 3 ∘.× 4 5 6\n 4  5  6\n 8 10 12\n12 15 18"],
"⍤":["Jot Diaeresis (⍤)","Dyadic operator:   Rank\n\n      (⍋ ⍤ 1) 2 3 ⍴ 'abczxy'\n1 2 3\n2 3 1\n\n      10 20 30 (+ ⍤ 0 1) 3 4 ⍴ ⍳ 12\n11 12 13 14\n25 26 27 28\n39 40 41 42"],
"⍞":["Quote Quad (⍞)","Niladic array:     Character Input\n\n      Input← ⍞\n(user types \"Bob Dylan\" and presses <Enter>)\n\n      Input\nBob Dylan"],
"⎕":["Quad (⎕)","Niladic array:     Evaluated Input\n\n      A← ⎕\n(user types \"1 3.4 4÷5\" and presses <Enter>)\n\n      A\n0.2 0.68 0.8"],
"⍠":["Quad Colon (⍠)","Dyadic operator:   Variant\n\n      ('a' ⎕R 'x') 'ABC'\nABC\n\n      ('a' ⎕R 'x' ⍠ 'IC' 1) 'ABC'\nxBC"],
"⌸":["Quad Equal (⌸)","Monadic operator:  Key\n\n      {⍺ ⍵}⌸ 'Mississippi'\nM 1\ni 2 5 8 11\ns 3 4 6 7\np 9 10\n\n      {≢⍵}⌸ 'Mississippi'\n1 4 4 2\n\n      'Mississippi' {+/⍵}⌸ 3 1 4 1 5 9 2 6 5 3 6\n3 18 16 8"],
"⌶":["I-Beam (⌶)","Monadic operator:  I-Beam\n\nProvides a range of system-related services\naccording to specific argument values.\n(see Dyalog Language Reference Guide)\n\n      (1111⌶)⍬  ⍝ Number of virtual processors\n4"],
"⍎":["Hydrant (⍎)","Monadic function:  Execute\n\n      ⍎ '1+1'\n2\n\nDyadic function:   Dyadic Execute\n\n      '⎕SE' ⍎ 'B←42'\n      ⎕SE.B\n42"],
"⍕":["Thorn (⍕)","Monadic function:  Format\n\n      ⍕ 0.0000003  3.87687857858\n3E¯7 3.8768786\n\nDyadic function:   Format By Specification\n\n      8 3 ⍕ 0.00003 3.87687\n   0.000   3.877"],
"⋄":["Diamond (⋄)","Statement separator: Separates a single line of code\n                     into 2 (or more) APL expressions.\n\n                     When a line of code is executed, the\n                     expressions separated by diamonds are\n                     evaluated sequentially from left to\n                     right.\n\n      A←10 ⋄ A+←1 ⋄ A÷2\n5.5"],
"⍝":["Lamp (⍝)","Any text to the right of the ⍝ symbol is\ncommentary and not executable code."],
"→":["Right Arrow (→)","Niladic syntax:    Abort\n\n      →\n\nMonadic syntax:  Branch\n\n      → Label1"],
"⍵":["Omega (⍵)","Right argument in direct functions\n\n      {(+/⍵)÷⍴⍵} 1 2 3 4    ⍝ Arithmetic Mean (Average)\n2.5"],
"⍺":["Alpha (⍺)","Left argument in direct functions\n\n      3 {⍵*÷⍺} 64     ⍝ ⍺th root\n4"],
"∇":["Del (∇)","Direct Function Self Reference (Recursion)\n\nfact←{          ⍝ Factorial ⍵.\n    ⍵≤1: 1      ⍝ Small ⍵, finished,\n    ⍵×∇ ⍵-1     ⍝ Otherwise recur.\n}"],
"&":["Ampersand (&)","Monadic operator:  Spawn\n\n      ⍎& '÷2 4'\n0.5 0.25\n\n      20÷&2 4\n10 5"],
"¯":["High Minus (¯)","If a number is prefixed by the ¯ symbol (also known as\n\"high minus\") it means that the number is negative.\n\n      1+¯1 0 1 ¯3\n0 1 2 ¯2"],
"⍬":["Zilde (⍬)","Niladic array:     Empty Numeric Vector\n\n      ⍬≡⍳0\n1\n      ⍬≢''\n1\n      ⍬≡0⍴0\n1"]
}
}
