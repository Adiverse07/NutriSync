import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    updatePassword,
    sendEmailVerification,
  } from "firebase/auth";
  import { auth } from "./firebase";
  
  export const doCreateUserWithEmailAndPassword = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => userCredential.user)
      .catch((error) => {
        console.error("Signup Error:", error.message);
        throw error;
      });
  };
  
  export const doSignInWithEmailAndPassword = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };
  
  export const doSignInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };
  
  export const doSignOut = () => auth.signOut();
  
  export const doPasswordReset = (email) => sendPasswordResetEmail(auth, email);
  
  export const doPasswordChange = (newPassword) => {
    if (!auth.currentUser) throw new Error("No user is logged in.");
    return updatePassword(auth.currentUser, newPassword);
  };
  
  export const doSendEmailVerification = () =>
    sendEmailVerification(auth.currentUser, { url: `${window.location.origin}/home` });
  