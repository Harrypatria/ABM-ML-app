/**
 * CSV Loader for the Attached IBM HR Employee Attrition Dataset
 * Directly loads and parses /assets/aistudio/HR-Employee-Attrition__2__a5c31e38.csv (1,470 records).
 */

import {
  EmployeeProfile,
  DepartmentType,
  JobRoleType,
  MaritalStatusType,
  BusinessTravelType,
  GenderType,
  OverTimeType,
} from '../types';

export const ATTACHED_CSV_PATH = '/assets/aistudio/HR-Employee-Attrition__2__a5c31e38.csv';

// Deterministic name lists for creating realistic personas for all 1,470 employees
const FIRST_NAMES_MALE = [
  'James', 'Michael', 'Robert', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Daniel',
  'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Andrew', 'Paul', 'Joshua', 'Kenneth', 'Kevin',
  'Brian', 'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan', 'Jacob', 'Gary',
  'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin', 'Samuel',
  'Gregory', 'Alexander', 'Frank', 'Patrick', 'Raymond', 'Jack', 'Dennis', 'Jerry', 'Tyler', 'Aaron',
];

const FIRST_NAMES_FEMALE = [
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
  'Lisa', 'Nancy', 'Betty', 'Sandra', 'Margaret', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle',
  'Carol', 'Amanda', 'Dorothy', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Cynthia',
  'Kathleen', 'Amy', 'Angela', 'Shirley', 'Anna', 'Brenda', 'Pamela', 'Emma', 'Nicole', 'Helen',
  'Samantha', 'Katherine', 'Christine', 'Debra', 'Rachel', 'Carolyn', 'Janet', 'Catherine', 'Maria', 'Heather',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
];

function generateDeterministicName(empNum: number, gender: GenderType): string {
  const firstPool = gender === 'Female' ? FIRST_NAMES_FEMALE : FIRST_NAMES_MALE;
  const firstName = firstPool[empNum % firstPool.length];
  const lastName = LAST_NAMES[(Math.floor(empNum * 7) + 13) % LAST_NAMES.length];
  return `${firstName} ${lastName}`;
}

/**
 * Parses raw CSV text from the IBM HR dataset format into typed EmployeeProfile objects
 */
