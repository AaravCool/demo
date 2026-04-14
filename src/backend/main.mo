import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal"; // used by Map.empty<Principal, ...>
import CatalogTypes "types/catalog";
import QuizTypes "types/quiz";
import StudentTypes "types/student";
import CatalogLib "lib/catalog";
import CatalogApi "mixins/catalog-api";
import CatalogAdminApi "mixins/catalog-admin-api";
import QuizApi "mixins/quiz-api";
import StudentApi "mixins/student-api";
import Migration "migration";

(with migration = Migration.run)
actor {
  let subjects = List.empty<CatalogTypes.Subject>();
  let chapters = List.empty<CatalogTypes.Chapter>();
  let questions = List.empty<CatalogTypes.Question>();
  let attempts = List.empty<QuizTypes.QuizAttempt>();
  let userProfiles = Map.empty<Principal, StudentTypes.UserProfile>();

  let subjectCounter = { var value : Nat = 0 };
  let chapterCounter = { var value : Nat = 0 };
  let questionCounter = { var value : Nat = 0 };
  let attemptCounter = { var value : Nat = 0 };
  let sessionCounter = { var value : Nat = 0 };

  var seeded : Bool = false;

  // Admin principal — empty string means unclaimed. Call claimAdmin() once to set.
  let adminPrincipalRef = { var value : Text = "" };

  // Seed catalog data exactly once
  if (not seeded) {
    CatalogLib.seedSampleData(subjects, chapters, questions, subjectCounter, chapterCounter, questionCounter);
    seeded := true;
  };

  /// Set the admin to the caller if not yet claimed (adminPrincipal == "").
  /// Returns #ok with a confirmation message, or #err if already set.
  public shared ({ caller }) func claimAdmin() : async { #ok : Text; #err : Text } {
    if (adminPrincipalRef.value != "") return #err("Admin already set to " # adminPrincipalRef.value);
    adminPrincipalRef.value := caller.toText();
    #ok("Admin set to " # adminPrincipalRef.value)
  };

  include CatalogApi(subjects, chapters, questions);
  include CatalogAdminApi(subjects, chapters, questions, subjectCounter, chapterCounter, questionCounter, adminPrincipalRef);
  include QuizApi(attempts, questions, chapters, attemptCounter, sessionCounter);
  include StudentApi(userProfiles, attempts);
};
