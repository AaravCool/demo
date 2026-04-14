import List "mo:core/List";
import Principal "mo:core/Principal";
import StudentTypes "../types/student";
import QuizTypes "../types/quiz";
import Common "../types/common";

module {
  public func getStudentProfile(
    attempts : List.List<QuizTypes.QuizAttempt>,
    userId : Common.UserId
  ) : StudentTypes.StudentProfile {
    let userAttempts = attempts.filter(func(a) { Principal.equal(a.userId, userId) });
    let totalAttempts = userAttempts.size();

    if (totalAttempts == 0) {
      return {
        userId;
        totalAttempts = 0;
        bestScore = 0.0;
        averageScore = 0.0;
        lastActivity = 0;
      };
    };

    var bestScore : Float = 0.0;
    var scoreSum : Float = 0.0;
    var lastActivity : Common.Timestamp = 0;

    userAttempts.forEach(func(a) {
      if (a.score > bestScore) { bestScore := a.score };
      scoreSum := scoreSum + a.score;
      if (a.completedAt > lastActivity) { lastActivity := a.completedAt };
    });

    let averageScore = scoreSum / totalAttempts.toFloat();

    {
      userId;
      totalAttempts;
      bestScore;
      averageScore;
      lastActivity;
    }
  };
};
