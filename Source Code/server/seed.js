#!/usr/bin/env node

/**
 * Comprehensive Database Seeding Script
 * Run with: node server/seed.js
 * Options: 
 *   --clear  Clear database before seeding
 *   --users  Only seed users
 *   --courses Only seed courses and related data
 *   --all    Seed all data (default)
 *   --extended Seed extended data (assignments, submissions, etc.)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const winston = require('winston');
const { 
  seedAll, 
  seedDepartments, 
  seedPrograms, 
  seedCourses, 
  createUsers,
  seedAssignments,
  seedExams,
  seedMaterials,
  seedNotifications,
  seedDiscussions,
  seedAnalytics,
  clearDatabase
} = require('./utils/seedData');

// Setup logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  clear: args.includes('--clear'),
  usersOnly: args.includes('--users'),
  coursesOnly: args.includes('--courses'),
  extended: args.includes('--extended'),
  all: !args.includes('--users') && !args.includes('--courses') || args.includes('--all')
};

async function runSeeding() {
  try {
    logger.info('🌱 Starting comprehensive database seeding process...');
    
    // Connect to database
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      logger.error('MONGODB_URI environment variable is required. Set it in your .env file.');
      process.exit(1);
    }
    
    // Set strictQuery to false to suppress Mongoose 7 warning
    mongoose.set('strictQuery', false);
    
    await mongoose.connect(mongoURI);
    logger.info('✅ Connected to database');

    // Clear database if requested
    if (options.clear) {
      logger.info('🧹 Clearing database...');
      await clearDatabase();
    }

    // Run seeding based on options
    if (options.usersOnly) {
      logger.info('👥 Seeding users only...');
      const university = await require('./models/academic/University').findOne();
      if (!university) {
        logger.error('University must be seeded before users. Run with --all first.');
        process.exit(1);
      }
      const depts = await require('./models/academic/Department').find();
      await createUsers(depts);
    } else if (options.coursesOnly) {
      logger.info('📚 Seeding courses and related data...');
      const university = await require('./models/academic/University').findOne();
      const departments = await seedDepartments(university._id);
      const programs = await seedPrograms(departments);
      const ay = await require('./models/academic/AcademicYear').findOne({ isActive: true });
      await seedCourses(departments, programs, ay._id);
    } else if (options.all) {
      logger.info('🌍 Seeding all data...');
      const result = await seedAll();
      
      // Display summary
      logger.info('\n📊 Comprehensive Seeding Summary:');
      logger.info(`   University: ${result.university.name}`);
      logger.info(`   Academic Year: ${result.academicYear.year}`);
      logger.info(`   Departments: ${result.departments.length}`);
      logger.info(`   Programs: ${result.programs.length}`);
      logger.info(`   Semesters: ${result.semesters.length}`);
      logger.info(`   Sections: ${result.sections.length}`);
      logger.info(`   Courses: ${result.courses.length}`);
      logger.info(`   Users: ${result.users.length}`);
    }

    logger.info('\n✨ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error(`❌ Seeding failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

runSeeding();
