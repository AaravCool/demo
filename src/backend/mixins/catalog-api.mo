import List "mo:core/List";
import CatalogTypes "../types/catalog";
import Common "../types/common";
import CatalogLib "../lib/catalog";

mixin (
  subjects : List.List<CatalogTypes.Subject>,
  chapters : List.List<CatalogTypes.Chapter>,
  questions : List.List<CatalogTypes.Question>
) {
  public query func getSubjects() : async [CatalogTypes.Subject] {
    CatalogLib.getSubjects(subjects)
  };

  public query func getChapters(subjectId : Common.SubjectId) : async [CatalogTypes.Chapter] {
    CatalogLib.getChapters(chapters, subjectId)
  };

  public query func getQuestions(chapterId : Common.ChapterId, count : Nat) : async [CatalogTypes.Question] {
    CatalogLib.getQuestions(questions, chapterId, count)
  };
};
