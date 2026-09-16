// Standard class options used throughout the application
// Values match the format stored in database (e.g., '10th' not '10th standard')
export const STANDARDS = [
  '6th',
  '7th',
  '8th',
  '9th',
  '10th',
  '11th',
  '12th'
] as const;

export const STANDARD_LABELS: Record<string, string> = {
  '6th': '6th Standard',
  '7th': '7th Standard',
  '8th': '8th Standard',
  '9th': '9th Standard',
  '10th': '10th Standard',
  '11th': '11th Standard',
  '12th': '12th Standard'
};

export type StandardType = typeof STANDARDS[number];
