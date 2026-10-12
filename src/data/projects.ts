import { IMG } from '../lib/images'

export type ProjectCategory = 'Homes' | 'Remodeling' | 'Outdoor Living' | 'Site Work'

export type Project = {
  id: string
  title: string
  category: ProjectCategory
  location: string
  scope: string[]
  summary: string
  description: string
  cover: string
  gallery: string[]
}

/**
 * ILLUSTRATIVE CONCEPTS — stock photography showing the type of work offered.
 * These are NOT completed K&S Construction projects. Replace with real job photos when available.
 */
export const PROJECTS: Project[] = [
  {
    id: 'custom-home',
    title: 'Custom Family Home',
    category: 'Homes',
    location: 'Illustrative concept',
    scope: ['Excavation', 'Foundation', 'Framing to finish'],
    summary: 'A new home built from the ground up, start to finish.',
    description:
      'An example of a ground-up residential build: site excavation and grading, a poured foundation, framing, roofing, exterior finishes and final landscaping — coordinated by one local team.',
    cover: IMG.houseLawn,
    gallery: [IMG.houseLawn, IMG.houseFraming, IMG.framingInterior, IMG.modernHouse],
  },
  {
    id: 'kitchen-remodel',
    title: 'Whole-Home Remodel',
    category: 'Remodeling',
    location: 'Illustrative concept',
    scope: ['Kitchen', 'Living spaces', 'Finish carpentry'],
    summary: 'An older layout opened up and refreshed.',
    description:
      'An example of a remodeling project: walls reconfigured for an open kitchen and living area, new cabinetry and surfaces, and trim work finished by hand.',
    cover: IMG.whiteKitchen,
    gallery: [IMG.whiteKitchen, IMG.renovationKitchen, IMG.carpentry, IMG.livingRoom],
  },
  {
    id: 'backyard-deck',
    title: 'Backyard Deck & Patio',
    category: 'Outdoor Living',
    location: 'Illustrative concept',
    scope: ['Deck framing', 'Patio', 'Outdoor living'],
    summary: 'An outdoor living space for grilling, gathering and relaxing.',
    description:
      'An example of an outdoor living project: a solid deck structure with railings and stairs, a covered patio area and a layout planned around how the family uses the yard.',
    cover: IMG.deckTrees,
    gallery: [IMG.deckTrees, IMG.deckTable, IMG.patioCovered, IMG.patioTable],
  },
  {
    id: 'concrete-driveway',
    title: 'Concrete Driveway',
    category: 'Site Work',
    location: 'Illustrative concept',
    scope: ['Excavation', 'Base prep', 'Concrete'],
    summary: 'A clean, durable driveway with proper base and drainage.',
    description:
      'An example of a concrete project: excavating the old surface, building a compacted base, then forming, pouring and finishing a new driveway with control joints.',
    cover: IMG.drivewayHouse,
    gallery: [IMG.drivewayHouse, IMG.drivewayGarage, IMG.skidSteerGravel, IMG.dumpTruckDirt],
  },
  {
    id: 'fence-landscape',
    title: 'Fencing & Landscaping',
    category: 'Outdoor Living',
    location: 'Illustrative concept',
    scope: ['Fence install', 'Sod & beds', 'Final grade'],
    summary: 'A finished yard with a new fence line and fresh lawn.',
    description:
      'An example of a yard finishing project: setting a straight, sturdy fence, grading for drainage and laying sod and planting beds for a property that looks complete.',
    cover: IMG.fenceGrass,
    gallery: [IMG.fenceGrass, IMG.fenceSky, IMG.sod, IMG.gardenPath],
  },
  {
    id: 'lot-prep',
    title: 'Lot Excavation & Grading',
    category: 'Site Work',
    location: 'Illustrative concept',
    scope: ['Bobcat work', 'Excavation', 'Land grading'],
    summary: 'Ground prepared properly before anything is built.',
    description:
      'An example of site preparation: clearing, excavating for a foundation, hauling excess material and grading the lot so water drains away from the future structure.',
    cover: IMG.dozerHouse,
    gallery: [IMG.dozerHouse, IMG.excavatorDirt, IMG.skidSteerDirt, IMG.dozerField],
  },
]

export const PROJECT_FILTERS: ('All' | ProjectCategory)[] = ['All', 'Homes', 'Remodeling', 'Outdoor Living', 'Site Work']
