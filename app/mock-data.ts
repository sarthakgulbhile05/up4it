export const activityOptions = [
  { name: "Badminton", icon: "🏸" },
  { name: "Gaming", icon: "🎮" },
  { name: "Coffee", icon: "☕" },
  { name: "Food", icon: "🍔" },
  { name: "Walk", icon: "🚶" },
  { name: "Movies", icon: "🎬" },
  { name: "Hangout", icon: "✨" },
] as const;

export type Activity = (typeof activityOptions)[number]["name"];

export type Profile = {
  id: string;
  initials: string;
  avatarColor: string;
  name: string;
  phoneStatus: "not-added" | "pending" | "verified";
  communityStatus: "not-verified" | "pending" | "verified" | "rejected";
  communityName: string | null;
  experience: string;
  distance: string;
  bio: string;
};

export type FeedbackRecord = {
  itemId: string;
  profileId: string;
  rating: number;
  wouldMeetAgain: boolean;
};

export type DiscoveryItem = {
  id: string;
  kind: "session" | "availability";
  activity: Activity | null;
  openTo: Activity[];
  profileId: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  distance: string;
  mapX: number;
  mapY: number;
  spotsAvailable: number | null;
  participantCount: number | null;
  experience: string | null;
  description: string;
  accepting: boolean;
};

// The date keeps the prototype deterministic. All identities, trust statuses, and feedback are simulated.
export const sampleDate = "2026-10-04";

export const mockProfiles: Profile[] = [
  {
    id: "maya",
    initials: "MS",
    avatarColor: "bg-[#f1c5a9]",
    name: "Maya Singh",
    phoneStatus: "verified",
    communityStatus: "verified",
    communityName: "Sample community",
    experience: "Intermediate",
    distance: "1.2 km away",
    bio: "Enjoys friendly doubles games and meeting neighbours for an evening court session.",
  },
  {
    id: "rohan",
    initials: "RK",
    avatarColor: "bg-[#b9d9d0]",
    name: "Rohan Kapoor",
    phoneStatus: "verified",
    communityStatus: "pending",
    communityName: "Sample community",
    experience: "Beginner-friendly",
    distance: "2.4 km away",
    bio: "Learning badminton and keen on relaxed games where everyone gets a chance to play.",
  },
  {
    id: "priya",
    initials: "PM",
    avatarColor: "bg-[#d8c6ef]",
    name: "Priya Mehta",
    phoneStatus: "pending",
    communityStatus: "verified",
    communityName: "Sample community",
    experience: "Social player",
    distance: "900 m away",
    bio: "Often organises low-pressure games and welcomes people who are new to the activity.",
  },
  {
    id: "leena",
    initials: "LC",
    avatarColor: "bg-[#f0daa1]",
    name: "Leena Chawla",
    phoneStatus: "verified",
    communityStatus: "verified",
    communityName: "Sample community",
    experience: "Coffee regular",
    distance: "800 m away",
    bio: "Likes discovering independent cafés and making time for a good conversation.",
  },
  {
    id: "dev",
    initials: "DS",
    avatarColor: "bg-[#bad7ee]",
    name: "Dev Shah",
    phoneStatus: "not-added",
    communityStatus: "not-verified",
    communityName: null,
    experience: "Casual gamer",
    distance: "1.6 km away",
    bio: "New here and looking for a friendly group for a few games after class.",
  },
  {
    id: "anika",
    initials: "AN",
    avatarColor: "bg-[#c9e3b3]",
    name: "Anika Nair",
    phoneStatus: "verified",
    communityStatus: "verified",
    communityName: "Sample community",
    experience: "Easy pace",
    distance: "1.1 km away",
    bio: "Enjoys an unhurried neighbourhood walk and a good catch-up along the way.",
  },
  {
    id: "imran",
    initials: "IK",
    avatarColor: "bg-[#f4c1bf]",
    name: "Imran Khan",
    phoneStatus: "pending",
    communityStatus: "rejected",
    communityName: null,
    experience: "Food explorer",
    distance: "2.1 km away",
    bio: "Always up for trying a new local place, especially with a small group.",
  },
  {
    id: "nora",
    initials: "NP",
    avatarColor: "bg-[#d8d1b2]",
    name: "Nora Patel",
    phoneStatus: "not-added",
    communityStatus: "pending",
    communityName: "Sample community",
    experience: "Open to ideas",
    distance: "1.4 km away",
    bio: "Free this afternoon and open to a casual plan with someone nearby.",
  },
];

