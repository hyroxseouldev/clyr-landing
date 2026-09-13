import "server-only";
import { SolapiMessageService } from "solapi";
import { createOtpSender } from "./send-otp";

export function createSolapiSender(config: {
  apiKey: string;
  apiSecret: string;
  senderNumber: string;
}) {
  const service = new SolapiMessageService(config.apiKey, config.apiSecret);
  return createOtpSender(config.senderNumber, (message) =>
    service.send(message),
  );
}
