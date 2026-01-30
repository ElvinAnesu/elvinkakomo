export type ProjectStatus = "Planning" | "Building" | "Review" | "Complete";

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  progress: number;
  lastUpdated: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  feedback: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  highlighted?: boolean;
}

export interface Service {
  id: string;
  title: string;
  description: string[];
  outcome: string;
}

export const projects: Project[] = [
  {
    id: "1",
    name: "E-commerce Platform",
    status: "Building",
    progress: 65,
    lastUpdated: "2024-01-15",
  },
  {
    id: "2",
    name: "Internal Dashboard",
    status: "Review",
    progress: 90,
    lastUpdated: "2024-01-18",
  },
  {
    id: "3",
    name: "Mobile App MVP",
    status: "Planning",
    progress: 25,
    lastUpdated: "2024-01-20",
  },
  {
    id: "4",
    name: "Customer Portal",
    status: "Complete",
    progress: 100,
    lastUpdated: "2024-01-10",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "L Denhere",
    role: "Founder",
    company: "Tetrafert",
    feedback: "Elvin had our website up and running in just two days. he was very Efficient in his execution.",
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter – Product Support",
    price: 400,
    features: [
      "Small feature updates",
      "Bug fixes",
      "Basic monitoring",
      "Priority support",
    ],
  },
  {
    id: "growth",
    name: "Growth – Product Partner",
    price: 1000,
    features: [
      "Ongoing feature development",
      "Monthly planning & reviews",
      "Product improvements",
      "Automation & integrations",
    ],
    highlighted: true,
  },
  {
    id: "scale",
    name: "Scale – Dedicated Product Engineer",
    price: 2500,
    features: [
      "Acts as in-house engineer",
      "Weekly check-ins",
      "Fast turnaround",
      "Product & technical decisions",
    ],
  },
];

export interface ClientProject {
  id: string;
  name: string;
  client: string;
  description: string;
  technologies: string[];
  status: "Completed" | "Ongoing";
  year: string;
  projectType: "one time" | "partnership";
  image?: string;
}

export interface OwnProduct {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  status: "Active" | "Maintenance";
  users?: string;
  link?: string;
  image?: string;
  isDemo?: boolean;
  tryNow?: boolean;
}

export interface Solution {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  pricing: "Free" | "Paid" | "Open Source";
  link?: string;
  category: string;
  image?: string;
  tryNow?: boolean;
}

export const clientProjects: ClientProject[] = [
  {
    id: "1",
    name: "E-commerce Platform",
    client: "TechStart Inc.",
    description: "Full-stack e-commerce solution with payment integration, inventory management, and admin dashboard.",
    technologies: ["Next.js", "TypeScript", "PostgreSQL", "Stripe"],
    status: "Completed",
    year: "2024",
    projectType: "one time",
  },
  {
    id: "2",
    name: "Internal Dashboard",
    client: "RetailCo",
    description: "Custom dashboard replacing spreadsheet workflows with real-time data visualization and automation.",
    technologies: ["React", "Node.js", "MongoDB", "Chart.js"],
    status: "Completed",
    year: "2023",
    projectType: "partnership",
  },
  {
    id: "3",
    name: "Mobile App MVP",
    client: "Growth Labs",
    description: "Cross-platform mobile application for customer engagement and analytics.",
    technologies: ["React Native", "Firebase", "Redux"],
    status: "Ongoing",
    year: "2024",
    projectType: "one time",
  },
  {
    id: "4",
    name: "Customer Portal",
    client: "SaaS Company",
    description: "Self-service customer portal with billing, support tickets, and account management.",
    technologies: ["Vue.js", "Django", "PostgreSQL"],
    status: "Completed",
    year: "2023",
    projectType: "partnership",
  },
];

export const ownProducts: OwnProduct[] = [
  {
    id: "1",
    name: "TetraFert",
    description: "Professional website for a fertilizer plant company based in Harare, Zimbabwe. Features modern design, product showcase, and company information.",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
    status: "Active",
    link: "https://tetrafert.com/",
    image: "/projects/tetrafert.png",
  },
  {
    id: "2",
    name: "Expagro",
    description: "Professional website for an agricultural exports company based in Dar es Salaam, Tanzania. Showcases services, products, and company expertise in agro exports.",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
    status: "Active",
    link: "https://expagroltd.com/",
    image: "/projects/expagro.png",
  },
  {
    id: "3",
    name: "Soko Cars",
    description: "Enterprise Resource Planning (ERP) system for a company that imports cars. Comprehensive management tool for inventory, sales, and operations. Not publicly accessible.",
    technologies: ["Next.js", "TypeScript", "Supabase", "PostgreSQL"],
    status: "Active",
    image: "/projects/sokocars.com.png",
    isDemo: true,
  },
];

export const solutions: Solution[] = [
  {
    id: "1",
    name: "Intellimark",
    description: "An intelligent AI tool that provides comprehensive information on East African major markets. Get real-time market insights, trends, and data analytics to make informed business decisions.",
    technologies: ["AI/ML", "Next.js", "TypeScript", "Python"],
    pricing: "Free",
    category: "AI Tools",
    image: "/solutions/intellimark.png",
    link: "https://intellimark-gamma.vercel.app/",
    tryNow: true,
  },
  {
    id: "2",
    name: "Head To Head",
    description: "Youtube video comparison tool that allows you to compare two videos side by side. Great for content creators to see how their videos perform against competitors and great for corporates when choosing brand ambassadors or partners to work with in marketing",
    technologies: ["React Js", "Vite", "TypeScript", "RESTful API"],
    pricing: "Free",
    category: "Social Media Tools",
    image: "/solutions/headtohead.png",
    link: "https://channel-showdown.vercel.app/",
    tryNow: true,
  },
];

