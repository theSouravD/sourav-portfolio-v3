// All copy below is lifted verbatim from Sourav's original site.
// No wording has been rewritten, shortened, or invented.

export const profile = {
  name: "Sourav Dey",
  brand: "Sourav.",
  eyebrow: "Hello, I'm",
  role: "Gen AI Production Lead | Creative Director",
  tagline:
    "Gen AI Production Lead and Creative Director building scalable, production-ready creative systems.",
  intro:
    "Creative and Gen AI production lead with experience across motion graphics, video editing, AI ad creatives, automation workflows, prompt engineering, RCA, model testing and scaled creative production.",
  note: "Research, systems and creative direction for high-volume production.",
  resumeUrl: "/Sourav_Dey_New_Design_CV_2026.pdf",
};

export const stats = [
  { value: 6, suffix: "+", label: "Years of Experience" },
  { value: 6, suffix: "+", label: "AI Workflows Created" },
  { value: 2, suffix: "x+", label: "Production Throughput" },
];

export const about = {
  index: "01 / About",
  heading: "About",
  body: "I work where creative direction, Gen AI research and production systems meet. My focus is turning ambitious visual ideas into repeatable workflows that teams can actually use at scale, while maintaining quality across high-volume creative production.",
  linkLabel: "View Resume ->",
  aside: {
    title: "Creative Direction + Gen AI Production",
    body: "Visual thinking, model testing, automation workflows and quality control for high-volume content.",
  },
};

export const coreSkills = [
  "Gen AI Production Workflows",
  "Prompt Engineering",
  "AI Creative Automation",
  "Model Testing and Validation",
  "RCA and Error Identification",
  "Creative Direction",
  "Motion Graphics",
  "Video Editing",
  "AI Ad Creatives",
  "Production Scaling",
  "Workflow Optimization",
  "Team Management",
  "Creative QC",
  "Cross-functional Collaboration",
];

export const tools = [
  "Adobe After Effects",
  "Adobe Premiere Pro",
  "Adobe Photoshop",
  "Adobe Illustrator",
  "Blender 3D",
  "DaVinci Resolve",
  "ChatGPT",
  "Codex",
  "Claude",
  "Gemini",
  "Seedance 2.5",
  "Nano Banana Pro",
  "Minimax H3",
  "Grok Imagine",
  "Google Omni",
  "ElevenLabs",
];

/**
 * Lifted verbatim from the 2026 PDF, which carried it while the site did not.
 * It lives here so the resume view can be built from this file alone, rather
 * than from this file plus a document none of this code can read.
 */
export const education = [
  {
    school: "Maya Academy of Advanced Cinematics (MAAC)",
    course: "Advanced Program in Digital Media and Design",
    period: "2020 — 2021",
  },
];

export interface Job {
  title: string;
  company: string;
  place: string;
  period: string;
  duration: string;
  tags: string[];
  bullets: string[];
}

