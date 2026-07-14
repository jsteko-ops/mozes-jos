"use client";

interface CheckinFormProps {
  weight: string;
  energy: number;
  sleep: number;
  hunger: number;
  water: string;
  comment: string;

  setWeight: (value: string) => void;
  setEnergy: (value: number) => void;
  setSleep: (value: number) => void;
  setHunger: (value: number) => void;
  setWater: (value: string) => void;
  setComment: (value: string) => void;

  onSave: () => void;
}

function Rating({
  title,
  value,
  onChange,
}: {
  title: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="font-medium">{title}</p>

      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((number) => (
          <button
            key={number}
            type="button"
            onClick={() => onChange(number)}
            className={`w-10 h-10 rounded-full border ${
              value === number
                ? "bg-black text-white"
                : "bg-white"
            }`}
          >
            {number}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CheckinForm({
  weight,
  energy,
  sleep,
  hunger,
  water,
  comment,

  setWeight,
  setEnergy,
  setSleep,
  setHunger,
  setWater,
  setComment,

  onSave,
}: CheckinFormProps) {
  return (
    <div className="border rounded-xl p-5 space-y-5">

      <h2 className="text-xl font-bold">
        📝 Novi Check-in
      </h2>


      <input
        className="border rounded p-2 w-full"
        placeholder="⚖️ Težina kg"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
      />


      <Rating
        title="😊 Energija"
        value={energy}
        onChange={setEnergy}
      />


      <Rating
        title="😴 San"
        value={sleep}
        onChange={setSleep}
      />


      <Rating
        title="🍽 Glad"
        value={hunger}
        onChange={setHunger}
      />


      <input
        className="border rounded p-2 w-full"
        placeholder="💧 Voda (npr. 2.5 L)"
        value={water}
        onChange={(e) => setWater(e.target.value)}
      />


      <textarea
        className="border rounded p-2 w-full"
        placeholder="💬 Komentar"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />


      <button
        className="bg-black text-white px-5 py-2 rounded"
        onClick={onSave}
      >
        ✅ Spremi Check-in
      </button>

    </div>
  );
}