import { House, Hammer, Fence, Shovel, Truck, Trees, Construction, DraftingCompass, Tractor, Mountain, Armchair, type LucideIcon } from 'lucide-react'
import { IMG } from '../lib/images'

export type ServiceCategory = 'Homes & Remodeling' | 'Outdoor Living' | 'Site Work'

export type Service = {
  title: string
  description: string
  icon: LucideIcon
  category: ServiceCategory
  photo?: string
}

export const SERVICES: Service[] = [
  { title: 'Custom Residential Projects', description: 'One-of-a-kind projects planned around your property, your family and the way you live.', icon: DraftingCompass, category: 'Homes & Remodeling', photo: IMG.houseLawn },
  { title: 'Residential Construction', description: 'Solid, well-built homes and structures — from the footings to the finish work.', icon: House, category: 'Homes & Remodeling', photo: IMG.houseFraming },
  { title: 'Home Remodeling', description: 'Kitchens, living spaces and whole-home updates done with care and clean job sites.', icon: Hammer, category: 'Homes & Remodeling', photo: IMG.renovationKitchen },
  { title: 'Decks & Patios', description: 'Outdoor spaces built for family dinners, weekend cookouts and years of use.', icon: Armchair, category: 'Outdoor Living', photo: IMG.deckTrees },
  { title: 'Concrete Work', description: 'Driveways, slabs, sidewalks and foundations formed and finished right.', icon: Construction, category: 'Site Work', photo: IMG.drivewayGarage },
  { title: 'Excavation', description: 'Digging for foundations, utilities and drainage with care for the rest of your yard.', icon: Shovel, category: 'Site Work', photo: IMG.excavatorDirt },
  { title: 'Bobcat Work', description: 'Compact equipment for tight spaces — clearing, moving material and prep work.', icon: Tractor, category: 'Site Work', photo: IMG.skidSteerDirt },
  { title: 'Light Hauling', description: 'Dirt, rock, debris and materials moved where they need to go.', icon: Truck, category: 'Site Work', photo: IMG.dumpTruckRoad },
  { title: 'Landscaping', description: 'Lawns, beds and finishing touches that make a property feel complete.', icon: Trees, category: 'Outdoor Living', photo: IMG.sod },
  { title: 'Fencing', description: 'Privacy, security and a clean property line, set straight and built to last.', icon: Fence, category: 'Outdoor Living', photo: IMG.fenceSky },
  { title: 'Land Grading', description: 'Proper slope and drainage so water moves away from your home — not toward it.', icon: Mountain, category: 'Site Work', photo: IMG.dozerField },
]

export const SERVICE_CATEGORIES: ServiceCategory[] = ['Homes & Remodeling', 'Outdoor Living', 'Site Work']
