"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import RoleGuard from "@/components/auth/RoleGuard";
import { useAuth } from "@/components/auth/AuthProvider";
import { getTrainerStats } from "@/lib/services/klijentiService";


export default function TrainerPage(){

const { user } = useAuth();

const router = useRouter();


const [stats,setStats] =
useState({

clientsCount:0,

measurementsCount:0

});


const [loading,setLoading] =
useState(true);



useEffect(()=>{


async function loadStats(){


if(!user) return;


const data =
await getTrainerStats(
user.uid
);


setStats(data);

setLoading(false);


}


loadStats();


},[user]);





return(

<RoleGuard allowedRoles={["trainer"]}>


<div className="p-6 space-y-6">


<h1 className="text-3xl font-bold">
🏋️ Trainer Dashboard
</h1>





{loading ?


<p>
Učitavanje statistike...
</p>


:


<div className="grid grid-cols-1 md:grid-cols-2 gap-5">





<div

className="border rounded-xl p-5 cursor-pointer hover:bg-gray-100"

onClick={()=>
router.push("/dashboard/trainer/klijenti")
}

>


<h2 className="text-xl font-bold">
👥 Klijenti
</h2>


<p className="text-4xl mt-3">
{stats.clientsCount}
</p>


</div>







<div

className="border rounded-xl p-5 cursor-pointer hover:bg-gray-100"

onClick={()=>
router.push("/dashboard/trainer/mjerenja")
}

>


<h2 className="text-xl font-bold">
⚖️ Mjerenja
</h2>


<p className="text-4xl mt-3">
{stats.measurementsCount}
</p>


</div>







<div className="border rounded-xl p-5">


<h2 className="text-xl font-bold">
🏆 Status
</h2>


<p className="mt-3">
Aktivan trener
</p>


</div>







<div className="border rounded-xl p-5">


<h2 className="text-xl font-bold">
🚀 Možeš Još
</h2>


<p className="mt-3">
Radi na napretku klijenata
</p>


</div>






</div>


}





</div>


</RoleGuard>

);


}