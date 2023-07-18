export enum status {
  "loan" = "On Loan",
  "holdShelf" = "On Hold Shelf",
  "inLibrary" ="In Library",
  "notAvailable" = "Not Available - Search in Progress"
}
type stackRequestItem = "false" | "true"
type book = {
  callNum: string,
  material: string,
  location: string,
  status: status,
  stackRequestItem: stackRequestItem
}
export type branchStatus = {
  branchName: string
  items: book[]
}
export type bookStatus = {
  titleId: string,
  titleItem: string,
  catalogFormat: string,
  numCopies: string,
  numHolds: string,
  summary: string,
  branches: branchStatus[]
}