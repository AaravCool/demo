import Common "common";

module {
  public type Subject = {
    id : Common.SubjectId;
    name : Text;
    description : Text;
  };

  public type Chapter = {
    id : Common.ChapterId;
    subjectId : Common.SubjectId;
    name : Text;
    description : Text;
  };

  public type QuestionType = {
    #MultipleChoice;
    #TrueFalse;
    #FillInBlank;
  };

  public type Difficulty = {
    #Easy;
    #Medium;
    #Hard;
  };

  public type Question = {
    id : Common.QuestionId;
    chapterId : Common.ChapterId;
    questionText : Text;
    questionType : QuestionType;
    options : [Text];
    correctAnswer : Text;
    difficulty : Difficulty;
    solution : ?Text;
  };
};
