import Image from "next/image";
import Link from "next/link";
import { nameToSlug } from "@/lib/utils";
import { Metadata } from "next";
import { getChats, getChatByContact } from "@/lib/cms";
import { formatTimestampFor2012 } from "@/lib/utils";
import { cookies } from "next/headers";
import { redis } from "@/lib/redis";


export default function page() {
  return (
<div className="bg-white p-2 text-black">
      <h1 className="text-2xl font-bold">Message Requests</h1>
      <div className="divide-y">
        
      </div>
    </div>  )
}
