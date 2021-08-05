import { Column, Entity } from "~/Domain/metadata";
import { FileRef } from "~/Domain/types";
import { BookingWeekDocumentTypes } from "~/Shared/Enums";

export { BookingWeekDocumentTypes };

@Entity()
export class BookingDocument {
  @Column()
  fileRef: FileRef;

  @Column()
  documentType?: BookingWeekDocumentTypes;
}
