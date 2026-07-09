import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton height={30} />
      <div style={{ marginTop: 20 }}>
        <Skeleton height={100} />
        <Skeleton height={100} />
        <Skeleton height={100} />
      </div>
    </div>
  );
}