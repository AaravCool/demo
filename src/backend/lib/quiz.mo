import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import QuizTypes "../types/quiz";
import CatalogTypes "../types/catalog";
import Common "../types/common";

module {
  public func submitQuizAttempt(
    attempts : List.List<QuizTypes.QuizAttempt>,
    questions : List.List<CatalogTypes.Question>,
    chapters : List.List<CatalogTypes.Chapter>,
    sessionInput : QuizTypes.StartSessionInput,
    answers : [QuizTypes.SubmitAnswerInput],
    caller : Common.UserId,
    nextAttemptId : { var value : Nat },
    nextSessionId : { var value : Nat }
  ) : QuizTypes.QuizAttempt {
    // Determine subjectId from chapterId
    let chapterOpt = chapters.find(func(c) { c.id == sessionInput.chapterId });
    let subjectId = switch (chapterOpt) {
      case (?ch) ch.subjectId;
      case null 0;
    };

    // Build questionResults with isCorrect
    var correctCount : Nat = 0;
    let resultList = List.empty<QuizTypes.QuestionResult>();
    var totalTime : Nat = 0;

    for (ans in answers.values()) {
      let questionOpt = questions.find(func(q) { q.id == ans.questionId });
      let isCorrect = switch (questionOpt) {
        case (?q) q.correctAnswer.toLower() == ans.userAnswer.toLower();
        case null false;
      };
      if (isCorrect) { correctCount += 1 };
      totalTime += ans.timeSpent;
      resultList.add({
        questionId = ans.questionId;
        userAnswer = ans.userAnswer;
        isCorrect;
        timeSpent = ans.timeSpent;
      });
    };

    let totalQuestions = answers.size();
    let score : Float = if (totalQuestions == 0) 0.0
      else (correctCount.toFloat() / totalQuestions.toFloat()) * 100.0;

    let attemptId = nextAttemptId.value;
    nextAttemptId.value += 1;
    let sessionId = nextSessionId.value;
    nextSessionId.value += 1;

    let attempt : QuizTypes.QuizAttempt = {
      attemptId;
      sessionId;
      userId = caller;
      subjectId;
      chapterId = sessionInput.chapterId;
      totalQuestions;
      correctAnswers = correctCount;
      score;
      timeTaken = totalTime;
      completedAt = Time.now();
      questionResults = resultList.toArray();
    };

    attempts.add(attempt);
    attempt
  };

  public func getAttemptsByUser(
    attempts : List.List<QuizTypes.QuizAttempt>,
    userId : Common.UserId
  ) : [QuizTypes.QuizAttempt] {
    attempts.filter(func(a) { Principal.equal(a.userId, userId) }).toArray()
  };

  public func getAttemptById(
    attempts : List.List<QuizTypes.QuizAttempt>,
    attemptId : Common.AttemptId,
    userId : Common.UserId
  ) : ?QuizTypes.QuizAttempt {
    attempts.find(func(a) { a.attemptId == attemptId and Principal.equal(a.userId, userId) })
  };
};
