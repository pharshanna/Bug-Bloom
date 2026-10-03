// src/firebase/api.js
// ALL the data functions for Bug & Bloom. Owned by Person 2.
// Person 1's pages import from here:  import { getProjects } from '../firebase/api'
//
// DATABASE LAYOUT (Firestore):
//   users/{userId}                          → { name, email, seeds }
//   projects/{projectId}                    → { title, description, link, testRequest,
//                                               ownerId, ownerName, feedbackCount, createdAt }
//   projects/{projectId}/tests/{testId}     → { testerId, testerName, liked, confused,
//                                               suggestion, rating, createdAt }
//   projects/{projectId}/comments/{id}      → { authorId, authorName, text, createdAt }
//   conversations/{convoId}                 → { participants: [idA, idB], names: {idA: "...", idB: "..."},
//                                               lastMessage, updatedAt }
//   conversations/{convoId}/messages/{id}   → { fromId, text, createdAt }

import { auth, db } from "./config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  writeBatch,
  runTransaction,
} from "firebase/firestore";

const STARTING_SEEDS = 3;
const POST_COST = 1;
const TEST_REWARD = 1;
const MIN_ANSWER_LENGTH = 30;

// ---------- helpers ----------

// Turns a Firestore document into a plain object with an `id`
// and converts timestamps into normal JavaScript Dates.
function toObject(snap) {
  const data = snap.data();
  const out = { id: snap.id, ...data };
  for (const key of ["createdAt", "updatedAt"]) {
    if (data?.[key]?.toDate) out[key] = data[key].toDate();
  }
  return out;
}

// Throws a friendly error if nobody is logged in. Returns the logged-in user.
async function requireUser() {
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user) throw new Error("Please log in first.");
  return user;
}

// Two users always share the same conversation id, no matter who messages first.
function convoIdFor(idA, idB) {
  return [idA, idB].sort().join("_");
}

// ---------- accounts ----------

export async function signUp(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await setDoc(doc(db, "users", cred.user.uid), {
    name,
    email,
    seeds: STARTING_SEEDS,
    createdAt: serverTimestamp(),
  });
  return { id: cred.user.uid, name, email, seeds: STARTING_SEEDS };
}

export async function logIn(email, password) {
  await signInWithEmailAndPassword(auth, email, password);
  return getCurrentUser();
}

export async function logOut() {
  await signOut(auth);
}

// → { id, name, email, seeds }  or  null if not logged in
export async function getCurrentUser() {
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user) return null;
  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return { id: user.uid, name: user.displayName, email: user.email, seeds: 0 };
  return toObject(snap);
}

export async function getSeeds() {
  const user = await getCurrentUser();
  return user ? user.seeds : 0;
}

// ---------- projects ----------

export async function getProjects() {
  const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
  const snaps = await getDocs(q);
  return snaps.docs.map(toObject);
}

export async function getProject(projectId) {
  const snap = await getDoc(doc(db, "projects", projectId));
  if (!snap.exists()) throw new Error("Project not found.");
  return toObject(snap);
}

export async function getMyProjects() {
  const user = await requireUser();
  const q = query(collection(db, "projects"), where("ownerId", "==", user.uid));
  const snaps = await getDocs(q);
  return snaps.docs.map(toObject);
}

// Costs 1 Seed. Throws an error if the user has no Seeds.
export async function createProject({ title, description, link, testRequest }) {
  const user = await requireUser();
  if (!title || !link) throw new Error("Please add a title and a link.");

  const userRef = doc(db, "users", user.uid);
  const projectRef = doc(collection(db, "projects")); // new empty id

  // A transaction makes "check seeds + spend seed + create project" happen all at once.
  await runTransaction(db, async (tx) => {
    const userSnap = await tx.get(userRef);
    const seeds = userSnap.data()?.seeds ?? 0;
    if (seeds < POST_COST) {
      throw new Error("You need a Seed to plant a project. Test someone else's project to earn one! 🌱");
    }
    tx.update(userRef, { seeds: seeds - POST_COST });
    tx.set(projectRef, {
      title,
      description: description || "",
      link,
      testRequest: testRequest || "",
      ownerId: user.uid,
      ownerName: user.displayName || "Anonymous",
      feedbackCount: 0,
      createdAt: serverTimestamp(),
    });
  });

  return projectRef.id;
}

// ---------- testing / feedback ----------

