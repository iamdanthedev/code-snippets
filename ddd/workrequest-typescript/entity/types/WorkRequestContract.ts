import { UserRef } from "../../misc";

export interface WorkRequestContract {
  signedOn: Date;
  signedBy: UserRef; // maybe that's meaningless
}
