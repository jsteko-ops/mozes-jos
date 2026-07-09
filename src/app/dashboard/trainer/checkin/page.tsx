"use client";

import { useEffect, useState } from "react";

import RoleGuard from "@/components/auth/RoleGuard";
import { useAuth } from "@/components/auth/AuthProvider";

import {
  getClients,
  addCheckin,
  getCheckins,
} from "@/lib/services/klijentiService";



export default function CheckinPage(){


const { user } = useAuth();



const [clients,setClients] =
useState<any[]>([]);



const [clientId,setClientId] =
useState("");



const [checkins,setCheckins] =
useState<any[]>([]);



const [weight,setWeight] =
useState("");



const [energy,setEnergy] =
useState("");



const [note,setNote] =
useState("");



const [loading,setLoading] =
useState(true);





useEffect(()=>{


async function load(){


if(!user) return;



const data =
await getClients(user.uid);



setClients(data as any[]);


setLoading(false);


}



load();


},[user]);







async function loadCheckins(){


if(!clientId) {

setCheckins([]);

return;

}



const data =
await getCheckins(clientId);



setCheckins(data as any[]);


}







async function save(){


if(!clientId){

alert("Odaberi klijenta");

return;

}



await addCheckin(

clientId,

{

weight:
Number(
weight.replace(",", ".")
),

energy:
Number(energy),

note

}

);



setWeight("");

setEnergy("");

setNote("");



await loadCheckins();



alert("Check-in spremljen ✅");


}







return(

<RoleGuard allowedRoles={["trainer"]}>


<div className="p-6 space-y-6">



<h1 className="text-3xl font-bold">
✅ Check-in klijenata
</h1>





{loading &&

<p>
Učitavanje klijenata...
</p>

}





<div className="border rounded-xl p-5 space-y-3">



<h2 className="text-xl font-bold">
Novi Check-in
</h2>





<select

className="border p-2 w-full"

value={clientId}

onChange={(e)=>{

setClientId(e.target.value);

}}

>

<option value="">
Odaberi klijenta
</option>



{clients.map((c)=>(

<option

key={c.id}

value={c.id}

>

{c.name}

</option>

))}



</select>






<button

className="bg-gray-200 px-4 py-2 rounded"

onClick={loadCheckins}

>

Učitaj povijest

</button>






<input

className="border p-2 w-full"

placeholder="Težina kg"

value={weight}

onChange={(e)=>

setWeight(e.target.value)

}

/>





<input

className="border p-2 w-full"

placeholder="Energija 1-10"

value={energy}

onChange={(e)=>

setEnergy(e.target.value)

}

/>





<textarea

className="border p-2 w-full"

placeholder="Kako se klijent osjeća / napomena"

value={note}

onChange={(e)=>

setNote(e.target.value)

}

/>





<button

className="bg-black text-white px-5 py-2 rounded"

onClick={save}

>

Spremi Check-in

</button>



</div>









<div className="border rounded-xl p-5">


<h2 className="text-xl font-bold">
📋 Povijest Check-inova
</h2>





{checkins.length === 0 &&

<p className="mt-3">
Nema spremljenih check-inova.
</p>

}





{checkins.map((c)=>(


<div

key={c.id}

className="border rounded p-3 mt-3"

>


<p>
⚖️ Težina: {String(c.weight).replace(".",",")} kg
</p>


<p>
⚡ Energija: {c.energy}/10
</p>


<p>
📝 {c.note}
</p>



</div>


))}



</div>





</div>


</RoleGuard>

);


}