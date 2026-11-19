import { dataValida, hojeSP } from "../../../../../lib/datas";
import FormularioDespesa from "../../formulario-despesa";

export default async function PaginaNovaDespesa({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  const { data } = await searchParams;
  const dataInicial = data && dataValida(data) ? data : hojeSP();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Nova despesa</h1>
      <FormularioDespesa dataInicial={dataInicial} />
    </div>
  );
}
