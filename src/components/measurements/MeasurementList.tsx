export default function MeasurementList({
  measurements,
}: {
  measurements: any[];
}) {
  return (
    <div className="space-y-3">
      {measurements.length === 0 && (
        <p className="text-gray-500">Nema mjerenja</p>
      )}

      {measurements.map((m) => (
        <div key={m.id} className="bg-white border p-4 rounded-xl">
          <div className="font-bold">
            {m.weight} kg
          </div>

          {m.bodyFat && (
            <div className="text-sm text-gray-600">
              Body fat: {m.bodyFat}%
            </div>
          )}

          {m.notes && (
            <div className="text-sm text-gray-500 mt-1">
              {m.notes}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}