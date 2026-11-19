import FormularioServico from "../formulario-servico";

export default function PaginaNovoServico() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Novo serviço</h1>
      <FormularioServico />
    </div>
  );
}
