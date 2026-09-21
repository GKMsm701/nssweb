export type ActivityScope = "Campus" | "Community";
export type SelectionMode = "FCFS" | "LowestHours";

export interface Activity {
  id: number;
  title: string;
  date: string; // ISO date "YYYY-MM-DD" or formatted "DD MMM YYYY"
  isoDate: string; // "YYYY-MM-DD" for calendar mapping
  time?: string;
  location: string;
  category: string;
  scope: ActivityScope; // Campus or Community
  description: string;
  hours: number; // ONLY VISIBLE TO ADMIN! Strictly hidden from volunteers.
  image: string;
  status: "Upcoming" | "Completed" | "Cancelled";
  maxVolunteers: number;
  selectionMode: SelectionMode; // "FCFS" or "LowestHours"
  publishedAt: string; // ISO string
  registrationStartsAt: string; // ISO string: registration unlocks at this timestamp
  attendanceMarked?: boolean;
}

export interface Volunteer {
  id: string; // "VOL-101"
  name: string;
  email: string;
  phone: string;
  rollNumber: string;
  department: string;
  year: string; // "1st Year", "2nd Year", "3rd Year", "4th Year"
  unit: string; // "Unit 128" | "Unit 198"
  avatar: string;
  bloodGroup: string;
  joinedDate: string;
  password?: string;
  status: "Active" | "Inactive";
  // Accumulated Activity Hours (CONFIDENTIAL: ONLY ADMIN CAN VIEW!)
  campusHours: number;
  communityHours: number;
  totalHours: number;
}

export interface ActivityRegistration {
  id: string;
  activityId: number;
  volunteerId: string;
  volunteerName: string;
  volunteerRoll: string;
  registeredAt: string; // ISO string
  status: "Selected" | "Waitlisted" | "Pending" | "Attended";
  selectionReason?: string;
}

export interface ActivityDiaryEntry {
  id: string;
  activityId: number;
  activityTitle: string;
  volunteerId: string;
  volunteerName: string;
  date: string; // Date of entry
  tasksDone: string;
  learnings: string;
  rating: number; // 1 to 5
  photoUrl?: string;
  verifiedByAdmin: boolean;
  adminRemarks?: string;
}

export interface PortalNotification {
  id: string;
  volunteerId: string | "all"; // "all" or specific volunteer
  title: string;
  message: string;
  type: "registration_open" | "selection" | "reminder" | "diary_prompt" | "announcement";
  createdAt: string;
  read: boolean;
  activityId?: number;
  link?: string;
}

