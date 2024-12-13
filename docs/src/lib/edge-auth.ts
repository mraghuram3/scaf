import { jwtVerify, createRemoteJWKSet } from "jose";

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Create a JWKS client using Firebase's public keys
const JWKS = createRemoteJWKSet(
  new URL(
    `https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`
  )
);

export interface FirebaseUser {
  _id?: string;
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
  githubID?: string;
}

export async function verifyFirebaseToken(
  token: string
): Promise<FirebaseUser> {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    });
    //! TODO: Add uid to FirebaseUser

    return {
      _id: payload.sub as string,
      uid: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      picture: payload.picture as string,
    };
  } catch (error) {
    console.error("Error verifying token:", error);
    throw new Error("Invalid token");
  }
}