export function parseHrCsv(csvText: string): EmployeeProfile[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headerLine = lines[0];
  const headers = headerLine.split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const headerMap: Record<string, number> = {};
  headers.forEach((h, idx) => {
    headerMap[h] = idx;
  });

  const employees: EmployeeProfile[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Handle commas properly (standard split is sufficient because no quoted commas in this dataset)
    const cols = rawLine.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    if (cols.length < headers.length - 2) continue;

    const getVal = (name: string, fallback: string = ''): string => {
      const idx = headerMap[name];
      return idx !== undefined && cols[idx] !== undefined ? cols[idx] : fallback;
    };

    const getNum = (name: string, fallback: number = 0): number => {
      const val = parseFloat(getVal(name, `${fallback}`));
      return isNaN(val) ? fallback : val;
    };

    const empNumber = getNum('EmployeeNumber', i);
    const gender = (getVal('Gender', 'Male') === 'Female' ? 'Female' : 'Male') as GenderType;
    const fullName = generateDeterministicName(empNumber, gender);

    // Validate and cast categorical types
    let dept: DepartmentType = 'Research & Development';
    const rawDept = getVal('Department', 'Research & Development');
    if (rawDept.includes('Sales')) dept = 'Sales';
    else if (rawDept.includes('Human Resources')) dept = 'Human Resources';

    let jobRole: JobRoleType = 'Research Scientist';
    const rawRole = getVal('JobRole', 'Research Scientist');
    const roleCandidates: JobRoleType[] = [
      'Sales Executive',
      'Research Scientist',
      'Laboratory Technician',
      'Manufacturing Director',
      'Healthcare Representative',
      'Manager',
      'Sales Representative',
      'Research Director',
      'Human Resources',
    ];
    for (const r of roleCandidates) {
      if (rawRole.toLowerCase() === r.toLowerCase()) {
        jobRole = r;
        break;
      }
    }

    let maritalStatus: MaritalStatusType = 'Married';
    const rawMarital = getVal('MaritalStatus', 'Married');
    if (rawMarital === 'Single' || rawMarital === 'Divorced') {
      maritalStatus = rawMarital;
    }

    let travel: BusinessTravelType = 'Travel_Rarely';
    const rawTravel = getVal('BusinessTravel', 'Travel_Rarely');
    if (rawTravel === 'Travel_Frequently' || rawTravel === 'Non-Travel') {
      travel = rawTravel;
    }

    const overTime: OverTimeType = getVal('OverTime', 'No') === 'Yes' ? 'Yes' : 'No';
    const actualAttrition: 'Yes' | 'No' = getVal('Attrition', 'No') === 'Yes' ? 'Yes' : 'No';

    const profile: EmployeeProfile = {
      id: `emp-csv-${empNumber}`,
      employeeRef: `EMP-${String(empNumber).padStart(4, '0')}`,
      fullName,
      age: getNum('Age', 35),
      gender,
      maritalStatus,
      distanceFromHome: getNum('DistanceFromHome', 5),
      department: dept,
      jobRole,
      jobLevel: Math.min(5, Math.max(1, Math.round(getNum('JobLevel', 2)))),
      jobInvolvement: Math.min(4, Math.max(1, Math.round(getNum('JobInvolvement', 3)))),
      monthlyIncome: getNum('MonthlyIncome', 5000),
      stockOptionLevel: Math.min(3, Math.max(0, Math.round(getNum('StockOptionLevel', 0)))),
      percentSalaryHike: getNum('PercentSalaryHike', 15),
      jobSatisfaction: Math.min(4, Math.max(1, Math.round(getNum('JobSatisfaction', 3)))),
      workLifeBalance: Math.min(4, Math.max(1, Math.round(getNum('WorkLifeBalance', 3)))),
      environmentSatisfaction: Math.min(4, Math.max(1, Math.round(getNum('EnvironmentSatisfaction', 3)))),
      relationshipSatisfaction: Math.min(4, Math.max(1, Math.round(getNum('RelationshipSatisfaction', 3)))),
      yearsAtCompany: getNum('YearsAtCompany', 5),
      yearsInRole: getNum('YearsInCurrentRole', getNum('YearsAtCompany', 3)),
      yearsSinceLastPromotion: getNum('YearsSinceLastPromotion', 1),
      yearsWithCurrManager: getNum('YearsWithCurrManager', 3),
      totalWorkingYears: getNum('TotalWorkingYears', 10),
      numCompaniesWorked: getNum('NumCompaniesWorked', 2),
      performanceRating: Math.min(4, Math.max(3, Math.round(getNum('PerformanceRating', 3)))),
      trainingTimesLastYear: Math.min(6, Math.max(0, Math.round(getNum('TrainingTimesLastYear', 2)))),
      overTime,
      businessTravel: travel,
      actualAttrition,
      dailyRate: getNum('DailyRate', 800),
      education: Math.min(5, Math.max(1, Math.round(getNum('Education', 3)))),
      educationField: getVal('EducationField', 'Life Sciences'),
      hourlyRate: getNum('HourlyRate', 65),
      monthlyRate: getNum('MonthlyRate', 14000),
    };

    employees.push(profile);
  }

  return employees;
}

/**
 * Loads the attached CSV file from public/assets/aistudio/...
 */
export async function loadAttachedDataset(): Promise<EmployeeProfile[]> {
  try {
    const response = await fetch(ATTACHED_CSV_PATH);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: Failed to fetch attached CSV`);
    }
    const csvText = await response.text();
    const parsed = parseHrCsv(csvText);
    return parsed;
  } catch (err) {
    console.warn('Failed to load attached dataset from path, checking alternatives:', err);
    throw err;
  }
}
