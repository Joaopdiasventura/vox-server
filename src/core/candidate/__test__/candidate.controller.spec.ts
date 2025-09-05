import { Test, TestingModule } from "@nestjs/testing";
import { CandidateController } from "./candidate.controller";
import { CandidateService } from "./candidate.service";

describe("CandidateController", () => {
  let controller: CandidateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CandidateController],
      providers: [CandidateService],
    }).compile();

    controller = module.get<CandidateController>(CandidateController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
