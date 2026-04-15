import { Layers } from "lucide-react";
import { Card, Input, Select } from "../ui/index.js";
import {
  tipoServicoOptions,
  formaLancamentoOptions,
  indicativoFormaPagamentoOptions,
  tooltips,
} from "../../utils/constants.js";

/**
 * @param {{ loteInfo: object, setLoteField: (k: string) => (v: string) => void }} props
 */
export default function LoteTab({ loteInfo, setLoteField }) {
  return (
    <Card title="Configuracoes do Lote" icon={<Layers size={16} />}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Tipo de Servico"
          value={loteInfo.tipoServico}
          onChange={setLoteField("tipoServico")}
          options={tipoServicoOptions}
          tooltip={tooltips.tipoServico}
        />
        <Select
          label="Forma de Lancamento"
          value={loteInfo.formaLancamento}
          onChange={setLoteField("formaLancamento")}
          options={formaLancamentoOptions}
          tooltip={tooltips.formaLancamento}
        />
        <Select
          label="Indicativo Forma de Pagamento (P014)"
          value={loteInfo.indicativoFormaPagamento}
          onChange={setLoteField("indicativoFormaPagamento")}
          options={indicativoFormaPagamentoOptions}
          tooltip={tooltips.indicativoFormaPagamento}
        />
        <Input
          label="Versao Layout do Lote"
          value={loteInfo.versaoLayoutLote}
          onChange={setLoteField("versaoLayoutLote")}
          placeholder="046"
          maxLength={3}
          tooltip={tooltips.versaoLayoutLote}
        />
        <div className="sm:col-span-2">
          <Input
            label="Mensagem do Lote (Informacao 1)"
            value={loteInfo.mensagem}
            onChange={setLoteField("mensagem")}
            placeholder="Mensagem opcional - ate 40 caracteres"
            charLimit={40}
          />
        </div>
      </div>
    </Card>
  );
}
