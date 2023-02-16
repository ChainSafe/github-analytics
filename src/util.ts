export function isTeamMember(
  members: string[],
  member: string | undefined
): boolean {
  if (members.length === 0) {
    return true;
  }
  //probably bot
  if (!member) {
    return false;
  }
  return members.includes(member.trim().toLowerCase());
}

export function isBot(author: string | undefined): boolean {
  return (
    author == undefined ||
    author === "dependabot" ||
    author === "github-actions" ||
    author === "renovate"
  );
}
