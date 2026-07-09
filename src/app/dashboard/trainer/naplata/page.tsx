"use client";


import RoleGuard from "@/components/auth/RoleGuard";
import { useAuth } from "@/components/auth/AuthProvider";



export default function NaplataPage(){


const { user } = useAuth();





async function startCheckout(){


if(!user){

alert(
"Nema prijavljenog korisnika"
);

return;

}




const res =
await fetch(
"/api/stripe/checkout",
{

method:"POST",

headers:{

"Content-Type":"application/json"

},


body:JSON.stringify({

userId:user.uid,

email:user.email,

plan:"pro"

})


}

);




const data =
await res.json();





if(data.error){

alert(data.error);

return;

}





if(data.url){

window.location.href =
data.url;

return;

}




}







return(

<RoleGuard allowedRoles={["trainer"]}>


<div className="p-6 space-y-6">


<h1 className="text-3xl font-bold">
💳 Naplata
</h1>




<div className="border rounded-xl p-5">


<h2 className="text-xl font-bold">
Možeš Još Pro
</h2>



<p className="mt-3">
Status pretplate:
</p>



<p className="font-bold text-green-600">
Aktivan korisnik
</p>




<button

className="bg-black text-white px-5 py-2 rounded mt-5"

onClick={startCheckout}

>

Aktiviraj Pro plan

</button>



</div>




</div>


</RoleGuard>

);


}