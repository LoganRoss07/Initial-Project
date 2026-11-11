import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from './firebase'

function friendlyAuthError(err) {
  switch (err.code) {
    case 'auth/invalid-email':
      return 'That email address does not look right.'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try logging in instead.'
    case 'auth/weak-password':
      return 'Choose a password with at least 6 characters.'
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Email or password is incorrect.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes and try again.'
    case 'auth/network-request-failed':
      return 'Could not connect. Check your internet connection and try again.'
    default:
      return 'Something went wrong. Please try again.'
  }
}

export async function signUp(email, password) {
  try {
    await createUserWithEmailAndPassword(auth, email, password)
  } catch (err) {
    throw new Error(friendlyAuthError(err))
  }
}

export async function logIn(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password)
  } catch (err) {
    throw new Error(friendlyAuthError(err))
  }
}

export async function logOut() {
  await signOut(auth)
}