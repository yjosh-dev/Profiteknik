export interface JobPreset {
  id: string;
  category: "Blue-Collar" | "White-Collar";
  title: string;
  description: string;
  employment_type: string;
  minimum_salary: number;
  maximum_salary: number;
  vacant_position: number;
  highest_education: string;
  experience: number;
  skillIds: number[];
}

export const JOB_PRESET_QUESTIONS: Record<string, string[]> = {
  welder: [
    "How many years of professional welding experience do you have?",
    "Which welding processes are you experienced in (SMAW, MIG, or TIG)?",
    "Do you have experience reading welding symbols, drawings, or fabrication plans?",
    "Have you worked in industrial, construction, or fabrication environments?",
    "Do you have experience following welding safety procedures and working in confined spaces?",
  ],

  pipefitter: [
    "How many years of professional pipefitting experience do you have?",
    "How experienced are you in reading piping blueprints and isometric drawings?",
    "Do you have experience installing or maintaining industrial piping systems?",
    "Have you performed pressure testing or leak detection on pipelines?",
    "Do you have experience working in confined spaces and following industrial safety procedures?",
  ],

  electrician: [
    "How many years of professional electrical work experience do you have?",
    "Do you have experience with commercial and industrial electrical wiring?",
    "Have you performed electrical installation, inspection, troubleshooting, or maintenance?",
    "Do you have experience working with high-voltage electrical systems?",
    "Are you familiar with electrical safety procedures and temporary site power distribution?",
  ],

  "heavy-equipment-operator": [
    "How many years of experience do you have operating heavy equipment?",
    "Which heavy equipment have you operated (excavator, bulldozer, crane, or similar)?",
    "Do you have experience performing pre-operation equipment inspections?",
    "Do you have experience working on construction sites?",
    "Are you familiar with rigging, signaling, and construction site safety procedures?",
  ],

  "mechanical-technician": [
    "How many years of industrial mechanical maintenance experience do you have?",
    "Do you have experience maintaining pumps, motors, and mechanical piping systems?",
    "Do you have experience troubleshooting pneumatic and hydraulic systems?",
    "Have you performed preventive maintenance on industrial equipment?",
    "Do you have experience troubleshooting mechanical or robotic equipment?",
  ],

  "construction-worker": [
    "How many years of construction site experience do you have?",
    "Which construction tasks are you experienced in?",
    "Do you have experience with excavation, site clearing, or debris removal?",
    "Do you have experience with concrete work, rebar preparation, or masonry?",
    "Are you familiar with construction site safety procedures?",
  ],

  "civil-engineer": [
    "How many years of professional civil engineering experience do you have?",
    "Do you have experience with civil or structural engineering design?",
    "Do you have experience preparing or reviewing engineering drawings and construction documents?",
    "Have you performed or coordinated site investigations or construction inspections?",
    "Which engineering or CAD tools are you experienced with?",
  ],

  "mechanical-engineer": [
    "How many years of professional mechanical engineering experience do you have?",
    "Do you have experience designing or reviewing mechanical systems and equipment?",
    "Do you have experience with CAD or mechanical engineering design tools?",
    "Have you worked with pumps, motors, piping, or industrial mechanical systems?",
    "Do you have experience supporting maintenance or engineering projects?",
  ],

  "project-engineer": [
    "How many years of engineering or project coordination experience do you have?",
    "Do you have experience monitoring project schedules and progress?",
    "Have you coordinated with contractors, subcontractors, or project stakeholders?",
    "Do you have experience with quality control or construction inspection?",
    "Which project scheduling or management tools are you familiar with?",
  ],

  accountant: [
    "How many years of professional accounting experience do you have?",
    "Do you have experience maintaining general ledger and accounting records?",
    "Do you have experience preparing tax compliance documents?",
    "Have you performed auditing or internal control procedures?",
    "Do you have experience handling accounts payable, accounts receivable, or payroll?",
  ],

  "hr-specialist": [
    "How many years of professional human resources experience do you have?",
    "Do you have experience with recruitment and talent acquisition?",
    "Have you handled employee relations or performance management activities?",
    "Do you have experience coordinating employee training?",
    "Have you handled employee onboarding or offboarding?",
  ],

  "it-support-specialist": [
    "How many years of professional IT support experience do you have?",
    "Do you have experience diagnosing and repairing computer hardware?",
    "Do you have experience troubleshooting networks and IT infrastructure?",
    "Have you installed software and assisted users with technical issues?",
    "Do you have experience providing Tier 1 IT helpdesk support?",
  ],
};

