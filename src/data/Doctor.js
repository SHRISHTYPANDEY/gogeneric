export const doctorCategories = [
  {
    id: 1,
    name: "Cardio Issues",
    specialization: "Cardiologist",
    image: "/doctor_img/categories/cardiologist.jpg",
  },
  {
    id: 2,
    name: "Sugar Issues",
    specialization: "Endocrinologist",
    image: "/doctor_img/categories/endocrinologist.jpg",
  },
  {
    id: 3,
    name: "Women's Health",
    specialization: "Gynecologist",
    image: "/doctor_img/categories/gyenocologist.webp",
  },
  {
    id: 4,
    name: "Child Care",
    specialization: "Pediatrician",
    image: "/doctor_img/categories/pediatrician.webp",
  },
  {
    id: 5,
    name: "Bone & Joint",
    specialization: "Orthopedist",
    image: "/doctor_img/categories/orthopedist.jpg",
  },
  {
    id: 6,
    name: "Skin & Hair",
    specialization: "Dermatologist",
    image: "/doctor_img/categories/skin_hair.webp",
  },
  {
    id: 7,
    name: "Mental Health",
    specialization: "Psychologist",
    image: "/doctor_img/categories/mental_health.jpg",
  },
  {
    id: 8,
    name: "General Physician",
    specialization: "Physician",
    image: "/doctor_img/categories/physician.jpg",
  },
];

export const doctors = [
  {
    id: "sangita-raj",
    name: "Dietician Sangita Raj",
    specialization: "Lifestyle & Weight Management",
    category: "Physician",
    experience: "12+ Years",
    image: "/doctor_img/sangeeta.jpeg",
    phone: "919211510600",
    whatsapp: "919211510600",

    about: `I am a dedicated dietician with strong experience in lifestyle-related disorders and weight management. I believe in natural, traditional, and sustainable methods of achieving long-term health. My approach focuses on simple, homely diet plans that are easy to follow and stress-free.`,

    approach: [
      "Natural and traditional diet methods",
      "Sustainable lifestyle changes",
      "Weekly customised diet plans",
      "Focus on daily routine & comfort",
    ],

    experienceDetail: `I have extensive experience working with individuals who wish to improve their health, manage weight, and adopt balanced lifestyle habits. My customised weekly diet plans help people feel free, supported and not stressed.`,

    specialisation: ["Weight Management", "Lifestyle Disorders"],

    plans: [
      {
        id: "free",
        title: "First Time Clients",
        subtitle: "100% Refundable Security Deposit",
        price: "₹99",
        features: {
          "Health & Lifestyle Assessment": true,
          "Booking Fee": "Refundable after visit",
          "Goal Setting": true,
          "Customised Weekly Diet Plan": true,
          "Progress Tracking": false,
          "WhatsApp Support": false,
          "Recipe Guidance": false,
          "Food Substitution List": "Basic Tips",
          "Motivation & Accountability": false,
        },
      },
      {
        id: "appointment",
        title: "Per Appointment",
        subtitle: "Follow-up",
        price: "₹199",
        features: {
          "Health & Lifestyle Assessment": true,
          "Goal Setting": "Per Assessment",
          "Customised Weekly Diet Plan": "Basic",
          "Progress Tracking": "Basic",
          "WhatsApp Support": true,
          "Recipe Guidance": "Basic",
          "Food Substitution List": "Basic",
          "Motivation & Accountability": "Low",
        },
      },
      {
        id: "monthly",
        title: "Monthly Plan",
        subtitle: "Regular Improvement",
        featured: true,
        price: "₹499",
        features: {
          "Health & Lifestyle Assessment": true,
          "Goal Setting": true,
          "Customised Weekly Diet Plan": "Standard",
          "Progress Tracking": "Weekly",
          "WhatsApp Support": "Mon–Sat",
          "Recipe Guidance": "Optional",
          "Food Substitution List": "Weekly Recipes",
          "Motivation & Accountability": "Moderate",
        },
      },
    ],
  },
  {
  id: "dr-shashi",
  name: "Dr. Shashi",
  specialization: "Ayurvedic Gynaecology Specialist",
  category: "Gynecologist",
  image: "/doctor_img/shashi.jpeg", 
  experience: "20 Years",
  phone: "01234567890", 
  whatsapp: "01234567890",
  location: "Meerut, Uttar Pradesh",

  qualification: "BAMS (Ayurvedacharya – Bachelor of Ayurvedic Medicine & Surgery)",
  university: "Chhatrapati Shahu Ji Maharaj University, Kanpur",
  yearOfPassing: "2002",

  registration: {
    council: "Bharatiya Chikitsa Parishad, Uttar Pradesh",
    number: "49267",
    date: "23 June 2004",
    status: "Active",
  },

  about: `Dr. Shashi is a qualified & experienced Ayurvedic Physician (BAMS) with specialization in Gynaecology (Stree Rog & Prasuti Tantra). She is dedicated to Providing safe, effective, and holistic Ayurvedic treatment for women's health using classical Ayurvedic principles combined with modern clinical understanding`,

  approach: [
    "Root-cause based Ayurvedic treatment",
    "Personalized Ayurvedic medicines",
    "Diet & lifestyle correction",
    "Safe, natural & long-term wellness care without harmful side effects",
    "Focused on natural healing, hormaonal balance, and overall women's well-being",
  ],
  specialisation: [
    "Menstrual disorders (Irregular / Painfull periods",
    "Leucorrhoea (White discharge)",
    "PCOD / PCOS (Ayurvedic management)",
    "Hormonal imbalance",
    "Female infertility",
    "Pregnancy care (Antenatal Ayurvedic care",
    "Post-natal care",
    "Menopause-related problems",
    "General women's health disorders"
  ],

  languages: ["Hindi", "English"],

  consultation: {
    type: "OPD / Clinic Consultation",
    mode: ["In-person / Offline"],
    prescription: "Ayurvedic Medicines",
  },

  plans: [
    {
      id: "single-consultation",
      title: "Single Consultation Plan",
      subtitle: "One-Time Visit",
      price: "₹299",
      features: {
        "Detailed Case History": true,
        "Ayurvedic Diagnosis": true,
        "Treatment Guidance": true,
        "Diet & Lifestyle Advice": true,
        "Follow-up Support": false,
        "WhatsApp Support": false,
      },
    },
    {
      id: "monthly-care",
      title: "Monthly Care Plan",
      subtitle: "1 Month (2–3 Visits)",
      price: "₹999 / Month",
      features: {
        "Regular Follow-ups": true,
        "Medicine & Dose Adjustment": true,
        "Hormonal Balance Support": true,
        "Diet & Lifestyle Correction": true,
        "24×7 WhatsApp Support": true,
      },
    },
    {
      id: "pregnancy-care",
      title: "Complete Pregnancy Care Plan",
      subtitle: "Up to 9 Months (trimester-wise visits)",
      price: "₹4,999",
      features: {
        "Antenatal Ayurvedic Care": true,
        "Garbh Sanskar Guidance": true,
        "Nutrition Planning": true,
        "Mother & Baby Wellness Support": true,
        "24×7 WhatsApp Help": true,
      },
    },
  ],
}

];