// Initial demo activities
export const activities: Activity[] = [
  {
    id: 1,
    title: "Mega Blood Donation Camp",
    date: "25 Sep 2026",
    isoDate: "2026-09-25",
    time: "09:00 AM - 02:00 PM",
    location: "College Auditorium",
    category: "Health",
    scope: "Campus",
    description: "Annual university-wide blood donation drive organized in partnership with District General Hospital Blood Bank.",
    hours: 6, // Admin only
    image: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1200&q=85",
    status: "Upcoming",
    maxVolunteers: 3,
    selectionMode: "LowestHours", // Priority to lowest Campus hours!
    publishedAt: "2026-09-18T10:00:00Z",
    registrationStartsAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(), // Already open!
    attendanceMarked: false,
  },
  {
    id: 2,
    title: "Rural Water Conservation Survey",
    date: "28 Sep 2026",
    isoDate: "2026-09-28",
    time: "08:30 AM - 01:30 PM",
    location: "Akathethara Gram Panchayat",
    category: "Environment",
    scope: "Community",
    description: "Field survey on domestic water usage, rainwater harvesting adoption, and well-water contamination testing.",
    hours: 5, // Admin only
    image: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1200&q=85",
    status: "Upcoming",
    maxVolunteers: 2,
    selectionMode: "LowestHours", // Priority to lowest Community hours!
    publishedAt: "2026-09-20T08:00:00Z",
    registrationStartsAt: new Date(Date.now() + 3600 * 1000 * 6).toISOString(), // Delayed: opens in 6 hours!
    attendanceMarked: false,
  },
  {
    id: 3,
    title: "Digital Literacy Workshop for Seniors",
    date: "02 Oct 2026",
    isoDate: "2026-10-02",
    time: "10:00 AM - 01:00 PM",
    location: "Community Center Hall",
    category: "Community",
    scope: "Community",
    description: "Hands-on smartphone literacy, cyber safety, and digital banking guidance for elderly community residents.",
    hours: 4, // Admin only
    image: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1200&q=85",
    status: "Upcoming",
    maxVolunteers: 4,
    selectionMode: "FCFS", // First-Come-First-Serve mode
    publishedAt: "2026-09-19T09:00:00Z",
    registrationStartsAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(), // Open now!
    attendanceMarked: false,
  },
  {
    id: 4,
    title: "Campus Cleanliness & Plastic Segregation Drive",
    date: "10 Sep 2026",
    isoDate: "2026-09-10",
    time: "03:00 PM - 06:00 PM",
    location: "Main Engineering Block",
    category: "Environment",
    scope: "Campus",
    description: "Comprehensive campus plastic waste collection and setting up color-coded segregation bins.",
    hours: 4, // Admin only
    image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1200&q=85",
    status: "Completed",
    maxVolunteers: 5,
    selectionMode: "FCFS",
    publishedAt: "2026-09-01T09:00:00Z",
    registrationStartsAt: "2026-09-02T09:00:00Z",
    attendanceMarked: true,
  },
  {
    id: 5,
    title: "National Road Safety Awareness Rally",
    date: "15 Sep 2026",
    isoDate: "2026-09-15",
    time: "08:00 AM - 11:30 AM",
    location: "City Junction to College Gate",
    category: "Awareness",
    scope: "Community",
    description: "Public rally with placards and helmet safety street plays conducted alongside local traffic police.",
    hours: 4, // Admin only
    image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=85",
    status: "Completed",
    maxVolunteers: 4,
    selectionMode: "LowestHours",
    publishedAt: "2026-09-05T09:00:00Z",
    registrationStartsAt: "2026-09-06T09:00:00Z",
    attendanceMarked: true,
  }
];

// Initial pre-seeded volunteers with differing category hours for testing selection algorithm
export const initialVolunteers: Volunteer[] = [
  {
    id: "VOL-101",
    name: "Rahul Sharma",
    email: "rahul.sharma@college.edu.in",
    phone: "+91 98765 12345",
    rollNumber: "23CS1042",
    department: "Computer Science & Engineering",
    year: "2nd Year",
    unit: "Unit 128",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    bloodGroup: "O+",
    joinedDate: "15 Aug 2024",
    status: "Active",
    // rahul has HIGH campus hours (18) and LOW community hours (4)
    campusHours: 18,
    communityHours: 4,
    totalHours: 22,
  },
  {
    id: "VOL-102",
    name: "Sneha Patel",
    email: "sneha.patel@college.edu.in",
    phone: "+91 98765 54321",
    rollNumber: "22EC2015",
    department: "Electronics & Communication",
    year: "3rd Year",
    unit: "Unit 198",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    bloodGroup: "B+",
    joinedDate: "10 Aug 2023",
    status: "Active",
    // sneha has LOW campus hours (2) and HIGH community hours (24)
    campusHours: 2,
    communityHours: 24,
    totalHours: 26,
  },
  {
    id: "VOL-103",
    name: "Amit Kumar",
    email: "amit.kumar@college.edu.in",
    phone: "+91 98765 99887",
    rollNumber: "23ME3008",
    department: "Mechanical Engineering",
    year: "2nd Year",
    unit: "Unit 128",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80",
    bloodGroup: "A+",
    joinedDate: "15 Aug 2024",
    status: "Active",
    // amit has balanced hours (10 campus, 12 community)
    campusHours: 10,
    communityHours: 12,
    totalHours: 22,
  },
  {
    id: "VOL-104",
    name: "Priya Menon",
    email: "priya.menon@college.edu.in",
    phone: "+91 98765 33221",
    rollNumber: "24CE4012",
    department: "Civil Engineering",
    year: "1st Year",
    unit: "Unit 198",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
    bloodGroup: "AB+",
    joinedDate: "01 Sep 2025",
    status: "Active",
    // priya is new with 0 campus hours and 4 community hours
    campusHours: 0,
    communityHours: 4,
    totalHours: 4,
  },
  {
    id: "VOL-105",
    name: "Vikram Verma",
    email: "vikram.verma@college.edu.in",
    phone: "+91 98765 77665",
    rollNumber: "22EE1055",
    department: "Electrical Engineering",
    year: "3rd Year",
    unit: "Unit 128",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    bloodGroup: "O-",
    joinedDate: "10 Aug 2023",
    status: "Active",
    // vikram has high hours in both (28 campus, 32 community)
    campusHours: 28,
    communityHours: 32,
    totalHours: 60,
  },
];

