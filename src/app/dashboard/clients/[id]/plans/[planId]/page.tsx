import {
  redirect,
} from "next/navigation";

export default async function LegacyPlanDetailPage({
  params,
}: {
  params: Promise<{
    id: string;
    planId: string;
  }>;
}) {
  const {
    id,
  } = await params;

  redirect(
    `/dashboard/trainer/klijenti/${id}?tab=plans`
  );
}