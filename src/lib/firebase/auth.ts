import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type Auth
} from "firebase/auth";
import type { AppUser } from "@/types/app";

export async function loginWithEmailPassword(auth: Auth, email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signupWithEmailPassword(
  auth: Auth,
  name: string,
  email: string,
  password: string
) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  if (name.trim()) {
    await updateProfile(credential.user, {
      displayName: name.trim()
    });
  }

  return credential.user;
}

export async function logout(auth: Auth) {
  await signOut(auth);
}

export async function sendPasswordReset(auth: Auth, email: string) {
  await sendPasswordResetEmail(auth, email);
}

export function mapFirebaseUserToAppUser(
  user: Pick<import("firebase/auth").User, "uid" | "email" | "displayName">
): AppUser {
  return {
    uid: user.uid,
    name: user.displayName ?? "Player",
    email: user.email ?? ""
  };
}
