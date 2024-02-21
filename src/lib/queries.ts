"use server";
import { currentUser } from "@clerk/nextjs";
import { db } from "./db";
import { redirect } from "next/navigation";
import { User } from "@prisma/client";

export const getAuthUserDetails = async () => {
  const user = await currentUser();
  if (!user) {
    return;
  }

  const userdata = await db.user.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    include: {
      Agency: {
        include: {
          SidebarOption: true,
          SubAccount: {
            include: {
              SidebarOption: true,
            },
          },
        },
      },
      Permissions: true,
    },
  });

  return userdata;
};

export const createTeamUser = async (agencyId: string, user: User) => {
  if (user.role === "AGENCY_OWNER") return null;
  const response = await db.user.create({ data: { ...user } });
};

export const verfiyandacceptinvite = async () => {
  const user = await currentUser();
  if (!user) return redirect("/sign-in");
  const Existinginvite = await db.invitation.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
      status: "PENDING",
    },
  });

  if (Existinginvite) {
    const userDetails = await createTeamUser(Existinginvite.agencyId, {
      email: Existinginvite.email,
      agencyId: Existinginvite.agencyId,
      avatarUrl: user.imageUrl,
      id: user.id,
      name: "${user.firstName} ${user.lastName}",
      role: Existinginvite.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

  }
};
