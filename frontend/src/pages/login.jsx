import React from "react";
import { SignIn } from "@clerk/clerk-react";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <SignIn path="/login" routing="path" signUpUrl="/register" />
    </div>
  );
}
