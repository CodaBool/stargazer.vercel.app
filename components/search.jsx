import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { points } from '@/app/data.js'
import { useRef } from "react"

function getCoordindates(name) {
  return points.objects.points.geometries.find(p => (
    p.properties.name === name
  )).coordinates
}

const locations = points.objects.points.geometries.map(p => (
  p.properties.name
))

export default function Search({panTo, setOpen}) {
  const cmd = useRef(null)

  function handleEnter() {
    const name = cmd.current.querySelector('[data-selected="true"]').textContent
    panTo(getCoordindates(name))
    setOpen(false)
  }

  // TODO: add polygon search as well
  // can use shadcn/ui of Command groups
  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput placeholder="Type a command or search..." onKeyDown={e => { if (e.code === 'Enter') handleEnter()}} />
      <CommandList style={{height: '351px'}}>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup ref={cmd} heading="Suggestions">
          {locations.map(location => (
            <CommandItem key={location} value={location} className="cursor-pointer" onSelect={() => {
              // TODO: validate coords
              panTo(getCoordindates(location))
              setOpen(false)
            }}>
              {location}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
