import profiles from "@/data/userProfiles.json";
import { CustomerTier, UserProfile } from "@/types/panopticon";

const typedProfiles = profiles as Record<string, UserProfile>;

export function getUserProfile(userId: string, tier: CustomerTier): UserProfile {
  return (
    typedProfiles[userId] ?? {
      userId,
      companyName: "Demo Account",
      tier,
      monthlySpendUsd: tier === "Enterprise" ? 25000 : tier === "Standard" ? 5000 : 0,
      contractRenewalDays: 120,
      criticalIntegrations: ["Payments API"],
      accountOwner: tier === "Free" ? "Community Support" : "Panopticon Success"
    }
  );
}
