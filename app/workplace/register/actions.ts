"use server";

import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { parseScopeList, recordWorkplaceAuditLog } from "@/lib/workplace";

const toJson = (value: unknown) => value as Prisma.InputJsonValue;
const sanitize = (value: FormDataEntryValue | null) => (typeof value === "string" ? value.trim() : "");

export async function submitWorkplaceApplicationAction(formData: FormData) {
  const name = sanitize(formData.get("name"));
  const email = sanitize(formData.get("email")).toLowerCase();
  const password = sanitize(formData.get("password"));
  const jobTitle = sanitize(formData.get("jobTitle"));
  const countryScope = parseScopeList(formData.get("countryScope"));
  const cityScope = parseScopeList(formData.get("cityScope"));
  const nicheScope = parseScopeList(formData.get("nicheScope"));

  if (!name || !email || password.length < 8) {
    throw new Error("Completa nombre, email y una contrasena de 8 caracteres o mas.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: passwordHash,
      role: "EMPLOYEE",
      accountStatus: "PENDING",
      statusMessage: "Solicitud Workplace pendiente de aprobacion."
    },
    create: {
      name,
      email,
      password: passwordHash,
      role: "EMPLOYEE",
      accountStatus: "PENDING",
      statusMessage: "Solicitud Workplace pendiente de aprobacion."
    }
  });

  const employee = await prisma.workplaceEmployee.upsert({
    where: { userId: user.id },
    update: {
      jobTitle: jobTitle || null,
      status: "PENDING",
      countryScope: toJson(countryScope),
      cityScope: toJson(cityScope),
      nicheScope: toJson(nicheScope)
    },
    create: {
      userId: user.id,
      jobTitle: jobTitle || null,
      status: "PENDING",
      employeeCode: `EMP-${Date.now().toString(36).toUpperCase()}`,
      countryScope: toJson(countryScope),
      cityScope: toJson(cityScope),
      nicheScope: toJson(nicheScope)
    }
  });

  await recordWorkplaceAuditLog({
    actorUserId: user.id,
    employeeId: employee.id,
    actionKey: "workplace.employee.apply",
    moduleKey: "security",
    resourceType: "employee",
    resourceId: employee.id,
    metadata: { email, source: "public_register" }
  });

  redirect("/workplace/register?submitted=1");
}
