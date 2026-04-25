import List "mo:core/List";
import CatalogTypes "../types/catalog";
import Common "../types/common";

module {
  public func getSubjects(
    subjects : List.List<CatalogTypes.Subject>
  ) : [CatalogTypes.Subject] {
    subjects.toArray()
  };

  public func getChapters(
    chapters : List.List<CatalogTypes.Chapter>,
    subjectId : Common.SubjectId
  ) : [CatalogTypes.Chapter] {
    chapters.filter(func(c) { c.subjectId == subjectId }).toArray()
  };

  public func getQuestions(
    questions : List.List<CatalogTypes.Question>,
    chapterId : Common.ChapterId,
    count : Nat
  ) : [CatalogTypes.Question] {
    let filtered = questions.filter(func(q) { q.chapterId == chapterId }).toArray();
    let total = filtered.size();
    if (total == 0 or count == 0) return [];
    let take = if (count >= total) total else count;
    // Deterministic pseudo-shuffle using index-based spreading
    let step = if (total > 3) (total / 3 + 1) else 1;
    let result = List.empty<CatalogTypes.Question>();
    var i = 0;
    var idx = 0;
    while (i < take) {
      result.add(filtered[idx % total]);
      idx := idx + step;
      if (idx >= total) idx := (idx - total) + 1;
      i := i + 1;
    };
    result.toArray()
  };

  public func getQuestionById(
    questions : List.List<CatalogTypes.Question>,
    questionId : Common.QuestionId
  ) : ?CatalogTypes.Question {
    questions.find(func(q) { q.id == questionId })
  };

  public func getChapterById(
    chapters : List.List<CatalogTypes.Chapter>,
    chapterId : Common.ChapterId
  ) : ?CatalogTypes.Chapter {
    chapters.find(func(c) { c.id == chapterId })
  };

  public func seedSampleData(
    subjects : List.List<CatalogTypes.Subject>,
    chapters : List.List<CatalogTypes.Chapter>,
    questions : List.List<CatalogTypes.Question>,
    nextSubjectId : { var value : Nat },
    nextChapterId : { var value : Nat },
    nextQuestionId : { var value : Nat }
  ) : () {
    // ─── Subjects ───────────────────────────────────────────────────────────
    let mathId = nextSubjectId.value;
    subjects.add({ id = mathId; name = "Mathematics"; description = "Core mathematical concepts from algebra to geometry" });
    nextSubjectId.value += 1;

    let scienceId = nextSubjectId.value;
    subjects.add({ id = scienceId; name = "Science"; description = "Fundamentals of physics and biology" });
    nextSubjectId.value += 1;

    let englishId = nextSubjectId.value;
    subjects.add({ id = englishId; name = "English Literature"; description = "Grammar, writing, and literary analysis skills" });
    nextSubjectId.value += 1;

    // ─── Chapters ────────────────────────────────────────────────────────────
    let algebraId = nextChapterId.value;
    chapters.add({ id = algebraId; subjectId = mathId; name = "Algebra Basics"; description = "Equations, variables, exponents, and factoring" });
    nextChapterId.value += 1;

    let geometryId = nextChapterId.value;
    chapters.add({ id = geometryId; subjectId = mathId; name = "Geometry Fundamentals"; description = "Shapes, area, perimeter, and angles" });
    nextChapterId.value += 1;

    let physicsId = nextChapterId.value;
    chapters.add({ id = physicsId; subjectId = scienceId; name = "Physics Principles"; description = "Motion, force, energy, and electricity" });
    nextChapterId.value += 1;

    let biologyId = nextChapterId.value;
    chapters.add({ id = biologyId; subjectId = scienceId; name = "Biology Basics"; description = "Cells, DNA, ecosystems, and evolution" });
    nextChapterId.value += 1;

    let grammarId = nextChapterId.value;
    chapters.add({ id = grammarId; subjectId = englishId; name = "Grammar & Writing"; description = "Parts of speech, punctuation, and sentence structure" });
    nextChapterId.value += 1;

    let literaryId = nextChapterId.value;
    chapters.add({ id = literaryId; subjectId = englishId; name = "Literary Analysis"; description = "Plot, theme, metaphor, and narrative" });
    nextChapterId.value += 1;

    // ─── Helper ──────────────────────────────────────────────────────────────
    let addQ = func(chId : Nat, text : Text, qtype : CatalogTypes.QuestionType, opts : [Text], answer : Text, diff : CatalogTypes.Difficulty, sol : ?Text) {
      questions.add({
        id = nextQuestionId.value;
        chapterId = chId;
        questionText = text;
        questionType = qtype;
        options = opts;
        correctAnswer = answer;
        difficulty = diff;
        solution = sol;
      });
      nextQuestionId.value += 1;
    };

    // ─── Algebra Basics questions (20) ───────────────────────────────────────
    // Algebra – MultipleChoice
    addQ(algebraId, "What is the value of x if 2x + 4 = 12?", #MultipleChoice, ["2", "4", "6", "8"], "4", #Easy,
      ?"Subtract 4 from both sides to get 2x = 8, then divide both sides by 2 to find x = 4.");

    addQ(algebraId, "Simplify: 3x + 2x", #MultipleChoice, ["5x", "6x", "5x²", "x⁵"], "5x", #Easy,
      ?"Combine like terms by adding the coefficients: 3 + 2 = 5, so 3x + 2x = 5x.");

    addQ(algebraId, "What is the solution to x² = 25?", #MultipleChoice, ["x = 5", "x = ±5", "x = -5", "x = 25"], "x = ±5", #Medium,
      ?"Taking the square root of both sides gives x = ±5, because both 5² = 25 and (-5)² = 25 are valid solutions.");

    addQ(algebraId, "Factor: x² - 9", #MultipleChoice, ["(x-3)(x+3)", "(x-9)(x+1)", "(x+3)²", "(x-3)²"], "(x-3)(x+3)", #Medium,
      ?"x² - 9 is a difference of squares: a² - b² = (a - b)(a + b), so x² - 9 = (x - 3)(x + 3).");

    addQ(algebraId, "What is the slope of y = 3x + 7?", #MultipleChoice, ["7", "3", "-3", "1/3"], "3", #Easy,
      ?"In slope-intercept form y = mx + b, m is the slope and b is the y-intercept. Here m = 3, so the slope is 3.");

    addQ(algebraId, "Solve for y: 3y - 6 = 9", #MultipleChoice, ["1", "3", "5", "7"], "5", #Easy,
      ?"Add 6 to both sides: 3y = 15, then divide by 3: y = 5.");

    addQ(algebraId, "What is 2³?", #MultipleChoice, ["6", "8", "9", "16"], "8", #Easy,
      ?"2³ means 2 multiplied by itself 3 times: 2 × 2 × 2 = 8.");

    addQ(algebraId, "Which expression equals (x + 2)²?", #MultipleChoice, ["x² + 4", "x² + 4x + 4", "x² + 2x + 4", "x² + 4x"], "x² + 4x + 4", #Medium,
      ?"Using FOIL: (x + 2)(x + 2) = x² + 2x + 2x + 4 = x² + 4x + 4. Remember to include the middle term.");

    // Algebra – TrueFalse
    addQ(algebraId, "The equation x² + 1 = 0 has real solutions.", #TrueFalse, ["True", "False"], "False", #Medium,
      ?"x² + 1 = 0 means x² = -1. Since no real number squared gives a negative result, there are no real solutions (only imaginary ones).");

    addQ(algebraId, "Any number raised to the power of 0 equals 1.", #TrueFalse, ["True", "False"], "True", #Easy,
      ?"By definition, any non-zero number raised to the power of 0 equals 1. For example, 5⁰ = 1, 100⁰ = 1.");

    addQ(algebraId, "2x + 3 = 3x + 2 has x = 1 as its solution.", #TrueFalse, ["True", "False"], "True", #Easy,
      ?"Subtract 2x from both sides: 3 = x + 2, then subtract 2: x = 1. Checking: 2(1) + 3 = 5 and 3(1) + 2 = 5. ✓");

    addQ(algebraId, "The FOIL method is used to multiply two binomials.", #TrueFalse, ["True", "False"], "True", #Easy,
      ?"FOIL stands for First, Outer, Inner, Last — it is a systematic method for multiplying two binomials like (a + b)(c + d).");

    // Algebra – FillInBlank
    addQ(algebraId, "If 5x = 35, then x = ___.", #FillInBlank, [], "7", #Easy,
      ?"Divide both sides by 5: x = 35 ÷ 5 = 7.");

    addQ(algebraId, "x⁰ = ___ for any non-zero x.", #FillInBlank, [], "1", #Easy,
      ?"Any non-zero number raised to the power of 0 equals 1, by the zero exponent rule.");

    addQ(algebraId, "The factor of x² - 16 is (x - 4)(x + ___)", #FillInBlank, [], "4", #Medium,
      ?"x² - 16 is a difference of squares: x² - 4² = (x - 4)(x + 4). The missing number is 4.");

    addQ(algebraId, "If y = 2x and x = 5, then y = ___.", #FillInBlank, [], "10", #Easy,
      ?"Substitute x = 5 into the equation: y = 2 × 5 = 10.");

    addQ(algebraId, "Solve: 4(x + 1) = 20, x = ___.", #FillInBlank, [], "4", #Medium,
      ?"Distribute: 4x + 4 = 20, subtract 4: 4x = 16, divide by 4: x = 4.");

    addQ(algebraId, "The exponent in x³ is ___.", #FillInBlank, [], "3", #Easy,
      ?"In the expression x³, the small raised number 3 is the exponent, indicating x is multiplied by itself 3 times.");

    addQ(algebraId, "If 3x - 3 = 12, then x = ___.", #FillInBlank, [], "5", #Easy,
      ?"Add 3 to both sides: 3x = 15, then divide by 3: x = 5.");

    addQ(algebraId, "x² - 5x + 6 factors to (x - 2)(x - ___)", #FillInBlank, [], "3", #Hard,
      ?"Find two numbers that multiply to 6 and add to -5: those are -2 and -3. So x² - 5x + 6 = (x - 2)(x - 3).");

    // ─── Geometry Fundamentals questions (20) ────────────────────────────────
    addQ(geometryId, "What is the area of a rectangle with length 8 and width 5?", #MultipleChoice, ["13", "26", "40", "80"], "40", #Easy,
      ?"Area of a rectangle = length × width = 8 × 5 = 40 square units.");

    addQ(geometryId, "What is the sum of interior angles in a triangle?", #MultipleChoice, ["90°", "180°", "270°", "360°"], "180°", #Easy,
      ?"The interior angles of any triangle always add up to 180°. This is a fundamental property of triangles.");

    addQ(geometryId, "What is the perimeter of a square with side 6?", #MultipleChoice, ["12", "24", "36", "6"], "24", #Easy,
      ?"A square has 4 equal sides, so perimeter = 4 × side = 4 × 6 = 24 units.");

    addQ(geometryId, "How many degrees are in a right angle?", #MultipleChoice, ["45°", "90°", "180°", "360°"], "90°", #Easy,
      ?"A right angle is exactly 90°, often shown by a small square in diagrams. It is one-quarter of a full rotation.");

    addQ(geometryId, "What is the area of a circle with radius 7? (use π ≈ 3.14)", #MultipleChoice, ["43.96", "153.86", "21.98", "49"], "153.86", #Medium,
      ?"Area of a circle = π × r² = 3.14 × 7² = 3.14 × 49 = 153.86 square units.");

    addQ(geometryId, "A triangle with all sides equal is called:", #MultipleChoice, ["Scalene", "Isosceles", "Equilateral", "Right"], "Equilateral", #Easy,
      ?"An equilateral triangle has all three sides of equal length and all three angles equal to 60°.");

    addQ(geometryId, "What is the Pythagorean theorem formula?", #MultipleChoice, ["a + b = c", "a² + b² = c²", "a² - b² = c²", "2a + 2b = c"], "a² + b² = c²", #Medium,
      ?"The Pythagorean theorem states that in a right triangle, the sum of the squares of the two legs equals the square of the hypotenuse: a² + b² = c².");

    addQ(geometryId, "How many sides does a hexagon have?", #MultipleChoice, ["5", "6", "7", "8"], "6", #Easy,
      ?"The prefix 'hex-' means six in Greek, so a hexagon has exactly 6 sides. A honeycomb is a common example.");

    addQ(geometryId, "What is the area of a triangle with base 10 and height 4?", #MultipleChoice, ["40", "20", "14", "10"], "20", #Easy,
      ?"Area of a triangle = ½ × base × height = ½ × 10 × 4 = 20 square units.");

    addQ(geometryId, "Two angles that add up to 90° are called:", #MultipleChoice, ["Supplementary", "Complementary", "Vertical", "Adjacent"], "Complementary", #Medium,
      ?"Complementary angles sum to 90°. Remember: C for Complementary, C for Corner (right angle). Supplementary angles sum to 180°.");

    // Geometry – TrueFalse
    addQ(geometryId, "A square is always a rectangle.", #TrueFalse, ["True", "False"], "True", #Medium,
      ?"A rectangle is a quadrilateral with four right angles. A square satisfies this definition and also has equal sides, making it a special type of rectangle.");

    addQ(geometryId, "The diameter of a circle is twice the radius.", #TrueFalse, ["True", "False"], "True", #Easy,
      ?"The diameter passes through the center and connects two points on the circle. Since the radius is the distance from center to edge, diameter = 2 × radius.");

    addQ(geometryId, "All right angles are equal.", #TrueFalse, ["True", "False"], "True", #Easy,
      ?"By definition, a right angle is always exactly 90°, so all right angles are equal to each other.");

    addQ(geometryId, "A regular polygon has sides of different lengths.", #TrueFalse, ["True", "False"], "False", #Easy,
      ?"A regular polygon has all sides of equal length AND all interior angles equal. A square and equilateral triangle are examples of regular polygons.");

    // Geometry – FillInBlank
    addQ(geometryId, "The perimeter of a circle is called the ___.", #FillInBlank, [], "circumference", #Easy,
      ?"The distance around a circle is called its circumference, calculated by C = 2πr or C = πd.");

    addQ(geometryId, "A polygon with 8 sides is called an ___.", #FillInBlank, [], "octagon", #Medium,
      ?"The prefix 'octo-' means eight (like an octopus with 8 arms), so an 8-sided polygon is an octagon.");

    addQ(geometryId, "Area of a rectangle = length × ___.", #FillInBlank, [], "width", #Easy,
      ?"The area formula for a rectangle is length × width, which gives the total space inside the rectangle.");

    addQ(geometryId, "In a right triangle, the longest side is called the ___.", #FillInBlank, [], "hypotenuse", #Easy,
      ?"The hypotenuse is the side opposite the right angle and is always the longest side in a right triangle.");

    addQ(geometryId, "Two angles that sum to 180° are called ___ angles.", #FillInBlank, [], "supplementary", #Medium,
      ?"Supplementary angles add up to 180°. For example, 110° and 70° are supplementary. They form a straight line when placed together.");

    addQ(geometryId, "The area of a circle is π × r² where r is the ___.", #FillInBlank, [], "radius", #Easy,
      ?"In the formula A = πr², r stands for the radius — the distance from the center of the circle to its edge.");

    // ─── Physics Principles questions (20) ───────────────────────────────────
    addQ(physicsId, "What is Newton's First Law of Motion?", #MultipleChoice, ["F = ma", "Objects in motion stay in motion unless acted on by a force", "For every action there is an equal and opposite reaction", "Energy cannot be created or destroyed"], "Objects in motion stay in motion unless acted on by a force", #Medium,
      ?"Newton's First Law, also called the Law of Inertia, states that an object will remain at rest or in uniform motion unless acted upon by a net external force.");

    addQ(physicsId, "What is the unit of force?", #MultipleChoice, ["Joule", "Watt", "Newton", "Pascal"], "Newton", #Easy,
      ?"Force is measured in Newtons (N), named after Isaac Newton. One Newton is the force needed to accelerate 1 kg of mass by 1 m/s².");

    addQ(physicsId, "Which formula represents kinetic energy?", #MultipleChoice, ["mgh", "½mv²", "mv", "Fd"], "½mv²", #Medium,
      ?"Kinetic energy is the energy of motion, given by KE = ½mv², where m is mass and v is velocity. The ½ comes from the calculus derivation of work done.");

    addQ(physicsId, "What is the speed of light in a vacuum?", #MultipleChoice, ["3 × 10⁶ m/s", "3 × 10⁸ m/s", "3 × 10¹⁰ m/s", "3 × 10⁴ m/s"], "3 × 10⁸ m/s", #Hard,
      ?"The speed of light in a vacuum is approximately 3 × 10⁸ metres per second (300,000 km/s). This constant, denoted c, is fundamental in Einstein's theory of relativity.");

    addQ(physicsId, "What does Ohm's Law state?", #MultipleChoice, ["V = IR", "P = IV", "F = ma", "E = mc²"], "V = IR", #Medium,
      ?"Ohm's Law states that Voltage (V) equals Current (I) multiplied by Resistance (R): V = IR. It describes the relationship between these three electrical quantities.");

    addQ(physicsId, "What is the acceleration due to gravity on Earth?", #MultipleChoice, ["8.9 m/s²", "9.8 m/s²", "10.8 m/s²", "11.2 m/s²"], "9.8 m/s²", #Easy,
      ?"Near Earth's surface, gravity accelerates all objects at 9.8 m/s² downward (often approximated as 10 m/s² for calculations). This value comes from Earth's mass and radius.");

    addQ(physicsId, "What is the unit of electrical resistance?", #MultipleChoice, ["Volt", "Ampere", "Ohm", "Watt"], "Ohm", #Easy,
      ?"Electrical resistance is measured in Ohms (Ω), named after Georg Ohm. It represents how much a material opposes the flow of electric current.");

    addQ(physicsId, "Which type of energy does a stretched spring possess?", #MultipleChoice, ["Kinetic energy", "Thermal energy", "Elastic potential energy", "Chemical energy"], "Elastic potential energy", #Medium,
      ?"A stretched or compressed spring stores elastic potential energy. This energy is released when the spring returns to its natural length, described by Hooke's Law: F = kx.");

    addQ(physicsId, "What is the formula for work done?", #MultipleChoice, ["W = F/d", "W = Fd", "W = F + d", "W = F²d"], "W = Fd", #Easy,
      ?"Work is done when a force moves an object over a distance. The formula is W = F × d, where F is force in Newtons and d is distance in metres. Work is measured in Joules.");

    addQ(physicsId, "What happens to pressure when depth increases in a liquid?", #MultipleChoice, ["Decreases", "Stays the same", "Increases", "Becomes zero"], "Increases", #Medium,
      ?"Pressure in a liquid increases with depth because there is more liquid above pushing down. The formula is P = ρgh, where ρ is fluid density, g is gravity, and h is depth.");

    // Physics – TrueFalse
    addQ(physicsId, "Sound travels faster than light.", #TrueFalse, ["True", "False"], "False", #Easy,
      ?"Light travels at about 3 × 10⁸ m/s, while sound travels at only about 343 m/s in air. Light is nearly a million times faster than sound.");

    addQ(physicsId, "Energy can be converted from one form to another.", #TrueFalse, ["True", "False"], "True", #Easy,
      ?"The Law of Conservation of Energy states that energy cannot be created or destroyed, but it can be converted between forms — for example, chemical energy to heat and light when burning fuel.");

    addQ(physicsId, "Friction always acts in the direction of motion.", #TrueFalse, ["True", "False"], "False", #Medium,
      ?"Friction always acts opposite to the direction of motion. It is a resistive force that opposes movement, which is why it slows things down.");

    addQ(physicsId, "A conductor allows electric current to flow through it easily.", #TrueFalse, ["True", "False"], "True", #Easy,
      ?"Conductors (like copper and silver) have free electrons that can move easily, allowing electric current to flow through them with low resistance.");

    // Physics – FillInBlank
    addQ(physicsId, "The law F = ma is Newton's ___ Law.", #FillInBlank, [], "Second", #Easy,
      ?"Newton's Second Law states that Force = mass × acceleration (F = ma). It means a greater force or smaller mass results in greater acceleration.");

    addQ(physicsId, "Potential energy stored due to height is called ___ potential energy.", #FillInBlank, [], "gravitational", #Medium,
      ?"Gravitational potential energy is stored by an object due to its height above the ground, calculated as GPE = mgh (mass × gravity × height).");

    addQ(physicsId, "The unit of power is the ___.", #FillInBlank, [], "Watt", #Easy,
      ?"Power is the rate at which work is done, measured in Watts (W). One Watt equals one Joule of energy transferred per second.");

    addQ(physicsId, "An object moving in a circle experiences ___ acceleration.", #FillInBlank, [], "centripetal", #Hard,
      ?"Centripetal acceleration always points toward the center of the circle. It is what keeps an object moving in a curved path rather than a straight line.");

    addQ(physicsId, "The bending of light when it passes from one medium to another is called ___.", #FillInBlank, [], "refraction", #Medium,
      ?"Refraction occurs because light changes speed when moving between different media (like air to water), causing it to bend. This is why a straw looks bent in a glass of water.");

    addQ(physicsId, "Voltage divided by current equals ___.", #FillInBlank, [], "resistance", #Easy,
      ?"From Ohm's Law (V = IR), rearranging gives R = V/I. So voltage divided by current equals resistance, measured in Ohms.");

    // ─── Biology Basics questions (20) ───────────────────────────────────────
    addQ(biologyId, "What is the powerhouse of the cell?", #MultipleChoice, ["Nucleus", "Ribosome", "Mitochondria", "Vacuole"], "Mitochondria", #Easy,
      ?"Mitochondria are called the powerhouse of the cell because they produce ATP (adenosine triphosphate) through cellular respiration, providing energy for all cell activities.");

    addQ(biologyId, "What does DNA stand for?", #MultipleChoice, ["Deoxyribonucleic Acid", "Dinitrogen Acid", "Deoxyribose Nitrogenous Acid", "Dual Nucleic Acid"], "Deoxyribonucleic Acid", #Easy,
      ?"DNA stands for Deoxyribonucleic Acid. It is the molecule that carries the genetic instructions for the development, functioning, and reproduction of all living organisms.");

    addQ(biologyId, "Which organelle is responsible for protein synthesis?", #MultipleChoice, ["Golgi apparatus", "Ribosome", "Lysosome", "Nucleus"], "Ribosome", #Medium,
      ?"Ribosomes read the mRNA instructions from the nucleus and assemble amino acids into proteins. They are found both free in the cytoplasm and attached to the rough endoplasmic reticulum.");

    addQ(biologyId, "What is the process by which plants make food using sunlight?", #MultipleChoice, ["Respiration", "Fermentation", "Photosynthesis", "Digestion"], "Photosynthesis", #Easy,
      ?"Photosynthesis is the process where plants use sunlight, water, and CO₂ to produce glucose and oxygen: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂.");

    addQ(biologyId, "What is natural selection?", #MultipleChoice, ["Random mutation of genes", "Survival and reproduction of best-adapted organisms", "Formation of new species by isolation", "Transfer of genes between species"], "Survival and reproduction of best-adapted organisms", #Medium,
      ?"Natural selection is the process where organisms with traits better suited to their environment are more likely to survive and reproduce, passing those advantageous traits to offspring.");

    addQ(biologyId, "Which base pairs with Adenine in DNA?", #MultipleChoice, ["Cytosine", "Guanine", "Thymine", "Uracil"], "Thymine", #Medium,
      ?"In DNA, base pairing follows specific rules: Adenine (A) pairs with Thymine (T), and Cytosine (C) pairs with Guanine (G). In RNA, Adenine pairs with Uracil instead.");

    addQ(biologyId, "What is a food chain?", #MultipleChoice, ["A cycle of water in nature", "Transfer of energy from producers to consumers", "A list of organisms in a biome", "The process of photosynthesis"], "Transfer of energy from producers to consumers", #Easy,
      ?"A food chain shows the flow of energy from one organism to the next, starting with producers (plants) and moving through herbivores, carnivores, and decomposers.");

    addQ(biologyId, "What type of cell division produces gametes?", #MultipleChoice, ["Mitosis", "Binary fission", "Meiosis", "Budding"], "Meiosis", #Medium,
      ?"Meiosis is a special type of cell division that produces gametes (sperm and egg cells) with half the normal chromosome number. When two gametes fuse, the full chromosome number is restored.");

    addQ(biologyId, "Which part of the cell controls its activities?", #MultipleChoice, ["Cell membrane", "Cytoplasm", "Nucleus", "Vacuole"], "Nucleus", #Easy,
      ?"The nucleus is the control center of the cell. It contains DNA and directs all cellular activities including growth, metabolism, and reproduction.");

    addQ(biologyId, "Who proposed the theory of evolution by natural selection?", #MultipleChoice, ["Gregor Mendel", "Louis Pasteur", "Charles Darwin", "James Watson"], "Charles Darwin", #Easy,
      ?"Charles Darwin proposed the theory of evolution by natural selection in his 1859 book 'On the Origin of Species', based on observations from his voyage on the HMS Beagle.");

    // Biology – TrueFalse
    addQ(biologyId, "All living cells contain DNA.", #TrueFalse, ["True", "False"], "True", #Easy,
      ?"DNA is present in all living cells as it carries the genetic instructions needed for life. Even prokaryotic cells (without a nucleus) contain DNA, just not enclosed in a membrane.");

    addQ(biologyId, "Prokaryotic cells have a membrane-bound nucleus.", #TrueFalse, ["True", "False"], "False", #Medium,
      ?"Prokaryotic cells (like bacteria) do NOT have a membrane-bound nucleus — their DNA floats freely in the cytoplasm. Only eukaryotic cells (like plant and animal cells) have a true nucleus.");

    addQ(biologyId, "Decomposers play no important role in an ecosystem.", #TrueFalse, ["True", "False"], "False", #Easy,
      ?"Decomposers (fungi, bacteria) are essential in ecosystems because they break down dead organic matter and recycle nutrients back into the soil, supporting plant growth and the entire food web.");

    addQ(biologyId, "Mutations are always harmful to an organism.", #TrueFalse, ["True", "False"], "False", #Medium,
      ?"Mutations can be harmful, neutral, or even beneficial. A beneficial mutation that improves survival can spread through a population via natural selection, driving evolution.");

    // Biology – FillInBlank
    addQ(biologyId, "The basic unit of life is the ___.", #FillInBlank, [], "cell", #Easy,
      ?"The cell is the smallest unit that can carry out all the processes of life, including metabolism, growth, and reproduction. All living things are made of one or more cells.");

    addQ(biologyId, "DNA is found in the ___ of eukaryotic cells.", #FillInBlank, [], "nucleus", #Easy,
      ?"In eukaryotic cells, DNA is stored in the nucleus, protected by a nuclear membrane. This is one of the key features that distinguishes eukaryotes from prokaryotes.");

    addQ(biologyId, "Organisms that make their own food are called ___.", #FillInBlank, [], "producers", #Medium,
      ?"Producers (also called autotrophs) make their own food through photosynthesis or chemosynthesis. They form the base of all food chains and food webs.");

    addQ(biologyId, "The molecule that carries genetic information is ___.", #FillInBlank, [], "DNA", #Easy,
      ?"DNA (Deoxyribonucleic Acid) carries the genetic blueprint of an organism. It contains the instructions for building proteins and determining all inherited traits.");

    addQ(biologyId, "The process of copying DNA is called DNA ___.", #FillInBlank, [], "replication", #Medium,
      ?"DNA replication is the process where the double helix unwinds and each strand serves as a template to build a new complementary strand, resulting in two identical DNA molecules.");

    addQ(biologyId, "An organism's physical traits are called its ___.", #FillInBlank, [], "phenotype", #Hard,
      ?"The phenotype is the observable physical or biochemical characteristics of an organism (like eye color or height), resulting from the interaction between its genotype and environment.");

    // ─── Grammar & Writing questions (20) ────────────────────────────────────
    addQ(grammarId, "What part of speech is the word 'quickly'?", #MultipleChoice, ["Noun", "Verb", "Adjective", "Adverb"], "Adverb", #Easy,
      ?"'Quickly' modifies the verb by describing how an action is performed. Adverbs typically answer 'how?', 'when?', 'where?', or 'how much?' and often end in '-ly'.");

    addQ(grammarId, "Which sentence uses a comma correctly?", #MultipleChoice, ["I like apples, and oranges", "She ran fast, but tired quickly.", "He came, he saw, he conquered.", "We need: milk eggs and bread."], "He came, he saw, he conquered.", #Medium,
      ?"Commas can separate three or more items in a list (including independent clauses). 'He came, he saw, he conquered' correctly uses commas to separate three parallel independent clauses.");

    addQ(grammarId, "What is a noun?", #MultipleChoice, ["A word that describes an action", "A word that names a person, place, or thing", "A word that modifies a verb", "A word that connects clauses"], "A word that names a person, place, or thing", #Easy,
      ?"A noun names a person (teacher), place (school), thing (book), or idea (freedom). Nouns function as subjects and objects in sentences.");

    addQ(grammarId, "Which of the following is a compound sentence?", #MultipleChoice, ["She ran.", "She ran fast and won.", "She ran because she was late.", "She ran, and she won."], "She ran, and she won.", #Medium,
      ?"A compound sentence contains two or more independent clauses joined by a coordinating conjunction (and, but, or). 'She ran, and she won' has two independent clauses joined by 'and'.");

    addQ(grammarId, "What punctuation ends an exclamatory sentence?", #MultipleChoice, ["Period", "Question mark", "Exclamation mark", "Comma"], "Exclamation mark", #Easy,
      ?"An exclamatory sentence expresses strong emotion or emphasis and always ends with an exclamation mark (!). For example: 'What a beautiful day!'");

    addQ(grammarId, "What is the past tense of 'run'?", #MultipleChoice, ["Runned", "Ran", "Running", "Runs"], "Ran", #Easy,
      ?"'Run' is an irregular verb, so its past tense is 'ran' (not 'runned'). Irregular verbs do not follow the standard '-ed' pattern for past tense.");

    addQ(grammarId, "Which word is a conjunction?", #MultipleChoice, ["Quickly", "Beautiful", "Although", "Happiness"], "Although", #Medium,
      ?"'Although' is a subordinating conjunction that connects a dependent clause to an independent clause. Conjunctions join words, phrases, or clauses together.");

    addQ(grammarId, "What is a pronoun?", #MultipleChoice, ["A word that modifies a noun", "A word that takes the place of a noun", "A word that shows action", "A word that joins sentences"], "A word that takes the place of a noun", #Easy,
      ?"Pronouns replace nouns to avoid repetition. Instead of 'Maria said Maria was tired,' we say 'Maria said she was tired.' Common pronouns include he, she, it, they, and we.");

    addQ(grammarId, "Which sentence is written in active voice?", #MultipleChoice, ["The cake was eaten by John.", "The book was read by Mary.", "John ate the cake.", "The race was won."], "John ate the cake.", #Medium,
      ?"In active voice, the subject performs the action: 'John (subject) ate (verb) the cake.' In passive voice, the subject receives the action: 'The cake was eaten by John.'");

    addQ(grammarId, "What is a preposition?", #MultipleChoice, ["A word showing action", "A word showing the relationship between a noun and other words", "A describing word", "A connecting word"], "A word showing the relationship between a noun and other words", #Medium,
      ?"Prepositions show the relationship of a noun or pronoun to another word, often indicating location, direction, or time. Examples include: in, on, at, under, between, after.");

    // Grammar – TrueFalse
    addQ(grammarId, "A sentence must have both a subject and a predicate.", #TrueFalse, ["True", "False"], "True", #Easy,
      ?"A complete sentence requires a subject (who or what the sentence is about) and a predicate (what the subject does or is). Without both, it is a sentence fragment.");

    addQ(grammarId, "An adjective modifies a verb.", #TrueFalse, ["True", "False"], "False", #Easy,
      ?"Adjectives modify nouns (e.g., 'the tall tree'). It is adverbs that modify verbs (e.g., 'she ran quickly'). Remembering this distinction is key to correct grammar.");

    addQ(grammarId, "A semicolon can connect two independent clauses.", #TrueFalse, ["True", "False"], "True", #Medium,
      ?"A semicolon (;) can join two closely related independent clauses without a conjunction. For example: 'She studied hard; she passed the exam.'");

    addQ(grammarId, "All nouns are proper nouns.", #TrueFalse, ["True", "False"], "False", #Easy,
      ?"Nouns are either common (general names like 'city', 'dog') or proper (specific names like 'London', 'Fido'). Proper nouns are capitalized; common nouns are not. Most nouns are common nouns.");

    // Grammar – FillInBlank
    addQ(grammarId, "A word that describes a noun is called an ___.", #FillInBlank, [], "adjective", #Easy,
      ?"Adjectives describe or modify nouns, telling us more about their qualities: size, color, shape, or number. Examples: 'a big red ball' — big and red are adjectives.");

    addQ(grammarId, "The three types of articles are a, an, and ___.", #FillInBlank, [], "the", #Easy,
      ?"Articles are a type of adjective. 'A' and 'an' are indefinite articles (used for non-specific nouns), while 'the' is the definite article (used for specific nouns).");

    addQ(grammarId, "A group of words with a subject and verb that cannot stand alone is a ___ clause.", #FillInBlank, [], "dependent", #Medium,
      ?"A dependent (subordinate) clause has a subject and verb but depends on an independent clause to make complete sense. Example: 'because she was tired' cannot stand alone.");

    addQ(grammarId, "A sentence that asks a question ends with a ___.", #FillInBlank, [], "question mark", #Easy,
      ?"Interrogative sentences ask questions and always end with a question mark (?). For example: 'Where are you going?'");

    addQ(grammarId, "The plural of 'child' is ___.", #FillInBlank, [], "children", #Medium,
      ?"'Child' is an irregular noun — its plural is 'children', not 'childs'. English has many irregular plurals that must be memorized, such as mouse/mice and foot/feet.");

    addQ(grammarId, "A word that sounds like another but has a different meaning is a ___.", #FillInBlank, [], "homophone", #Hard,
      ?"Homophones are words that sound the same but have different spellings and meanings. Examples: their/there/they're, to/too/two, and hear/here.");

    // ─── Literary Analysis questions (20) ────────────────────────────────────
    addQ(literaryId, "What is the central message or insight of a literary work?", #MultipleChoice, ["Plot", "Setting", "Theme", "Tone"], "Theme", #Easy,
      ?"The theme is the underlying message or universal truth that the author wants to convey. Unlike the plot (what happens), the theme is the deeper meaning, such as 'love conquers all' or 'power corrupts'.");

    addQ(literaryId, "A metaphor is:", #MultipleChoice, ["A comparison using 'like' or 'as'", "A direct comparison between two unlike things", "A humorous exaggeration", "Giving human traits to non-human things"], "A direct comparison between two unlike things", #Medium,
      ?"A metaphor directly states that one thing is another, creating a vivid image: 'Life is a journey.' It differs from a simile, which uses 'like' or 'as': 'Life is like a journey.'");

    addQ(literaryId, "What is the climax of a story?", #MultipleChoice, ["The introduction of characters", "The turning point or most intense moment", "The resolution of conflict", "The background information"], "The turning point or most intense moment", #Easy,
      ?"The climax is the peak of tension in a story — the moment when the main conflict comes to a head and the outcome is decided. Everything before builds toward it; everything after follows from it.");

    addQ(literaryId, "What is foreshadowing in literature?", #MultipleChoice, ["Repeating key phrases", "Hints about future events", "Describing the setting in detail", "Comparing two characters"], "Hints about future events", #Medium,
      ?"Foreshadowing is a literary technique where the author drops subtle clues about what will happen later in the story. It builds suspense and helps readers feel satisfied when predictions come true.");

    addQ(literaryId, "What is a simile?", #MultipleChoice, ["A direct comparison", "A comparison using 'like' or 'as'", "A story with a moral", "A type of rhyme scheme"], "A comparison using 'like' or 'as'", #Easy,
      ?"A simile compares two unlike things using 'like' or 'as': 'Her smile was like sunshine.' This distinguishes it from a metaphor, which makes the comparison directly without these words.");

    addQ(literaryId, "What term describes the narrator who tells a story using 'I'?", #MultipleChoice, ["Third-person limited", "Third-person omniscient", "First-person narrator", "Unreliable narrator"], "First-person narrator", #Easy,
      ?"A first-person narrator is a character within the story who uses 'I' to tell it from their own perspective. This creates intimacy but limits the reader to only what that character knows.");

    addQ(literaryId, "What is the exposition of a story?", #MultipleChoice, ["The climax of the plot", "The conclusion", "The introduction providing background information", "The falling action"], "The introduction providing background information", #Easy,
      ?"The exposition is the opening section of a narrative that introduces the characters, setting, and situation. It gives readers the background information needed to understand the story.");

    addQ(literaryId, "What literary device gives human qualities to non-human things?", #MultipleChoice, ["Simile", "Metaphor", "Personification", "Hyperbole"], "Personification", #Medium,
      ?"Personification gives human characteristics (emotions, actions, speech) to non-human things. For example: 'The wind whispered through the trees' — wind cannot whisper, but this makes the description vivid.");

    addQ(literaryId, "An extreme exaggeration used for emphasis is called:", #MultipleChoice, ["Irony", "Alliteration", "Hyperbole", "Symbolism"], "Hyperbole", #Medium,
      ?"Hyperbole is a deliberate exaggeration not meant to be taken literally, used to emphasize a point or create humor. Example: 'I've told you a million times!'");

    addQ(literaryId, "What is the setting of a story?", #MultipleChoice, ["The main character's personality", "The conflict in the story", "The time and place where the story happens", "The moral lesson"], "The time and place where the story happens", #Easy,
      ?"The setting includes both the time period and the physical location of a story. It creates the atmosphere and context, and can deeply influence the plot and characters' actions.");

    // Literary – TrueFalse
    addQ(literaryId, "The protagonist is the main character of a story.", #TrueFalse, ["True", "False"], "True", #Easy,
      ?"The protagonist is the central character whom the story follows. They usually face the main conflict and drive the plot forward. The term comes from the Greek word for 'first actor'.");

    addQ(literaryId, "An antagonist always has to be a person.", #TrueFalse, ["True", "False"], "False", #Medium,
      ?"An antagonist is any force that opposes the protagonist — it can be a person, but also nature, society, technology, or even the protagonist's own internal struggles.");

    addQ(literaryId, "Alliteration is the repetition of consonant sounds at the beginning of words.", #TrueFalse, ["True", "False"], "True", #Easy,
      ?"Alliteration is the repetition of the same initial consonant sound in closely connected words, as in 'Peter Piper picked a peck.' It creates rhythm and is often used in poetry and speeches.");

    addQ(literaryId, "The resolution comes before the climax in narrative structure.", #TrueFalse, ["True", "False"], "False", #Easy,
      ?"In the standard narrative arc, the order is: exposition → rising action → climax → falling action → resolution. The resolution (denouement) is the final section where loose ends are tied up.");

    // Literary – FillInBlank
    addQ(literaryId, "The struggle between opposing forces in a story is called ___.", #FillInBlank, [], "conflict", #Easy,
      ?"Conflict is the central struggle in a narrative. It can be external (character vs. character, character vs. nature) or internal (character vs. self). Conflict drives the plot and character development.");

    addQ(literaryId, "A story that teaches a lesson using animals is called a ___.", #FillInBlank, [], "fable", #Medium,
      ?"A fable is a short story featuring animals as characters that represent human traits, ending with a clear moral lesson. Aesop's fables (like 'The Tortoise and the Hare') are famous examples.");

    addQ(literaryId, "The character who opposes the protagonist is called the ___.", #FillInBlank, [], "antagonist", #Easy,
      ?"The antagonist creates obstacles for the protagonist, driving the conflict in the story. Classic antagonists include villains in fiction, but the role can be filled by any opposing force.");

    addQ(literaryId, "When the audience knows something a character does not, it is called dramatic ___.", #FillInBlank, [], "irony", #Hard,
      ?"Dramatic irony occurs when the audience possesses information that a character lacks, creating tension or humor. For example, the audience knowing a character is walking into a trap while the character does not.");

    addQ(literaryId, "A recurring symbol or idea throughout a work is called a ___.", #FillInBlank, [], "motif", #Hard,
      ?"A motif is a recurring element — image, symbol, theme, or idea — that appears multiple times throughout a work and reinforces the central themes. For example, light and dark in 'Romeo and Juliet'.");

    addQ(literaryId, "The sequence of events in a story is called the ___.", #FillInBlank, [], "plot", #Easy,
      ?"The plot is the structured sequence of events that make up a story, typically following an arc: exposition, rising action, climax, falling action, and resolution.");
  };
};
