export type ProcessStep = { n: string; title: string; text: string; points: string[] }

export const PROCESS: ProcessStep[] = [
  { n: '01', title: 'Call for a Bid', text: 'Tell us about your project. We listen first — goals, property, timing and budget range.', points: ['Phone or form', 'Site visit', 'Your priorities'] },
  { n: '02', title: 'Bid & Planning', text: 'You receive a clear bid and a plan for how the work will be done.', points: ['Clear scope', 'Materials', 'Scheduling'] },
  { n: '03', title: 'Site Preparation', text: 'Excavation, Bobcat work, hauling and grading get the ground ready before anything is built.', points: ['Excavation', 'Bobcat work', 'Land grading'] },
  { n: '04', title: 'Foundation & Structural Work', text: 'Footings, slabs and the structure go in — the part of a home you never see again.', points: ['Footings & slab', 'Framing', 'Inspections'] },
  { n: '05', title: 'Build & Install', text: 'Framing, roofing, remodels, decks, concrete and fencing — done hands-on by our team.', points: ['Framing & roofing', 'Concrete & decks', 'Remodel work'] },
  { n: '06', title: 'Finish & Landscape', text: 'Exterior finishes, grading, sod and fencing complete the property.', points: ['Final grade', 'Landscaping', 'Clean-up'] },
  { n: '07', title: 'Final Walk-Through', text: 'We walk the finished project with you and make sure you are happy with the result.', points: ['Walk-through', 'Punch list', 'Ongoing contact'] },
]
