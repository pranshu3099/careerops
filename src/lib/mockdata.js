export const mockSummary = {
  totalApplications: 42,
  interviewsScheduled: 8,
  offersReceived: 3,
  rejections: 12,
};

export const mockApplications = [
  {
    id: 1,
    company: 'Google',
    role: 'Software Engineer',
    status: 'Interview',
    appliedDate: '2026-04-10',
  },
  {
    id: 2,
    company: 'Microsoft',
    role: 'Product Manager',
    status: 'Applied',
    appliedDate: '2026-04-08',
  },
  {
    id: 3,
    company: 'Amazon',
    role: 'Backend Developer',
    status: 'Offer',
    appliedDate: '2026-04-05',
  },
  {
    id: 4,
    company: 'Meta',
    role: 'Frontend Engineer',
    status: 'Rejected',
    appliedDate: '2026-04-03',
  },
  {
    id: 5,
    company: 'Apple',
    role: 'iOS Developer',
    status: 'Interview',
    appliedDate: '2026-04-01',
  },
];

export const mockFollowUps = [
  {
    id: 1,
    company: 'Stripe',
    message: 'Follow up on the interview feedback',
    date: '2026-04-18',
    urgent: true,
  },
  {
    id: 2,
    company: 'OpenAI',
    message: 'Check application status',
    date: '2026-04-22',
    urgent: false,
  },
  {
    id: 3,
    company: 'Netflix',
    message: 'Schedule second interview',
    date: '2026-04-15',
    urgent: false,
  },
];

export const mockBarData = [
  { week: 'Mar 31', applications: 5 },
  { week: 'Apr 7', applications: 8 },
  { week: 'Apr 14', applications: 12 },
  { week: 'Apr 21', applications: 7 },
  { week: 'Apr 28', applications: 10 },
];

export const mockPieData = [
  { name: 'Applied', value: 19 },
  { name: 'Interview', value: 8 },
  { name: 'Offer', value: 3 },
  { name: 'Rejected', value: 12 },
];