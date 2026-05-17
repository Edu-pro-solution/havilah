export const employees = [
  { id: "EMP001", name: "Aisha Mohammed", email: "aisha@targetpath.com", department: "Laboratory", location: "Lagos Main", role: "Lab Scientist", status: "Active", createdAt: "2024-01-15", salary: 350000, phone: "08012345678" },
  { id: "EMP002", name: "Chinedu Okoro", email: "chinedu@targetpath.com", department: "Laboratory", location: "Lagos Main", role: "Lab Technician", status: "Active", createdAt: "2024-02-20", salary: 250000, phone: "08023456789" },
  { id: "EMP003", name: "Blessing Okafor", email: "blessing@targetpath.com", department: "Reception", location: "Abuja Branch", role: "Front Desk Officer", status: "Active", createdAt: "2024-03-10", salary: 180000, phone: "08034567890" },
  { id: "EMP004", name: "Ibrahim Suleiman", email: "ibrahim@targetpath.com", department: "Finance", location: "Lagos Main", role: "Accountant", status: "Active", createdAt: "2023-11-05", salary: 400000, phone: "08045678901" },
  { id: "EMP005", name: "Grace Eze", email: "grace@targetpath.com", department: "IT", location: "Lagos Main", role: "System Admin", status: "Active", createdAt: "2023-09-15", salary: 450000, phone: "08056789012" },
  { id: "EMP006", name: "Yusuf Abdullahi", email: "yusuf@targetpath.com", department: "Laboratory", location: "Abuja Branch", role: "Phlebotomist", status: "Active", createdAt: "2024-04-01", salary: 200000, phone: "08067890123" },
  { id: "EMP007", name: "Ngozi Nwankwo", email: "ngozi@targetpath.com", department: "Sales", location: "Lagos Main", role: "Marketing Officer", status: "Active", createdAt: "2024-01-20", salary: 280000, phone: "08078901234" },
  { id: "EMP008", name: "David Ogunleye", email: "david@targetpath.com", department: "Logistics", location: "Lagos Main", role: "Dispatch Rider", status: "Suspended", createdAt: "2023-08-10", salary: 150000, phone: "08089012345" },
  { id: "EMP009", name: "Fatima Bello", email: "fatima@targetpath.com", department: "Laboratory", location: "Lagos Main", role: "Microbiologist", status: "Active", createdAt: "2024-05-12", salary: 380000, phone: "08090123456" },
  { id: "EMP010", name: "Oluwaseun Adeyemi", email: "seun@targetpath.com", department: "Reception", location: "Lagos Main", role: "Customer Service", status: "Active", createdAt: "2024-06-01", salary: 170000, phone: "08001234567" },
];

export const departments = [
  { id: "1", name: "Laboratory", head: "Dr. Funke Akindele", staffCount: 45, createdAt: "2020-01-01" },
  { id: "2", name: "Reception", head: "Mrs. Adaeze Uche", staffCount: 12, createdAt: "2020-01-01" },
  { id: "3", name: "Finance", head: "Mr. Chukwudi Obi", staffCount: 8, createdAt: "2020-01-01" },
  { id: "4", name: "Logistics", head: "Mr. Emeka Nnamdi", staffCount: 15, createdAt: "2020-06-15" },
  { id: "5", name: "Sales", head: "Mrs. Binta Hassan", staffCount: 10, createdAt: "2021-03-01" },
  { id: "6", name: "IT", head: "Mr. Tunde Bakare", staffCount: 6, createdAt: "2020-01-01" },
  { id: "7", name: "Human Resources", head: "Edana Admin", staffCount: 4, createdAt: "2020-01-01" },
];

export const jobPositions = [
  { id: "1", title: "Lab Scientist", department: "Laboratory", location: "Lagos Main", applications: 24, datePosted: "2026-02-15", status: "Open", type: "Full-time" },
  { id: "2", title: "Phlebotomist", department: "Laboratory", location: "Abuja Branch", applications: 18, datePosted: "2026-02-20", status: "Open", type: "Full-time" },
  { id: "3", title: "Front Desk Officer", department: "Reception", location: "Lagos Main", applications: 32, datePosted: "2026-01-10", status: "Closed", type: "Full-time" },
  { id: "4", title: "IT Support", department: "IT", location: "Lagos Main", applications: 15, datePosted: "2026-03-01", status: "Open", type: "Contract" },
  { id: "5", title: "Dispatch Rider", department: "Logistics", location: "Lagos Main", applications: 40, datePosted: "2026-03-05", status: "Open", type: "Full-time" },
];

