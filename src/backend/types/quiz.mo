import Common "common";

module {
  public type SessionStatus = {
    #InProgress;
    #Completed;
    #Abandoned;
  };

  public type QuizSession = {
    sessionId : Common.SessionId;
    userId : Common.UserId;
    chapterId : Common.ChapterId;
    questionIds : [Common.QuestionId];
    timeLimit : Nat;
    startTime : Common.Timestamp;
    status : SessionStatus;
  };

  public type QuestionResult = {
    questionId : Common.QuestionId;
    userAnswer : Text;
    isCorrect : Bool;
    timeSpent : Nat;
  };

  public type QuizAttempt = {
    attemptId : Common.AttemptId;
    sessionId : Common.SessionId;
    userId : Common.UserId;
    subjectId : Common.SubjectId;
    chapterId : Common.ChapterId;
    totalQuestions : Nat;
    correctAnswers : Nat;
    score : Float;
    timeTaken : Nat;
    completedAt : Common.Timestamp;
    questionResults : [QuestionResult];
  };

  public type SubmitAnswerInput = {
    questionId : Common.QuestionId;
    userAnswer : Text;
    timeSpent : Nat;
  };

  public type StartSessionInput = {
    chapterId : Common.ChapterId;
    questionCount : Nat;
    timeLimit : Nat;
  };
};