// Initial registrations
export const initialRegistrations: ActivityRegistration[] = [
  // Registrations for Activity 1 (Mega Blood Donation Camp - scope: Campus, selection: LowestHours, max: 3)
  {
    id: "REG-101-1",
    activityId: 1,
    volunteerId: "VOL-101", // Rahul (Campus: 18)
    volunteerName: "Rahul Sharma",
    volunteerRoll: "23CS1042",
    registeredAt: "2026-09-18T10:30:00Z",
    status: "Waitlisted",
    selectionReason: "Rank #3 (Campus hours: 18 hrs)",
  },
  {
    id: "REG-101-2",
    activityId: 1,
    volunteerId: "VOL-102", // Sneha (Campus: 2) -> SELECTED due to lowest campus hours!
    volunteerName: "Sneha Patel",
    volunteerRoll: "22EC2015",
    registeredAt: "2026-09-18T11:15:00Z",
    status: "Selected",
    selectionReason: "Rank #2 (Lowest Campus hours: 2 hrs)",
  },
  {
    id: "REG-101-4",
    activityId: 1,
    volunteerId: "VOL-104", // Priya (Campus: 0) -> SELECTED due to 0 campus hours!
    volunteerName: "Priya Menon",
    volunteerRoll: "24CE4012",
    registeredAt: "2026-09-18T12:00:00Z",
    status: "Selected",
    selectionReason: "Rank #1 (Lowest Campus hours: 0 hrs)",
  },
  {
    id: "REG-101-3",
    activityId: 1,
    volunteerId: "VOL-103", // Amit (Campus: 10) -> SELECTED (rank 3 of 3)
    volunteerName: "Amit Kumar",
    volunteerRoll: "23ME3008",
    registeredAt: "2026-09-18T12:30:00Z",
    status: "Selected",
    selectionReason: "Rank #3 (Campus hours: 10 hrs)",
  },
  // Past completed registrations
  {
    id: "REG-104-1",
    activityId: 4,
    volunteerId: "VOL-101",
    volunteerName: "Rahul Sharma",
    volunteerRoll: "23CS1042",
    registeredAt: "2026-09-02T10:00:00Z",
    status: "Attended",
    selectionReason: "FCFS confirmed",
  },
  {
    id: "REG-105-1",
    activityId: 5,
    volunteerId: "VOL-101",
    volunteerName: "Rahul Sharma",
    volunteerRoll: "23CS1042",
    registeredAt: "2026-09-06T10:00:00Z",
    status: "Attended",
    selectionReason: "Lowest Community hours confirmed",
  },
  {
    id: "REG-104-2",
    activityId: 4,
    volunteerId: "VOL-102",
    volunteerName: "Sneha Patel",
    volunteerRoll: "22EC2015",
    registeredAt: "2026-09-02T11:00:00Z",
    status: "Attended",
    selectionReason: "FCFS confirmed",
  }
];

