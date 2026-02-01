export type Blog = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  minutes: number;
  image: string;
  body: string[];
};

// Blogs are intentionally positioned for Gen Z couples / relationship texting.
// Keep content short, practical, and non-corporate.
export const BLOGS: Blog[] = [
  {
    slug: "k-text-decoder",
    title: 'She Said "K." Now What? Replies That Don\'t Make It Worse',
    excerpt: "Three replies for three situations: tired, upset, or done-with-this energy.",
    author: "ReTone Team",
    minutes: 4,
    image:
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Step 1: do not panic-text. Step 2: do not guilt-text. Step 3: send one calm message and stop spamming.",
      'Try this opener: "Hey, are you okay? I\'m here." Simple, safe, and it doesn\'t escalate.',
      'If you messed up, own it in one sentence, then ask what would help: "I hear you. What do you need from me right now?"',
      "In ReTone, run your draft in Peacekeeper or Soft & Sweet and pick the version that sounds like you.",
    ],
  },
  {
    slug: "apology-that-lands",
    title: 'Apology Texts That Actually Land (Not the "Sorry If..." Kind)',
    excerpt: "A simple formula + examples you can copy, paste, and customize.",
    author: "ReTone Team",
    minutes: 5,
    image:
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80",
    body: [
      'The fastest way to lose her is "Sorry if you felt..." because it dodges ownership.',
      "Use the 4-part formula: (1) name what happened, (2) take ownership, (3) validate her feelings, (4) propose a repair action.",
      'Good example: "You\'re right, I was late and didn\'t update you. I\'m sorry. I get why you felt ignored. Next time I\'ll text before I\'m late."',
      "Use ReTone to rewrite your draft into Soft & Sweet or Sincere (no cringe) so it lands without sounding robotic.",
    ],
  },
  {
    slug: "stop-arguing-on-text",
    title: "Stop Fighting on Text: The 2-Line Message That Saves Your Night",
    excerpt: "A calm pause message that prevents 40-message spirals.",
    author: "ReTone Team",
    minutes: 4,
    image:
      "https://images.unsplash.com/photo-1520975732148-9d4501d5b3d3?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Text fights escalate because tone gets guessed. If the fight is hot, pause it instead of typing novels.",
      'Use this: "I care about this. I\'m getting heated, so I\'m taking 20 mins and coming back calmer."',
      "Then follow through. If you say 20 minutes, come back in 20 minutes.",
      'In ReTone, pick Direct (with boundaries) and run "Too angry -> chill it down" for a clean version in your voice.',
    ],
  },
  {
    slug: "boundaries-without-cold",
    title: "Boundaries Without Sounding Cold: How to Ask for Space Nicely",
    excerpt: "Protect your peace without triggering a bigger fight.",
    author: "ReTone Team",
    minutes: 5,
    image:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Boundaries are not punishment. They are a plan for how to talk when emotions are high.",
      "Say what you need, why you need it, and when you will reconnect. That is the whole recipe.",
      'Try: "I want to talk, I just need 30 mins to calm down. Can we talk at 8:30?"',
      "Use Direct (with boundaries) if you tend to people-please, or Peacekeeper if you both get defensive fast.",
    ],
  },
  {
    slug: "red-flag-phrases-to-delete",
    title: "Red-Flag Phrases to Delete from Your Texts (If You Want Peace)",
    excerpt: "Tiny phrases that start wars - and what to say instead.",
    author: "ReTone Team",
    minutes: 6,
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
    body: [
      'These phrases light the fuse: "calm down", "you always", "whatever", "fine".',
      'Swap blame for impact: "When that happened, I felt ___."',
      'Swap mind-reading for curiosity: "Help me understand what you meant."',
      "ReTone's red-flag scan helps catch escalation triggers before you hit send.",
    ],
  },
  {
    slug: "make-up-date-plan",
    title: "Make-Up Messages That Don't Sound Desperate (Plus a Cute Date Plan)",
    excerpt: "From apology -> repair -> small plan. Keep it simple.",
    author: "ReTone Team",
    minutes: 5,
    image:
      "https://images.unsplash.com/photo-1523419400528-0c1df022bdd7?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Repair is action, not paragraphs. After apologizing, suggest one small plan that fits her mood.",
      "Ideas: coffee + walk, dessert run, home movie with her favorite snack, or a quiet drive playlist moment.",
      "Keep it non-pushy: offer a plan and give room to say yes or choose a different time.",
      "Use Cute & Casual if things are already cooling down. Use Sincere (no cringe) if trust needs repair first.",
    ],
  },
  {
    slug: "relationship-repair-scripts",
    title: "7 Texts That Save You from the Doghouse (Without Begging)",
    excerpt: "Templates for apologies, boundaries, and making plans after a fight.",
    author: "ReTone Team",
    minutes: 6,
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80",
    body: [
      "The best texts are short, specific, and do not argue the other person's feelings.",
      'Template 1 (apology): "You\'re right about ___. I\'m sorry. I get why you felt ___. I\'ll do ___."',
      'Template 2 (pause): "I care about this. I\'m heated. I\'m taking __ mins then I\'ll come back calmer."',
      'Template 3 (repair): "I want us good. Can we reset tonight? I\'ll bring ___."',
    ],
  },
  {
    slug: "retone-vs-chatgpt-couple-fights",
    title: "ReTone vs ChatGPT for Couple Fights: Why Good English Isn't Enough",
    excerpt:
      "ChatGPT can write. ReTone helps you land the message without accidentally starting World War 3.",
    author: "ReTone Team",
    minutes: 5,
    image:
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1200&q=80",
    body: [
      "In fights, the problem is rarely grammar. It is tone: defensive, cold, sarcastic, or vague.",
      "ReTone is built for ready-to-send replies with multiple vibes in one click (Sincere, Soft & Sweet, Peacekeeper, etc.).",
      "You can cool down a spicy draft or add boundaries without sounding mean.",
      "Keep chatbots for brainstorming. Use ReTone when the text has consequences.",
    ],
  },
  {
    slug: "how-to-start-a-tough-talk",
    title: "How to Start a Tough Talk Without Triggering a Fight",
    excerpt: "One opener, three variations, and what to avoid.",
    author: "ReTone Team",
    minutes: 5,
    image:
      "https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&fit=crop&w=1200&q=80",
    body: [
      'Bad opener: "We need to talk." It creates dread with zero context.',
      'Better opener: "Can we talk about something small so it doesn\'t become a big thing? I care about us."',
      "Then be specific: name one behavior and one impact. Do not list 10 old receipts.",
      "In ReTone, try Peacekeeper first. If you get too soft, tap add boundaries.",
    ],
  },
];

