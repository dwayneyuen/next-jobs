import { Test } from "@nestjs/testing";
import { v4 } from "uuid";
import { PaypalSubscriptionStatus } from "@dwayneyuen/next-cron-prisma";
import { PaypalController } from "src/controllers/paypal/paypal.controller";
import { PrismaService } from "src/prisma/prisma.service";
import { UserFactory } from "test/factories/user.factory";
import { PlanFactory } from "test/factories/plan.factory";
import { PrismaModule } from "src/prisma/prisma.module";

describe("PaypalController", () => {
  let paypalController: PaypalController;
  let planFactory: PlanFactory;
  let prismaService: PrismaService;
  let userFactory: UserFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PaypalController, PrismaModule],
      providers: [PaypalController, PlanFactory, PrismaService, UserFactory],
    }).compile();

    paypalController = moduleRef.get(PaypalController);
    planFactory = moduleRef.get(PlanFactory);
    prismaService = moduleRef.get(PrismaService);
    userFactory = moduleRef.get(UserFactory);
  });

  describe("webhook with a subscription created message", () => {
    it("should update subscription status", async () => {
      const plan = await planFactory.create();
      const user = await userFactory.create({
        paypalSubscriptionId: v4(),
        planId: plan.id,
        paypalSubscriptionStatus: null,
      });

      paypalController.webhook({
        create_time: new Date(),
        id: v4(),
        resource_type: "subscription",
        event_type: "BILLING.SUBSCRIPTION.CREATED",
        summary: "",
        resource: {
          id: user.paypalSubscriptionId,
          plan_id: plan.paypalPlanId,
          status: PaypalSubscriptionStatus.APPROVAL_PENDING,
        },
      });

      const userAfter = await prismaService.user.findUnique({
        where: { id: user.id },
      });
      expect(userAfter?.paypalSubscriptionStatus).toEqual(
        PaypalSubscriptionStatus.APPROVAL_PENDING,
      );
    });
  });
  describe("with a subscription cancelled message", () => {
    it("should update subscription status", () => {
      expect(true).toEqual(false);
    });
  });
  describe("with a subscription active message", () => {
    it("should update subscription status", async () => {
      const plan = await planFactory.create();
      const user = await userFactory.create({
        paypalSubscriptionId: v4(),
        planId: plan.id,
        paypalSubscriptionStatus: null,
      });

      paypalController.webhook({
        create_time: new Date(),
        id: v4(),
        resource_type: "subscription",
        event_type: "BILLING.SUBSCRIPTION.CREATED",
        summary: "",
        resource: {
          id: user.paypalSubscriptionId,
          plan_id: plan.paypalPlanId,
          status: PaypalSubscriptionStatus.ACTIVE,
        },
      });

      const userAfter = await prismaService.user.findUnique({
        where: { id: user.id },
      });
      expect(userAfter?.paypalSubscriptionStatus).toEqual(
        PaypalSubscriptionStatus.ACTIVE,
      );
    });
  });
  describe("with a subscription expired message", () => {
    it("should update subscription status", () => {
      expect(true).toEqual(false);
    });
  });
  describe("with a subscription payment failed message", () => {
    it("should update subscription status", () => {
      expect(true).toEqual(false);
    });
  });
  describe("with a subscription re-activated message", () => {
    it("should update subscription status", () => {
      expect(true).toEqual(false);
    });
  });
  describe("with a subscription suspended message", () => {
    it("should update subscription status", () => {
      expect(true).toEqual(false);
    });
  });
  describe("with a subscription updated message", () => {
    it("should update subscription status", () => {
      expect(true).toEqual(false);
    });
  });
});
