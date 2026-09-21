import React, { createContext, useContext, useState, useEffect } from "react";
import {
  type Activity,
  type Volunteer,
  type ActivityRegistration,
  type ActivityDiaryEntry,
  type PortalNotification,
  activities as initialActivities,
  initialVolunteers,
  initialRegistrations,
  initialDiaryEntries,
  initialNotifications,
  news as initialNews,
  gallery as initialGallery,
  team as initialTeam,
  achievements as initialAchievements,
} from "../data/site";

export type { Activity, Volunteer, ActivityRegistration, ActivityDiaryEntry, PortalNotification };

export interface NewsItem {
  id: number;
  title: string;
  date: string;
  category: string;
  text: string;
}

export interface GalleryItem {
  src: string;
  caption: string;
}

export interface TeamMember {
  name: string;
  role: string;
  department: string;
  image: string;
}

export interface AchievementItem {
  year: string;
  title: string;
  text: string;
}

export interface SiteStats {
  volunteers: string;
  activities: string;
  hours: string;
  recognitions: string;
}

export interface SiteInfo {
  heroTagline: string;
  heroSubtitle: string;
  stats: SiteStats;
  programmeOfficer: string;
  phone: string;
  email: string;
  collegeName: string;
  address: string;
}

const initialSiteInfo: SiteInfo = {
  heroTagline: "Not Me,\nBut You.",
  heroSubtitle:
    "Empowering students through community service, social responsibility and meaningful action.",
  stats: {
    volunteers: "250+",
    activities: "35+",
    hours: "1,250+",
    recognitions: "15+",
  },
  programmeOfficer: "Dr. Rajesh Kumar",
  phone: "+91 98765 43210",
  email: "nss@college.edu.in",
  collegeName: "NSS College of Engineering",
  address: "NSS Units 128 & 198, NSS College of Engineering, Akathethara, Palakkad, Kerala, India",
};

interface SiteContextType {
  // Existing data
  activities: Activity[];
  news: NewsItem[];
  gallery: GalleryItem[];
  team: TeamMember[];
  achievements: AchievementItem[];
  siteInfo: SiteInfo;
  isAuthenticated: boolean;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;

  // Volunteer state & actions
  volunteers: Volunteer[];
  currentVolunteer: Volunteer | null;
  loginVolunteer: (identifier: string) => boolean;
  logoutVolunteer: () => void;
  switchVolunteer: (volunteerId: string) => void;
  registerVolunteer: (data: Omit<Volunteer, "id" | "campusHours" | "communityHours" | "totalHours">) => Volunteer;
  updateVolunteerProfile: (id: string, updates: Partial<Volunteer>) => void;
  adjustVolunteerHours: (volunteerId: string, campusDelta: number, communityDelta: number, reason?: string) => void;

  // Activity Registrations & Selection Engine
  registrations: ActivityRegistration[];
  registerForActivity: (activityId: number, volunteerId: string) => { success: boolean; message: string };
  cancelRegistration: (registrationId: string) => void;
  runSelectionAlgorithm: (activityId: number) => { selectedCount: number; waitlistedCount: number };
  updateRegistrationStatus: (registrationId: string, status: ActivityRegistration["status"], reason?: string) => void;
  markActivityAttendance: (activityId: number, attendedVolunteerIds: string[]) => void;

  // Diary Entries & Feedback
  diaryEntries: ActivityDiaryEntry[];
  submitDiaryEntry: (entry: Omit<ActivityDiaryEntry, "id" | "verifiedByAdmin">) => void;
  verifyDiaryEntry: (entryId: string, remarks?: string) => void;

  // Notifications & Reminders
  notifications: PortalNotification[];
  sendNotification: (notif: Omit<PortalNotification, "id" | "createdAt" | "read">) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: (volunteerId: string) => void;
  deleteNotification: (id: string) => void;

  // Activities CRUD
  addActivity: (activity: Omit<Activity, "id">) => void;
  updateActivity: (id: number, activity: Partial<Activity>) => void;
  deleteActivity: (id: number) => void;

  // News CRUD
  addNews: (newsItem: Omit<NewsItem, "id">) => void;
  updateNews: (id: number, newsItem: Partial<NewsItem>) => void;
  deleteNews: (id: number) => void;

