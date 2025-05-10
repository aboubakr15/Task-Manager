"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import LoadingPage from "@/components/LoadingPage";
import { emailSchema } from "@/lib/validations/auth";

// Validation schema for the invite form
const inviteFormSchema = z.object({
  email: emailSchema,
  role: z.enum(["admin", "member"], {
    required_error: "Please select a role",
  }),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

interface Team {
  id: string;
  name: string;
}

export default function InviteMemberPage({ params }: { params: { id: string } }) {
  const { status } = useSession();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch(`/api/teams/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch team");
        }
        const data = await response.json();
        setTeam(data.team);
      } catch (error) {
        console.error("Error fetching team:", error);
        setError("Failed to load team. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchTeam();
    }
  }, [status, params.id]);

  const onSubmit = async (values: InviteFormValues) => {
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/teams/${params.id}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to invite member");
      }

      setSuccess("Member invited successfully!");
      form.reset();
    } catch (error) {
      console.error("Error inviting member:", error);
      setError(error instanceof Error ? error.message : "Failed to invite member");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return <LoadingPage message="Verifying your session..." />;
  }

  if (loading) {
    return <LoadingPage message="Loading team details..." />;
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="bg-white rounded-xl shadow-md p-8 border border-red-200 max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Team Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The team you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Button
            onClick={() => router.push("/dashboard/teams")}
            className="w-full"
          >
            Go Back to Teams
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 border border-blue-200">
            <div className="flex items-center mb-6">
              <Button
                variant="ghost"
                onClick={() => router.push(`/dashboard/teams/${params.id}`)}
                className="mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-800">
                Invite to {team.name}
              </h1>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-500 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
                {success}
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="name@example.com"
                          {...field}
                          className="bg-white border-blue-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white border-blue-200">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Inviting...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invite Member
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
