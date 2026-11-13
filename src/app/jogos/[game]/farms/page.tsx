import { redirect } from "next/navigation";

export default async function GameFarmsRedirect({
  params,
}: {
  params: Promise<{ game: string }>;
}) {
  const { game } = await params;
  redirect(`/jogos/${game}#farms`);
}
