"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getNutritionPlans,
} from "@/lib/services/klijentiService";


type Plan = {

  id: string;

  title: string;

  meals: string;

};


type Props = {

  clientId: string;

  selectedPlanId?: string | null;

};


export default function ClientNutrition({

  clientId,

  selectedPlanId,

}: Props) {


  const [
    plans,
    setPlans,
  ] = useState<Plan[]>([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  async function load() {

    try {

      setLoading(true);


      const data =
        await getNutritionPlans(
          clientId
        );


      setPlans(
        data as Plan[]
      );

    } catch (error) {

      console.error(
        "Greška kod učitavanja prehrane:",
        error
      );

    } finally {

      setLoading(false);

    }

  }


  useEffect(() => {

    load();

  }, [clientId]);


  useEffect(() => {

    if (
      !selectedPlanId ||
      plans.length === 0
    ) {

      return;

    }


    const timeout =
      window.setTimeout(() => {

        const selectedElement =
          document.getElementById(
            `nutrition-plan-${selectedPlanId}`
          );


        selectedElement?.scrollIntoView({

          behavior:
            "smooth",

          block:
            "center",

        });

      }, 150);


    return () => {

      window.clearTimeout(
        timeout
      );

    };

  }, [
    selectedPlanId,
    plans,
  ]);


  return (

    <div className="border rounded-xl bg-white p-5 space-y-5">


      <h2 className="text-xl font-bold">

        🥗 Moja prehrana

      </h2>


      {
        loading

          ? (

            <p>
              Učitavanje planova prehrane...
            </p>

          )

          : plans.length === 0

            ? (

              <p>
                Trener još nije dodao plan prehrane.
              </p>

            )

            : plans.map((plan) => {

              const isSelected =
                selectedPlanId === plan.id;


              return (

                <div

                  id={`nutrition-plan-${plan.id}`}

                  key={plan.id}

                  className={`
                    rounded-xl
                    border
                    p-4
                    transition
                    ${

                      isSelected

                        ? `
                          border-amber-500
                          bg-amber-50
                          ring-2
                          ring-amber-200
                        `

                        : `
                          border-gray-200
                          bg-white
                        `

                    }
                  `}

                >


                  <div className="flex flex-wrap items-center justify-between gap-3">

                    <h3 className="font-bold text-lg">

                      🥗 {plan.title}

                    </h3>


                    {
                      isSelected && (

                        <span
                          className="
                            rounded-full
                            bg-amber-200
                            px-3
                            py-1
                            text-xs
                            font-bold
                            text-amber-900
                          "
                        >

                          Otvoreno iz obavijesti

                        </span>

                      )
                    }

                  </div>


                  <p className="whitespace-pre-line mt-3">

                    {plan.meals}

                  </p>


                </div>

              );

            })
      }


    </div>

  );

}