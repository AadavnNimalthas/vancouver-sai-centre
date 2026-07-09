import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { StudioApp, type StudioSeedUser } from "./StudioApp";

// VSC roles that get ISai admin tools (the "Curator" lineup builder).
const VSC_ADMIN_ROLES = ["executive", "president", "administrator"];

export default async function StudioPage() {
  // The portal already requires auth, but resolve the member here so we can
  // seed the studio and auto-log-them-in — no separate ISai sign-in.
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/portal/bhajans/studio");

  const initialUser: StudioSeedUser = {
    userId: `vsc-${user.id}`,
    name: user.fullName || user.email,
    email: user.email,
    role: VSC_ADMIN_ROLES.includes(user.role) ? "ADMIN" : "SINGER",
    skillRating: 2,
    preferredDeity: "Sai",
    centerId: "center-123",
    isHarmoniumPlayer: false,
    vibrationLevel: 108,
    authProvider: "vsc",
    vscRole: user.role,
  };

  return <StudioApp initialUser={initialUser} />;
}