export const candidates = [
  { id: "1", name: "Amara Obi", email: "amara@gmail.com", phone: "08111222333", position: "Lab Scientist", applicationDate: "2026-02-18", stage: "Final Interview", status: "Active" },
  { id: "2", name: "Kunle Adesanya", email: "kunle@gmail.com", phone: "08222333444", position: "Lab Scientist", applicationDate: "2026-02-19", stage: "Screening", status: "Active" },
  { id: "3", name: "Zainab Musa", email: "zainab@gmail.com", phone: "08333444555", position: "Phlebotomist", applicationDate: "2026-02-22", stage: "First Interview", status: "Active" },
  { id: "4", name: "Emmanuel Udo", email: "emmanuel@gmail.com", phone: "08444555666", position: "IT Support", applicationDate: "2026-03-02", stage: "Screening", status: "Active" },
  { id: "5", name: "Chioma Nwosu", email: "chioma@gmail.com", phone: "08555666777", position: "Front Desk Officer", applicationDate: "2026-01-12", stage: "Offer Sent", status: "Hired" },
  { id: "6", name: "Abdulrahman Garba", email: "abdul@gmail.com", phone: "08666777888", position: "Dispatch Rider", applicationDate: "2026-03-06", stage: "Screening", status: "Active" },
];

export const interviews = [
  { id: "1", candidateName: "Amara Obi", position: "Lab Scientist", type: "Final Interview", date: "2026-03-15", time: "10:00 AM", interviewers: "Dr. Funke Akindele, CEO", status: "Scheduled", location: "Lagos Main Office" },
  { id: "2", candidateName: "Zainab Musa", position: "Phlebotomist", type: "Department Interview", date: "2026-03-14", time: "2:00 PM", interviewers: "Dr. Funke Akindele", status: "Scheduled", location: "Virtual - Zoom" },
  { id: "3", candidateName: "Emmanuel Udo", position: "IT Support", type: "HR Interview", date: "2026-03-13", time: "11:00 AM", interviewers: "Dr. Adebayo Ogundimu", status: "Completed", location: "Lagos Main Office" },
  { id: "4", candidateName: "Kunle Adesanya", position: "Lab Scientist", type: "HR Interview", date: "2026-03-16", time: "9:00 AM", interviewers: "HR Team", status: "Pending", location: "Virtual - Teams" },
];

export const payrollData = [
  { id: "1", staffName: "Aisha Mohammed", department: "Laboratory", salary: 350000, allowances: 50000, deductions: 35000, netSalary: 365000, status: "Paid" },
  { id: "2", staffName: "Chinedu Okoro", department: "Laboratory", salary: 250000, allowances: 30000, deductions: 25000, netSalary: 255000, status: "Paid" },
  { id: "3", staffName: "Blessing Okafor", department: "Reception", salary: 180000, allowances: 20000, deductions: 18000, netSalary: 182000, status: "Pending" },
  { id: "4", staffName: "Ibrahim Suleiman", department: "Finance", salary: 400000, allowances: 60000, deductions: 40000, netSalary: 420000, status: "Paid" },
  { id: "5", staffName: "Grace Eze", department: "IT", salary: 450000, allowances: 70000, deductions: 45000, netSalary: 475000, status: "Pending" },
  { id: "6", staffName: "Yusuf Abdullahi", department: "Laboratory", salary: 200000, allowances: 25000, deductions: 20000, netSalary: 205000, status: "Paid" },
];

