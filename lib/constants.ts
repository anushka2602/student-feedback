export const TEACHERS = [
  'Er. Supreet Saini',
  'Er. Surinder Kaur',
  'Er. Venkatesh',
  'Er. Gurmeet Kaur',
  'Er. Jaspreet Singh',
  'Er. Alisha',
  'Ms. Komal Dhiman',
  'Er. Anu Kaushik',
  'Er. Ashish Agrawal',
]

export const TIMETABLE = 'Timetable Management'
export const ACADEMIC_ITEMS = [...TEACHERS, TIMETABLE]

export const TEACHER_FACTORS = [
  'Clarity',
  'Subject Knowledge',
  'Communication Skills',
  'Approachability',
  'Punctuality',
  'Engagement and Interaction',
  'Teaching Method',
  'Content Quality',
]
export const TIMETABLE_FACTORS = ['Overall Rating']
export const ALL_FACTORS = [...TEACHER_FACTORS, ...TIMETABLE_FACTORS]

export const factorsFor = (item: string) => (item === TIMETABLE ? TIMETABLE_FACTORS : TEACHER_FACTORS)

export const FACTOR_HINTS: Record<string, string> = {
  Clarity: 'Explains topics so they are easy to follow',
  'Subject Knowledge': 'Depth and accuracy of what is taught',
  'Communication Skills': 'Speaks clearly and listens well',
  Approachability: 'Comfortable to ask questions or ask for help',
  Punctuality: 'Starts and ends classes on time',
  'Engagement and Interaction': 'Keeps the class involved',
  'Teaching Method': 'Examples, pace and use of tools',
  'Content Quality': 'Notes, slides and assignments',
  'Overall Rating': 'How well the timetable works for you',
}

export const NON_ACADEMIC_CATEGORIES = [
  'Infrastructure',
  'Cleanliness and Hygiene',
  'Peer Interaction',
  'Safety and Security',
  'Availability of Wi-Fi',
  'Cleanliness in Food and Drinking Water',
  'Extracurricular Opportunities',
  'Administration and Management',
]

export const CATEGORY_META: Record<string, { icon: string; hint: string }> = {
  Infrastructure: { icon: 'building', hint: 'Classrooms, labs, seating and buildings' },
  'Cleanliness and Hygiene': { icon: 'sparkles', hint: 'Washrooms, corridors and classrooms' },
  'Peer Interaction': { icon: 'users', hint: 'How students get along and work together' },
  'Safety and Security': { icon: 'lock', hint: 'Campus access, supervision and feeling safe' },
  'Availability of Wi-Fi': { icon: 'wifi', hint: 'Coverage and speed where you study' },
  'Cleanliness in Food and Drinking Water': { icon: 'utensils', hint: 'Canteen food and water quality' },
  'Extracurricular Opportunities': { icon: 'star', hint: 'Clubs, sports, events and societies' },
  'Administration and Management': { icon: 'clipboard', hint: 'Office support, fees and responsiveness' },
}
