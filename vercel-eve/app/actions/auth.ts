"use server";

import { prisma } from "~/lib/prisma";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "~/lib/mail";

export async function registerUser(formData: FormData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "User already exists with this email" };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate 6-digit OTP
  const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verifyCodeExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

  // Create user
  await prisma.user.create({
    data: {
      email,
      name: email.split("@")[0],
      password: hashedPassword,
      verifyCode,
      verifyCodeExpiry,
    },
  });

  // Send email
  await sendVerificationEmail(email, verifyCode);

  return { success: true };
}

export async function verifyEmail(formData: FormData) {
  const email = formData.get("email")?.toString();
  const code = formData.get("code")?.toString();

  if (!email || !code) {
    return { error: "Email and code are required" };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: "User not found" };
  }

  if (user.emailVerified) {
    return { error: "Email already verified" };
  }

  if (user.verifyCode !== code) {
    return { error: "Invalid verification code" };
  }

  if (!user.verifyCodeExpiry || user.verifyCodeExpiry < new Date()) {
    return { error: "Verification code has expired" };
  }

  // Update user as verified
  await prisma.user.update({
    where: { email },
    data: {
      emailVerified: new Date(),
      verifyCode: null,
      verifyCodeExpiry: null,
    },
  });

  return { success: true };
}

export async function resendVerificationCode(email: string) {
  if (!email) {
    return { error: "Email is required" };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: "User not found" };
  }

  if (user.emailVerified) {
    return { error: "Email already verified" };
  }

  // Generate 6-digit OTP
  const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
  const verifyCodeExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

  // Update user
  await prisma.user.update({
    where: { email },
    data: {
      verifyCode,
      verifyCodeExpiry,
    },
  });

  // Send email
  await sendVerificationEmail(email, verifyCode);

  return { success: true };
}


