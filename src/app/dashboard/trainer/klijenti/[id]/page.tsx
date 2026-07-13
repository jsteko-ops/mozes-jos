"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import RoleGuard from "@/components/auth/RoleGuard";
import ClientPlans from "@/components/owner/ClientPlans";

import {
  getClient,
  updateClient,
  addMeasurement,
  getMeasurements,
  updateMeasurement,
  deleteMeasurement,
} from "@/lib/services/klijentiService";




function toNumber(value: string) {

  return Number(
    value.replace(",", ".")
  );

}




type Client = {

  id: string;
  name: string;
  email: string;
  phone: string;
  note: string;

};



type Measurement = {

  id: string;
  weight: number;
  height: number;
  waist: number;
  chest: number;
  arm: number;

};






export default function KlijentProfilPage() {


  const params = useParams();

  const id = params.id as string;





  const [client, setClient] =
    useState<Client | null>(null);



  const [measurements, setMeasurements] =
    useState<Measurement[]>([]);


  const [chartData, setChartData] =
    useState<any[]>([]);






  const [loading, setLoading] =
    useState(true);





  // KLIJENT EDIT

  const [editingClient, setEditingClient] =
    useState(false);


  const [editName, setEditName] =
    useState("");

  const [editEmail, setEditEmail] =
    useState("");

  const [editPhone, setEditPhone] =
    useState("");

  const [editNote, setEditNote] =
    useState("");







  // MJERENJE

  const [weight, setWeight] =
    useState("");

  const [height, setHeight] =
    useState("");

  const [waist, setWaist] =
    useState("");

  const [chest, setChest] =
    useState("");

  const [arm, setArm] =
    useState("");





  const [editingMeasurement, setEditingMeasurement] =
    useState<string | null>(null);



  const [editMeasurementData, setEditMeasurementData] =
    useState({

      weight: "",
      height: "",
      waist: "",
      chest: "",
      arm: ""

    });







  // TRENING

  const [workoutTitle, setWorkoutTitle] =
    useState("");

  const [exercises, setExercises] =
    useState("");



  const [editingWorkout, setEditingWorkout] =
    useState<string | null>(null);



  const [editWorkoutData, setEditWorkoutData] =
    useState({

      title: "",
      exercises: ""

    });








  async function loadData() {


    if (!id) return;



    const c =
      await getClient(id);


    setClient(
      c as Client
    );



    const m =
      await getMeasurements(id);


    setMeasurements(
      m as Measurement[]
    );

    const chart = (m as any[])
      .map((item) => ({

        date:
          item.createdAt?.toDate
            ?
            item.createdAt.toDate().toLocaleDateString("hr-HR")
            :
            "",

        weight: item.weight

      }))
      .reverse();



    setChartData(chart);




    setLoading(false);


  }







  useEffect(() => {

    loadData();

  }, [id]);







  async function saveClientChanges() {


    await updateClient(

      id,

      {
        name: editName,
        email: editEmail,
        phone: editPhone,
        note: editNote
      }

    );



    setEditingClient(false);


    await loadData();


    alert("Podaci spremljeni ✅");


  }







  async function saveMeasurement() {


    await addMeasurement(

      id,

      {
        weight: toNumber(weight),
        height: toNumber(height),
        waist: toNumber(waist),
        chest: toNumber(chest),
        arm: toNumber(arm)
      }

    );



    setWeight("");
    setHeight("");
    setWaist("");
    setChest("");
    setArm("");



    await loadData();


    alert("Mjerenje spremljeno ✅");


  }







  async function saveEditedMeasurement(
    measurementId: string
  ) {


    await updateMeasurement(

      id,

      measurementId,

      {
        weight: toNumber(editMeasurementData.weight),
        height: toNumber(editMeasurementData.height),
        waist: toNumber(editMeasurementData.waist),
        chest: toNumber(editMeasurementData.chest),
        arm: toNumber(editMeasurementData.arm)
      }

    );



    setEditingMeasurement(null);


    await loadData();


    alert("Mjerenje izmijenjeno ✅");


  }
  async function removeMeasurement(
    measurementId: string
  ) {

    const ok =
      confirm(
        "Obrisati mjerenje?"
      );


    if (!ok) return;


    await deleteMeasurement(
      id,
      measurementId
    );


    await loadData();


    alert("Mjerenje obrisano ✅");

  }

























  return (

    <RoleGuard allowedRoles={["trainer"]}>


      <div className="p-6 space-y-6">


        <h1 className="text-3xl font-bold">
          Profil klijenta
        </h1>




        {loading &&

          <p>
            Učitavanje...
          </p>

        }





        {client && (

          <>

            <div className="border rounded-xl p-5">


              {!editingClient &&

                <>


                  <h2 className="text-2xl font-bold">
                    👤 {client.name}
                  </h2>


                  <p>
                    Email: {client.email}
                  </p>


                  <p>
                    Telefon: {client.phone}
                  </p>


                  <p>
                    Napomena: {client.note}
                  </p>



                  <button

                    className="bg-black text-white px-4 py-2 rounded mt-3"

                    onClick={() => {

                      setEditName(client.name);
                      setEditEmail(client.email);
                      setEditPhone(client.phone);
                      setEditNote(client.note);

                      setEditingClient(true);

                    }}

                  >
                    ✏️ Uredi podatke
                  </button>


                </>

              }





              {editingClient &&

                <div className="space-y-2">


                  <input
                    className="border p-2 w-full"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />


                  <input
                    className="border p-2 w-full"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />


                  <input
                    className="border p-2 w-full"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                  />


                  <textarea
                    className="border p-2 w-full"
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                  />



                  <button

                    className="bg-black text-white px-4 py-2 rounded"

                    onClick={saveClientChanges}

                  >
                    Spremi promjene
                  </button>


                </div>

              }



            </div>








            <div className="border rounded-xl p-5">


              <h2 className="font-bold text-xl">
                ⚖️ Dodaj mjerenje
              </h2>



              <input
                className="border p-2 w-full mt-2"
                placeholder="Težina kg"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />



              <input
                className="border p-2 w-full mt-2"
                placeholder="Visina cm"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />



              <input
                className="border p-2 w-full mt-2"
                placeholder="Struk"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
              />



              <input
                className="border p-2 w-full mt-2"
                placeholder="Prsa"
                value={chest}
                onChange={(e) => setChest(e.target.value)}
              />



              <input
                className="border p-2 w-full mt-2"
                placeholder="Ruka"
                value={arm}
                onChange={(e) => setArm(e.target.value)}
              />



              <button

                className="bg-black text-white px-5 py-2 rounded mt-3"

                onClick={saveMeasurement}

              >
                Spremi mjerenje
              </button>


            </div>









            <div className="border rounded-xl p-5">


              <h2 className="font-bold text-xl">
                📋 Mjerenja
              </h2>



              {measurements.map((m) => (


                <div


                  key={m.id}

                  className="border rounded p-3 mt-3"

                >


                  {editingMeasurement === m.id ?


                    <>

                      <input

                        className="border p-2 w-full"

                        value={editMeasurementData.weight}

                        onChange={(e) =>

                          setEditMeasurementData({

                            ...editMeasurementData,

                            weight: e.target.value

                          })

                        }

                      />



                      <button

                        className="bg-black text-white px-3 py-2 rounded mt-2"

                        onClick={() => saveEditedMeasurement(m.id)}

                      >
                        Spremi
                      </button>


                    </>


                    :


                    <>


                      <p>
                        ⚖️ {String(m.weight).replace(".", ",")} kg
                      </p>


                      <p>
                        📏 {m.height} cm
                      </p>


                      <p>
                        📐 Struk: {m.waist} cm
                      </p>




                      <button

                        className="mr-3 mt-2"

                        onClick={() => {

                          setEditingMeasurement(m.id);


                          setEditMeasurementData({

                            weight: String(m.weight).replace(".", ","),
                            height: String(m.height),
                            waist: String(m.waist),
                            chest: String(m.chest),
                            arm: String(m.arm)

                          });

                        }}

                      >
                        ✏️ Uredi
                      </button>



                      <button

                        onClick={() => removeMeasurement(m.id)}

                      >
                        🗑️ Obriši
                      </button>



                    </>


                  }



                </div>


              ))}



            </div>







            <div className="border rounded-xl p-5">


              <h2 className="font-bold text-xl mb-4">
                📈 Napredak težine
              </h2>


              <ResponsiveContainer
                width="100%"
                height={300}
              >


                <LineChart data={chartData}>


                  <CartesianGrid />


                  <XAxis
                    dataKey="date"
                  />


                  <YAxis />


                  <Tooltip />


                  <Line

                    type="monotone"

                    dataKey="weight"

                    strokeWidth={3}

                  />


                </LineChart>


              </ResponsiveContainer>


            </div>







            <div className="border rounded-xl p-5">


              <h2 className="font-bold text-xl">
                🏋️ Trening plan
              </h2>



              <input

                className="border p-2 w-full mt-2"

                placeholder="Naziv plana"

                value={workoutTitle}

                onChange={(e) => setWorkoutTitle(e.target.value)}

              />




              <textarea

                className="border p-2 w-full mt-2"

                placeholder="Vježbe"

                value={exercises}

                onChange={(e) => setExercises(e.target.value)}

              />



              <button

                className="bg-black text-white px-5 py-2 rounded mt-2"

                onClick={() => { }}

              >
                Spremi trening
              </button>


            </div>








            <div className="border rounded-xl p-5">


              <h2 className="font-bold text-xl">
                📋 Trening planovi
              </h2>


              <ClientPlans clientId={id} />

            </div>

          </>

        )}

      </div>

    </RoleGuard>

  );

}