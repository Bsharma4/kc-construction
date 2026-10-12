import { IMG } from '../lib/images'

export type GalleryItem = { id: string; photo: string; alt: string; ratio: string }

/** Illustrative stock photography from Unsplash (unsplash.com/license) — not K&C job photos. */
export const GALLERY: GalleryItem[] = [
  { id: 'g1', photo: IMG.houseFraming, alt: 'House under construction with wooden framing', ratio: '3/4' },
  { id: 'g2', photo: IMG.deckTrees, alt: 'Wooden deck surrounded by green trees', ratio: '4/3' },
  { id: 'g3', photo: IMG.excavatorDirt, alt: 'Excavator on a dirt lot', ratio: '4/5' },
  { id: 'g4', photo: IMG.whiteKitchen, alt: 'Bright remodeled kitchen', ratio: '1/1' },
  { id: 'g5', photo: IMG.drivewayHouse, alt: 'Modern home with a concrete driveway', ratio: '16/10' },
  { id: 'g6', photo: IMG.fenceSky, alt: 'Wooden fence under a blue sky', ratio: '3/4' },
  { id: 'g7', photo: IMG.skidSteerDirt, alt: 'Skid steer loader moving dirt', ratio: '2/3' },
  { id: 'g8', photo: IMG.patioCovered, alt: 'Covered backyard patio with a grill', ratio: '4/3' },
  { id: 'g9', photo: IMG.houseLawn, alt: 'Modern house with a large green lawn', ratio: '4/3' },
  { id: 'g10', photo: IMG.sod, alt: 'Fresh sod being laid by hand', ratio: '1/1' },
  { id: 'g11', photo: IMG.framingInterior, alt: 'Interior wall framing during construction', ratio: '4/5' },
  { id: 'g12', photo: IMG.dumpTruckDirt, alt: 'Dump truck unloading dirt on a job site', ratio: '3/4' },
]
