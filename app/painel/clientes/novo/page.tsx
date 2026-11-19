import FormularioCliente from "../formulario-cliente";

export default function PaginaNovoCliente() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Novo cliente</h1>
      <FormularioCliente />
    </div>
  );
}
