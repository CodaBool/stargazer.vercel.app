'use client'
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { Heart, Github, Copyright, History } from "lucide-react"
import Dialog from './dialog'
import Contribute from './contribute'

export default function Menu({panTo}) {
  return (
    <Menubar style={{color: 'white'}}>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New Tab <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            New Window <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>New Incognito Window</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Share</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Email link</MenubarItem>
              <MenubarItem>Messages</MenubarItem>
              <MenubarItem>Notes</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>
            Print... <MenubarShortcut>⌘P</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <Dialog panTo={panTo} />
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger><Heart size={16} className="relative top-[1px] pe-[2px]" /> Contribute</MenubarTrigger>
        <MenubarContent>
          <Contribute text="Edit existing content" />
          <MenubarSeparator />
          <Contribute text="Add a new content" />
          <MenubarSeparator />
          <Contribute text="Create a new map" />
          <MenubarSeparator />
          <Contribute text="Make a suggestion" />
          <MenubarSeparator />
          <Contribute text="Make a fork" />
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger><Github size={16} className="relative top-[1px] pe-[2px]" />  About</MenubarTrigger>
        <MenubarContent>
          <MenubarItem inset><a href="https://github.com/codabool/community-vtt-maps/blob/main/license" target="_blank"><Copyright size={16} className="inline" /> License</a></MenubarItem>
          <MenubarSeparator />
          <MenubarItem inset><a href="https://github.com/codabool/community-vtt-maps" target="_blank"><Github size={16} className="inline" /> Source Code</a></MenubarItem>
          <MenubarSeparator />
          <MenubarItem inset><a href="https://github.com/codabool/community-vtt-maps/releases" target="_blank"><History size={16} className="inline" /> Version History</a></MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}
