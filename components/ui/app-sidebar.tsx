"use client"

import * as React from "react"
import {

} from "lucide-react"

import { NavMain } from "@/components/ui/nav-main"

import { NavUser } from "@/components/ui/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "Repository",
    email: "",
    avatar: "",
  },

  navMain: [


    {
      title: "Items",
      url: "",

      items: [
        {
          title: "Add Items",
          url: "/dashboard/addItem",
        },
        {
          title: "View Items",
          url: "/dashboard/ViewItem",
        },

      ],
    },
    {
      title: "Contracts",
      url: "",

      items: [
        {
          title: "Define Contract",
          url: "/dashboard/define-contract",
        },
        {
          title: "View Contracts",
          url: "/dashboard/view-contract",
        },

      ],
    },
  ],

}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props} >
      <SidebarHeader>

      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />

      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
