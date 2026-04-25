import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import CatalogTypes "types/catalog";
import QuizTypes "types/quiz";
import StudentTypes "types/student";
import CatalogLib "lib/catalog";
import CatalogApi "mixins/catalog-api";
import CatalogAdminApi "mixins/catalog-admin-api";
import QuizApi "mixins/quiz-api";
import StudentApi "mixins/student-api";



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

  // Admin principal — immutable constant, never overridden.
  let admin : Principal = Principal.fromText("stg4z-mbqle-h7omu-re7wj-od36c-yptmv-y5zbm-gmwfv-3zcmc-gvegn-iae");

  // Seed catalog data exactly once
  if (not seeded) {
    CatalogLib.seedSampleData(subjects, chapters, questions, subjectCounter, chapterCounter, questionCounter);
    seeded := true;
  };

  include CatalogApi(subjects, chapters, questions);
  include CatalogAdminApi(subjects, chapters, questions, subjectCounter, chapterCounter, questionCounter, admin);
  include QuizApi(attempts, questions, chapters, attemptCounter, sessionCounter);
  include StudentApi(userProfiles, attempts);
};
