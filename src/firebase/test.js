// src/firebase/test.js — test page for Person 2's data functions.
// Open http://localhost:5173/src/firebase/test.html while `npm run dev` is running.
import {
  signUp, logOut, getCurrentUser, getSeeds,
  createProject, getProjects, getProject,
  submitTest, getTests,
  addComment, getComments,
  sendMessage, getConversations, getMessages,
} from "./api.js";

const logEl = document.getElementById("log");
const btn = document.getElementById("run");

function log(msg, cls = "") {
  logEl.innerHTML += `<div class="${cls}">${msg}</div>`;
}
function check(label, condition, detail = "") {
  log(`${condition ? "✅" : "❌"} ${label} ${detail}`, condition ? "ok" : "bad");
  if (!condition) throw new Error(`Check failed: ${label}`);
}

btn.addEventListener("click", async () => {
  btn.disabled = true;
  logEl.innerHTML = "";
  const stamp = Date.now();
  try {
    // 1. Owner signs up and gets 3 seeds
    const owner = await signUp("Test Owner", `owner${stamp}@test.com`, "password123");
    check("Sign up (owner)", !!owner.id);
    check("Starts with 3 Seeds", (await getSeeds()) === 3, `→ ${await getSeeds()}`);

    // 2. Owner posts a project (costs 1 seed)
    const projectId = await createProject({
      title: "Test Study Planner",
      description: "A planner for NJIT students",
      link: "https://example.com",
      testRequest: "Is the sign-up flow confusing?",
    });
    check("Create project", !!projectId);
    check("Posting cost 1 Seed", (await getSeeds()) === 2, `→ ${await getSeeds()}`);
    const projects = await getProjects();
    check("Project shows in getProjects()", projects.some((p) => p.id === projectId), `(${projects.length} total)`);

    // 3. Owner can't test their own project
    let blocked = false;
    try {
      await submitTest(projectId, { liked: "x".repeat(40), confused: "y".repeat(40), suggestion: "", rating: 5 });
    } catch { blocked = true; }
    check("Can't test your own project", blocked);

    // 4. Tester signs up, tests the project, earns a seed
    await logOut();
    const tester = await signUp("Test Tester", `tester${stamp}@test.com`, "password123");
    check("Sign up (tester)", !!tester.id);
    await submitTest(projectId, {
      liked: "The colors are really nice and the layout is clean.",
      confused: "I couldn't find where to log out after signing in.",
      suggestion: "Add a logout button to the navbar.",
      rating: 4,
    });
    check("Submit test earns 1 Seed", (await getSeeds()) === 4, `→ ${await getSeeds()}`);
    check("feedbackCount went up", (await getProject(projectId)).feedbackCount === 1);
    check("getTests() returns the feedback", (await getTests(projectId)).length === 1);

    // 5. Short answers get rejected
    let rejected = false;
    try {
      await submitTest(projectId, { liked: "ok", confused: "no", rating: 3 });
    } catch { rejected = true; }
    check("Short/duplicate feedback rejected", rejected);

    // 6. Comments
    await addComment(projectId, "Love this idea! 🌱");
    check("Add + get comments", (await getComments(projectId)).length === 1);

    // 7. DMs
    await sendMessage(owner.id, "Hi! I just tested your planner.");
    const convos = await getConversations();
    check("Conversation created", convos.some((c) => c.userId === owner.id), `with ${convos[0]?.userName}`);
    check("Message saved", (await getMessages(owner.id)).length === 1);

    const me = await getCurrentUser();
    log(`<br>🎉 <b>ALL TESTS PASSED!</b> Logged in as ${me.name} with ${me.seeds} Seeds.`, "ok");
    log(`(You can delete the test data in the Firebase console → Firestore.)`);
  } catch (err) {
    log(`<br>❌ ERROR: ${err.message}`, "bad");
    log(`Copy this error and send it to Claude.`);
    console.error(err);
  } finally {
    btn.disabled = false;
  }
});