// Used only to demonstrate how an availability activated in this browser appears in a matching search.
export const localAvailabilityProfile: Profile = {
  id: "local-availability",
  initials: "YO",
  avatarColor: "bg-[#b9d9d0]",
  name: "Your sample availability",
  phoneStatus: "not-added",
  communityStatus: "not-verified",
  communityName: null,
  experience: "Open to ideas",
  distance: "1 km away",
  bio: "A local-only prototype record used to demonstrate availability matching between discovery modes.",
};

// These are simulated feedback records for completed mock activities. Public trust summaries derive from them.
export const mockFeedback: FeedbackRecord[] = [
  { itemId: "completed-maya-1", profileId: "maya", rating: 5, wouldMeetAgain: true },
  { itemId: "completed-maya-2", profileId: "maya", rating: 4, wouldMeetAgain: true },
  { itemId: "completed-leena-1", profileId: "leena", rating: 5, wouldMeetAgain: true },
  { itemId: "completed-priya-1", profileId: "priya", rating: 4, wouldMeetAgain: true },
  { itemId: "completed-anika-1", profileId: "anika", rating: 5, wouldMeetAgain: true },
  { itemId: "completed-imran-1", profileId: "imran", rating: 4, wouldMeetAgain: false },
];

export const mockDiscoveryItems: DiscoveryItem[] = [
  {
    id: "badminton-1",
    kind: "session",
    activity: "Badminton",
    openTo: [],
    profileId: "maya",
    date: sampleDate,
    startTime: "13:00",
    endTime: "17:00",
    location: "North Court, Block B",
    distance: "1.2 km away",
    mapX: 22,
    mapY: 26,
    spotsAvailable: 1,
    participantCount: 3,
    experience: "Intermediate",
    description: "Doubles game with one spot left.",
    accepting: true,
  },
  {
    id: "badminton-2",
    kind: "session",
    activity: "Badminton",
    openTo: [],
    profileId: "rohan",
    date: sampleDate,
    startTime: "14:00",
    endTime: "17:00",
    location: "Community Sports Hall",
    distance: "2.4 km away",
    mapX: 58,
    mapY: 26,
    spotsAvailable: 2,
    participantCount: 2,
    experience: "Beginner-friendly",
    description: "Relaxed games for people still learning.",
    accepting: true,
  },
  {
    id: "badminton-3",
    kind: "session",
    activity: "Badminton",
    openTo: [],
    profileId: "priya",
    date: sampleDate,
    startTime: "15:00",
    endTime: "18:00",
    location: "North Court, Block A",
    distance: "900 m away",
    mapX: 26,
    mapY: 62,
    spotsAvailable: 1,
    participantCount: 3,
    experience: "Social player",
    description: "A friendly court session before dinner.",
    accepting: true,
  },
  {
    id: "badminton-4",
    kind: "session",
    activity: "Badminton",
    openTo: [],
    profileId: "maya",
    date: sampleDate,
    startTime: "16:00",
    endTime: "18:00",
    location: "North Court, Block B",
    distance: "1.2 km away",
    mapX: 24,
    mapY: 32,
    spotsAvailable: 1,
    participantCount: 3,
    experience: "Intermediate",
    description: "Short doubles session with a flexible finish.",
    accepting: true,
  },
  {
    id: "coffee-1",
    kind: "session",
    activity: "Coffee",
    openTo: [],
    profileId: "leena",
    date: sampleDate,
    startTime: "15:30",
    endTime: "16:30",
    location: "Bean Street Café",
    distance: "800 m away",
    mapX: 68,
    mapY: 54,
    spotsAvailable: 2,
    participantCount: 1,
    experience: "Coffee regular",
    description: "A quick coffee and a chat between classes.",
    accepting: true,
  },
  {
    id: "walk-1",
    kind: "session",
    activity: "Walk",
    openTo: [],
    profileId: "anika",
    date: sampleDate,
    startTime: "16:30",
    endTime: "17:30",
    location: "Lakeside Loop",
    distance: "1.1 km away",
    mapX: 50,
    mapY: 78,
    spotsAvailable: null,
    participantCount: 1,
    experience: "Easy pace",
    description: "Looking for company on a relaxed loop around the lake.",
    accepting: true,
  },
  {
    id: "badminton-5",
    kind: "session",
    activity: "Badminton",
    openTo: [],
    profileId: "priya",
    date: sampleDate,
    startTime: "17:00",
    endTime: "19:00",
    location: "Community Sports Hall",
    distance: "900 m away",
    mapX: 59,
    mapY: 32,
    spotsAvailable: 3,
    participantCount: 1,
    experience: "Social player",
    description: "Evening games with room for a few more people.",
    accepting: true,
  },
  {
    id: "gaming-1",
    kind: "session",
    activity: "Gaming",
    openTo: [],
    profileId: "dev",
    date: sampleDate,
    startTime: "17:30",
    endTime: "20:00",
    location: "Common Room, Residence 4",
    distance: "1.6 km away",
    mapX: 76,
    mapY: 72,
    spotsAvailable: 3,
    participantCount: 2,
    experience: "Casual gamer",
    description: "Co-op games and a low-key evening indoors.",
    accepting: true,
  },
  {
    id: "food-1",
    kind: "session",
    activity: "Food",
    openTo: [],
    profileId: "imran",
    date: sampleDate,
    startTime: "18:00",
    endTime: "20:00",
    location: "Market Lane Food Court",
    distance: "2.1 km away",
    mapX: 83,
    mapY: 40,
    spotsAvailable: 2,
    participantCount: 2,
    experience: "Food explorer",
    description: "Trying a few stalls and sharing recommendations.",
    accepting: true,
  },
  {
    id: "open-nora",
    kind: "availability",
    activity: null,
    openTo: ["Badminton", "Coffee", "Food", "Walk"],
    profileId: "nora",
    date: sampleDate,
    startTime: "14:00",
    endTime: "19:00",
    location: "Near Central Library",
    distance: "1.4 km away",
    mapX: 43,
    mapY: 45,
    spotsAvailable: null,
    participantCount: null,
    experience: "Open to ideas",
    description: "Free this afternoon and open to badminton, coffee, food, a walk, or anything fun.",
    accepting: true,
  },
  {
    id: "open-dev",
    kind: "availability",
    activity: null,
    openTo: ["Gaming", "Movies", "Hangout"],
    profileId: "dev",
    date: sampleDate,
    startTime: "13:00",
    endTime: "15:00",
    location: "Near the Common Room",
    distance: "1.1 km away",
    mapX: 72,
    mapY: 70,
    spotsAvailable: null,
    participantCount: null,
    experience: "Casual gamer",
    description: "Free for a little while and open to games, a movie, or an easy hangout.",
    accepting: true,
  },
  {
    id: "open-leena",
    kind: "availability",
    activity: null,
    openTo: ["Coffee", "Food", "Walk"],
    profileId: "leena",
    date: sampleDate,
    startTime: "15:00",
    endTime: "18:00",
    location: "Around Café Lane",
    distance: "800 m away",
    mapX: 66,
    mapY: 50,
    spotsAvailable: null,
    participantCount: null,
    experience: "Coffee regular",
    description: "Free later today and happy to make a relaxed coffee, food, or walking plan.",
    accepting: true,
  },
];
