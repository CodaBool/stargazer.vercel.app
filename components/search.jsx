import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
} from "lucide-react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { useState } from "react";

export default function Search() {
  const all = ['Oberon', 'Uranus', 'Saturn', 'Jupiter', 'Mars', 'Mercury', 'Ras Shamra', 'Whiteharbor', 'Amurru', 'Ugarit', 'Sheridan', 'Eber-Nari', 'Karrakis', 'Arrudye', 'Ispahsala', 'Tilimsan', 'Khayradin', 'Umara', 'Begum', 'Bo', 'The Stand', 'Pyxis', 'Alhambra', 'Iserlohn', 'Ventrum', 'Shah', 'Alluwlua', 'Hur', 'Caladesh', 'Capitol', 'Cradle', 'Carina', 'Vela', 'Hermes', 'Sigmund', 'Jabal', 'San Simian', 'Mesa', 'Xirimiri', 'Maseca', 'Alif-Baa', 'Io', 'Europa', 'Ganymede', 'Titan', 'Rhea', 'Enceladus', 'Titania', 'Luna', 'cradle', 'Hercynia', 'Creighton', 'Eyalet I', 'Eyalet-A', 'Serajevo', 'Mesyats', 'Allan Hon', 'Sink', 'New Victoria', 'Nanaimo', 'Kollam', 'Erudite', 'New Mahangaatuamatua', 'Iwi', 'Hilda', 'Maw', 'Lycia', 'Necessity', 'Issac', "Barnham's Mettle", 'Wali', 'Hadii', 'Verdevilla', 'Sindh', 'Paran', 'Ajyad', 'Bethel', 'Sicard', 'Myrrh', 'Syracuse', 'New Cyprus', 'Ashkelon', 'Means', 'Annapurna', "M'Goun", 'Dawn Throne', 'Dusk', 'Harvest', 'Cornucopia', 'Borea', 'Dodona', "Bijan's World", 'Calvary', 'Kangchenjunga', 'Agamemnon', 'Barr', 'New Madrassa', 'Lluvilla', 'Fanispan', 'Adams', 'Broad Peak', 'Cerro Gordo', 'Ľadový štít', 'Nairamdal', 'Elbrus', 'Arka Tagh', 'Cerro Bonete', 'Grand Teton', 'Kunlun Goddess', 'Iremel', 'Quanoukrim', 'Everest', 'Belukha', 'Moldoveanu', 'Cerro Mohinora', 'Chhogori', 'Rainier', 'Ngoc Linh', 'Galán', 'Lincoln', 'Kongur Tagh', 'Manaraga', 'Toubkal', 'Kharkhiraa', 'Gerlachovský štít', 'Cerro Barajas', 'Gasherbrum', 'Hood', 'Rao Co', 'Havelburg', 'Cressidium', 'Sparr']
  // const [inputValue, setInputValue] = useState()

  // const filteredItems = all.filter(i => 
    
  // ).slice(0, 5)

  // console.log(filteredItems)
  
  return (
    <Command 
      className="rounded-lg border shadow-md" 
      // value={inputValue}
      // onValueChange={setInputValue}
      // filter={(value, search) => {
      //   console.log(value, search)
      //   if (value.toLowerCase().includes(search.toLowerCase())) return 1
      //   return 0
      // }}
    >
      <CommandInput
        placeholder="Type a command or search..."
      />
      <CommandList  style={{height: '351px'}}>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          {all.map((item, index) => {
            return (
              <CommandItem key={item} value={item}>
                {item}
              </CommandItem>
            )
          })}
        </CommandGroup>
        {/* <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup> */}
      </CommandList>
    </Command>
  )
}
