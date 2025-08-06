-- HRMS Recruitment Database Schema
-- MySQL Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS hrms_db;
USE hrms_db;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role ENUM('admin', 'hr_spoc', 'employer', 'manager', 'recruiter') DEFAULT 'employer',
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sub_department VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Recruitment Workflow Templates
CREATE TABLE IF NOT EXISTS recruitment_workflows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    steps JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Recruitment Agencies
CREATE TABLE IF NOT EXISTS recruitment_agencies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    website VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    position VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    hire_date DATE NOT NULL,
    salary INT,
    manager_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- Jobs table (Enhanced for comprehensive recruitment process)
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    position_title VARCHAR(255) NOT NULL,
    position_code VARCHAR(100) UNIQUE NOT NULL,
    level VARCHAR(100),
    grade VARCHAR(100),
    department_id INT,
    sub_department VARCHAR(255),
    process TEXT,
    reporting_to_title VARCHAR(255),
    reporting_to_manager VARCHAR(255),
    location_type ENUM('onsite', 'remote', 'hybrid') DEFAULT 'onsite',
    location_details VARCHAR(255),
    required_skills TEXT,
    experience_level VARCHAR(255),
    job_description TEXT,
    job_specification TEXT,
    number_of_vacancies INT DEFAULT 1,
    compensation_min INT,
    compensation_max INT,
    employment_type ENUM('Full-time', 'Part-time', 'Contract', 'Management Trainee', 'Internship') NOT NULL,
    hiring_deadline DATE,
    approval_authority VARCHAR(255),
    recruiter_id INT,
    workflow_template_id INT,
    recruitment_agency_id INT,
    status ENUM('Draft', 'Pending Approval', 'Approved', 'Active', 'Closed', 'Archived') DEFAULT 'Draft',
    is_remote BOOLEAN DEFAULT FALSE,
    created_by INT,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (workflow_template_id) REFERENCES recruitment_workflows(id) ON DELETE SET NULL,
    FOREIGN KEY (recruitment_agency_id) REFERENCES recruitment_agencies(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Candidates table (Enhanced for comprehensive candidate management)
CREATE TABLE IF NOT EXISTS candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    location_state VARCHAR(255),
    location_city VARCHAR(255),
    location_area VARCHAR(255),
    location_pincode VARCHAR(20),
    education_qualification_short VARCHAR(255),
    education_qualification_detailed TEXT,
    experience_years INT,
    experience_details TEXT,
    notice_period INT,
    current_compensation INT,
    expected_compensation INT,
    resume_url VARCHAR(500),
    cover_letter TEXT,
    source ENUM('Internal Career Page', 'Job Portal', 'Social Media', 'Campus Placement', 'Reference', 'Walk-in', 'WhatsApp', 'Manual Entry') DEFAULT 'Manual Entry',
    source_details VARCHAR(255),
    status ENUM('New', 'Shortlisted', 'Interviewed', 'Rejected', 'Hired', 'Pool') DEFAULT 'New',
    notes TEXT,
    is_in_pool BOOLEAN DEFAULT FALSE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Job Applications table (Enhanced)
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    job_id INT NOT NULL,
    status ENUM('Applied', 'Shortlisted', 'Interviewed', 'Rejected', 'Hired') DEFAULT 'Applied',
    cover_letter TEXT,
    resume_url VARCHAR(500),
    notes TEXT,
    recruiter_notes TEXT,
    interview_scheduled_at TIMESTAMP NULL,
    interview_conducted_at TIMESTAMP NULL,
    interview_feedback TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Job Posting Channels
CREATE TABLE IF NOT EXISTS job_posting_channels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    channel_type ENUM('Internal Career Page', 'Job Portal', 'Social Media', 'Campus Placement', 'Reference') NOT NULL,
    channel_name VARCHAR(255),
    posting_url VARCHAR(500),
    posted_at TIMESTAMP NULL,
    status ENUM('Pending', 'Posted', 'Failed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- WhatsApp Communications
CREATE TABLE IF NOT EXISTS whatsapp_communications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    message_content TEXT,
    message_type ENUM('Initial Contact', 'Follow-up', 'Interview Schedule', 'Offer Letter', 'Rejection') DEFAULT 'Initial Contact',
    status ENUM('Pending', 'Sent', 'Delivered', 'Read', 'Failed') DEFAULT 'Pending',
    sent_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO users (email, username, hashed_password, full_name, role, is_active, is_superuser) VALUES
('admin@hrms.com', 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uOe', 'Admin User', 'admin', TRUE, TRUE),
('hr.spoc@company.com', 'hr_spoc', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uOe', 'HR SPOC', 'hr_spoc', TRUE, FALSE),
('recruiter@company.com', 'recruiter', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uOe', 'Recruiter', 'recruiter', TRUE, FALSE);

INSERT INTO departments (name, sub_department) VALUES
('Engineering', 'Frontend Development'),
('Engineering', 'Backend Development'),
('Engineering', 'DevOps'),
('Product', 'Product Management'),
('Product', 'Product Design'),
('Human Resources', 'Recruitment'),
('Human Resources', 'Employee Relations'),
('Sales', 'Enterprise Sales'),
('Sales', 'SMB Sales'),
('Marketing', 'Digital Marketing'),
('Marketing', 'Content Marketing');

INSERT INTO recruitment_workflows (name, description, steps) VALUES
('Standard Engineering', 'Standard workflow for engineering positions', '["Screening", "Technical Interview", "HR Interview", "Final Round", "Offer"]'),
('Senior Management', 'Workflow for senior management positions', '["Screening", "HR Interview", "Panel Interview", "CEO Interview", "Offer"]'),
('Entry Level', 'Workflow for entry level positions', '["Screening", "HR Interview", "Technical Assessment", "Offer"]');

INSERT INTO recruitment_agencies (name, contact_person, email, phone, website) VALUES
('TechRecruit Pro', 'John Smith', 'john@techrecruitpro.com', '+1-555-123-4567', 'https://techrecruitpro.com'),
('HR Solutions Inc', 'Sarah Johnson', 'sarah@hrsolutions.com', '+1-555-234-5678', 'https://hrsolutions.com'),
('Talent Hunters', 'Mike Wilson', 'mike@talenthunters.com', '+1-555-345-6789', 'https://talenthunters.com');

INSERT INTO employees (first_name, last_name, email, phone, position, department, hire_date, salary) VALUES
('John', 'Doe', 'john.doe@company.com', '+1-555-123-4567', 'Senior Developer', 'Engineering', '2023-01-15', 120000),
('Sarah', 'Johnson', 'sarah.johnson@company.com', '+1-555-234-5678', 'Product Manager', 'Product', '2022-08-20', 130000),
('Mike', 'Wilson', 'mike.wilson@company.com', '+1-555-345-6789', 'UX Designer', 'Design', '2023-03-10', 90000),
('Emily', 'Brown', 'emily.brown@company.com', '+1-555-456-7890', 'HR Specialist', 'Human Resources', '2022-11-05', 75000);

INSERT INTO jobs (position_title, position_code, level, grade, department_id, sub_department, process, reporting_to_title, reporting_to_manager, location_type, location_details, required_skills, experience_level, job_description, job_specification, number_of_vacancies, compensation_min, compensation_max, employment_type, hiring_deadline, approval_authority, recruiter_id, workflow_template_id, recruitment_agency_id, status, created_by) VALUES
('Senior Frontend Developer', 'FE001', 'Senior', 'L3', 1, 'Frontend Development', 'Agile Development', 'Engineering Manager', 'John Doe', 'hybrid', 'San Francisco, CA', 'React, TypeScript, 3+ years experience', '3-5 years', 'We are looking for an experienced Frontend Developer to join our team.', 'Detailed job specification...', 2, 120000, 150000, 'Full-time', '2024-06-30', 'HR Director', 3, 1, 1, 'Active', 1),
('Product Manager', 'PM001', 'Mid', 'L2', 4, 'Product Management', 'Product Development', 'Senior Product Manager', 'Sarah Johnson', 'onsite', 'New York, NY', '5+ years PM experience, Agile methodology', '5-7 years', 'Lead product strategy and development for our core products.', 'Detailed job specification...', 1, 130000, 160000, 'Full-time', '2024-07-15', 'HR Director', 3, 2, 2, 'Active', 1),
('UX Designer', 'UX001', 'Junior', 'L1', 5, 'Product Design', 'Design Process', 'Design Lead', 'Mike Wilson', 'remote', 'Remote', 'Figma, user research, 2+ years experience', '2-4 years', 'Create beautiful and intuitive user experiences.', 'Detailed job specification...', 1, 90000, 120000, 'Full-time', '2024-06-15', 'HR Director', 3, 3, 3, 'Active', 1);

INSERT INTO candidates (first_name, last_name, email, phone, location_state, location_city, location_area, location_pincode, education_qualification_short, education_qualification_detailed, experience_years, experience_details, notice_period, current_compensation, expected_compensation, source, source_details, status, is_in_pool, created_by) VALUES
('Alex', 'Thompson', 'alex.thompson@email.com', '+1-555-123-4567', 'California', 'San Francisco', 'Downtown', '94102', 'B.Tech', 'Bachelor of Technology in Computer Science from Stanford University', 3, '3 years of experience in React, TypeScript, and modern frontend technologies', 30, 110000, 130000, 'Job Portal', 'Indeed.com', 'Shortlisted', FALSE, 2),
('Maria', 'Garcia', 'maria.garcia@email.com', '+1-555-234-5678', 'New York', 'New York', 'Manhattan', '10001', 'MBA', 'Master of Business Administration from NYU Stern', 5, '5 years of product management experience in tech companies', 60, 120000, 150000, 'Reference', 'Employee referral', 'Interviewed', FALSE, 2),
('David', 'Chen', 'david.chen@email.com', '+1-555-345-6789', 'Texas', 'Austin', 'Downtown', '73301', 'B.Tech', 'Bachelor of Technology in Computer Science from UT Austin', 4, '4 years of backend development experience', 45, 100000, 125000, 'Internal Career Page', 'IJP', 'Shortlisted', FALSE, 2),
('Lisa', 'Wang', 'lisa.wang@email.com', '+1-555-456-7890', 'California', 'Los Angeles', 'Santa Monica', '90401', 'B.Des', 'Bachelor of Design from Parsons School of Design', 2, '2 years of UX design experience', 30, 85000, 100000, 'Social Media', 'LinkedIn', 'New', TRUE, 2);

INSERT INTO applications (candidate_id, job_id, status, recruiter_notes) VALUES
(1, 1, 'Shortlisted', 'Strong technical skills, good cultural fit'),
(2, 2, 'Interviewed', 'Excellent product thinking, scheduled for final round'),
(3, 1, 'Shortlisted', 'Good backend experience, needs frontend assessment'),
(4, 3, 'Applied', 'Portfolio looks promising, needs interview scheduling');

INSERT INTO job_posting_channels (job_id, channel_type, channel_name, posting_url, status) VALUES
(1, 'Job Portal', 'Indeed', 'https://indeed.com/job/123', 'Posted'),
(1, 'Job Portal', 'LinkedIn', 'https://linkedin.com/job/456', 'Posted'),
(1, 'Internal Career Page', 'Company Website', 'https://company.com/careers/789', 'Posted'),
(2, 'Job Portal', 'Naukri.com', 'https://naukri.com/job/101', 'Posted'),
(3, 'Social Media', 'LinkedIn', 'https://linkedin.com/job/202', 'Posted'); 