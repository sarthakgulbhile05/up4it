"use client";

import { FormEvent, useState } from "react";
import {
  activityOptions,
  type Activity,
  type DiscoveryItem,
  type FeedbackRecord,
  type Profile,
  localAvailabilityProfile,
  mockFeedback,
  mockDiscoveryItems,
  mockProfiles,
  sampleDate,
} from "./mock-data";

type View =
  | "home"
  | "specific"
  | "specificResults"
  | "feed"
  | "availability"
  | "freeSetup"
  | "freeResults"
  | "trustSettings"
  | "detail";
type FeedDisplay = "list" | "map";
type FreeDuration = "now" | "oneHour" | "twoHours" | "laterToday";

const allActivities = "All activities";
const freeDurationOptions: Record<FreeDuration, { label: string; startTime: string; endTime: string; remaining: string }> = {
  now: { label: "Right now", startTime: "13:00", endTime: "13:30", remaining: "about 30 minutes" },
  oneHour: { label: "Next 1 hour", startTime: "13:00", endTime: "14:00", remaining: "about 1 hour" },
  twoHours: { label: "Next 2 hours", startTime: "13:00", endTime: "15:00", remaining: "about 2 hours" },
  laterToday: { label: "Later today", startTime: "15:00", endTime: "19:00", remaining: "until 7 PM" },
};

function timeLabel(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const hour = hours % 12 || 12;
  const suffix = hours >= 12 ? "PM" : "AM";

  return `${hour}${minutes ? `:${minutes.toString().padStart(2, "0")}` : ""} ${suffix}`;
}

function dateLabel(date: string) {
  return date === sampleDate ? "Oct 4, 2026" : date;
}

function activityIcon(activity: Activity | null) {
  return activityOptions.find((option) => option.name === activity)?.icon ?? "✨";
}

function itemIsVisible(item: DiscoveryItem, date: string, referenceTime: string) {
  return (
    item.date === date &&
    item.endTime > referenceTime &&
    item.accepting &&
    (item.kind === "availability" || item.spotsAvailable !== 0)
  );
}

function distanceInKilometers(distance: string) {
  const value = Number.parseFloat(distance);

  return distance.includes("km") ? value : value / 1000;
}

function trustSummary(profileId: string, feedback: FeedbackRecord[]) {
  const records = feedback.filter((record) => record.profileId === profileId);
  const reviewCount = records.length;

  return {
    completedActivities: reviewCount,
    reviewCount,
    rating: reviewCount
      ? (records.reduce((total, record) => total + record.rating, 0) / reviewCount).toFixed(1)
      : null,
  };
}

function verificationLabel(
  status: Profile["phoneStatus"] | Profile["communityStatus"],
  kind: "phone" | "community",
) {
  if (kind === "phone") {
    return status === "verified" ? "Phone verified" : status === "pending" ? "Phone pending" : "Phone not added";
  }

  return status === "verified"
    ? "Community verified"
    : status === "pending"
      ? "Community pending"
      : status === "rejected"
        ? "Community rejected"
        : "Community not verified";
}

function TrustBadges({ profile }: { profile: Profile }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5 text-xs font-medium">
      <span className={`rounded-full px-2 py-1 ${profile.phoneStatus === "verified" ? "bg-[#e4f3ed] text-[#17614f]" : "bg-[#f4f7f5] text-[#596a64]"}`}>
        {profile.phoneStatus === "verified" ? "✓ " : ""}{verificationLabel(profile.phoneStatus, "phone")}{profile.phoneStatus === "verified" ? " (simulated)" : ""}
      </span>
      <span className={`rounded-full px-2 py-1 ${profile.communityStatus === "verified" ? "bg-[#e4f3ed] text-[#17614f]" : "bg-[#f4f7f5] text-[#596a64]"}`}>
        {profile.communityStatus === "verified" ? "✓ " : ""}{verificationLabel(profile.communityStatus, "community")}{profile.communityStatus === "verified" ? " (simulated)" : ""}
      </span>
    </div>
  );
}

