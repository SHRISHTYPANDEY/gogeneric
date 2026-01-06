export const doctors = [
  {
    id: "sangita-raj",
    name: "Dietician Sangita Raj",
    specialization: "Lifestyle & Weight Management",
    experience: "12+ Years",
    image: "/public/doctor_img/sangeeta.jpeg",
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
];
