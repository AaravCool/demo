import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import StudentTypes "../types/student";
import QuizTypes "../types/quiz";
import StudentLib "../lib/student";

mixin (
  userProfiles : Map.Map<Principal, StudentTypes.UserProfile>,
  attempts : List.List<QuizTypes.QuizAttempt>
) {
  public query ({ caller }) func getMyProfile() : async StudentTypes.StudentProfile {
    StudentLib.getStudentProfile(attempts, caller)
  };

  public query ({ caller }) func getCallerUserProfile() : async ?StudentTypes.UserProfile {
    userProfiles.get(caller)
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : StudentTypes.UserProfile) : async () {
    userProfiles.add(caller, profile)
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?StudentTypes.UserProfile {
    userProfiles.get(user)
  };
};