export const JOB_PRESETS: JobPreset[] = [
  {
    id: "welder",
    category: "Blue-Collar",
    title: "Welder",
    description:
      "Perform welding and fabrication work using SMAW, MIG, and TIG processes while following workplace safety procedures and welding specifications.",
    employment_type: "Full-time",
    minimum_salary: 18000,
    maximum_salary: 28000,
    vacant_position: 1,
    highest_education: "Vocational",
    experience: 2,
    skillIds: [1, 2, 3, 72, 73],
  },
  {
    id: "pipefitter",
    category: "Blue-Collar",
    title: "Pipefitter",
    description:
      "Install, assemble, maintain, and repair industrial piping systems using blueprints and established safety procedures.",
    employment_type: "Full-time",
    minimum_salary: 20000,
    maximum_salary: 32000,
    vacant_position: 1,
    highest_education: "Vocational",
    experience: 2,
    skillIds: [4, 41, 72, 73, 303],
  },
  {
    id: "electrician",
    category: "Blue-Collar",
    title: "Electrician",
    description:
      "Install, inspect, troubleshoot, and maintain commercial and industrial electrical systems while observing electrical safety requirements.",
    employment_type: "Full-time",
    minimum_salary: 18000,
    maximum_salary: 30000,
    vacant_position: 1,
    highest_education: "Vocational",
    experience: 2,
    skillIds: [11, 12, 13, 337],
  },
  {
    id: "heavy-equipment-operator",
    category: "Blue-Collar",
    title: "Heavy Equipment Operator",
    description:
      "Operate and perform basic inspections of heavy construction equipment such as excavators, bulldozers, and cranes while following site safety procedures.",
    employment_type: "Full-time",
    minimum_salary: 20000,
    maximum_salary: 35000,
    vacant_position: 1,
    highest_education: "High School",
    experience: 2,
    skillIds: [6, 7, 8, 9],
  },
  {
    id: "mechanical-technician",
    category: "Blue-Collar",
    title: "Mechanical Technician",
    description:
      "Maintain and troubleshoot pumps, motors, piping, pneumatic and hydraulic systems, and other industrial mechanical equipment.",
    employment_type: "Full-time",
    minimum_salary: 20000,
    maximum_salary: 32000,
    vacant_position: 1,
    highest_education: "Vocational",
    experience: 2,
    skillIds: [40, 41, 43, 44, 45],
  },
  {
    id: "construction-worker",
    category: "Blue-Collar",
    title: "Construction Worker",
    description:
      "Perform general construction tasks including site clearing, excavation, concrete work, rebar preparation, and masonry while following site safety requirements.",
    employment_type: "Contract",
    minimum_salary: 16000,
    maximum_salary: 25000,
    vacant_position: 2,
    highest_education: "High School",
    experience: 1,
    skillIds: [311, 312, 313, 315, 316, 319],
  },
  {
    id: "civil-engineer",
    category: "White-Collar",
    title: "Civil Engineer",
    description:
      "Plan, design, review, and coordinate civil and structural engineering work, including construction documentation, site investigation, and project requirements.",
    employment_type: "Full-time",
    minimum_salary: 30000,
    maximum_salary: 50000,
    vacant_position: 1,
    highest_education: "Bachelor",
    experience: 2,
    skillIds: [175, 176, 218, 219, 348, 349],
  },
  {
    id: "mechanical-engineer",
    category: "White-Collar",
    title: "Mechanical Engineer",
    description:
      "Design, review, and support mechanical systems and equipment while coordinating technical documentation, maintenance requirements, and engineering projects.",
    employment_type: "Full-time",
    minimum_salary: 30000,
    maximum_salary: 50000,
    vacant_position: 1,
    highest_education: "Bachelor",
    experience: 2,
    skillIds: [177, 40, 41, 43],
  },
  {
    id: "project-engineer",
    category: "White-Collar",
    title: "Project Engineer",
    description:
      "Coordinate engineering projects, monitor project schedules and progress, support quality control, and communicate with contractors and project stakeholders.",
    employment_type: "Full-time",
    minimum_salary: 30000,
    maximum_salary: 55000,
    vacant_position: 1,
    highest_education: "Bachelor",
    experience: 2,
    skillIds: [176, 177, 342, 343, 345, 347],
  },
  {
    id: "accountant",
    category: "White-Collar",
    title: "Accountant",
    description:
      "Maintain accounting records, prepare financial reports, support tax compliance, and perform auditing and accounts payable or receivable activities.",
    employment_type: "Full-time",
    minimum_salary: 25000,
    maximum_salary: 45000,
    vacant_position: 1,
    highest_education: "Bachelor",
    experience: 2,
    skillIds: [103, 104, 105, 109, 110, 171],
  },
  {
    id: "hr-specialist",
    category: "White-Collar",
    title: "HR Specialist",
    description:
      "Support recruitment, employee relations, performance management, training, and employee onboarding and offboarding activities.",
    employment_type: "Full-time",
    minimum_salary: 22000,
    maximum_salary: 40000,
    vacant_position: 1,
    highest_education: "Bachelor",
    experience: 1,
    skillIds: [111, 112, 117, 118, 120],
  },
  {
    id: "it-support-specialist",
    category: "White-Collar",
    title: "IT Support Specialist",
    description:
      "Provide technical support, troubleshoot computer and network issues, install software, and assist users with IT systems and infrastructure.",
    employment_type: "Full-time",
    minimum_salary: 22000,
    maximum_salary: 40000,
    vacant_position: 1,
    highest_education: "Bachelor",
    experience: 1,
    skillIds: [163, 164, 167, 201, 297, 298],
  },
];

export const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
