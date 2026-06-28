import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.documentTypeListItem("post").title("Posts"),
      S.documentTypeListItem("profile").title("Profiles"),
      S.documentTypeListItem("comment").title("Comments"),
      S.divider(),
      S.documentTypeListItem("chat").title("Chats"),
      S.documentTypeListItem("message").title("Messages"),
      S.documentTypeListItem("messageRequest").title("Message requests"),
      S.divider(),
      S.documentTypeListItem("soundPad").title("Sound pads"),
    ]);
