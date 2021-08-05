import sinon from "sinon";
import { expect } from "chai";
import { ObjectID } from "bson";
import { ConsultantBookedPeriodFinder } from "~/Domain/implementation/ConsultantBookedPeriodFinder";
import { createStubInstance, momentWeekUTC, sameDate, weekUTC } from "~/test/testUtils";
import { BookingWeekRepository } from "~/Domain/repository";

describe("ConsultantBookedPeriodFinder", () => {
  describe("getPeriod", () => {
    const repoMock = createStubInstance(BookingWeekRepository);
    const service = new ConsultantBookedPeriodFinder(repoMock.__instance);

    beforeEach(() => sinon.reset());

    it("should return null when no bookings exist", async () => {
      repoMock.findByConsultantIdEarliestActive.resolves(null);
      const result = await service.getPeriod(new ObjectID());
      expect(result).eq(null);
    });

    it("should return first week start / last week end", async () => {
      repoMock.findByConsultantIdEarliestActive.resolves({
        week: weekUTC(10, 2020)
      });

      repoMock.findByConsultantIdLatestActive.resolves({
        week: weekUTC(14, 2020)
      });

      const result = await service.getPeriod(new ObjectID());

      expect(result.from).satisfy(sameDate(momentWeekUTC(10, 2020)));
      expect(result.to).satisfy(sameDate(momentWeekUTC(14, 2020).endOf("isoWeek")));
    });
  });
});
