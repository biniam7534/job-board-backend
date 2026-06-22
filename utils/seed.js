// Run with: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Employer = require('../models/Employer');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');

const seed = async () => {
  await connectDB();

  await Promise.all([Employer.deleteMany(), Candidate.deleteMany(), Job.deleteMany()]);

  const employer = await Employer.create({
    companyName: 'Northwind Logistics',
    email: 'hr@northwind.test',
    password: 'password123',
    industry: 'Logistics',
    website: 'https://northwind.test',
  });

  const candidate = await Candidate.create({
    name: 'Yonas Tesfaye',
    email: 'yonas@example.test',
    password: 'password123',
    phone: '+251911000000',
    skills: ['Node.js', 'MongoDB', 'AWS'],
    experienceYears: 5,
    location: 'Addis Ababa, ET',
  });

  await Job.create({
    title: 'Senior backend engineer',
    description:
      'Lead backend work on our fleet-tracking platform, building APIs that handle real-time shipment data across East Africa.',
    employer: employer._id,
    location: 'Addis Ababa, ET',
    jobType: 'full-time',
    skillsRequired: ['Node.js', 'MongoDB', 'AWS'],
    salaryMin: 95000,
    salaryMax: 120000,
    experienceRequired: 5,
  });

  console.log('Seed data created:');
  console.log(`  Employer login: hr@northwind.test / password123`);
  console.log(`  Candidate login: yonas@example.test / password123`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
