export function shouldViewAsSuperUser(): boolean {
  return localStorage.getItem("view-as") !== "regular";
}
