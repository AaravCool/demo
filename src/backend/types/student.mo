import Common "common";

module {
  public type StudentProfile = {
    userId : Common.UserId;
    totalAttempts : Nat;
    bestScore : Float;
    averageScore : Float;
    lastActivity : Common.Timestamp;
  };

  public type UserProfile = {
    name : Text;
  };
};
