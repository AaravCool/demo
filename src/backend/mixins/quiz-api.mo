import List "mo:core/List";
import QuizTypes "../types/quiz";
import CatalogTypes "../types/catalog";
import Common "../types/common";
import QuizLib "../lib/quiz";

mixin (
  attempts : List.List<QuizTypes.QuizAttempt>,
  questions : List.List<CatalogTypes.Question>,
  chapters : List.List<CatalogTypes.Chapter>,
  nextAttemptId : { var value : Nat },
  nextSessionId : { var value : Nat }
) {
  public shared ({ caller }) func submitQuizAttempt(
    sessionInput : QuizTypes.StartSessionInput,
    answers : [QuizTypes.SubmitAnswerInput]
  ) : async QuizTypes.QuizAttempt {
    QuizLib.submitQuizAttempt(attempts, questions, chapters, sessionInput, answers, caller, nextAttemptId, nextSessionId)
  };

  public query ({ caller }) func getMyAttempts() : async [QuizTypes.QuizAttempt] {
    QuizLib.getAttemptsByUser(attempts, caller)
  };

  public query ({ caller }) func getAttemptDetail(attemptId : Common.AttemptId) : async ?QuizTypes.QuizAttempt {
    QuizLib.getAttemptById(attempts, attemptId, caller)
  };
};