export interface Transaction {
  id: string;
  date: string;
  client: string;
  description: string;
  amount: number;
  type: "Income" | "Expense";
  status: "Completed" | "Pending" | "Failed";
  category: string;
}

export interface BusinessStats {
  totalRevenue: number;
  monthlyRevenue: number;
  activeProjects: number;
  totalClients: number;
  pendingTransactions: number;
}

export const transactions: Transaction[] = [
  {
    id: "1",
    date: "2024-01-15",
    client: "TechStart Inc.",
    description: "E-commerce Platform - Monthly Subscription",
    amount: 1000,
    type: "Income",
    status: "Completed",
    category: "Recurring",
  },
  {
    id: "2",
    date: "2024-01-18",
    client: "RetailCo",
    description: "Internal Dashboard - Project Payment",
    amount: 5000,
    type: "Income",
    status: "Completed",
    category: "Project",
  },
  {
    id: "3",
    date: "2024-01-20",
    client: "Growth Labs",
    description: "Mobile App MVP - Initial Payment",
    amount: 3000,
    type: "Income",
    status: "Pending",
    category: "Project",
  },
  {
    id: "4",
    date: "2024-01-22",
    client: "SaaS Company",
    description: "Customer Portal - Monthly Subscription",
    amount: 1000,
    type: "Income",
    status: "Completed",
    category: "Recurring",
  },
  {
    id: "5",
    date: "2024-01-25",
    client: "TechStart Inc.",
    description: "Hosting & Infrastructure",
    amount: -150,
    type: "Expense",
    status: "Completed",
    category: "Infrastructure",
  },
  {
    id: "6",
    date: "2024-01-28",
    client: "New Client",
    description: "Website Redesign - Deposit",
    amount: 2000,
    type: "Income",
    status: "Pending",
    category: "Project",
  },
];

export const businessStats: BusinessStats = {
  totalRevenue: 12500,
  monthlyRevenue: 10200,
  activeProjects: 3,
  totalClients: 5,
  pendingTransactions: 2,
};

export interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  period: string;
}

export interface FinancialReport {
  id: string;
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  growth: number;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: "Todo" | "In Progress" | "Review" | "Done";
  priority: "Low" | "Medium" | "High";
  assignee?: string;
  dueDate: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  status: "Upcoming" | "In Progress" | "Completed";
  progress: number;
}

export const budgets: Budget[] = [
  {
    id: "1",
    category: "Infrastructure",
    allocated: 500,
    spent: 150,
    period: "January 2024",
  },
  {
    id: "2",
    category: "Marketing",
    allocated: 1000,
    spent: 450,
    period: "January 2024",
  },
  {
    id: "3",
    category: "Tools & Software",
    allocated: 300,
    spent: 280,
    period: "January 2024",
  },
  {
    id: "4",
    category: "Professional Development",
    allocated: 500,
    spent: 200,
    period: "January 2024",
  },
];

export const financialReports: FinancialReport[] = [
  {
    id: "1",
    period: "January 2024",
    revenue: 10200,
    expenses: 1080,
    profit: 9120,
    growth: 15.5,
  },
  {
    id: "2",
    period: "December 2023",
    revenue: 8800,
    expenses: 950,
    profit: 7850,
    growth: 8.2,
  },
  {
    id: "3",
    period: "November 2023",
    revenue: 8100,
    expenses: 1100,
    profit: 7000,
    growth: 5.1,
  },
];

export const projectTasks: ProjectTask[] = [
  {
    id: "1",
    projectId: "3",
    title: "Design user authentication flow",
    description: "Create login, signup, and password reset screens",
    status: "In Progress",
    priority: "High",
    assignee: "Elvin",
    dueDate: "2024-02-05",
  },
  {
    id: "2",
    projectId: "3",
    title: "Implement API endpoints",
    description: "Build REST API for user management",
    status: "Todo",
    priority: "High",
    assignee: "Elvin",
    dueDate: "2024-02-10",
  },
  {
    id: "3",
    projectId: "1",
    title: "Payment integration",
    description: "Integrate Stripe payment gateway",
    status: "Review",
    priority: "High",
    assignee: "Elvin",
    dueDate: "2024-01-25",
  },
  {
    id: "4",
    projectId: "2",
    title: "Dashboard analytics",
    description: "Add charts and data visualization",
    status: "Done",
    priority: "Medium",
    assignee: "Elvin",
    dueDate: "2024-01-20",
  },
  {
    id: "5",
    projectId: "3",
    title: "Mobile app testing",
    description: "Test on iOS and Android devices",
    status: "Todo",
    priority: "Medium",
    assignee: "Elvin",
    dueDate: "2024-02-15",
  },
];

export const milestones: Milestone[] = [
  {
    id: "1",
    projectId: "3",
    title: "MVP Launch",
    description: "Complete core features and deploy to production",
    dueDate: "2024-02-28",
    status: "In Progress",
    progress: 45,
  },
  {
    id: "2",
    projectId: "1",
    title: "Beta Release",
    description: "Release beta version to selected users",
    dueDate: "2024-02-10",
    status: "Upcoming",
    progress: 0,
  },
  {
    id: "3",
    projectId: "2",
    title: "Version 2.0",
    description: "Major update with new features",
    dueDate: "2024-03-15",
    status: "Upcoming",
    progress: 0,
  },
];
