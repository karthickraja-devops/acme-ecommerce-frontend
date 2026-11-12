import { CognitoJwtVerifier } from "aws-jwt-verify";

const verifier = CognitoJwtVerifier.create({
  userPoolId: "us-east-2_ijftCHNB1",
  tokenUse: "access",
  clientId: "5goouvp4s2hvkm1n2af7qsrl2i",
});

export async function verifyAccessToken(
  token: string
): Promise<boolean> {
  try {
    await verifier.verify(token);
    console.log("JWT VERIFICATION SUCCESS");
    return true;
  } catch (error) {
    console.error("JWT VERIFICATION FAILED:", error);
    return false;
  }
}