import {
  redirect,
} from "next/navigation";

export default function LegacyClientsPage() {
  redirect(
    "/dashboard/trainer/klijenti"
  );
}