export const leaveRequests = [
  { id: "1", staffName: "Aisha Mohammed", department: "Laboratory", leaveType: "Annual Leave", startDate: "2026-03-20", endDate: "2026-03-27", status: "Pending", reason: "Family vacation" },
  { id: "2", staffName: "Grace Eze", department: "IT", leaveType: "Sick Leave", startDate: "2026-03-10", endDate: "2026-03-12", status: "Approved", reason: "Medical appointment" },
  { id: "3", staffName: "Ngozi Nwankwo", department: "Sales", leaveType: "Annual Leave", startDate: "2026-04-01", endDate: "2026-04-05", status: "Pending", reason: "Personal matters" },
  { id: "4", staffName: "Chinedu Okoro", department: "Laboratory", leaveType: "Maternity Leave", startDate: "2026-05-01", endDate: "2026-08-01", status: "Approved", reason: "Maternity" },
  { id: "5", staffName: "Ibrahim Suleiman", department: "Finance", leaveType: "Sick Leave", startDate: "2026-03-08", endDate: "2026-03-09", status: "Rejected", reason: "Insufficient documentation" },
];

export const guarantors = [
  { id: "1", staffName: "Aisha Mohammed", guarantorName: "Mr. Ahmed Mohammed", phone: "08011112222", address: "12 Broad Street, Lagos", relationship: "Father" },
  { id: "2", staffName: "Chinedu Okoro", guarantorName: "Mrs. Nkechi Okoro", phone: "08022223333", address: "5 Park Lane, Enugu", relationship: "Mother" },
  { id: "3", staffName: "Grace Eze", guarantorName: "Dr. Peter Eze", phone: "08033334444", address: "8 Ring Road, Benin", relationship: "Brother" },
  { id: "4", staffName: "Ibrahim Suleiman", guarantorName: "Alhaji Suleiman Baba", phone: "08044445555", address: "15 Sultan Road, Kaduna", relationship: "Father" },
];

export const roles = [
  { id: "1", name: "HR Admin", assignedUsers: 2, permissionsCount: 45, createdDate: "2020-01-01", description: "Full access to HR module" },
  { id: "2", name: "Department Head", assignedUsers: 7, permissionsCount: 20, createdDate: "2020-01-01", description: "Department-level access" },
  { id: "3", name: "Finance Officer", assignedUsers: 3, permissionsCount: 12, createdDate: "2020-06-15", description: "Payroll and finance access" },
  { id: "4", name: "Lab Scientist", assignedUsers: 25, permissionsCount: 8, createdDate: "2020-01-01", description: "Laboratory operations" },
  { id: "5", name: "Receptionist", assignedUsers: 10, permissionsCount: 6, createdDate: "2021-03-01", description: "Front desk operations" },
];

export const onboardingPipeline = [
  { id: "1", candidateName: "Chioma Nwosu", position: "Front Desk Officer", stage: "Contract Signing", startDate: "2026-03-18" },
  { id: "2", candidateName: "Amara Obi", position: "Lab Scientist", stage: "Offer Accepted", startDate: "2026-03-20" },
];

export const activityFeed = [
  { id: "1", type: "hire", message: "Chioma Nwosu accepted offer for Front Desk Officer", time: "2 hours ago" },
  { id: "2", type: "leave", message: "Grace Eze's sick leave approved", time: "4 hours ago" },
  { id: "3", type: "job", message: "New position posted: IT Support", time: "1 day ago" },
  { id: "4", type: "payroll", message: "March payroll processing started", time: "1 day ago" },
  { id: "5", type: "hire", message: "Emmanuel Udo completed HR interview", time: "2 days ago" },
  { id: "6", type: "leave", message: "Ibrahim Suleiman's leave request rejected", time: "3 days ago" },
];

export const staffDistributionData = [
  { department: "Lab", count: 45 },
  { department: "Reception", count: 12 },
  { department: "Finance", count: 8 },
  { department: "Logistics", count: 15 },
  { department: "Sales", count: 10 },
  { department: "IT", count: 6 },
  { department: "HR", count: 4 },
];

export const recruitmentPipelineData = [
  { stage: "Applications", count: 129 },
  { stage: "Screening", count: 45 },
  { stage: "1st Interview", count: 22 },
  { stage: "Final Interview", count: 8 },
  { stage: "Offer Sent", count: 3 },
];
