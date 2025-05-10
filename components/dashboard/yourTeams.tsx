import { db } from "@/lib/db";
import { Button } from "../ui/button";
import { useSession } from "next-auth/react";
import getYourTeams from "@/lib/actions/getYourTeams";

async function YourTeams() {
  const teams = await getYourTeams();

  console.log(teams);
  return (
    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
      <h2 className="flex justify-between text-xl font-semibold text-blue-700 mb-4">
        <span>Your Teams</span>
        <Button className="bg-blue-600 text-white">+ Create team</Button>
      </h2>
      <p className="text-gray-600">
        You are not part of any team yet. Create or join a team to collaborate.
      </p>
    </div>
  );
}

export default YourTeams;