function DiscoveryCard({
  item,
  profile,
  trust,
  referenceTime,
  onOpen,
}: {
  item: DiscoveryItem;
  profile: Profile;
  trust: ReturnType<typeof trustSummary>;
  referenceTime: string;
  onOpen: () => void;
}) {
  const isAvailability = item.kind === "availability";
  const isOngoing = item.startTime < referenceTime && item.endTime > referenceTime;

  return (
    <article className="rounded-3xl border border-[#dce6e1] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            aria-hidden="true"
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-[#23433b] ${profile.avatarColor}`}
          >
            {profile.initials}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold tracking-[-0.025em]">{profile.name}</h2>
            <p className="mt-1 text-sm text-[#65736e]">{profile.distance}</p>
            <TrustBadges profile={profile} />
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isAvailability
              ? "bg-[#f4e8cf] text-[#805f20]"
              : isOngoing
                ? "bg-[#e4f3ed] text-[#17614f]"
                : "bg-[#edf2f0] text-[#52645e]"
          }`}
        >
          {isAvailability ? "Open availability" : isOngoing ? "Ongoing" : "Upcoming"}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-base font-semibold tracking-[-0.02em]">
          {isAvailability ? "Free and open to plans" : `${activityIcon(item.activity)} ${item.activity}`}
        </p>
        <p className="mt-1 text-sm text-[#596a64]">
          {timeLabel(item.startTime)}–{timeLabel(item.endTime)} · {item.location}
        </p>
        <p className="mt-3 text-sm leading-6 text-[#596a64]">{item.description}</p>
        <p className="mt-3 text-sm font-medium text-[#496159]">
          Why this match: {isAvailability ? "available during your selected time" : `joinable ${item.activity} at this time`}
          {profile.communityStatus === "verified" ? " · community verified (simulated)" : ""}.
        </p>
      </div>

      {isAvailability && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {item.openTo.map((activity) => (
            <span className="rounded-full bg-[#f4f7f5] px-2.5 py-1 text-xs font-medium text-[#496159]" key={activity}>
              {activityIcon(activity)} {activity}
            </span>
          ))}
        </div>
      )}

      <dl className="mt-5 grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-2xl bg-[#f4f7f5] px-2 py-2.5">
          <dt className="sr-only">Member rating</dt>
          <dd className="font-semibold">{trust.rating ? `★ ${trust.rating} (${trust.reviewCount})` : "New member"}</dd>
        </div>
        <div className="rounded-2xl bg-[#f4f7f5] px-2 py-2.5">
          <dt className="sr-only">Completed activities</dt>
          <dd className="font-semibold">{trust.completedActivities || "New"}</dd>
        </div>
        <div className="rounded-2xl bg-[#f4f7f5] px-2 py-2.5">
          <dt className="sr-only">Available spots</dt>
          <dd className="font-semibold">
            {item.spotsAvailable === null ? "Open to chat" : `${item.spotsAvailable} spot${item.spotsAvailable === 1 ? "" : "s"}`}
          </dd>
        </div>
      </dl>

      <button
        className="mt-5 w-full rounded-2xl border border-[#146c5a] px-4 py-3 text-sm font-semibold text-[#146c5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#146c5a]"
        onClick={onOpen}
        type="button"
      >
        View details
      </button>
    </article>
  );
}

function MapDiscovery({
  items,
  profileFor,
  selectedItem,
  onSelect,
  onClose,
  onOpen,
}: {
  items: DiscoveryItem[];
  profileFor: (item: DiscoveryItem) => Profile | undefined;
  selectedItem: DiscoveryItem | null;
  onSelect: (item: DiscoveryItem) => void;
  onClose: () => void;
  onOpen: (item: DiscoveryItem) => void;
}) {
  const previewItem = selectedItem && items.some((item) => item.id === selectedItem.id)
    ? selectedItem
    : null;
  const previewProfile = previewItem ? profileFor(previewItem) : undefined;
  return (
    <div>
      <div aria-label="People discovery map" className="relative mt-8 h-[34rem] overflow-hidden rounded-3xl border border-[#dce6e1] bg-[#edf4f1] shadow-inner sm:h-[38rem]" role="region">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.9),transparent_34%),radial-gradient(circle_at_80%_70%,rgba(202,226,216,0.7),transparent_32%)]" />
        <div aria-hidden="true" className="absolute left-[-10%] top-[28%] h-px w-[120%] rotate-[-11deg] bg-white/80" />
        <div aria-hidden="true" className="absolute left-[45%] top-[-10%] h-[120%] w-px rotate-[18deg] bg-white/75" />
        <p className="absolute left-5 top-5 rounded-full bg-white/80 px-3 py-2 text-xs font-semibold text-[#496159] shadow-sm">
          People nearby · approximate areas
        </p>

        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center">
          <div aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-[#146c5a] text-lg shadow-lg">📍</div>
          <p className="mt-1 rounded-full bg-white/85 px-2 py-1 text-xs font-semibold text-[#17614f] shadow-sm">You</p>
        </div>

        {items.map((item) => {
          const profile = profileFor(item);

          return profile ? (
            <button
              aria-label={`Show ${profile.name}, ${item.kind === "availability" ? "available for" : "hosting"} ${item.kind === "availability" ? item.openTo.join(", ") : item.activity}`}
              className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#146c5a] ${previewItem?.id === item.id ? "scale-110" : ""}`}
              key={item.id}
              onClick={() => onSelect(item)}
              style={{ left: `${item.mapX}%`, top: `${item.mapY}%` }}
              type="button"
            >
              <span className={`relative mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-white text-sm font-bold text-[#23433b] shadow-lg ${profile.avatarColor}`}>
                {profile.initials}
                <span aria-hidden="true" className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-white text-sm shadow-sm">
                  {item.kind === "availability" ? "🟢" : activityIcon(item.activity)}
                </span>
              </span>
              <span className="mt-1 block max-w-24 truncate rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-[#374542] shadow-sm">
                {profile.name.split(" ")[0]}
              </span>
            </button>
          ) : null;
        })}

        {items.length === 0 && (
          <div className="absolute inset-x-5 top-1/2 z-20 -translate-y-1/2 rounded-3xl bg-white p-5 text-center shadow-lg">
            <h2 className="text-lg font-semibold">No people nearby right now.</h2>
            <p className="mt-2 text-sm text-[#596a64]">Try changing your existing activity, time, or distance filters.</p>
          </div>
        )}

        {previewItem && previewProfile && (
          <article className="absolute inset-x-3 bottom-3 z-30 rounded-3xl border border-[#dce6e1] bg-white p-4 shadow-xl sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-72">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  aria-hidden="true"
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-[#23433b] ${previewProfile.avatarColor}`}
                >
                  {previewProfile.initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{previewProfile.name}</p>
                </div>
              </div>
              <button
                aria-label="Close activity preview"
                className="rounded-full px-2 py-1 text-lg leading-none text-[#65736e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#146c5a]"
                onClick={onClose}
                type="button"
              >
                ×
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="font-semibold">
                {previewItem.kind === "availability" ? `🟢 Available for ${previewItem.openTo.join(", ")}` : `${activityIcon(previewItem.activity)} ${previewItem.activity}`}
              </p>
            </div>
            <p className="mt-1 text-sm text-[#596a64]">
              {dateLabel(previewItem.date)} · {timeLabel(previewItem.startTime)}{previewItem.kind === "availability" ? `–${timeLabel(previewItem.endTime)}` : ""}
            </p>
            <p className="mt-3 text-sm font-medium text-[#496159]">{previewItem.experience ?? previewProfile.experience}</p>
            <button
              className="mt-4 w-full rounded-2xl bg-[#146c5a] px-4 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#146c5a]"
              onClick={() => onOpen(previewItem)}
              type="button"
            >
              View profile
            </button>
          </article>
        )}
      </div>
      <p className="mt-3 text-sm leading-6 text-[#71807b]">
        Positions are based on existing mock proximity data. “You” is an approximate simulated location — no exact or live location is shown.
      </p>
    </div>
  );
}

