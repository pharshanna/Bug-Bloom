// src/components/grove/demoData.js — fake projects + feedback so the app looks alive for the demo.
// Owned by Person 4. Person 2 loads this into Firebase with a "Load demo data" button.
// Field names match Person 2's database (src/firebase/api.js).

export const demoProjects = [
  {
    title: 'StudySprout',
    description:
      'A study planner for NJIT students that breaks big exams into small daily goals and sends gentle reminders.',
    link: 'https://example.com/studysprout',
    ownerName: 'Aisha K.',
    testRequest: 'Is it clear how to add a new exam? Does the daily goal list make sense?',
    feedbackCount: 4,
  },
  {
    title: 'Highlander Eats',
    description:
      'Find cheap food near campus, filter by dietary needs, and see which dining halls are open right now.',
    link: 'https://example.com/highlander-eats',
    ownerName: 'Priya S.',
    testRequest: 'Try filtering for vegetarian options. Is the map easy to use on your phone?',
    feedbackCount: 3,
  },
  {
    title: 'ClubHub',
    description:
      'One place for every student club event on campus, with RSVPs and a weekly "what\'s happening" email.',
    link: 'https://example.com/clubhub',
    ownerName: 'Maya R.',
    testRequest: 'Please try RSVPing to an event. Did anything confuse you during sign-up?',
    feedbackCount: 3,
  },
  {
    title: 'PennyPlanner',
    description:
      'A simple budgeting tool for college students: track textbooks, food and fun money with friendly charts.',
    link: 'https://example.com/pennyplanner',
    ownerName: 'Jordan L.',
    testRequest: 'Are the charts easy to understand? Would you actually use this every week?',
    feedbackCount: 3,
  },
  {
    title: 'Portfolio Garden',
    description:
      'A drag-and-drop portfolio website builder made for CS students applying to internships.',
    link: 'https://example.com/portfolio-garden',
    ownerName: 'Nina T.',
    testRequest: 'Does the drag-and-drop feel smooth? Is anything missing that recruiters would want?',
    feedbackCount: 4,
  },
];

export const demoFeedback = [
  // StudySprout
  {
    projectTitle: 'StudySprout',
    testerName: 'Leah M.',
    liked: 'Breaking my exam into daily goals felt really manageable and less stressful.',
    confused: 'I could not figure out how to edit a goal after I created it.',
    suggestion: 'Add an edit button directly on each goal card.',
    rating: 4,
  },
  {
    projectTitle: 'StudySprout',
    testerName: 'Sam P.',
    liked: 'The reminders are friendly and the colors are calm, which I really liked.',
    confused: 'The difference between "goals" and "tasks" was not clear to me at first.',
    suggestion: 'Use one word everywhere or add a short tooltip.',
    rating: 4,
  },
  {
    projectTitle: 'StudySprout',
    testerName: 'Riya D.',
    liked: 'Adding an exam was super quick, it took me less than a minute.',
    confused: 'I was not sure if my plan saved because there was no confirmation message.',
    suggestion: 'Show a small "Saved!" message after creating a plan.',
    rating: 5,
  },
  {
    projectTitle: 'StudySprout',
    testerName: 'Chris W.',
    liked: 'The progress bar for each exam is motivating to look at every day.',
    confused: 'On my phone the calendar view was cut off on the right side.',
    suggestion: 'Make the calendar scroll sideways on small screens.',
    rating: 3,
  },

  // Highlander Eats
  {
    projectTitle: 'Highlander Eats',
    testerName: 'Ava G.',
    liked: 'The vegetarian filter worked well and showed places I did not know about.',
    confused: 'The map pins all looked the same so I could not tell what was open.',
    suggestion: 'Color the pins green for open and gray for closed.',
    rating: 4,
  },
  {
    projectTitle: 'Highlander Eats',
    testerName: 'Marcus B.',
    liked: 'Seeing prices right on the list saves so much time when I am hungry.',
    confused: 'The search bar did not find places when I typed only part of the name.',
    suggestion: 'Support partial matches in search.',
    rating: 4,
  },
  {
    projectTitle: 'Highlander Eats',
    testerName: 'Zoe F.',
    liked: 'The "open right now" toggle is the best feature, very useful late at night.',
    confused: 'The map was slow to load on my phone and the page jumped around.',
    suggestion: 'Load the list first and the map after.',
    rating: 3,
  },

  // ClubHub
  {
    projectTitle: 'ClubHub',
    testerName: 'Ethan C.',
    liked: 'RSVPing was one click and I liked seeing how many people were going.',
    confused: 'Sign-up asked for my major twice on two different screens.',
    suggestion: 'Remove the repeated question from the second screen.',
    rating: 4,
  },
  {
    projectTitle: 'ClubHub',
    testerName: 'Hana Y.',
    liked: 'Having every club in one place is something campus really needs.',
    confused: 'I could not find a way to cancel my RSVP after I clicked it.',
    suggestion: 'Turn the RSVP button into a toggle.',
    rating: 5,
  },
  {
    projectTitle: 'ClubHub',
    testerName: 'Omar A.',
    liked: 'The event cards look clean and the photos make events feel exciting.',
    confused: 'Some events had no time listed, so I did not know when to show up.',
    suggestion: 'Make the event time a required field for organizers.',
    rating: 4,
  },

  // PennyPlanner
  {
    projectTitle: 'PennyPlanner',
    testerName: 'Grace H.',
    liked: 'The pie chart made it obvious that I spend way too much on coffee.',
    confused: 'I did not understand what the "rollover" setting does for my budget.',
    suggestion: 'Explain rollover with a one-line example.',
    rating: 4,
  },
  {
    projectTitle: 'PennyPlanner',
    testerName: 'Dev N.',
    liked: 'Adding an expense is fast and the categories fit college life well.',
    confused: 'There was no way to set a weekly budget, only a monthly one.',
    suggestion: 'Add a weekly budget option since many students get paid weekly.',
    rating: 3,
  },
  {
    projectTitle: 'PennyPlanner',
    testerName: 'Ivy Q.',
    liked: 'The friendly messages when I stay under budget made me smile.',
    confused: 'The chart colors were hard to tell apart for food and fun categories.',
    suggestion: 'Use more different colors or add labels on the chart.',
    rating: 4,
  },

  // Portfolio Garden
  {
    projectTitle: 'Portfolio Garden',
    testerName: 'Tara S.',
    liked: 'Drag and drop felt smooth and the templates look professional.',
    confused: 'I could not tell how to add a link to my GitHub on a project card.',
    suggestion: 'Add a GitHub link field to project cards.',
    rating: 5,
  },
  {
    projectTitle: 'Portfolio Garden',
    testerName: 'Ben K.',
    liked: 'Publishing my site took one click and the URL was easy to share.',
    confused: 'Undo did not work after I accidentally deleted a section.',
    suggestion: 'Add undo with Cmd+Z or an "undo" button.',
    rating: 4,
  },
  {
    projectTitle: 'Portfolio Garden',
    testerName: 'Lina V.',
    liked: 'The preview mode shows exactly what recruiters will see, very helpful.',
    confused: 'On the mobile preview some text overlapped with the profile photo.',
    suggestion: 'Stack the photo above the text on small screens.',
    rating: 4,
  },
  {
    projectTitle: 'Portfolio Garden',
    testerName: 'Kai J.',
    liked: 'The resume section auto-formats nicely and saves a lot of time.',
    confused: 'I was not sure if recruiters can download my resume as a PDF.',
    suggestion: 'Add a clear "Download resume" button.',
    rating: 4,
  },
];
