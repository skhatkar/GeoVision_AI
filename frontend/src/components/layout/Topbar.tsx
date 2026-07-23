"use client";

import { Bell, Search } from "lucide-react";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";

export default function Topbar() {

  return (

    <header className="flex h-20 items-center justify-between border-b bg-background px-8">

      <div className="relative w-96">

        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

        <Input
          placeholder="Search assets, layers..."
          className="pl-10"
        />

      </div>

      <div className="flex items-center gap-5">

        <Bell className="cursor-pointer" />

        <Avatar>

          <AvatarFallback>
            SK
          </AvatarFallback>

        </Avatar>

      </div>

    </header>

  );

}