  // Gallery CRUD
  addGalleryItem: (item: GalleryItem) => void;
  deleteGalleryItem: (index: number) => void;

  // Team CRUD
  addTeamMember: (member: TeamMember) => void;
  updateTeamMember: (index: number, member: TeamMember) => void;
  deleteTeamMember: (index: number) => void;

  // Achievements CRUD
  addAchievement: (achievement: AchievementItem) => void;
  updateAchievement: (index: number, achievement: AchievementItem) => void;
  deleteAchievement: (index: number) => void;

  // Site Info
  updateSiteInfo: (info: Partial<SiteInfo>) => void;

  // Reset
  resetToDefaults: () => void;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

const STORAGE_KEY = "nss_portal_site_data_v3";
const AUTH_KEY = "nss_portal_admin_auth";
const VOLUNTEER_AUTH_KEY = "nss_portal_volunteer_auth";
const ADMIN_PASS = "nss2026";

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + "_activities");
    return saved ? JSON.parse(saved) : initialActivities;
  });

  const [volunteers, setVolunteers] = useState<Volunteer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + "_volunteers");
    return saved ? JSON.parse(saved) : initialVolunteers;
  });

  const [registrations, setRegistrations] = useState<ActivityRegistration[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + "_registrations");
    return saved ? JSON.parse(saved) : initialRegistrations;
  });

  const [diaryEntries, setDiaryEntries] = useState<ActivityDiaryEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + "_diary");
    return saved ? JSON.parse(saved) : initialDiaryEntries;
  });

  const [notifications, setNotifications] = useState<PortalNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + "_notifications");
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [currentVolunteerId, setCurrentVolunteerId] = useState<string | null>(() => {
    return localStorage.getItem(VOLUNTEER_AUTH_KEY) || "VOL-101"; // Default to Rahul Sharma for instant review
  });

  const [news, setNews] = useState<NewsItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + "_news");
    return saved ? JSON.parse(saved) : initialNews;
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + "_gallery");
    return saved ? JSON.parse(saved) : initialGallery;
  });

  const [team, setTeam] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + "_team");
    return saved ? JSON.parse(saved) : initialTeam;
  });

  const [achievements, setAchievements] = useState<AchievementItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + "_achievements");
    return saved ? JSON.parse(saved) : initialAchievements;
  });

  const [siteInfo, setSiteInfo] = useState<SiteInfo>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + "_info");
    return saved ? JSON.parse(saved) : initialSiteInfo;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(AUTH_KEY) === "true";
  });

  // Current volunteer object
  const currentVolunteer = volunteers.find((v) => v.id === currentVolunteerId) || null;

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + "_activities", JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + "_volunteers", JSON.stringify(volunteers));
  }, [volunteers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + "_registrations", JSON.stringify(registrations));
  }, [registrations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + "_diary", JSON.stringify(diaryEntries));
  }, [diaryEntries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + "_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (currentVolunteerId) {
      localStorage.setItem(VOLUNTEER_AUTH_KEY, currentVolunteerId);
    } else {
      localStorage.removeItem(VOLUNTEER_AUTH_KEY);
    }
  }, [currentVolunteerId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + "_news", JSON.stringify(news));
  }, [news]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + "_gallery", JSON.stringify(gallery));
  }, [gallery]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + "_team", JSON.stringify(team));
  }, [team]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + "_achievements", JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + "_info", JSON.stringify(siteInfo));
  }, [siteInfo]);

  // Admin Auth functions
  const loginAdmin = (password: string) => {
    if (password === ADMIN_PASS || password === "admin123") {
      setIsAuthenticated(true);
      sessionStorage.setItem(AUTH_KEY, "true");
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_KEY);
  };

  // Volunteer Auth & Switcher
  const loginVolunteer = (identifier: string) => {
    const trimmed = identifier.trim().toLowerCase();
    const found = volunteers.find(
      (v) =>
        v.id.toLowerCase() === trimmed ||
        v.email.toLowerCase() === trimmed ||
        v.rollNumber.toLowerCase() === trimmed
    );
    if (found) {
      setCurrentVolunteerId(found.id);
      return true;
    }
    return false;
  };

  const logoutVolunteer = () => {
    setCurrentVolunteerId(null);
  };

  const switchVolunteer = (volunteerId: string) => {
    const exists = volunteers.find((v) => v.id === volunteerId);
    if (exists) {
      setCurrentVolunteerId(volunteerId);
    }
  };

  const registerVolunteer = (data: Omit<Volunteer, "id" | "campusHours" | "communityHours" | "totalHours">): Volunteer => {
    const num = volunteers.length + 1;
    const newId = `VOL-${100 + num}`;
    const newVolunteer: Volunteer = {
      ...data,
      id: newId,
      campusHours: 0,
      communityHours: 0,
      totalHours: 0,
      status: "Active",
    };
    setVolunteers((prev) => [...prev, newVolunteer]);
    setCurrentVolunteerId(newId);
    return newVolunteer;
  };

  const updateVolunteerProfile = (id: string, updates: Partial<Volunteer>) => {
    setVolunteers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
  };

  // Admin hours adjustment (strictly for Admin use)
  const adjustVolunteerHours = (volunteerId: string, campusDelta: number, communityDelta: number, reason?: string) => {
    setVolunteers((prev) =>
      prev.map((v) => {
        if (v.id !== volunteerId) return v;
        const newCampus = Math.max(0, (v.campusHours || 0) + campusDelta);
        const newCommunity = Math.max(0, (v.communityHours || 0) + communityDelta);
        return {
          ...v,
          campusHours: newCampus,
          communityHours: newCommunity,
          totalHours: newCampus + newCommunity,
        };
      })
    );

    if (reason) {
      sendNotification({
        volunteerId,
        title: "Service Hours Credited",
        message: `Admin adjusted your NSS record: ${reason}`,
        type: "announcement",
      });
    }
  };

  // ───────── Selection Engine & Registrations ─────────
  const registerForActivity = (activityId: number, volunteerId: string): { success: boolean; message: string } => {
    const activity = activities.find((a) => a.id === activityId);
    const volunteer = volunteers.find((v) => v.id === volunteerId);

    if (!activity) return { success: false, message: "Activity not found." };
    if (!volunteer) return { success: false, message: "Volunteer not found. Please log in." };

    // Check if registration open time has arrived
    const now = new Date();
    const startsAt = new Date(activity.registrationStartsAt);
    if (now < startsAt) {
      return {
        success: false,
        message: `Registration has not opened yet. It unlocks on ${startsAt.toLocaleString()}.`,
      };
    }

    // Check if already registered
    const existing = registrations.find(
      (r) => r.activityId === activityId && r.volunteerId === volunteerId
    );
    if (existing) {
      return { success: false, message: `You are already registered for this activity (Status: ${existing.status}).` };
    }

    // Determine current registrations for this activity
    const activityRegs = registrations.filter((r) => r.activityId === activityId);
    const newRegId = `REG-${activityId}-${Date.now()}`;

    // Apply selection mode logic immediately upon registering
    let status: ActivityRegistration["status"] = "Pending";
    let selectionReason = "";

    if (activity.selectionMode === "FCFS") {
      // First Come First Serve
      const currentlySelected = activityRegs.filter((r) => r.status === "Selected").length;
      if (currentlySelected < activity.maxVolunteers) {
        status = "Selected";
        selectionReason = `FCFS order #${currentlySelected + 1}`;
      } else {
        status = "Waitlisted";
        selectionReason = `Capacity of ${activity.maxVolunteers} reached; waitlisted`;
      }
    } else {
      // Lowest Hours Priority across Category (Campus vs Community)
      // Activity scope decides which hours are checked:
      const category = activity.scope; // "Campus" or "Community"
      const volCategoryHours = category === "Campus" ? (volunteer.campusHours || 0) : (volunteer.communityHours || 0);

      // We add this registration as pending and trigger re-ranking
      status = "Pending";
      selectionReason = `Registered for priority ranking (Volunteer has ${volCategoryHours} ${category} hrs)`;
    }

    const newReg: ActivityRegistration = {
      id: newRegId,
      activityId,
      volunteerId,
      volunteerName: volunteer.name,
      volunteerRoll: volunteer.rollNumber,
      registeredAt: new Date().toISOString(),
      status,
      selectionReason,
    };

    const updatedRegs = [...registrations, newReg];
    setRegistrations(updatedRegs);

    // If lowest hours mode, auto-calculate selections across all applicants
    if (activity.selectionMode === "LowestHours") {
      setTimeout(() => {
        runSelectionAlgorithm(activityId);
      }, 50);
    }

    // Send confirmation notification
    sendNotification({
      volunteerId,
      title: "Registration Received",
      message: `You registered for "${activity.title}". ${status === "Selected" ? "You have been selected!" : "Selection ranking is in progress."}`,
      type: "selection",
      activityId,
    });

    return {
      success: true,
      message: status === "Selected" ? "Registration confirmed! You are selected." : "Registration submitted! Processing selection.",
    };
  };

  const cancelRegistration = (registrationId: string) => {
    const reg = registrations.find((r) => r.id === registrationId);
    if (!reg) return;
    const actId = reg.activityId;
    setRegistrations((prev) => prev.filter((r) => r.id !== registrationId));

    // Re-run selection for the activity so waitlisted candidate can get selected
    setTimeout(() => {
      runSelectionAlgorithm(actId);
    }, 50);
  };

  // Run selection algorithm for an activity (Admin callable or auto-triggered)
  const runSelectionAlgorithm = (activityId: number) => {
    const activity = activities.find((a) => a.id === activityId);
    if (!activity) return { selectedCount: 0, waitlistedCount: 0 };

    const max = activity.maxVolunteers;
    const mode = activity.selectionMode;
    const scope = activity.scope || "Campus";

    // Filter registrations for this activity (excluding already attended)
    const actRegs = registrations.filter((r) => r.activityId === activityId && r.status !== "Attended");
    if (actRegs.length === 0) return { selectedCount: 0, waitlistedCount: 0 };

    // Sort according to mode
    const sorted = [...actRegs].sort((a, b) => {
      if (mode === "FCFS") {
        // Earliest registeredAt first
        return new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime();
      } else {
        // Lowest hours in this activity's scope (Campus vs Community)
        const volA = volunteers.find((v) => v.id === a.volunteerId);
        const volB = volunteers.find((v) => v.id === b.volunteerId);
        const hoursA = scope === "Campus" ? (volA?.campusHours ?? 0) : (volA?.communityHours ?? 0);
        const hoursB = scope === "Campus" ? (volB?.campusHours ?? 0) : (volB?.communityHours ?? 0);

        if (hoursA !== hoursB) {
          return hoursA - hoursB; // Lowest hours first!
        }
        // Tie-breaker: earlier registration time
        return new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime();
      }
    });

    const updatedIds = new Map<string, { status: ActivityRegistration["status"]; reason: string }>();

    sorted.forEach((reg, index) => {
      const vol = volunteers.find((v) => v.id === reg.volunteerId);
      const categoryHours = scope === "Campus" ? (vol?.campusHours ?? 0) : (vol?.communityHours ?? 0);

      if (index < max) {
        const reason = mode === "LowestHours"
          ? `Selected: Lowest ${scope} hours (${categoryHours} hrs, rank #${index + 1})`
          : `Selected: FCFS order #${index + 1}`;
        updatedIds.set(reg.id, { status: "Selected", reason });
      } else {
        const reason = mode === "LowestHours"
          ? `Waitlisted: Higher ${scope} hours (${categoryHours} hrs, rank #${index + 1})`
          : `Waitlisted: Exceeded capacity (${index + 1} of ${max})`;
        updatedIds.set(reg.id, { status: "Waitlisted", reason });
      }
    });

    let selectedCount = 0;
    let waitlistedCount = 0;

    setRegistrations((prev) =>
      prev.map((r) => {
        if (updatedIds.has(r.id)) {
          const update = updatedIds.get(r.id)!;
          if (update.status === "Selected") selectedCount++;
          if (update.status === "Waitlisted") waitlistedCount++;
          return { ...r, status: update.status, selectionReason: update.reason };
        }
        return r;
      })
    );

    return { selectedCount, waitlistedCount };
  };

  const updateRegistrationStatus = (
    registrationId: string,
    status: ActivityRegistration["status"],
    reason?: string
  ) => {
    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === registrationId
          ? { ...r, status, selectionReason: reason || r.selectionReason }
          : r
      )
    );
  };

  // Mark attendance for an activity & auto-credit category hours to volunteers
  const markActivityAttendance = (activityId: number, attendedVolunteerIds: string[]) => {
    const activity = activities.find((a) => a.id === activityId);
    if (!activity) return;

    // Mark activity as completed and attendanceMarked = true
    setActivities((prev) =>
      prev.map((a) => (a.id === activityId ? { ...a, status: "Completed", attendanceMarked: true } : a))
    );

    // Update registrations
    setRegistrations((prev) =>
      prev.map((r) => {
        if (r.activityId === activityId) {
          if (attendedVolunteerIds.includes(r.volunteerId)) {
            return { ...r, status: "Attended", selectionReason: "Attendance confirmed by Officer" };
          }
        }
        return r;
      })
    );

    // Credit hours to volunteers (Admin ledger updated!)
    const hoursToCredit = activity.hours || 4;
    const scope = activity.scope;

    setVolunteers((prev) =>
      prev.map((v) => {
        if (attendedVolunteerIds.includes(v.id)) {
          const campusAdd = scope === "Campus" ? hoursToCredit : 0;
          const commAdd = scope === "Community" ? hoursToCredit : 0;
          const newCampus = (v.campusHours || 0) + campusAdd;
          const newComm = (v.communityHours || 0) + commAdd;
          return {
            ...v,
            campusHours: newCampus,
            communityHours: newComm,
            totalHours: newCampus + newComm,
          };
        }
        return v;
      })
    );

    // Dispatch diary prompt notification to all attended volunteers
    attendedVolunteerIds.forEach((vId) => {
      sendNotification({
        volunteerId: vId,
        title: "Activity Completed - Diary Entry Required",
        message: `You completed "${activity.title}". Please submit your diary entry and feedback to record your experience.`,
        type: "diary_prompt",
        activityId,
        link: "/volunteer?tab=diary",
      });
    });
  };

  // ───────── Diary Entries & Feedback ─────────
  const submitDiaryEntry = (entry: Omit<ActivityDiaryEntry, "id" | "verifiedByAdmin">) => {
    const newId = `DIR-${Date.now()}`;
    const newEntry: ActivityDiaryEntry = {
      ...entry,
      id: newId,
      verifiedByAdmin: false,
    };
    setDiaryEntries((prev) => [newEntry, ...prev]);

    // Send acknowledgment notification
    sendNotification({
      volunteerId: entry.volunteerId,
      title: "Diary Entry Submitted",
      message: `Your reflection for "${entry.activityTitle}" has been received and queued for Programme Officer review.`,
      type: "announcement",
      activityId: entry.activityId,
    });
  };

  const verifyDiaryEntry = (entryId: string, remarks?: string) => {
    setDiaryEntries((prev) =>
      prev.map((d) => (d.id === entryId ? { ...d, verifiedByAdmin: true, adminRemarks: remarks } : d))
    );
  };

  // ───────── Notifications ─────────
  const sendNotification = (notif: Omit<PortalNotification, "id" | "createdAt" | "read">) => {
    const newNotif: PortalNotification = {
      ...notif,
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = (volunteerId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.volunteerId === volunteerId || n.volunteerId === "all" ? { ...n, read: true } : n
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // ───────── Activities CRUD ─────────
  const addActivity = (activity: Omit<Activity, "id">) => {
    const newId = activities.length > 0 ? Math.max(...activities.map((a) => a.id)) + 1 : 1;
    const newAct: Activity = {
      ...activity,
      id: newId,
      scope: activity.scope || "Campus",
      maxVolunteers: activity.maxVolunteers || 4,
      selectionMode: activity.selectionMode || "LowestHours",
      publishedAt: activity.publishedAt || new Date().toISOString(),
      registrationStartsAt: activity.registrationStartsAt || new Date().toISOString(),
      isoDate: activity.isoDate || new Date().toISOString().split("T")[0],
    };
    setActivities([newAct, ...activities]);

    // Send broadcast notification about new activity
    sendNotification({
      volunteerId: "all",
      title: "New NSS Activity Published",
      message: `"${newAct.title}" has been published. Registration opens on ${new Date(newAct.registrationStartsAt).toLocaleString()}.`,
      type: "registration_open",
      activityId: newId,
    });
  };

  const updateActivity = (id: number, updated: Partial<Activity>) => {
    setActivities(activities.map((a) => (a.id === id ? { ...a, ...updated } : a)));
  };

  const deleteActivity = (id: number) => {
    setActivities(activities.filter((a) => a.id !== id));
    setRegistrations(registrations.filter((r) => r.activityId !== id));
  };

  // ───────── News CRUD ─────────
  const addNews = (item: Omit<NewsItem, "id">) => {
    const newId = news.length > 0 ? Math.max(...news.map((n) => n.id)) + 1 : 1;
    setNews([{ ...item, id: newId }, ...news]);
  };

  const updateNews = (id: number, updated: Partial<NewsItem>) => {
    setNews(news.map((n) => (n.id === id ? { ...n, ...updated } : n)));
  };

  const deleteNews = (id: number) => {
    setNews(news.filter((n) => n.id !== id));
  };

  // ───────── Gallery CRUD ─────────
  const addGalleryItem = (item: GalleryItem) => {
    setGallery([item, ...gallery]);
  };

  const deleteGalleryItem = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index));
  };

  // ───────── Team CRUD ─────────
  const addTeamMember = (member: TeamMember) => {
    setTeam([...team, member]);
  };

  const updateTeamMember = (index: number, member: TeamMember) => {
    const updated = [...team];
    updated[index] = member;
    setTeam(updated);
  };

  const deleteTeamMember = (index: number) => {
    setTeam(team.filter((_, i) => i !== index));
  };

  // ───────── Achievements CRUD ─────────
  const addAchievement = (achievement: AchievementItem) => {
    setAchievements([achievement, ...achievements]);
  };

  const updateAchievement = (index: number, achievement: AchievementItem) => {
    const updated = [...achievements];
    updated[index] = achievement;
    setAchievements(updated);
  };

  const deleteAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  // ───────── Site Info ─────────
  const updateSiteInfo = (info: Partial<SiteInfo>) => {
    setSiteInfo((prev) => ({ ...prev, ...info }));
  };

  // ───────── Reset ─────────
  const resetToDefaults = () => {
    setActivities(initialActivities);
    setVolunteers(initialVolunteers);
    setRegistrations(initialRegistrations);
    setDiaryEntries(initialDiaryEntries);
    setNotifications(initialNotifications);
    setNews(initialNews);
    setGallery(initialGallery);
    setTeam(initialTeam);
    setAchievements(initialAchievements);
    setSiteInfo(initialSiteInfo);
    setCurrentVolunteerId("VOL-101");
    localStorage.removeItem(STORAGE_KEY + "_activities");
    localStorage.removeItem(STORAGE_KEY + "_volunteers");
    localStorage.removeItem(STORAGE_KEY + "_registrations");
    localStorage.removeItem(STORAGE_KEY + "_diary");
    localStorage.removeItem(STORAGE_KEY + "_notifications");
    localStorage.removeItem(STORAGE_KEY + "_news");
    localStorage.removeItem(STORAGE_KEY + "_gallery");
    localStorage.removeItem(STORAGE_KEY + "_team");
    localStorage.removeItem(STORAGE_KEY + "_achievements");
    localStorage.removeItem(STORAGE_KEY + "_info");
    localStorage.removeItem(VOLUNTEER_AUTH_KEY);
  };

  return (
    <SiteContext.Provider
      value={{
        activities,
        news,
        gallery,
        team,
        achievements,
        siteInfo,
        isAuthenticated,
        loginAdmin,
        logoutAdmin,

        // Volunteers
        volunteers,
        currentVolunteer,
        loginVolunteer,
        logoutVolunteer,
        switchVolunteer,
        registerVolunteer,
        updateVolunteerProfile,
        adjustVolunteerHours,

        // Registrations & Selection
        registrations,
        registerForActivity,
        cancelRegistration,
        runSelectionAlgorithm,
        updateRegistrationStatus,
        markActivityAttendance,

        // Diary
        diaryEntries,
        submitDiaryEntry,
        verifyDiaryEntry,

        // Notifications
        notifications,
        sendNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,

        // Activities CRUD
        addActivity,
        updateActivity,
        deleteActivity,

        // News CRUD
        addNews,
        updateNews,
        deleteNews,

        // Gallery CRUD
        addGalleryItem,
        deleteGalleryItem,

        // Team CRUD
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,

        // Achievements CRUD
        addAchievement,
        updateAchievement,
        deleteAchievement,

        // Site Info
        updateSiteInfo,
        resetToDefaults,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export const useSiteData = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error("useSiteData must be used within a SiteProvider");
  }
  return context;
};