export const experience: Job[] = [
  {
    title: "Gen AI Production Lead, Experiment & Research (E&R)",
    company: "Pocket FM Pvt Ltd",
    place: "Bengaluru, Karnataka | Remote",
    period: "Feb 2026 - Present",
    duration: "7+ months",
    tags: ["ai", "creative", "motion"],
    bullets: [
      "Lead **Gen AI research and production workflows**, including model testing, RCA, error identification, validation and improvements to existing automation tools.",
      "Worked on **Script to Image and Script to Motion automation**, handling prompt engineering, creative testing, RCA, output validation and improvements for production use.",
      "Worked on **2 Thumbnail Automation workflows**, improving outputs and reducing manual QC and fixes.",
      "Created a **Character Canvas (CC) creation tool** and worked on multiple fixes and improvements to existing internal AI tools.",
      "Research **new AI models and workflows** to improve output quality, reduce production time and cost, and scale production.",
      "Created **AI skills and workflows for CDs and ACDs** to maintain creative quality and consistency across production.",
      "Automation and workflow improvements contributed to increasing production throughput by **2x or more**.",
      "Created an **AI Dubbing Studio POC**, later developed further by Engineering into a usable English-to-regional-language dubbing tool, including Hindi and LATAM.",
      "Worked in a **CD++ role for a brand film project**, managing CDs, providing creative feedback and helping with the overall visual direction.",
    ],
  },
  {
    title: "Creative Director, Scaling Romantasy US",
    company: "Pocket FM Pvt Ltd",
    place: "Bengaluru, Karnataka | Remote",
    period: "Sep 2025 - Feb 2026",
    duration: "6 months",
    tags: ["creative", "ai"],
    bullets: [
      "**Managed ACDs** and maintained creative quality and production throughput across Scaling Romantasy US assets.",
      "Helped ACDs with **visualization and visual direction** while finding ways to scale assets.",
      "Worked with the team on creative and production challenges while maintaining **quality and consistency across high-volume production**.",
    ],
  },
  {
    title: "Sr. Motion Graphics Designer",
    company: "Ginger Monkey LLP",
    place: "Gurugram, Haryana | Remote",
    period: "Apr 2025 - Sep 2025",
    duration: "6 months",
    tags: ["ai", "motion"],
    bullets: [
      "Creating engaging **AI ad creatives** for brands like Durex, Amazon, Atlys, Bangur, Bikaji, Pepsi etc.",
    ],
  },
  {
    title: "Sr. Motion Graphics Designer & GEN-AI Expert, AI Team Lead",
    company: "Pocket FM Pvt Ltd",
    place: "Bengaluru, Karnataka | Remote",
    period: "Oct 2022 - Oct 2024",
    duration: "2 years",
    tags: ["ai", "motion"],
    bullets: [
      "Crafted **AI-generated graphics, motion, and edited videos** to enhance marketing campaigns for diverse shows.",
      "Introduced **new AI tools**, optimizing editing workflows, enhancing efficiency, and collaboration within the team.",
    ],
  },
  {
    title: "Web Designer",
    company: "Zolute Technology & Consulting",
    place: "Indore, Madhya Pradesh | Remote",
    period: "Aug 2021 - Sep 2022",
    duration: "1 year 2 months",
    tags: ["creative"],
    bullets: [
      "Developed **graphic and image assets** for both content and digital marketing efforts.",
      "Designed highly engaging **interactive user interfaces** that complied with modern web standards.",
    ],
  },
  {
    title: "Graphics Designer",
    company: "ProjectPie Technologies Private Limited",
    place: "Kolkata, West Bengal | Remote",
    period: "Aug 2019 - June 2020",
    duration: "11 months",
    tags: ["creative", "motion"],
    bullets: [
      "Developed unique and **trend-driven T-shirt designs** that resonated with the target audience, boosting overall product appeal.",
      "Consistently delivered **high-quality designs under tight deadlines**, contributing to the timely release of new collections.",
      "Worked closely with clients to translate their vision into **creative and market-ready T-shirt designs**.",
    ],
  },
];

export const experienceFilters = [
  { key: "all", label: "All" },
  { key: "ai", label: "AI Production" },
  { key: "creative", label: "Creative Direction" },
  { key: "motion", label: "Motion" },
];

export const experienceIntro =
  "A record of building creative systems, leading teams and improving production through AI.";

export const workIntro =
  "Selected areas across Gen AI production, creative direction and scaled content systems.";

export const workAreas = [
  {
    index: "01",
    key: "automation",
    title: "Automation Workflows",
    blurb: "Production tools, testing, RCA and scalable creative systems.",
    count: "5 projects",
  },
  {
    index: "02",
    key: "direction",
    title: "Creative Direction",
    blurb: "Visual direction, creative feedback and production quality.",
    count: "4 projects",
  },
  {
    index: "03",
    key: "ai",
    title: "AI Ads and Motion Work",
    blurb:
      "AI animation, branded ads, motion graphics, promos, reels and video editing.",
    count: "22 projects",
  },
];

