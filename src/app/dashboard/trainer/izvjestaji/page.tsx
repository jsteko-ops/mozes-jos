"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import RoleGuard from "@/components/auth/RoleGuard";
import { useAuth } from "@/components/auth/AuthProvider";

import {
  getClients,
  getMeasurements,
  getCheckins,
} from "@/lib/services/klijentiService";



export default function IzvjestajiPage(){


const { user } = useAuth();



const [stats,setStats] =
useState({

clients:0,
measurements:0,
checkins:0

});



const [loading,setLoading] =
useState(true);





useEffect(()=>{


async function load(){


if(!user) return;



const clients =
await getClients(user.uid);



let measurements = 0;

let checkins = 0;




for(const client of clients){


const m =
await getMeasurements(client.id);


measurements += m.length;




const c =
await getCheckins(client.id);


checkins += c.length;



}




setStats({

clients:clients.length,

measurements,

checkins

});



setLoading(false);



}



load();



},[user]);







return(

<RoleGuard allowedRoles={["trainer"]}>


<div className="p-6 space-y-6">


<h1 className="text-3xl font-bold">
📊 Izvještaji
</h1>




{loading ?


<p>
Učitavanje...
</p>


:

<div className="grid grid-cols-1 md:grid-cols-3 gap-5">





<Link

href="/dashboard/trainer/klijenti"

className="border rounded-xl p-5 block hover:bg-gray-100"

>

<h2 className="font-bold text-xl">
👥 Klijenti
</h2>


<p className="text-4xl mt-3">
{stats.clients}
</p>


</Link>







<Link

href="/dashboard/trainer/mjerenja"

className="border rounded-xl p-5 block hover:bg-gray-100"

>

<h2 className="font-bold text-xl">
⚖️ Mjerenja
</h2>


<p className="text-4xl mt-3">
{stats.measurements}
</p>


</Link>







<Link

href="/dashboard/trainer/checkin"

className="border rounded-xl p-5 block hover:bg-gray-100"

>

<h2 className="font-bold text-xl">
✅ Check-inovi
</h2>


<p className="text-4xl mt-3">
{stats.checkins}
</p>


</Link>





</div>

}



</div>


</RoleGuard>

);


}