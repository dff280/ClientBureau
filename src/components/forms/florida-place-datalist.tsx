import { floridaLocationLabel, floridaPlaceRecords } from "@/lib/florida-geography"

interface FloridaPlaceDatalistProps {
  id: string
}

export function FloridaPlaceDatalist({ id }: FloridaPlaceDatalistProps) {
  return (
    <datalist id={id}>
      {floridaPlaceRecords.map((place) => (
        <option key={place.geoid} value={place.name}>
          {floridaLocationLabel(place)}
        </option>
      ))}
    </datalist>
  )
}