export const automationContribution = {
  heading: "My contribution",
  body: "I owned the POCs and vibe-coded prototypes, and led the research, RCA, prompt engineering, testing, validation, and evaluations. The production automation workflow was implemented by the tech team.",
};

export const contact = {
  eyebrow: "Let's connect",
  heading: "Available for thoughtful, high-impact creative work.",
  body: "Based in Kolkata and working across creative direction, Gen AI production and scalable content systems.",
  items: [
    { label: "Location", value: "Kolkata 700061, WB", href: null },
    { label: "Phone", value: "+91 79801 49807", href: "tel:+917980149807" },
    {
      label: "Email",
      value: "souravdey2105@gmail.com",
      href: "mailto:souravdey2105@gmail.com",
    },
    {
      label: "LinkedIn",
      value: "linkedin.com/in/souravdey2105",
      href: "https://www.linkedin.com/in/souravdey2105/",
    },
  ],
};

export const navLinks = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#work", label: "Work" },
  { href: "#connect", label: "Connect" },
];

export const loader = {
  headTitle: "Portfolio Builder",
  headSubtitle: "AI workspace",
  prompt:
    "Create Sourav Dey's portfolio from his experience, AI workflows, creative direction and selected work.",
  steps: [
    {
      title: "Reading experience and skills",
      detail: "Mapping roles, tools and production systems",
    },
    {
      title: "Organizing selected work",
      detail: "Preparing AI ads and motion projects",
    },
    {
      title: "Building portfolio interactions",
      detail: "Tuning motion, hover and responsive behavior",
    },
    {
      title: "Running final visual checks",
      detail: "Rendering the final portfolio preview",
    },
  ],
  doneTitle: "Portfolio generated",
  doneDetail: "Your interactive portfolio is ready",
  cta: "Click to open",
};

/* ---------------------------------------------------------------------------
   v2 additions — derived from the roles above, no new claims invented.
   --------------------------------------------------------------------------- */

export interface Company {
  name: string;
  wordmark: string;
  roles: number;
  span: string;
  note: string;
}

/** Companies pulled straight out of `experience`, newest engagement first. */
export const companies: Company[] = [
  {
    name: 'Pocket FM Pvt Ltd',
    wordmark: 'Pocket FM',
    roles: 3,
    span: '2022 — Present',
    note: 'Gen AI Production Lead · Creative Director · Sr. Motion Graphics Designer',
  },
  {
    name: 'Ginger Monkey LLP',
    wordmark: 'Ginger Monkey',
    roles: 1,
    span: '2025',
    note: 'Sr. Motion Graphics Designer',
  },
  {
    name: 'Zolute Technology & Consulting',
    wordmark: 'Zolute',
    roles: 1,
    span: '2021 — 2022',
    note: 'Web Designer',
  },
  {
    name: 'ProjectPie Technologies Private Limited',
    wordmark: 'ProjectPie',
    roles: 1,
    span: '2019 — 2020',
    note: 'Graphics Designer',
  },
];

/** Brand names lifted verbatim from the Ginger Monkey bullet. */
export const brands = [
  'Durex',
  'Amazon',
  'Atlys',
  'Bangur',
  'Bikaji',
  'Pepsi',
];

export const experienceScene = {
  eyebrow: 'The record',
  yearsLabel: 'Years building creative systems',
  companiesLabel: 'Companies',
  rolesLabel: 'Roles held',
  brandsLabel: 'Brands worked on',
  timelineLabel: 'Career timeline',
};

export const workScene = {
  eyebrow: 'The work',
  intro:
    'Selected areas across Gen AI production, creative direction and scaled content systems.',
  railHint: 'Scroll to move through the work',
};

export const capabilitiesScene = {
  eyebrow: 'How I work',
};