function DiscoveryViewToggle({
  display,
  onChange,
}: {
  display: FeedDisplay;
  onChange: (display: FeedDisplay) => void;
}) {
  return (
    <div aria-label="Discovery view" className="mt-6 inline-flex rounded-2xl bg-[#edf2f0] p-1" role="group">
      <button
        aria-pressed={display === "list"}
        className={`rounded-xl px-4 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#146c5a] ${
          display === "list" ? "bg-white text-[#146c5a] shadow-sm" : "text-[#596a64]"
        }`}
        onClick={() => onChange("list")}
        type="button"
      >
        ☷ List View
      </button>
      <button
        aria-pressed={display === "map"}
        className={`rounded-xl px-4 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#146c5a] ${
          display === "map" ? "bg-white text-[#146c5a] shadow-sm" : "text-[#596a64]"
        }`}
        onClick={() => onChange("map")}
        type="button"
      >
        ◉ Map View
      </button>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      aria-label="Go back"
      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dce6e1] bg-white text-xl text-[#146c5a] shadow-sm hover:bg-[#e4f3ed] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#146c5a]"
      onClick={onClick}
      type="button"
    >
      ←
    </button>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [activity, setActivity] = useState<Activity | null>(null);
  const [date, setDate] = useState(sampleDate);
  const [time, setTime] = useState("16:00");
  const [feedDate, setFeedDate] = useState(sampleDate);
  const [feedTime, setFeedTime] = useState("13:00");
  const [feedActivity, setFeedActivity] = useState<Activity | typeof allActivities>(allActivities);
  const [feedRadius, setFeedRadius] = useState(3);
  const [feedDisplay, setFeedDisplay] = useState<FeedDisplay>("list");
  const [specificDisplay, setSpecificDisplay] = useState<FeedDisplay>("list");
  const [selectedMapItem, setSelectedMapItem] = useState<DiscoveryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<DiscoveryItem | null>(null);
  const [detailOrigin, setDetailOrigin] = useState<"feed" | "specificResults" | "freeResults">("feed");
  const [requestedItem, setRequestedItem] = useState<string | null>(null);
  const [availabilityDate, setAvailabilityDate] = useState(sampleDate);
  const [availabilityStart, setAvailabilityStart] = useState("14:00");
  const [availabilityEnd, setAvailabilityEnd] = useState("19:00");
  const [openActivities, setOpenActivities] = useState<Activity[]>(["Coffee", "Walk"]);
  const [availabilitySaved, setAvailabilitySaved] = useState(false);
  const [freeDuration, setFreeDuration] = useState<FreeDuration>("twoHours");
  const [freeActivities, setFreeActivities] = useState<Activity[]>(["Coffee", "Walk"]);
  const [freeRadius, setFreeRadius] = useState(1.5);
  const [freeActive, setFreeActive] = useState(false);
  const [phoneStatus, setPhoneStatus] = useState<Profile["phoneStatus"]>("not-added");
  const [communityStatus, setCommunityStatus] = useState<Profile["communityStatus"]>("not-verified");
  const [communityName, setCommunityName] = useState("");
  const [institutionEmail, setInstitutionEmail] = useState("");
  const [feedback, setFeedback] = useState<FeedbackRecord[]>(mockFeedback);
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [blockedProfileIds, setBlockedProfileIds] = useState<string[]>([]);
  const [reportProfileId, setReportProfileId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("Harassment");
  const [reportNote, setReportNote] = useState("");
  const [reports, setReports] = useState<{ profileId: string; reason: string; note: string }[]>([]);
  const [reportedProfileIds, setReportedProfileIds] = useState<string[]>([]);
  const [confirmBlockProfileId, setConfirmBlockProfileId] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState("5");
  const [didActivityTakePlace, setDidActivityTakePlace] = useState("yes");
  const [wouldMeetAgain, setWouldMeetAgain] = useState("yes");
  const [feedbackNote, setFeedbackNote] = useState("");

  const currentProfile: Profile = {
    ...localAvailabilityProfile,
    phoneStatus,
    communityStatus,
    communityName: communityName || null,
  };
  const profiles = [...mockProfiles, currentProfile];

  const freeWindow = freeDurationOptions[freeDuration];
  const activeFreeItem: DiscoveryItem | null = freeActive
    ? {
        id: "local-free-availability",
        kind: "availability",
        activity: null,
        openTo: freeActivities,
        profileId: localAvailabilityProfile.id,
        date: sampleDate,
        startTime: freeWindow.startTime,
        endTime: freeWindow.endTime,
        location: "Approximate local area",
        distance: localAvailabilityProfile.distance,
        mapX: 45,
        mapY: 55,
        spotsAvailable: null,
        participantCount: null,
        experience: "Open to ideas",
        description: "Availability activated in this browser for the prototype matching demonstration.",
        accepting: true,
      }
    : null;
  const discoveryItems = activeFreeItem ? [...mockDiscoveryItems, activeFreeItem] : mockDiscoveryItems;
  const specificItems = discoveryItems
    .filter(
      (item) =>
        !blockedProfileIds.includes(item.profileId) &&
        activity !== null &&
        itemIsVisible(item, date, time) &&
        (item.activity === activity || item.openTo.includes(activity)),
    )
    .sort((left, right) => left.startTime.localeCompare(right.startTime));
  const feedItems = mockDiscoveryItems
    .filter(
      (item) =>
        !blockedProfileIds.includes(item.profileId) &&
        item.kind === "session" &&
        itemIsVisible(item, feedDate, feedTime) &&
        distanceInKilometers(item.distance) <= feedRadius &&
        (feedActivity === allActivities || item.activity === feedActivity),
    )
    .sort(
      (left, right) =>
        Number(right.startTime < feedTime && right.endTime > feedTime) -
          Number(left.startTime < feedTime && left.endTime > feedTime) ||
        left.startTime.localeCompare(right.startTime),
    );
  const freeItems = mockDiscoveryItems
    .filter(
      (item) =>
        !blockedProfileIds.includes(item.profileId) &&
        item.kind === "availability" &&
        item.accepting &&
        item.date === sampleDate &&
        item.endTime > freeWindow.startTime &&
        item.startTime < freeWindow.endTime &&
        item.openTo.some((option) => freeActivities.includes(option)) &&
        distanceInKilometers(item.distance) <= freeRadius,
    )
    .sort(
      (left, right) =>
        right.openTo.filter((option) => freeActivities.includes(option)).length -
          left.openTo.filter((option) => freeActivities.includes(option)).length ||
        distanceInKilometers(left.distance) - distanceInKilometers(right.distance),
    );
  const selectedProfile = selectedItem
    ? profiles.find((profile) => profile.id === selectedItem.profileId)
    : null;
  const selectedTrust = selectedProfile ? trustSummary(selectedProfile.id, feedback) : null;
  const canShareAvailability =
    openActivities.length > 0 && availabilityStart < availabilityEnd;

  function openDetails(item: DiscoveryItem, origin: "feed" | "specificResults" | "freeResults") {
    setDetailOrigin(origin);
    setSelectedItem(item);
    setView("detail");
  }

  function submitSpecificSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (activity) {
      setSelectedMapItem(null);
      setView("specificResults");
    }
  }

  function toggleOpenActivity(selectedActivity: Activity) {
    setAvailabilitySaved(false);
    setOpenActivities((current) =>
      current.includes(selectedActivity)
        ? current.filter((option) => option !== selectedActivity)
        : [...current, selectedActivity],
    );
  }

  function submitAvailability(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (canShareAvailability) {
      setAvailabilitySaved(true);
    }
  }

  function toggleFreeActivity(selectedActivity: Activity) {
    setFreeActivities((current) =>
      current.includes(selectedActivity)
        ? current.filter((option) => option !== selectedActivity)
        : [...current, selectedActivity],
    );
  }

  function submitFreeSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (freeActivities.length > 0) {
      setFreeActive(true);
      setView("freeResults");
    }
  }

  function profileFor(item: DiscoveryItem) {
    return profiles.find((profile) => profile.id === item.profileId);
  }

  return (
    <main className="relative flex min-h-svh items-start justify-center overflow-hidden bg-[#f7f6f1] px-5 py-8 text-[#1f2a28] sm:items-center sm:px-8">
      <div
        aria-hidden="true"
        className="absolute -top-24 right-[-5rem] h-72 w-72 rounded-full bg-[#f4cb8f]/45 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#a8d8cc]/45 blur-3xl"
      />

      <section
        className={`relative w-full rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_24px_80px_rgba(31,42,40,0.12)] backdrop-blur sm:p-9 ${
          view === "home" || view === "specific" || view === "availability" || view === "freeSetup" || view === "trustSettings" ? "max-w-2xl" : "max-w-5xl"
        }`}
      >
        {view === "home" && (
          <>
            <header className="max-w-xl">
              <p className="text-xl font-bold tracking-[-0.06em] text-[#146c5a]">up4it</p>
              <h1 className="mt-8 text-4xl font-semibold leading-[1.05] tracking-[-0.055em] sm:text-5xl">
                Find people who are up for it.
              </h1>
              <p className="mt-4 text-base leading-7 text-[#5b6764]">
                Choose the way you want to find your next plan.
              </p>
            </header>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <button
                className="rounded-3xl border border-[#146c5a] bg-[#e4f3ed] p-6 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#146c5a]"
                onClick={() => setView("specific")}
                type="button"
              >
                <span className="text-3xl" aria-hidden="true">🎯</span>
                <span className="mt-6 block text-xl font-semibold tracking-[-0.03em]">I have something in mind</span>
                <span className="mt-2 block leading-7 text-[#47635b]">
                  Choose an activity and find people who are available.
                </span>
              </button>
              <button
                className="rounded-3xl border border-[#e8d0a2] bg-[#fff7e5] p-6 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#146c5a]"
                onClick={() => setView("feed")}
                type="button"
              >
                <span className="text-3xl" aria-hidden="true">🔎</span>
                <span className="mt-6 block text-xl font-semibold tracking-[-0.03em]">I&apos;m open to anything</span>
                <span className="mt-2 block leading-7 text-[#715d35]">
                  Explore activities happening around you.
                </span>
              </button>
              <button
                className="rounded-3xl border border-[#b8d9cc] bg-[#e4f3ed] p-6 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#146c5a]"
                onClick={() => setView("freeSetup")}
                type="button"
              >
                <span className="text-3xl" aria-hidden="true">🟢</span>
                <span className="mt-6 block text-xl font-semibold tracking-[-0.03em]">I&apos;m Free</span>
                <span className="mt-2 block leading-7 text-[#47635b]">
                  Let others discover you&apos;re available and find someone to make a plan with.
                </span>
              </button>
            </div>
            <button
              className="mt-6 text-sm font-semibold text-[#146c5a] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#146c5a]"
              onClick={() => setView("trustSettings")}
              type="button"
            >
              Trust &amp; safety settings
            </button>
            <p className="mt-4 text-sm leading-6 text-[#71807b]">
              Prototype only — every person, trust status, activity, and feedback record shown here is simulated.
            </p>
          </>
        )}

        {view === "specific" && (
          <>
            <BackButton onClick={() => setView("home")} />
            <header className="mt-8">
              <p className="text-xl font-bold tracking-[-0.06em] text-[#146c5a]">up4it</p>
              <h1 className="mt-6 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
                What do you have in mind?
              </h1>
              <p className="mt-3 text-base leading-7 text-[#5b6764]">
                Your time is a reference, not an exact match. We&apos;ll show joinable sessions still active then, plus later sessions.
              </p>
            </header>

            <form className="mt-8" onSubmit={submitSpecificSearch}>
              <fieldset>
                <legend className="text-lg font-semibold tracking-[-0.025em]">Choose an activity</legend>
                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                  {activityOptions.map((option) => (
                    <button
                      aria-pressed={activity === option.name}
                      className={`rounded-2xl border px-3 py-3 text-left text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#146c5a] ${
                        activity === option.name
                          ? "border-[#146c5a] bg-[#146c5a] text-white"
                          : "border-[#d9dfdb] bg-white text-[#374542] hover:border-[#82aa9e]"
                      }`}
                      key={option.name}
                      onClick={() => setActivity(option.name)}
                      type="button"
                    >
                      <span aria-hidden="true">{option.icon}</span> {option.name}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-8">
                <legend className="text-lg font-semibold tracking-[-0.025em]">When are you free?</legend>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="text-sm font-medium text-[#374542]">
                    Date
                    <input
                      className="mt-2 block w-full rounded-2xl border border-[#c9d5d0] bg-white px-4 py-3 text-base outline-none focus:border-[#146c5a] focus:ring-2 focus:ring-[#146c5a]/20"
                      onChange={(event) => setDate(event.target.value)}
                      type="date"
                      value={date}
                    />
                  </label>
                  <label className="text-sm font-medium text-[#374542]">
                    From around
                    <input
                      className="mt-2 block w-full rounded-2xl border border-[#c9d5d0] bg-white px-4 py-3 text-base outline-none focus:border-[#146c5a] focus:ring-2 focus:ring-[#146c5a]/20"
                      onChange={(event) => setTime(event.target.value)}
                      type="time"
                      value={time}
                    />
                  </label>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#71807b]">
                  Sample data starts on October 4, 2026. Try Badminton from 16:00 to see ongoing and later sessions.
                </p>
              </fieldset>

              <button
                className="mt-8 flex w-full items-center justify-center rounded-2xl bg-[#146c5a] px-5 py-4 text-base font-semibold text-white shadow-[0_10px_24px_rgba(20,108,90,0.24)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#146c5a] disabled:cursor-not-allowed disabled:bg-[#b9c9c3] disabled:shadow-none"
                disabled={!activity}
                type="submit"
              >
                {activity ? `Explore ${activity}` : "Choose an activity"}
              </button>
            </form>
          </>
        )}

        {view === "specificResults" && (
          <>
            <BackButton onClick={() => setView("specific")} />
            <header className="mt-8">
              <p className="text-xl font-bold tracking-[-0.06em] text-[#146c5a]">up4it</p>
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-[#64817a]">Sample discovery</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
                {activity} from {timeLabel(time)}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[#5b6764]">
                {dateLabel(date)} · Showing matching sessions plus people who are free for {activity}. Mock data only.
              </p>
              <DiscoveryViewToggle display={specificDisplay} onChange={setSpecificDisplay} />
            </header>

            {specificDisplay === "map" ? (
              <MapDiscovery
                items={specificItems}
                onClose={() => setSelectedMapItem(null)}
                onOpen={(item) => openDetails(item, "specificResults")}
                onSelect={setSelectedMapItem}
                profileFor={profileFor}
                selectedItem={selectedMapItem}
              />
            ) : specificItems.length > 0 ? (
              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                {specificItems.map((item) => {
                  const profile = profileFor(item);

                  return profile ? (
                    <DiscoveryCard
                      item={item}
                      key={item.id}
                      onOpen={() => openDetails(item, "specificResults")}
                      profile={profile}
                      referenceTime={time}
                      trust={trustSummary(profile.id, feedback)}
                    />
                  ) : null;
                })}
              </div>
            ) : (
              <div className="mt-8 rounded-3xl bg-[#e4f3ed] p-6">
                <h2 className="text-xl font-semibold tracking-[-0.025em]">No matching sessions are listed yet.</h2>
                <p className="mt-3 leading-7 text-[#47635b]">
                  Try nearby times, or explore all activities to see other plans and open availability.
                </p>
                <button
                  className="mt-5 rounded-full bg-[#146c5a] px-4 py-2.5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#146c5a]"
                  onClick={() => setView("feed")}
                  type="button"
                >
                  Explore all activities
                </button>
              </div>
            )}
          </>
        )}

        {view === "feed" && (
          <>
            <BackButton onClick={() => setView("home")} />
            <header className="mt-8">
              <p className="text-xl font-bold tracking-[-0.06em] text-[#146c5a]">up4it</p>
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-[#64817a]">Open discovery</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
                What&apos;s happening nearby
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[#5b6764]">
                Explore activities happening around you. This feed contains planned activities only. Everything shown is mock data.
              </p>
            </header>

            <DiscoveryViewToggle display={feedDisplay} onChange={setFeedDisplay} />

            <div className="mt-8 rounded-3xl bg-[#f4f7f5] p-4 sm:p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium text-[#374542]">
                  Date
                  <input
                    className="mt-2 block w-full rounded-2xl border border-[#c9d5d0] bg-white px-4 py-3 text-base outline-none focus:border-[#146c5a] focus:ring-2 focus:ring-[#146c5a]/20"
                    onChange={(event) => {
                      setFeedDate(event.target.value);
                      setSelectedMapItem(null);
                    }}
                    type="date"
                    value={feedDate}
                  />
                </label>
                <label className="text-sm font-medium text-[#374542]">
                  From around
                  <input
                    className="mt-2 block w-full rounded-2xl border border-[#c9d5d0] bg-white px-4 py-3 text-base outline-none focus:border-[#146c5a] focus:ring-2 focus:ring-[#146c5a]/20"
                    onChange={(event) => {
                      setFeedTime(event.target.value);
                      setSelectedMapItem(null);
                    }}
                    type="time"
                    value={feedTime}
                  />
                </label>
              </div>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {[allActivities, ...activityOptions.map((option) => option.name)].map((option) => (
                  <button
                    aria-pressed={feedActivity === option}
                    className={`rounded-full border px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#146c5a] ${
                      feedActivity === option
                        ? "border-[#146c5a] bg-[#146c5a] text-white"
                        : "border-[#d9dfdb] bg-white text-[#374542] hover:border-[#82aa9e]"
                    }`}
                    key={option}
                    onClick={() => {
                      setFeedActivity(option as Activity | typeof allActivities);
                      setSelectedMapItem(null);
                    }}
                    type="button"
                  >
                    {option === allActivities ? "All activities" : `${activityIcon(option as Activity)} ${option}`}
                  </button>
                ))}
              </div>
              <fieldset className="mt-5">
                <legend className="text-sm font-medium text-[#374542]">Within</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[1, 1.5, 3].map((radius) => (
                    <button
                      aria-pressed={feedRadius === radius}
                      className={`rounded-full border px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#146c5a] ${
                        feedRadius === radius
                          ? "border-[#146c5a] bg-[#146c5a] text-white"
                          : "border-[#d9dfdb] bg-white text-[#374542] hover:border-[#82aa9e]"
                      }`}
                      key={radius}
                      onClick={() => {
                        setFeedRadius(radius);
                        setSelectedMapItem(null);
                      }}
                      type="button"
                    >
                      {radius} km
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>

            {feedDisplay === "map" ? (
              <MapDiscovery
                items={feedItems}
                onClose={() => setSelectedMapItem(null)}
                onOpen={(item) => openDetails(item, "feed")}
                onSelect={setSelectedMapItem}
                profileFor={profileFor}
                selectedItem={selectedMapItem}
              />
            ) : feedItems.length > 0 ? (
              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                {feedItems.map((item) => {
                  const profile = profileFor(item);

                  return profile ? (
                    <DiscoveryCard
                      item={item}
                      key={item.id}
                      onOpen={() => openDetails(item, "feed")}
                      profile={profile}
                      referenceTime={feedTime}
                      trust={trustSummary(profile.id, feedback)}
                    />
                  ) : null;
                })}
              </div>
            ) : (
              <div className="mt-8 rounded-3xl bg-[#e4f3ed] p-6">
                <h2 className="text-xl font-semibold tracking-[-0.025em]">Nothing is listed for those filters yet.</h2>
                <p className="mt-3 leading-7 text-[#47635b]">
                  Try another time, clear the activity filter, or expand the distance.
                </p>
                <button
                  className="mt-5 rounded-full bg-[#146c5a] px-4 py-2.5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#146c5a]"
                  onClick={() => setFeedActivity(allActivities)}
                  type="button"
                >
                  Show all activities
                </button>
              </div>
            )}
          </>
        )}

        {view === "freeSetup" && (
          <>
            <BackButton onClick={() => setView("home")} />
            <header className="mt-8">
              <p className="text-xl font-bold tracking-[-0.06em] text-[#146c5a]">up4it</p>
              <h1 className="mt-6 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">I&apos;m Free</h1>
              <p className="mt-3 text-base leading-7 text-[#5b6764]">
                Share a flexible availability window to find people who are free too. This is not a planned activity.
              </p>
            </header>

            <form className="mt-8" onSubmit={submitFreeSearch}>
              <fieldset>
                <legend className="text-lg font-semibold tracking-[-0.025em]">How long are you available?</legend>
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  {(Object.entries(freeDurationOptions) as [FreeDuration, (typeof freeDurationOptions)[FreeDuration]][]).map(
                    ([key, option]) => (
                      <button
                        aria-pressed={freeDuration === key}
                        className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#146c5a] ${
                          freeDuration === key
                            ? "border-[#146c5a] bg-[#146c5a] text-white"
                            : "border-[#d9dfdb] bg-white text-[#374542] hover:border-[#82aa9e]"
                        }`}
                        key={key}
                        onClick={() => setFreeDuration(key)}
                        type="button"
                      >
                        {option.label}
                      </button>
                    ),
                  )}
                </div>
              </fieldset>

              <fieldset className="mt-8">
                <legend className="text-lg font-semibold tracking-[-0.025em]">What are you open to?</legend>
                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  <button
                    aria-pressed={freeActivities.length === activityOptions.length}
                    className={`rounded-2xl border px-3 py-3 text-left text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#146c5a] ${
                      freeActivities.length === activityOptions.length
                        ? "border-[#146c5a] bg-[#146c5a] text-white"
                        : "border-[#d9dfdb] bg-white text-[#374542] hover:border-[#82aa9e]"
                    }`}
                    onClick={() => setFreeActivities(activityOptions.map((option) => option.name))}
                    type="button"
                  >
                    ✨ Anything
                  </button>
                  {activityOptions.map((option) => (
                    <button
                      aria-pressed={freeActivities.includes(option.name)}
                      className={`rounded-2xl border px-3 py-3 text-left text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#146c5a] ${
                        freeActivities.includes(option.name)
                          ? "border-[#146c5a] bg-[#146c5a] text-white"
                          : "border-[#d9dfdb] bg-white text-[#374542] hover:border-[#82aa9e]"
                      }`}
                      key={option.name}
                      onClick={() => toggleFreeActivity(option.name)}
                      type="button"
                    >
                      <span aria-hidden="true">{option.icon}</span> {option.name}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-8">
                <legend className="text-lg font-semibold tracking-[-0.025em]">How far are you willing to travel?</legend>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {[0.5, 1, 1.5].map((radius) => (
                    <button
                      aria-pressed={freeRadius === radius}
                      className={`rounded-full border px-4 py-2.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#146c5a] ${
                        freeRadius === radius
                          ? "border-[#146c5a] bg-[#146c5a] text-white"
                          : "border-[#d9dfdb] bg-white text-[#374542] hover:border-[#82aa9e]"
                      }`}
                      key={radius}
                      onClick={() => setFreeRadius(radius)}
                      type="button"
                    >
                      {radius < 1 ? `${radius * 1000} m` : `${radius} km`}
                    </button>
                  ))}
                </div>
              </fieldset>

              <button
                className="mt-8 flex w-full items-center justify-center rounded-2xl bg-[#146c5a] px-5 py-4 text-base font-semibold text-white shadow-[0_10px_24px_rgba(20,108,90,0.24)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#146c5a] disabled:cursor-not-allowed disabled:bg-[#b9c9c3] disabled:shadow-none"
                disabled={freeActivities.length === 0}
                type="submit"
              >
                Find people
              </button>
            </form>
          </>
        )}

        {view === "freeResults" && (
          <>
            <BackButton onClick={() => setView("freeSetup")} />
            <header className="mt-8">
              <p className="text-xl font-bold tracking-[-0.06em] text-[#146c5a]">up4it</p>
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-[#64817a]">Flexible availability</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">People who are free too</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[#5b6764]">
                Showing people who are open to making a plan, not planned activities. Everything shown is mock data.
              </p>
            </header>

            <section aria-live="polite" className="mt-8 rounded-3xl border border-[#b8d9cc] bg-[#e4f3ed] p-5">
              {freeActive ? (
                <>
                  <p className="font-semibold text-[#17614f]">🟢 Your availability is active</p>
                  <p className="mt-2 leading-7 text-[#47635b]">
                    Free from {timeLabel(freeWindow.startTime)} to {timeLabel(freeWindow.endTime)} · {freeWindow.remaining} left · up to {freeRadius < 1 ? `${freeRadius * 1000} m` : `${freeRadius} km`} away.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      className="rounded-full border border-[#146c5a] bg-white px-4 py-2.5 text-sm font-semibold text-[#146c5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#146c5a]"
                      onClick={() => setView("freeSetup")}
                      type="button"
                    >
                      Edit availability
                    </button>
                    <button
                      className="rounded-full px-4 py-2.5 text-sm font-semibold text-[#47635b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#146c5a]"
                      onClick={() => setFreeActive(false)}
                      type="button"
                    >
                      Turn off availability
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-semibold text-[#17614f]">Your availability is off</p>
                  <button
                    className="mt-3 rounded-full border border-[#146c5a] bg-white px-4 py-2.5 text-sm font-semibold text-[#146c5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#146c5a]"
                    onClick={() => setFreeActive(true)}
                    type="button"
                  >
                    Turn availability back on
                  </button>
                </>
              )}
            </section>

            {freeActive && freeItems.length > 0 ? (
              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                {freeItems.map((item) => {
                  const profile = profileFor(item);

                  return profile ? (
                    <DiscoveryCard
                      item={item}
                      key={item.id}
                      onOpen={() => openDetails(item, "freeResults")}
                      profile={profile}
                      referenceTime={freeWindow.startTime}
                      trust={trustSummary(profile.id, feedback)}
                    />
                  ) : null;
                })}
              </div>
            ) : freeActive ? (
              <div className="mt-8 rounded-3xl bg-[#f4f7f5] p-6">
                <h2 className="text-xl font-semibold tracking-[-0.025em]">No one is free for those preferences yet.</h2>
                <p className="mt-3 leading-7 text-[#596a64]">
                  Try a longer window, a wider travel radius, or more activities. You can also explore planned activities nearby.
                </p>
                <button
                  className="mt-5 rounded-full bg-[#146c5a] px-4 py-2.5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#146c5a]"
                  onClick={() => setView("freeSetup")}
                  type="button"
                >
                  Edit availability
                </button>
              </div>
            ) : null}
          </>
        )}

        {view === "availability" && (
          <>
            <BackButton onClick={() => setView("feed")} />
            <header className="mt-8">
              <p className="text-xl font-bold tracking-[-0.06em] text-[#146c5a]">up4it</p>
              <h1 className="mt-6 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
                Share open availability
              </h1>
              <p className="mt-3 text-base leading-7 text-[#5b6764]">
                Tell people when you&apos;re free and what you&apos;d be open to. This is not a planned activity.
              </p>
            </header>

            <form className="mt-8" onSubmit={submitAvailability}>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="text-sm font-medium text-[#374542]">
                  Date
                  <input
                    className="mt-2 block w-full rounded-2xl border border-[#c9d5d0] bg-white px-4 py-3 text-base outline-none focus:border-[#146c5a] focus:ring-2 focus:ring-[#146c5a]/20"
                    onChange={(event) => {
                      setAvailabilityDate(event.target.value);
                      setAvailabilitySaved(false);
                    }}
                    type="date"
                    value={availabilityDate}
                  />
                </label>
                <label className="text-sm font-medium text-[#374542]">
                  From
                  <input
                    className="mt-2 block w-full rounded-2xl border border-[#c9d5d0] bg-white px-4 py-3 text-base outline-none focus:border-[#146c5a] focus:ring-2 focus:ring-[#146c5a]/20"
                    onChange={(event) => {
                      setAvailabilityStart(event.target.value);
                      setAvailabilitySaved(false);
                    }}
                    type="time"
                    value={availabilityStart}
                  />
                </label>
                <label className="text-sm font-medium text-[#374542]">
                  Until
                  <input
                    className="mt-2 block w-full rounded-2xl border border-[#c9d5d0] bg-white px-4 py-3 text-base outline-none focus:border-[#146c5a] focus:ring-2 focus:ring-[#146c5a]/20"
                    onChange={(event) => {
                      setAvailabilityEnd(event.target.value);
                      setAvailabilitySaved(false);
                    }}
                    type="time"
                    value={availabilityEnd}
                  />
                </label>
              </div>

              <fieldset className="mt-8">
                <legend className="text-lg font-semibold tracking-[-0.025em]">I&apos;m open to</legend>
                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                  {activityOptions.map((option) => (
                    <button
                      aria-pressed={openActivities.includes(option.name)}
                      className={`rounded-2xl border px-3 py-3 text-left text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#146c5a] ${
                        openActivities.includes(option.name)
                          ? "border-[#146c5a] bg-[#146c5a] text-white"
                          : "border-[#d9dfdb] bg-white text-[#374542] hover:border-[#82aa9e]"
                      }`}
                      key={option.name}
                      onClick={() => toggleOpenActivity(option.name)}
                      type="button"
                    >
                      <span aria-hidden="true">{option.icon}</span> {option.name}
                    </button>
                  ))}
                </div>
              </fieldset>

              {availabilitySaved ? (
                <div aria-live="polite" className="mt-8 rounded-3xl bg-[#e4f3ed] p-5">
                  <p className="font-semibold">Open availability saved locally.</p>
                  <p className="mt-2 leading-7 text-[#47635b]">
                    You&apos;re free on {dateLabel(availabilityDate)} from {timeLabel(availabilityStart)} to {timeLabel(availabilityEnd)} for {openActivities.join(", ")}. No real status was posted.
                  </p>
                </div>
              ) : (
                <button
                  className="mt-8 flex w-full items-center justify-center rounded-2xl bg-[#146c5a] px-5 py-4 text-base font-semibold text-white shadow-[0_10px_24px_rgba(20,108,90,0.24)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#146c5a] disabled:cursor-not-allowed disabled:bg-[#b9c9c3] disabled:shadow-none"
                  disabled={!canShareAvailability}
                  type="submit"
                >
                  Share open availability
                </button>
              )}
            </form>
          </>
        )}

        {view === "trustSettings" && (
          <>
            <BackButton onClick={() => setView("home")} />
            <header className="mt-8">
              <p className="text-xl font-bold tracking-[-0.06em] text-[#146c5a]">up4it</p>
              <h1 className="mt-6 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Trust &amp; safety settings</h1>
              <p className="mt-3 leading-7 text-[#5b6764]">
                Prototype controls only. Verification does not guarantee safety or confirm a real identity.
              </p>
            </header>

            <section className="mt-8 rounded-3xl border border-[#dce6e1] bg-white p-5">
              <h2 className="text-lg font-semibold">Community verification</h2>
              <p className="mt-2 text-sm leading-6 text-[#596a64]">
                Status: <strong>{verificationLabel(communityStatus, "community")}</strong>. No institution will be contacted in this demo.
              </p>
              {communityStatus === "pending" && <p className="mt-2 text-sm text-[#805f20]">Next step: a real product would review eligibility before confirming anything.</p>}
              {communityStatus === "verified" && <p className="mt-2 text-sm text-[#17614f]">Simulated verified state. This is not real-world verification.</p>}
              <form
                className="mt-5 space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  setCommunityStatus("pending");
                }}
              >
                <label className="block text-sm font-medium text-[#374542]">
                  Community or college
                  <input className="mt-2 block w-full rounded-2xl border border-[#c9d5d0] px-4 py-3" onChange={(event) => setCommunityName(event.target.value)} value={communityName} />
                </label>
                <label className="block text-sm font-medium text-[#374542]">
                  Institutional email (optional)
                  <input className="mt-2 block w-full rounded-2xl border border-[#c9d5d0] px-4 py-3" onChange={(event) => setInstitutionEmail(event.target.value)} type="email" value={institutionEmail} />
                </label>
                <button className="rounded-full bg-[#146c5a] px-4 py-2.5 text-sm font-semibold text-white" type="submit">
                  Submit simulated verification request
                </button>
              </form>
              {communityStatus === "pending" && (
                <button className="mt-3 text-sm font-semibold text-[#146c5a] underline underline-offset-4" onClick={() => setCommunityStatus("verified")} type="button">
                  Mark verified for demo
                </button>
              )}
            </section>

            <section className="mt-5 rounded-3xl border border-[#dce6e1] bg-white p-5">
              <h2 className="text-lg font-semibold">Phone verification</h2>
              <p className="mt-2 text-sm leading-6 text-[#596a64]">
                Status: <strong>{verificationLabel(phoneStatus, "phone")}</strong>. Phone numbers are never shown on public profiles.
              </p>
              {phoneStatus === "not-added" && <p className="mt-2 text-sm text-[#596a64]">No phone number is collected in this prototype.</p>}
              {phoneStatus === "pending" && <p className="mt-2 text-sm text-[#805f20]">Demo pending state — no OTP was sent or validated.</p>}
              {phoneStatus === "verified" && <p className="mt-2 text-sm text-[#17614f]">Simulated verified state only — no phone check occurred.</p>}
              <div className="mt-4 flex flex-wrap gap-3">
                {phoneStatus === "not-added" && (
                  <button className="rounded-full border border-[#146c5a] px-4 py-2.5 text-sm font-semibold text-[#146c5a]" onClick={() => setPhoneStatus("pending")} type="button">
                    Start simulated phone review
                  </button>
                )}
                {phoneStatus === "pending" && (
                  <button className="rounded-full border border-[#146c5a] px-4 py-2.5 text-sm font-semibold text-[#146c5a]" onClick={() => setPhoneStatus("verified")} type="button">
                    Mark phone verified for demo
                  </button>
                )}
              </div>
            </section>

            {blockedProfileIds.length > 0 && (
              <section className="mt-5 rounded-3xl border border-[#dce6e1] bg-white p-5">
                <h2 className="text-lg font-semibold">Blocked people</h2>
                <div className="mt-3 space-y-3">
                  {blockedProfileIds.map((profileId) => {
                    const profile = profiles.find((item) => item.id === profileId);

                    return profile ? (
                      <div className="flex items-center justify-between gap-3" key={profile.id}>
                        <span className="font-medium">{profile.name}</span>
                        <button className="text-sm font-semibold text-[#146c5a] underline underline-offset-4" onClick={() => setBlockedProfileIds((current) => current.filter((id) => id !== profile.id))} type="button">
                          Unblock
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              </section>
            )}
          </>
        )}

        {view === "detail" && selectedItem && selectedProfile && (
          <>
            <BackButton onClick={() => setView(detailOrigin)} />
            <article className="mt-8 max-w-3xl">
              <p className="text-xl font-bold tracking-[-0.06em] text-[#146c5a]">up4it</p>
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-[#64817a]">Mock profile and activity</p>
              <div className="mt-3 flex items-center gap-4">
                <div
                  aria-hidden="true"
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-bold text-[#23433b] ${selectedProfile.avatarColor}`}
                >
                  {selectedProfile.initials}
                </div>
                <div>
                  <h1 className="text-3xl font-semibold tracking-[-0.045em]">{selectedProfile.name}</h1>
                  <p className="mt-1 text-[#65736e]">{selectedProfile.distance}{selectedProfile.communityName ? ` · ${selectedProfile.communityName}` : ""}</p>
                  <TrustBadges profile={selectedProfile} />
                </div>
              </div>

              <p className="mt-7 text-lg leading-8 text-[#4f5e59]">{selectedProfile.bio}</p>

              <dl className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-[#f4f7f5] p-4">
                  <dt className="text-sm text-[#65736e]">Rating</dt>
                  <dd className="mt-1 text-xl font-semibold">{selectedTrust?.rating ? `★ ${selectedTrust.rating} (${selectedTrust.reviewCount} reviews)` : "New member"}</dd>
                </div>
                <div className="rounded-2xl bg-[#f4f7f5] p-4">
                  <dt className="text-sm text-[#65736e]">Completed activities</dt>
                  <dd className="mt-1 text-xl font-semibold">{selectedTrust?.completedActivities || "New"}</dd>
                </div>
                <div className="rounded-2xl bg-[#f4f7f5] p-4">
                  <dt className="text-sm text-[#65736e]">Experience</dt>
                  <dd className="mt-1 text-xl font-semibold">{selectedItem.experience ?? selectedProfile.experience}</dd>
                </div>
              </dl>

              <section className="mt-8 rounded-3xl border border-[#dce6e1] bg-white p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#64817a]">
                  {selectedItem.kind === "availability" ? "Open availability, not a planned activity" : "Planned activity"}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">
                  {selectedItem.kind === "availability"
                    ? "Free and open to make a plan"
                    : `${activityIcon(selectedItem.activity)} ${selectedItem.activity}`}
                </h2>
                <p className="mt-3 leading-7 text-[#596a64]">{selectedItem.description}</p>
                <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm text-[#65736e]">When</dt>
                    <dd className="mt-1 font-semibold">
                      {dateLabel(selectedItem.date)} · {timeLabel(selectedItem.startTime)}–{timeLabel(selectedItem.endTime)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-[#65736e]">Where</dt>
                    <dd className="mt-1 font-semibold">{selectedItem.location}</dd>
                  </div>
                  {selectedItem.kind === "session" && (
                    <>
                      <div>
                        <dt className="text-sm text-[#65736e]">Participants</dt>
                        <dd className="mt-1 font-semibold">{selectedItem.participantCount} going</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-[#65736e]">Spots</dt>
                        <dd className="mt-1 font-semibold">
                          {selectedItem.spotsAvailable === null ? "Looking for company" : `${selectedItem.spotsAvailable} available`}
                        </dd>
                      </div>
                    </>
                  )}
                </dl>
                {selectedItem.kind === "availability" && (
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {selectedItem.openTo.map((option) => (
                      <span className="rounded-full bg-[#f4f7f5] px-2.5 py-1 text-sm font-medium text-[#496159]" key={option}>
                        {activityIcon(option)} {option}
                      </span>
                    ))}
                  </div>
                )}
              </section>

              <aside className="mt-5 rounded-3xl bg-[#fff7e5] p-5">
                <h2 className="font-semibold">Safety before meeting</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[#715d35]">
                  <li>Prefer a public meeting location and confirm the activity, time, and meeting point first.</li>
                  <li>Do not share your home address or sensitive personal information.</li>
                  <li>Meet only when comfortable — you can decline or cancel at any time.</li>
                </ul>
                <p className="mt-3 text-xs text-[#805f20]">Locations in this prototype are approximate mock areas, not live locations.</p>
              </aside>

              {selectedItem.kind === "session" && !completedItems.includes(selectedItem.id) && (
                <button
                  className="mt-5 rounded-full border border-[#146c5a] px-4 py-2.5 text-sm font-semibold text-[#146c5a]"
                  onClick={() => setCompletedItems((current) => [...current, selectedItem.id])}
                  type="button"
                >
                  Mark mock activity completed
                </button>
              )}

              {selectedItem.kind === "session" && completedItems.includes(selectedItem.id) && (
                <section className="mt-5 rounded-3xl border border-[#dce6e1] bg-white p-5">
                  <h2 className="text-lg font-semibold">Post-activity feedback</h2>
                  {feedback.some((record) => record.itemId === selectedItem.id) ? (
                    <p className="mt-2 text-sm leading-6 text-[#17614f]">Feedback recorded once for this mock activity. Public trust summaries use only aggregate simulated feedback.</p>
                  ) : (
                    <form
                      className="mt-4 space-y-4"
                      onSubmit={(event) => {
                        event.preventDefault();
                        setFeedback((current) => [
                          ...current,
                          {
                            itemId: selectedItem.id,
                            profileId: selectedProfile.id,
                            rating: Number(feedbackRating),
                            wouldMeetAgain: wouldMeetAgain === "yes",
                          },
                        ]);
                        setFeedbackNote("");
                      }}
                    >
                      <fieldset>
                        <legend className="text-sm font-medium">Did the activity take place?</legend>
                        <div className="mt-2 flex gap-2">
                          {["yes", "no"].map((answer) => (
                            <button aria-pressed={didActivityTakePlace === answer} className={`rounded-full border px-3 py-2 text-sm ${didActivityTakePlace === answer ? "border-[#146c5a] bg-[#e4f3ed] text-[#17614f]" : "border-[#d9dfdb]"}`} key={answer} onClick={() => setDidActivityTakePlace(answer)} type="button">
                              {answer === "yes" ? "Yes" : "No"}
                            </button>
                          ))}
                        </div>
                      </fieldset>
                      <label className="block text-sm font-medium">
                        How was your experience?
                        <select className="mt-2 block w-full rounded-2xl border border-[#c9d5d0] px-4 py-3" onChange={(event) => setFeedbackRating(event.target.value)} value={feedbackRating}>
                          <option value="5">Great</option>
                          <option value="4">Good</option>
                          <option value="3">Okay</option>
                          <option value="2">Poor</option>
                          <option value="1">Unsafe or very poor</option>
                        </select>
                      </label>
                      <label className="block text-sm font-medium">
                        Would you do another activity with this person?
                        <select className="mt-2 block w-full rounded-2xl border border-[#c9d5d0] px-4 py-3" onChange={(event) => setWouldMeetAgain(event.target.value)} value={wouldMeetAgain}>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </label>
                      <label className="block text-sm font-medium">
                        Optional private comment
                        <textarea className="mt-2 block w-full rounded-2xl border border-[#c9d5d0] px-4 py-3" onChange={(event) => setFeedbackNote(event.target.value)} value={feedbackNote} />
                      </label>
                      <button className="rounded-full bg-[#146c5a] px-4 py-2.5 text-sm font-semibold text-white disabled:bg-[#b9c9c3]" disabled={didActivityTakePlace === "no"} type="submit">
                        Submit simulated feedback
                      </button>
                      {didActivityTakePlace === "no" && <p className="text-sm text-[#805f20]">Feedback is only recorded here when the mock activity took place. You can still report or block this profile below.</p>}
                    </form>
                  )}
                </section>
              )}

              <section className="mt-5 border-t border-[#e4e9e6] pt-5">
                {reportedProfileIds.includes(selectedProfile.id) ? (
                  confirmBlockProfileId === selectedProfile.id ? (
                    <div className="rounded-2xl bg-[#f4f7f5] p-4">
                      <p className="text-sm leading-6">Block {selectedProfile.name}? Their mock activities will disappear from this browser&apos;s discovery results.</p>
                      <div className="mt-3 flex gap-3">
                        <button className="rounded-full bg-[#23433b] px-4 py-2.5 text-sm font-semibold text-white" onClick={() => { setBlockedProfileIds((current) => [...current, selectedProfile.id]); setView(detailOrigin); }} type="button">Confirm block</button>
                        <button className="text-sm font-semibold text-[#596a64]" onClick={() => setConfirmBlockProfileId(null)} type="button">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-[#17614f]">{reports.filter((report) => report.profileId === selectedProfile.id).length} local report saved. No moderation team, police, or emergency service was notified.</p>
                      <button className="mt-3 text-sm font-semibold text-[#805f20] underline underline-offset-4" onClick={() => setConfirmBlockProfileId(selectedProfile.id)} type="button">Block user</button>
                    </div>
                  )
                ) : reportProfileId === selectedProfile.id ? (
                  <form
                    className="space-y-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      setReports((current) => [...current, { profileId: selectedProfile.id, reason: reportReason, note: reportNote }]);
                      setReportedProfileIds((current) => [...current, selectedProfile.id]);
                      setReportProfileId(null);
                      setReportNote("");
                    }}
                  >
                    <label className="block text-sm font-medium">
                      Report reason
                      <select className="mt-2 block w-full rounded-2xl border border-[#c9d5d0] px-4 py-3" onChange={(event) => setReportReason(event.target.value)} value={reportReason}>
                        <option>Harassment</option>
                        <option>Inappropriate behaviour</option>
                        <option>Fake profile</option>
                        <option>Unsafe conduct</option>
                        <option>Other</option>
                      </select>
                    </label>
                    <label className="block text-sm font-medium">
                      Optional explanation
                      <textarea className="mt-2 block w-full rounded-2xl border border-[#c9d5d0] px-4 py-3" onChange={(event) => setReportNote(event.target.value)} value={reportNote} />
                    </label>
                    <div className="flex gap-3">
                      <button className="rounded-full bg-[#146c5a] px-4 py-2.5 text-sm font-semibold text-white" type="submit">Submit local report</button>
                      <button className="text-sm font-semibold text-[#596a64]" onClick={() => setReportProfileId(null)} type="button">Cancel</button>
                    </div>
                  </form>
                ) : confirmBlockProfileId === selectedProfile.id ? (
                  <div className="rounded-2xl bg-[#f4f7f5] p-4">
                    <p className="text-sm leading-6">Block {selectedProfile.name}? Their mock activities will disappear from this browser&apos;s discovery results.</p>
                    <div className="mt-3 flex gap-3">
                      <button className="rounded-full bg-[#23433b] px-4 py-2.5 text-sm font-semibold text-white" onClick={() => { setBlockedProfileIds((current) => [...current, selectedProfile.id]); setView(detailOrigin); }} type="button">Confirm block</button>
                      <button className="text-sm font-semibold text-[#596a64]" onClick={() => setConfirmBlockProfileId(null)} type="button">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    <button className="text-sm font-semibold text-[#805f20] underline underline-offset-4" onClick={() => setReportProfileId(selectedProfile.id)} type="button">Report user</button>
                    <button className="text-sm font-semibold text-[#805f20] underline underline-offset-4" onClick={() => setConfirmBlockProfileId(selectedProfile.id)} type="button">Block user</button>
                  </div>
                )}
                <p className="mt-3 text-xs leading-5 text-[#71807b]">Report and block actions are local prototype controls only and do not notify anyone.</p>
              </section>

              {requestedItem === selectedItem.id ? (
                <div aria-live="polite" className="mt-6 rounded-3xl bg-[#e4f3ed] p-5">
                  <p className="font-semibold">Request recorded for this prototype.</p>
                  <p className="mt-2 leading-7 text-[#47635b]">
                    No request or message was sent to a real person.
                  </p>
                </div>
              ) : (
                <button
                  className="mt-8 w-full rounded-2xl bg-[#146c5a] px-5 py-4 text-base font-semibold text-white shadow-[0_10px_24px_rgba(20,108,90,0.24)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#146c5a]"
                  onClick={() => setRequestedItem(selectedItem.id)}
                  type="button"
                >
                  Request to join
                </button>
              )}
            </article>
          </>
        )}
      </section>
    </main>
  );
}
