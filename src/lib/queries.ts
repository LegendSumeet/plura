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

export const saveActivitylogsnotification = async ({
  agencyId,
  description,
  subaccountid,
}: {
  agencyId: string;
  description: string;
  subaccountid: string;
}) => {
  const authuser = await currentUser();
  let userData;
  if (!authuser) {
    const response = await db.user.findFirst({
      where: {
        Agency: {
          SubAccount: {
            some: {
              id: subaccountid,
            },
          },
        },
      },
    });
    if (response) {
      userData = response;
    }
  } else {
    userData = await db.user.findUnique({
      where: {
        email: authuser?.emailAddresses[0].emailAddress,
      },
    });
  }
  if (!userData) {
    console.log("user not found");
    return;
  }
  let foundagencyid = agencyId;
  if (!foundagencyid) {
    if (!subaccountid) {
      throw new Error("agencyId or subaccountid is required");
    }
  }
  const response = await db.subAccount.findUnique({
    where: {
      id: subaccountid,
    },
  });
  if (response) {
    foundagencyid = response.agencyId;
  }
  if (subaccountid) {
    await db.notification.create({
      data: {
        notification: `${userData.name} ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Agency: {
          connect: {
            id: foundagencyid,
          },
        },
        SubAccount: {
          connect: {
            id: subaccountid,
          },
        },
      },
    });
  } else {
    await db.notification.create({
      data: {
        notification: `${userData.name} ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Agency: {
          connect: {
            id: foundagencyid,
          },
        },
      },
    });
  }
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
    });
  }
};
