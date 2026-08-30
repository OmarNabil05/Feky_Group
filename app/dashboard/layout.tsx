import { AppSidebar } from '@/components/ui/app-sidebar';

import { Separator } from '@/components/ui/separator';

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toast';
import React from 'react'


type children = { children: React.ReactNode };
export default function DashboardLayout({ children }: children) {
    return (
        <>

            <SidebarProvider>
                <AppSidebar />
                <main className=' w-full'>
                    <header className="flex  shrink-0 items-center gap-2 border-b   ">
                        <div className="flex items-center justify-between w-full gap-2 px-2 h-10">
                            <div className="flex ">
                                <SidebarTrigger />
                                <Separator orientation="vertical" className="ml-1  " />
                            </div>
                           
                        </div>
                    </header>
                    <div className="lg:p-4 md:p-3 p-2">{children}</div>
                </main>
                <Toaster/>
            </SidebarProvider>

        </>
    )
}
