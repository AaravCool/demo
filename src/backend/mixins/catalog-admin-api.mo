import List "mo:core/List";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import CatalogTypes "../types/catalog";
import Common "../types/common";

mixin (
  subjects : List.List<CatalogTypes.Subject>,
  chapters : List.List<CatalogTypes.Chapter>,
  questions : List.List<CatalogTypes.Question>,
  subjectCounter : { var value : Nat },
  chapterCounter : { var value : Nat },
  questionCounter : { var value : Nat },
  adminPrincipalRef : { var value : Text }
) {

  // ── Diagnostics (no auth required) ─────────────────────────────────────────

  public shared query ({ caller }) func getCallerPrincipal() : async Text {
    caller.toText()
  };

  public query func getAdminPrincipal() : async Text {
    adminPrincipalRef.value
  };

  // ── Subjects ────────────────────────────────────────────────────────────────

  public shared ({ caller }) func addSubject(name : Text, description : Text) : async { #ok : Common.SubjectId; #err : Text } {
    if (caller.toText() != adminPrincipalRef.value) return #err("Unauthorized");
    let id = subjectCounter.value;
    subjectCounter.value += 1;
    subjects.add({ id; name; description });
    #ok(id)
  };

  public shared ({ caller }) func updateSubject(id : Common.SubjectId, name : Text, description : Text) : async { #ok : (); #err : Text } {
    if (caller.toText() != adminPrincipalRef.value) return #err("Unauthorized");
    switch (subjects.findIndex(func(s) { s.id == id })) {
      case (?idx) {
        subjects.put(idx, { id; name; description });
        #ok(())
      };
      case null { #err("Subject not found") };
    }
  };

  public shared ({ caller }) func deleteSubject(id : Common.SubjectId) : async { #ok : (); #err : Text } {
    if (caller.toText() != adminPrincipalRef.value) return #err("Unauthorized");
    let before = subjects.size();
    let kept = subjects.filter(func(s) { s.id != id });
    subjects.clear();
    subjects.append(kept);
    if (subjects.size() < before) #ok(()) else #err("Subject not found")
  };

  // ── Chapters ────────────────────────────────────────────────────────────────

  public shared ({ caller }) func addChapter(subjectId : Common.SubjectId, name : Text) : async { #ok : Common.ChapterId; #err : Text } {
    if (caller.toText() != adminPrincipalRef.value) return #err("Unauthorized");
    switch (subjects.find(func(s) { s.id == subjectId })) {
      case null { return #err("Subject not found") };
      case _ {};
    };
    let id = chapterCounter.value;
    chapterCounter.value += 1;
    chapters.add({ id; subjectId; name; description = "" });
    #ok(id)
  };

  public shared ({ caller }) func updateChapter(id : Common.ChapterId, name : Text) : async { #ok : (); #err : Text } {
    if (caller.toText() != adminPrincipalRef.value) return #err("Unauthorized");
    switch (chapters.findIndex(func(c) { c.id == id })) {
      case (?idx) {
        let existing = chapters.at(idx);
        chapters.put(idx, { existing with name });
        #ok(())
      };
      case null { #err("Chapter not found") };
    }
  };

  public shared ({ caller }) func deleteChapter(id : Common.ChapterId) : async { #ok : (); #err : Text } {
    if (caller.toText() != adminPrincipalRef.value) return #err("Unauthorized");
    let before = chapters.size();
    let kept = chapters.filter(func(c) { c.id != id });
    chapters.clear();
    chapters.append(kept);
    if (chapters.size() < before) #ok(()) else #err("Chapter not found")
  };

  // ── Questions ────────────────────────────────────────────────────────────────

  public shared ({ caller }) func addQuestion(
    chapterId : Common.ChapterId,
    text : Text,
    questionType : Text,
    options : [Text],
    correctAnswer : Text,
    difficulty : Text
  ) : async { #ok : Common.QuestionId; #err : Text } {
    if (caller.toText() != adminPrincipalRef.value) return #err("Unauthorized");
    let qtype : CatalogTypes.QuestionType = switch (questionType) {
      case ("MultipleChoice") #MultipleChoice;
      case ("TrueFalse") #TrueFalse;
      case ("FillInBlank") #FillInBlank;
      case (_) return #err("Invalid question type: " # questionType);
    };
    let diff : CatalogTypes.Difficulty = switch (difficulty) {
      case ("Easy") #Easy;
      case ("Medium") #Medium;
      case ("Hard") #Hard;
      case (_) return #err("Invalid difficulty: " # difficulty);
    };
    let id = questionCounter.value;
    questionCounter.value += 1;
    questions.add({
      id;
      chapterId;
      questionText = text;
      questionType = qtype;
      options;
      correctAnswer;
      difficulty = diff;
    });
    #ok(id)
  };

  public shared ({ caller }) func deleteQuestion(id : Common.QuestionId) : async { #ok : (); #err : Text } {
    if (caller.toText() != adminPrincipalRef.value) return #err("Unauthorized");
    let before = questions.size();
    let kept = questions.filter(func(q) { q.id != id });
    questions.clear();
    questions.append(kept);
    if (questions.size() < before) #ok(()) else #err("Question not found")
  };

  // ── Bulk Import ──────────────────────────────────────────────────────────────
  // Line format (pipe-separated):
  //   Question text | opt1 | opt2 | opt3 | opt4 | correct_answer | question_type | difficulty | chapterId
  // question_type: MultipleChoice | TrueFalse | FillInBlank
  // difficulty (optional, default Medium): Easy | Medium | Hard
  // chapterId (optional, default 0): Nat

  public shared ({ caller }) func bulkImportQuestions(data : Text) : async { #ok : Nat; #err : Text } {
    if (caller.toText() != adminPrincipalRef.value) return #err("Unauthorized");
    var imported : Nat = 0;
    for (line in data.split(#char '\n')) {
      let trimmed = line.trim(#char ' ');
      if (not trimmed.isEmpty()) {
        let partList = List.empty<Text>();
        for (p in trimmed.split(#char '|')) {
          partList.add(p.trim(#char ' '));
        };
        let parts = partList.toArray();
        if (parts.size() >= 7) {
          let questionText = parts[0];
          let correctAnswer = parts[5];
          let questionTypeText = parts[6];
          let difficultyText = if (parts.size() >= 8) parts[7] else "Medium";
          let chapterId : Nat = if (parts.size() >= 9) {
            switch (Nat.fromText(parts[8])) {
              case (?n) n;
              case null 0;
            }
          } else 0;
          let qtype : CatalogTypes.QuestionType = switch (questionTypeText) {
            case ("TrueFalse") #TrueFalse;
            case ("FillInBlank") #FillInBlank;
            case (_) #MultipleChoice;
          };
          let diff : CatalogTypes.Difficulty = switch (difficultyText) {
            case ("Easy") #Easy;
            case ("Hard") #Hard;
            case (_) #Medium;
          };
          let opts = List.empty<Text>();
          var oi : Nat = 1;
          while (oi <= 4 and oi + 2 < parts.size()) {
            opts.add(parts[oi]);
            oi += 1;
          };
          let id = questionCounter.value;
          questionCounter.value += 1;
          questions.add({
            id;
            chapterId;
            questionText;
            questionType = qtype;
            options = opts.toArray();
            correctAnswer;
            difficulty = diff;
          });
          imported += 1;
        };
      };
    };
    #ok(imported)
  };
};