// Earns 1 Seed. answers = { liked, confused, suggestion, rating }
export async function submitTest(projectId, { liked, confused, suggestion, rating }) {
  const user = await requireUser();

  // Anti-cheat checks
  if (!liked || liked.trim().length < MIN_ANSWER_LENGTH ||
      !confused || confused.trim().length < MIN_ANSWER_LENGTH) {
    throw new Error(`Please write at least ${MIN_ANSWER_LENGTH} characters for each answer.`);
  }
  if (!rating || rating < 1 || rating > 5) throw new Error("Please choose a rating from 1 to 5.");

  const project = await getProject(projectId);
  if (project.ownerId === user.uid) throw new Error("You can't test your own project! 😄");

  const already = await getDocs(
    query(collection(db, "projects", projectId, "tests"), where("testerId", "==", user.uid))
  );
  if (!already.empty) throw new Error("You've already tested this project.");

  // Save the test, bump the project's feedback count, and give the tester a Seed — all together.
  const batch = writeBatch(db);
  const testRef = doc(collection(db, "projects", projectId, "tests"));
  batch.set(testRef, {
    testerId: user.uid,
    testerName: user.displayName || "Anonymous",
    liked: liked.trim(),
    confused: confused.trim(),
    suggestion: (suggestion || "").trim(),
    rating: Number(rating),
    createdAt: serverTimestamp(),
  });
  batch.update(doc(db, "projects", projectId), { feedbackCount: increment(1) });
  batch.update(doc(db, "users", user.uid), { seeds: increment(TEST_REWARD) });
  await batch.commit();

  return testRef.id;
}

export async function getTests(projectId) {
  const q = query(collection(db, "projects", projectId, "tests"), orderBy("createdAt", "desc"));
  const snaps = await getDocs(q);
  return snaps.docs.map(toObject);
}

// ---------- comments ----------

export async function getComments(projectId) {
  const q = query(collection(db, "projects", projectId, "comments"), orderBy("createdAt", "asc"));
  const snaps = await getDocs(q);
  return snaps.docs.map(toObject);
}

export async function addComment(projectId, text) {
  const user = await requireUser();
  if (!text || !text.trim()) throw new Error("Comment can't be empty.");
  const ref = await addDoc(collection(db, "projects", projectId, "comments"), {
    authorId: user.uid,
    authorName: user.displayName || "Anonymous",
    text: text.trim(),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// LIVE version: calls `callback(comments)` every time a comment is added.
// Returns a function that stops listening (call it when the page closes).
export function listenToComments(projectId, callback) {
  const q = query(collection(db, "projects", projectId, "comments"), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snaps) => callback(snaps.docs.map(toObject)));
}

// ---------- DMs ----------

// → [ { userId, userName, lastMessage, updatedAt } ]  newest first
export async function getConversations() {
  const user = await requireUser();
  const q = query(collection(db, "conversations"), where("participants", "array-contains", user.uid));
  const snaps = await getDocs(q);
  return snaps.docs
    .map(toObject)
    .map((c) => {
      const otherId = c.participants.find((p) => p !== user.uid);
      return {
        userId: otherId,
        userName: c.names?.[otherId] || "Someone",
        lastMessage: c.lastMessage || "",
        updatedAt: c.updatedAt,
      };
    })
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export async function getMessages(otherUserId) {
  const user = await requireUser();
  const convoId = convoIdFor(user.uid, otherUserId);
  const q = query(collection(db, "conversations", convoId, "messages"), orderBy("createdAt", "asc"));
  const snaps = await getDocs(q);
  return snaps.docs.map(toObject);
}

export async function sendMessage(otherUserId, text) {
  const user = await requireUser();
  if (!text || !text.trim()) return;
  if (otherUserId === user.uid) throw new Error("You can't message yourself.");

  const convoId = convoIdFor(user.uid, otherUserId);
  const otherSnap = await getDoc(doc(db, "users", otherUserId));
  const otherName = otherSnap.data()?.name || "Someone";

  await setDoc(
    doc(db, "conversations", convoId),
    {
      participants: [user.uid, otherUserId],
      names: { [user.uid]: user.displayName || "Anonymous", [otherUserId]: otherName },
      lastMessage: text.trim(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  await addDoc(collection(db, "conversations", convoId, "messages"), {
    fromId: user.uid,
    text: text.trim(),
    createdAt: serverTimestamp(),
  });
}

// LIVE chat: calls `callback(messages)` whenever a new message arrives.
// Returns a function that stops listening.
export function listenToMessages(otherUserId, callback) {
  const me = auth.currentUser;
  if (!me) return () => {};
  const convoId = convoIdFor(me.uid, otherUserId);
  const q = query(collection(db, "conversations", convoId, "messages"), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snaps) => callback(snaps.docs.map(toObject)));
}
