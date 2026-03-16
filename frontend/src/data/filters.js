import { copy } from '../content/copy'

export const CATEGORY_OPTIONS = [
  { value: '', label: copy.filters.categories.all },
  { value: 'model', label: copy.filters.categories.model },
  { value: 'photographer', label: copy.filters.categories.photographer },
  { value: 'makeup artist', label: copy.filters.categories.makeupArtist },
  { value: 'tattoo artist', label: copy.filters.categories.tattooArtist },
  { value: 'creative director', label: copy.filters.categories.creativeDirector },
  { value: 'stylist', label: copy.filters.categories.stylist },
]

export const CITY_OPTIONS = [
  { value: '', label: copy.filters.cities.all },
  { value: 'Madrid', label: copy.filters.cities.madrid },
  { value: 'Barcelona', label: copy.filters.cities.barcelona },
  { value: 'Valencia', label: copy.filters.cities.valencia },
  { value: 'Sevilla', label: copy.filters.cities.sevilla },
]

export const AVAILABILITY_OPTIONS = [
  { value: '', label: copy.filters.availability.all },
  { value: 'Available', label: copy.filters.availability.available },
  { value: 'Campaign', label: copy.filters.availability.campaign },
  { value: 'Studio', label: copy.filters.availability.studio },
  { value: 'Editorial', label: copy.filters.availability.editorial },
]
