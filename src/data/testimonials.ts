/**
 * CUSTOMER REVIEWS
 * Add real, verified reviews here (e.g. copied with permission from the K&C Construction Facebook page).
 * Do not add invented reviews. While this list is empty the Reviews section shows an invitation instead.
 *
 * Example entry:
 * { id: 'r1', name: 'First L.', category: 'Deck & Patio', rating: 5, quote: '…', source: 'Facebook' }
 */
export type Testimonial = {
  id: string
  name: string
  category: string
  rating?: 1 | 2 | 3 | 4 | 5
  quote: string
  source?: string
}

export const TESTIMONIALS: Testimonial[] = []
