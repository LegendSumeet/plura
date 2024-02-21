import { getAuthUserDetails, verfiyandacceptinvite } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";

const Agency = async () => {
  const authuser = await currentUser();
  if (!authuser) return redirect("/sign-in");


  const agenecyid = await verfiyandacceptinvite();

  const user = await getAuthUserDetails();
  return <div> Agency Dashborard</div>;
};

export default Agency;
