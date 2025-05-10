import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function getUserTeams() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return [];

  const teams = await db.team.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
  });

  return teams;
}