// Initial diary feedback entries
export const initialDiaryEntries: ActivityDiaryEntry[] = [
  {
    id: "DIR-001",
    activityId: 4,
    activityTitle: "Campus Cleanliness & Plastic Segregation Drive",
    volunteerId: "VOL-101",
    volunteerName: "Rahul Sharma",
    date: "11 Sep 2026",
    tasksDone: "Assigned to the engineering quadrangle. Collected 18kg of single-use plastic, segregated recyclable PET bottles, and mapped out locations for three new permanent waste segregation bins.",
    learnings: "Realized how simple habits create massive litter. Engaging fellow hostel students directly while cleaning inspired multiple bystanders to join in.",
    rating: 5,
    photoUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80",
    verifiedByAdmin: true,
    adminRemarks: "Excellent leadership shown in waste segregation and student mobilization.",
  }
];

// Initial notifications & reminders
export const initialNotifications: PortalNotification[] = [
  {
    id: "NOTIF-001",
    volunteerId: "all",
    title: "Upcoming Drive Reminder",
    message: "Mega Blood Donation Camp is scheduled for 25 Sep 2026 at College Auditorium. Selected volunteers please report by 08:45 AM.",
    type: "reminder",
    createdAt: "2026-09-20T09:00:00Z",
    read: false,
    activityId: 1,
  },
  {
    id: "NOTIF-002",
    volunteerId: "VOL-101",
    title: "Diary Entry Pending",
    message: "You attended 'National Road Safety Awareness Rally'. Please submit your diary entry to document your experience.",
    type: "diary_prompt",
    createdAt: "2026-09-16T10:00:00Z",
    read: false,
    activityId: 5,
    link: "/volunteer?tab=diary",
  },
  {
    id: "NOTIF-003",
    volunteerId: "all",
    title: "Registration Opening Notice",
    message: "Registration for 'Rural Water Conservation Survey' will open today at 02:00 PM. Selection mode: Lowest Community Hours Priority.",
    type: "registration_open",
    createdAt: "2026-09-21T07:00:00Z",
    read: false,
    activityId: 2,
  },
  {
    id: "NOTIF-004",
    volunteerId: "VOL-102",
    title: "Selection Confirmed",
    message: "Congratulations! You have been selected for Mega Blood Donation Camp on 25 Sep based on lowest Campus hours priority.",
    type: "selection",
    createdAt: "2026-09-19T14:00:00Z",
    read: false,
    activityId: 1,
  }
];

export const news = [
  { id: 1, title: "Special Camp Registration Open", date: "19 Aug 2026", category: "Announcement", text: "Registration is now open for the upcoming NSS special camp." },
  { id: 2, title: "Volunteer Coordination Meeting", date: "18 Aug 2026", category: "Meeting", text: "Student coordinators and volunteers will meet to plan the next service activities." },
  { id: 3, title: "Community Outreach Week", date: "12 Aug 2026", category: "Programme", text: "Our unit is conducting a week of community-focused activities across nearby areas." },
];

export const gallery = [
  { src: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=900&q=85", caption: "Community volunteering" },
  { src: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=900&q=85", caption: "Tree plantation" },
  { src: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=900&q=85", caption: "Volunteer team" },
  { src: "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?auto=format&fit=crop&w=900&q=85", caption: "Community outreach" },
  { src: "https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=900&q=85", caption: "Team activity" },
  { src: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=900&q=85", caption: "Youth engagement" },
];

export const team = [
  { name: "Dr. Rajesh Kumar", role: "Programme Officer", department: "NSS Unit", image: "https://i.pravatar.cc/500?img=12" },
  { name: "Anjali Menon", role: "Student Coordinator", department: "Computer Science", image: "https://i.pravatar.cc/500?img=47" },
  { name: "Arjun Nair", role: "Student Coordinator", department: "Electronics", image: "https://i.pravatar.cc/500?img=11" },
  { name: "Meera Joseph", role: "Volunteer Leader", department: "Commerce", image: "https://i.pravatar.cc/500?img=44" },
];

export const achievements = [
  { year: "2025–26", title: "Best NSS Unit Recognition", text: "Recognised for sustained community engagement and volunteer participation." },
  { year: "2025", title: "Community Outreach Milestone", text: "Completed a year of regular awareness, environment and health initiatives." },
  { year: "2024", title: "Volunteer Excellence", text: "Student volunteers were recognised for outstanding service contributions." },
];