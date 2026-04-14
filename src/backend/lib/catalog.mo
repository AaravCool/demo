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

    // ─── Algebra Basics questions (20) ───────────────────────────────────────
    let addQ = func(chId : Nat, text : Text, qtype : CatalogTypes.QuestionType, opts : [Text], answer : Text, diff : CatalogTypes.Difficulty) {
      questions.add({
        id = nextQuestionId.value;
        chapterId = chId;
        questionText = text;
        questionType = qtype;
        options = opts;
        correctAnswer = answer;
        difficulty = diff;
      });
      nextQuestionId.value += 1;
    };

    // Algebra – MultipleChoice
    addQ(algebraId, "What is the value of x if 2x + 4 = 12?", #MultipleChoice, ["2", "4", "6", "8"], "4", #Easy);
    addQ(algebraId, "Simplify: 3x + 2x", #MultipleChoice, ["5x", "6x", "5x²", "x⁵"], "5x", #Easy);
    addQ(algebraId, "What is the solution to x² = 25?", #MultipleChoice, ["x = 5", "x = ±5", "x = -5", "x = 25"], "x = ±5", #Medium);
    addQ(algebraId, "Factor: x² - 9", #MultipleChoice, ["(x-3)(x+3)", "(x-9)(x+1)", "(x+3)²", "(x-3)²"], "(x-3)(x+3)", #Medium);
    addQ(algebraId, "What is the slope of y = 3x + 7?", #MultipleChoice, ["7", "3", "-3", "1/3"], "3", #Easy);
    addQ(algebraId, "Solve for y: 3y - 6 = 9", #MultipleChoice, ["1", "3", "5", "7"], "5", #Easy);
    addQ(algebraId, "What is 2³?", #MultipleChoice, ["6", "8", "9", "16"], "8", #Easy);
    addQ(algebraId, "Which expression equals (x + 2)²?", #MultipleChoice, ["x² + 4", "x² + 4x + 4", "x² + 2x + 4", "x² + 4x"], "x² + 4x + 4", #Medium);
    // Algebra – TrueFalse
    addQ(algebraId, "The equation x² + 1 = 0 has real solutions.", #TrueFalse, ["True", "False"], "False", #Medium);
    addQ(algebraId, "Any number raised to the power of 0 equals 1.", #TrueFalse, ["True", "False"], "True", #Easy);
    addQ(algebraId, "2x + 3 = 3x + 2 has x = 1 as its solution.", #TrueFalse, ["True", "False"], "True", #Easy);
    addQ(algebraId, "The FOIL method is used to multiply two binomials.", #TrueFalse, ["True", "False"], "True", #Easy);
    // Algebra – FillInBlank
    addQ(algebraId, "If 5x = 35, then x = ___.", #FillInBlank, [], "7", #Easy);
    addQ(algebraId, "x⁰ = ___ for any non-zero x.", #FillInBlank, [], "1", #Easy);
    addQ(algebraId, "The factor of x² - 16 is (x - 4)(x + ___)", #FillInBlank, [], "4", #Medium);
    addQ(algebraId, "If y = 2x and x = 5, then y = ___.", #FillInBlank, [], "10", #Easy);
    addQ(algebraId, "Solve: 4(x + 1) = 20, x = ___.", #FillInBlank, [], "4", #Medium);
    addQ(algebraId, "The exponent in x³ is ___.", #FillInBlank, [], "3", #Easy);
    addQ(algebraId, "If 3x - 3 = 12, then x = ___.", #FillInBlank, [], "5", #Easy);
    addQ(algebraId, "x² - 5x + 6 factors to (x - 2)(x - ___)", #FillInBlank, [], "3", #Hard);

    // ─── Geometry Fundamentals questions (20) ────────────────────────────────
    addQ(geometryId, "What is the area of a rectangle with length 8 and width 5?", #MultipleChoice, ["13", "26", "40", "80"], "40", #Easy);
    addQ(geometryId, "What is the sum of interior angles in a triangle?", #MultipleChoice, ["90°", "180°", "270°", "360°"], "180°", #Easy);
    addQ(geometryId, "What is the perimeter of a square with side 6?", #MultipleChoice, ["12", "24", "36", "6"], "24", #Easy);
    addQ(geometryId, "How many degrees are in a right angle?", #MultipleChoice, ["45°", "90°", "180°", "360°"], "90°", #Easy);
    addQ(geometryId, "What is the area of a circle with radius 7? (use π ≈ 3.14)", #MultipleChoice, ["43.96", "153.86", "21.98", "49"], "153.86", #Medium);
    addQ(geometryId, "A triangle with all sides equal is called:", #MultipleChoice, ["Scalene", "Isosceles", "Equilateral", "Right"], "Equilateral", #Easy);
    addQ(geometryId, "What is the Pythagorean theorem formula?", #MultipleChoice, ["a + b = c", "a² + b² = c²", "a² - b² = c²", "2a + 2b = c"], "a² + b² = c²", #Medium);
    addQ(geometryId, "How many sides does a hexagon have?", #MultipleChoice, ["5", "6", "7", "8"], "6", #Easy);
    addQ(geometryId, "What is the area of a triangle with base 10 and height 4?", #MultipleChoice, ["40", "20", "14", "10"], "20", #Easy);
    addQ(geometryId, "Two angles that add up to 90° are called:", #MultipleChoice, ["Supplementary", "Complementary", "Vertical", "Adjacent"], "Complementary", #Medium);
    // Geometry – TrueFalse
    addQ(geometryId, "A square is always a rectangle.", #TrueFalse, ["True", "False"], "True", #Medium);
    addQ(geometryId, "The diameter of a circle is twice the radius.", #TrueFalse, ["True", "False"], "True", #Easy);
    addQ(geometryId, "All right angles are equal.", #TrueFalse, ["True", "False"], "True", #Easy);
    addQ(geometryId, "A regular polygon has sides of different lengths.", #TrueFalse, ["True", "False"], "False", #Easy);
    // Geometry – FillInBlank
    addQ(geometryId, "The perimeter of a circle is called the ___.", #FillInBlank, [], "circumference", #Easy);
    addQ(geometryId, "A polygon with 8 sides is called an ___.", #FillInBlank, [], "octagon", #Medium);
    addQ(geometryId, "Area of a rectangle = length × ___.", #FillInBlank, [], "width", #Easy);
    addQ(geometryId, "In a right triangle, the longest side is called the ___.", #FillInBlank, [], "hypotenuse", #Easy);
    addQ(geometryId, "Two angles that sum to 180° are called ___ angles.", #FillInBlank, [], "supplementary", #Medium);
    addQ(geometryId, "The area of a circle is π × r² where r is the ___.", #FillInBlank, [], "radius", #Easy);

    // ─── Physics Principles questions (20) ───────────────────────────────────
    addQ(physicsId, "What is Newton's First Law of Motion?", #MultipleChoice, ["F = ma", "Objects in motion stay in motion unless acted on by a force", "For every action there is an equal and opposite reaction", "Energy cannot be created or destroyed"], "Objects in motion stay in motion unless acted on by a force", #Medium);
    addQ(physicsId, "What is the unit of force?", #MultipleChoice, ["Joule", "Watt", "Newton", "Pascal"], "Newton", #Easy);
    addQ(physicsId, "Which formula represents kinetic energy?", #MultipleChoice, ["mgh", "½mv²", "mv", "Fd"], "½mv²", #Medium);
    addQ(physicsId, "What is the speed of light in a vacuum?", #MultipleChoice, ["3 × 10⁶ m/s", "3 × 10⁸ m/s", "3 × 10¹⁰ m/s", "3 × 10⁴ m/s"], "3 × 10⁸ m/s", #Hard);
    addQ(physicsId, "What does Ohm's Law state?", #MultipleChoice, ["V = IR", "P = IV", "F = ma", "E = mc²"], "V = IR", #Medium);
    addQ(physicsId, "What is the acceleration due to gravity on Earth?", #MultipleChoice, ["8.9 m/s²", "9.8 m/s²", "10.8 m/s²", "11.2 m/s²"], "9.8 m/s²", #Easy);
    addQ(physicsId, "What is the unit of electrical resistance?", #MultipleChoice, ["Volt", "Ampere", "Ohm", "Watt"], "Ohm", #Easy);
    addQ(physicsId, "Which type of energy does a stretched spring possess?", #MultipleChoice, ["Kinetic energy", "Thermal energy", "Elastic potential energy", "Chemical energy"], "Elastic potential energy", #Medium);
    addQ(physicsId, "What is the formula for work done?", #MultipleChoice, ["W = F/d", "W = Fd", "W = F + d", "W = F²d"], "W = Fd", #Easy);
    addQ(physicsId, "What happens to pressure when depth increases in a liquid?", #MultipleChoice, ["Decreases", "Stays the same", "Increases", "Becomes zero"], "Increases", #Medium);
    // Physics – TrueFalse
    addQ(physicsId, "Sound travels faster than light.", #TrueFalse, ["True", "False"], "False", #Easy);
    addQ(physicsId, "Energy can be converted from one form to another.", #TrueFalse, ["True", "False"], "True", #Easy);
    addQ(physicsId, "Friction always acts in the direction of motion.", #TrueFalse, ["True", "False"], "False", #Medium);
    addQ(physicsId, "A conductor allows electric current to flow through it easily.", #TrueFalse, ["True", "False"], "True", #Easy);
    // Physics – FillInBlank
    addQ(physicsId, "The law F = ma is Newton's ___ Law.", #FillInBlank, [], "Second", #Easy);
    addQ(physicsId, "Potential energy stored due to height is called ___ potential energy.", #FillInBlank, [], "gravitational", #Medium);
    addQ(physicsId, "The unit of power is the ___.", #FillInBlank, [], "Watt", #Easy);
    addQ(physicsId, "An object moving in a circle experiences ___ acceleration.", #FillInBlank, [], "centripetal", #Hard);
    addQ(physicsId, "The bending of light when it passes from one medium to another is called ___.", #FillInBlank, [], "refraction", #Medium);
    addQ(physicsId, "Voltage divided by current equals ___.", #FillInBlank, [], "resistance", #Easy);

    // ─── Biology Basics questions (20) ───────────────────────────────────────
    addQ(biologyId, "What is the powerhouse of the cell?", #MultipleChoice, ["Nucleus", "Ribosome", "Mitochondria", "Vacuole"], "Mitochondria", #Easy);
    addQ(biologyId, "What does DNA stand for?", #MultipleChoice, ["Deoxyribonucleic Acid", "Dinitrogen Acid", "Deoxyribose Nitrogenous Acid", "Dual Nucleic Acid"], "Deoxyribonucleic Acid", #Easy);
    addQ(biologyId, "Which organelle is responsible for protein synthesis?", #MultipleChoice, ["Golgi apparatus", "Ribosome", "Lysosome", "Nucleus"], "Ribosome", #Medium);
    addQ(biologyId, "What is the process by which plants make food using sunlight?", #MultipleChoice, ["Respiration", "Fermentation", "Photosynthesis", "Digestion"], "Photosynthesis", #Easy);
    addQ(biologyId, "What is natural selection?", #MultipleChoice, ["Random mutation of genes", "Survival and reproduction of best-adapted organisms", "Formation of new species by isolation", "Transfer of genes between species"], "Survival and reproduction of best-adapted organisms", #Medium);
    addQ(biologyId, "Which base pairs with Adenine in DNA?", #MultipleChoice, ["Cytosine", "Guanine", "Thymine", "Uracil"], "Thymine", #Medium);
    addQ(biologyId, "What is a food chain?", #MultipleChoice, ["A cycle of water in nature", "Transfer of energy from producers to consumers", "A list of organisms in a biome", "The process of photosynthesis"], "Transfer of energy from producers to consumers", #Easy);
    addQ(biologyId, "What type of cell division produces gametes?", #MultipleChoice, ["Mitosis", "Binary fission", "Meiosis", "Budding"], "Meiosis", #Medium);
    addQ(biologyId, "Which part of the cell controls its activities?", #MultipleChoice, ["Cell membrane", "Cytoplasm", "Nucleus", "Vacuole"], "Nucleus", #Easy);
    addQ(biologyId, "Who proposed the theory of evolution by natural selection?", #MultipleChoice, ["Gregor Mendel", "Louis Pasteur", "Charles Darwin", "James Watson"], "Charles Darwin", #Easy);
    // Biology – TrueFalse
    addQ(biologyId, "All living cells contain DNA.", #TrueFalse, ["True", "False"], "True", #Easy);
    addQ(biologyId, "Prokaryotic cells have a membrane-bound nucleus.", #TrueFalse, ["True", "False"], "False", #Medium);
    addQ(biologyId, "Decomposers play no important role in an ecosystem.", #TrueFalse, ["True", "False"], "False", #Easy);
    addQ(biologyId, "Mutations are always harmful to an organism.", #TrueFalse, ["True", "False"], "False", #Medium);
    // Biology – FillInBlank
    addQ(biologyId, "The basic unit of life is the ___.", #FillInBlank, [], "cell", #Easy);
    addQ(biologyId, "DNA is found in the ___ of eukaryotic cells.", #FillInBlank, [], "nucleus", #Easy);
    addQ(biologyId, "Organisms that make their own food are called ___.", #FillInBlank, [], "producers", #Medium);
    addQ(biologyId, "The molecule that carries genetic information is ___.", #FillInBlank, [], "DNA", #Easy);
    addQ(biologyId, "The process of copying DNA is called DNA ___.", #FillInBlank, [], "replication", #Medium);
    addQ(biologyId, "An organism's physical traits are called its ___.", #FillInBlank, [], "phenotype", #Hard);

    // ─── Grammar & Writing questions (20) ────────────────────────────────────
    addQ(grammarId, "What part of speech is the word 'quickly'?", #MultipleChoice, ["Noun", "Verb", "Adjective", "Adverb"], "Adverb", #Easy);
    addQ(grammarId, "Which sentence uses a comma correctly?", #MultipleChoice, ["I like apples, and oranges", "She ran fast, but tired quickly.", "He came, he saw, he conquered.", "We need: milk eggs and bread."], "He came, he saw, he conquered.", #Medium);
    addQ(grammarId, "What is a noun?", #MultipleChoice, ["A word that describes an action", "A word that names a person, place, or thing", "A word that modifies a verb", "A word that connects clauses"], "A word that names a person, place, or thing", #Easy);
    addQ(grammarId, "Which of the following is a compound sentence?", #MultipleChoice, ["She ran.", "She ran fast and won.", "She ran because she was late.", "She ran, and she won."], "She ran, and she won.", #Medium);
    addQ(grammarId, "What punctuation ends an exclamatory sentence?", #MultipleChoice, ["Period", "Question mark", "Exclamation mark", "Comma"], "Exclamation mark", #Easy);
    addQ(grammarId, "What is the past tense of 'run'?", #MultipleChoice, ["Runned", "Ran", "Running", "Runs"], "Ran", #Easy);
    addQ(grammarId, "Which word is a conjunction?", #MultipleChoice, ["Quickly", "Beautiful", "Although", "Happiness"], "Although", #Medium);
    addQ(grammarId, "What is a pronoun?", #MultipleChoice, ["A word that modifies a noun", "A word that takes the place of a noun", "A word that shows action", "A word that joins sentences"], "A word that takes the place of a noun", #Easy);
    addQ(grammarId, "Which sentence is written in active voice?", #MultipleChoice, ["The cake was eaten by John.", "The book was read by Mary.", "John ate the cake.", "The race was won."], "John ate the cake.", #Medium);
    addQ(grammarId, "What is a preposition?", #MultipleChoice, ["A word showing action", "A word showing the relationship between a noun and other words", "A describing word", "A connecting word"], "A word showing the relationship between a noun and other words", #Medium);
    // Grammar – TrueFalse
    addQ(grammarId, "A sentence must have both a subject and a predicate.", #TrueFalse, ["True", "False"], "True", #Easy);
    addQ(grammarId, "An adjective modifies a verb.", #TrueFalse, ["True", "False"], "False", #Easy);
    addQ(grammarId, "A semicolon can connect two independent clauses.", #TrueFalse, ["True", "False"], "True", #Medium);
    addQ(grammarId, "All nouns are proper nouns.", #TrueFalse, ["True", "False"], "False", #Easy);
    // Grammar – FillInBlank
    addQ(grammarId, "A word that describes a noun is called an ___.", #FillInBlank, [], "adjective", #Easy);
    addQ(grammarId, "The three types of articles are a, an, and ___.", #FillInBlank, [], "the", #Easy);
    addQ(grammarId, "A group of words with a subject and verb that cannot stand alone is a ___ clause.", #FillInBlank, [], "dependent", #Medium);
    addQ(grammarId, "A sentence that asks a question ends with a ___.", #FillInBlank, [], "question mark", #Easy);
    addQ(grammarId, "The plural of 'child' is ___.", #FillInBlank, [], "children", #Medium);
    addQ(grammarId, "A word that sounds like another but has a different meaning is a ___.", #FillInBlank, [], "homophone", #Hard);

    // ─── Literary Analysis questions (20) ────────────────────────────────────
    addQ(literaryId, "What is the central message or insight of a literary work?", #MultipleChoice, ["Plot", "Setting", "Theme", "Tone"], "Theme", #Easy);
    addQ(literaryId, "A metaphor is:", #MultipleChoice, ["A comparison using 'like' or 'as'", "A direct comparison between two unlike things", "A humorous exaggeration", "Giving human traits to non-human things"], "A direct comparison between two unlike things", #Medium);
    addQ(literaryId, "What is the climax of a story?", #MultipleChoice, ["The introduction of characters", "The turning point or most intense moment", "The resolution of conflict", "The background information"], "The turning point or most intense moment", #Easy);
    addQ(literaryId, "What is foreshadowing in literature?", #MultipleChoice, ["Repeating key phrases", "Hints about future events", "Describing the setting in detail", "Comparing two characters"], "Hints about future events", #Medium);
    addQ(literaryId, "What is a simile?", #MultipleChoice, ["A direct comparison", "A comparison using 'like' or 'as'", "A story with a moral", "A type of rhyme scheme"], "A comparison using 'like' or 'as'", #Easy);
    addQ(literaryId, "What term describes the narrator who tells a story using 'I'?", #MultipleChoice, ["Third-person limited", "Third-person omniscient", "First-person narrator", "Unreliable narrator"], "First-person narrator", #Easy);
    addQ(literaryId, "What is the exposition of a story?", #MultipleChoice, ["The climax of the plot", "The conclusion", "The introduction providing background information", "The falling action"], "The introduction providing background information", #Easy);
    addQ(literaryId, "What literary device gives human qualities to non-human things?", #MultipleChoice, ["Simile", "Metaphor", "Personification", "Hyperbole"], "Personification", #Medium);
    addQ(literaryId, "An extreme exaggeration used for emphasis is called:", #MultipleChoice, ["Irony", "Alliteration", "Hyperbole", "Symbolism"], "Hyperbole", #Medium);
    addQ(literaryId, "What is the setting of a story?", #MultipleChoice, ["The main character's personality", "The conflict in the story", "The time and place where the story happens", "The moral lesson"], "The time and place where the story happens", #Easy);
    // Literary – TrueFalse
    addQ(literaryId, "The protagonist is the main character of a story.", #TrueFalse, ["True", "False"], "True", #Easy);
    addQ(literaryId, "An antagonist always has to be a person.", #TrueFalse, ["True", "False"], "False", #Medium);
    addQ(literaryId, "Alliteration is the repetition of consonant sounds at the beginning of words.", #TrueFalse, ["True", "False"], "True", #Easy);
    addQ(literaryId, "The resolution comes before the climax in narrative structure.", #TrueFalse, ["True", "False"], "False", #Easy);
    // Literary – FillInBlank
    addQ(literaryId, "The struggle between opposing forces in a story is called ___.", #FillInBlank, [], "conflict", #Easy);
    addQ(literaryId, "A story that teaches a lesson using animals is called a ___.", #FillInBlank, [], "fable", #Medium);
    addQ(literaryId, "The character who opposes the protagonist is called the ___.", #FillInBlank, [], "antagonist", #Easy);
    addQ(literaryId, "When the audience knows something a character does not, it is called dramatic ___.", #FillInBlank, [], "irony", #Hard);
    addQ(literaryId, "A recurring symbol or idea throughout a work is called a ___.", #FillInBlank, [], "motif", #Hard);
    addQ(literaryId, "The sequence of events in a story is called the ___.", #FillInBlank, [], "plot", #Easy);
  };
};
