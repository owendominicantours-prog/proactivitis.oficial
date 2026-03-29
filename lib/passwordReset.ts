import jwt from "jsonwebtoken";

const RESET_PASSWORD_EXPIRATION = "1h";

function getResetSecret() {
  return process.env.NEXTAUTH_SECRET ?? "dev-secret";
}

export function createPasswordResetToken(email: string) {
  return jwt.sign(
    {
      purpose: "password-reset",
      email
    },
    getResetSecret(),
    { expiresIn: RESET_PASSWORD_EXPIRATION }
  );
}

export function verifyPasswordResetToken(token: string) {
  const payload = jwt.verify(token, getResetSecret());
  if (
    typeof payload !== "object" ||
    payload === null ||
    payload.purpose !== "password-reset" ||
    typeof payload.email !== "string"
  ) {
    throw new Error("Invalid reset token");
  }

  return {
    email: payload.email
  };
}
