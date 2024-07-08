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
import { panTo } from "@/app/[map]/page"

// WARN: if the topojson doesn't have the points under "collection" this will fail
export default function Search({ setOpen }) {
  const cmd = useRef(null)

  function handleEnter(e) {
    if (e.code !== 'Enter') return
    const name = cmd.current.querySelector('[data-selected="true"]').textContent
    panTo(name)
    setOpen(false)
  }

  // TODO: add polygon search as well
  // can use shadcn/ui of Command groups
  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput placeholder="Type a command or search..." onKeyDown={handleEnter} />
      <CommandList style={{ height: '351px' }}>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup ref={cmd} heading="Suggestions">
          {points.objects.collection.geometries.map(({ properties }) => (
            <CommandItem key={properties.name} value={properties.name} className="cursor-pointer" onSelect={() => {
              panTo(properties.name)
              setOpen(false)
            }}>
              {properties.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command >
  )
}
