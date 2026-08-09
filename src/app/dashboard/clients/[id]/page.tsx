import {
  redirect,
} from "next/navigation";

export default async function LegacyClientPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const {
    id,
  } = await params;

  redirect(
    `/dashboard/trainer/klijenti/${id}`
  );
}