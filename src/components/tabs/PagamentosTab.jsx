import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronUp, ChevronDown, Copy, Trash2, Plus,
  ArrowUp, ArrowDown, User, CreditCard, MapPin, FileText,
} from "lucide-react";
import { Card, Input, Select, Button, EmptyState } from "../ui/index.js";
import { getBankName } from "../../utils/banks.js";
import {
  tipoInscricaoOptions,
  camaraOptions,
  avisoOptions,
  finalidadeTEDOptions,
  codFinalidadeCompOptions,
  tipoMovimentoOptions,
  tooltips,
} from "../../utils/constants.js";

/**
 * @param {{ pagamentos: Array, setPgtField: Function, addPgt: Function, removePgt: Function, duplicatePgt: Function, movePgt: Function, expanded: object, toggleExpanded: Function, loteInfo: object }} props
 */
export default function PagamentosTab({
  pagamentos,
  setPgtField,
  addPgt,
  removePgt,
  duplicatePgt,
  movePgt,
  expanded,
  toggleExpanded,
  loteInfo,
}) {
  if (pagamentos.length === 0) {
    return (
      <Card>
        <EmptyState
          title="Nenhum pagamento adicionado"
          description="Adicione favorecidos para gerar o arquivo de remessa CNAB 240."
          actionLabel="+ Adicionar Pagamento"
          onAction={addPgt}
          icon={<CreditCard size={28} className="text-zinc-600" />}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {pagamentos.map((pgt, idx) => {
          const isExpanded = expanded[pgt.id] || pagamentos.length === 1;
          const bankName = getBankName(pgt.bancoFavorecido);

          return (
            <motion.div
              key={pgt.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12, scale: 0.95 }}
              transition={{ duration: 0.2, delay: idx * 0.03 }}
            >
              <div className="glass border border-zinc-800/80 rounded-xl overflow-hidden">
                {/* Header */}
                <div
                  onClick={() => toggleExpanded(pgt.id)}
                  className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-zinc-800/30 transition-colors"
                >
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20
                    flex items-center justify-center text-xs font-bold text-emerald-400 font-mono">
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-medium text-zinc-200 truncate">
                        {pgt.nomeFavorecido || "Favorecido sem nome"}
                      </span>
                      {pgt.valor && (
                        <span className="text-xs font-mono font-semibold text-emerald-400">
                          R$ {parseFloat(pgt.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      )}
                      {bankName && (
                        <span className="text-[10px] text-zinc-600 font-mono hidden sm:inline">
                          {bankName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Move buttons */}
                    <button
                      onClick={(e) => { e.stopPropagation(); movePgt(pgt.id, -1); }}
                      disabled={idx === 0}
                      className="p-1.5 rounded-md hover:bg-zinc-700/50 text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Mover para cima"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); movePgt(pgt.id, 1); }}
                      disabled={idx === pagamentos.length - 1}
                      className="p-1.5 rounded-md hover:bg-zinc-700/50 text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Mover para baixo"
                    >
                      <ArrowDown size={14} />
                    </button>

                    {/* Duplicate */}
                    <button
                      onClick={(e) => { e.stopPropagation(); duplicatePgt(pgt.id); }}
                      className="p-1.5 rounded-md hover:bg-zinc-700/50 text-zinc-500 hover:text-zinc-300 transition-colors"
                      title="Duplicar pagamento"
                    >
                      <Copy size={14} />
                    </button>

                    {/* Remove */}
                    {pagamentos.length > 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removePgt(pgt.id); }}
                        className="p-1.5 rounded-md hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                        title="Remover pagamento"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}

                    {/* Expand toggle */}
                    <span className="text-zinc-500 ml-1">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-zinc-800/60">
                        {/* Favorecido section */}
                        <div className="flex items-center gap-2 mt-4 mb-3">
                          <User size={12} className="text-emerald-500" />
                          <span className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">
                            Favorecido
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                          <div className="sm:col-span-2">
                            <Input
                              label="Nome do Favorecido"
                              value={pgt.nomeFavorecido}
                              onChange={setPgtField(pgt.id, "nomeFavorecido")}
                              placeholder="NOME COMPLETO OU RAZAO SOCIAL"
                              charLimit={30}
                            />
                          </div>
                          <div>
                            <Input
                              label="Banco do Favorecido"
                              value={pgt.bancoFavorecido}
                              onChange={setPgtField(pgt.id, "bancoFavorecido")}
                              placeholder="341"
                              mask="banco"
                            />
                            {bankName && (
                              <p className="text-[10px] text-emerald-500/70 mt-1 font-mono truncate">{bankName}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3">
                          <Input
                            label="Agencia"
                            value={pgt.agenciaFavorecido}
                            onChange={setPgtField(pgt.id, "agenciaFavorecido")}
                            placeholder="00001"
                            mask="agencia"
                          />
                          <Input
                            label="DV Ag."
                            value={pgt.dvAgenciaFav}
                            onChange={setPgtField(pgt.id, "dvAgenciaFav")}
                            placeholder="0"
                            mask="dv"
                          />
                          <Input
                            label="Conta Corrente"
                            value={pgt.contaFavorecido}
                            onChange={setPgtField(pgt.id, "contaFavorecido")}
                            placeholder="000000000001"
                            mask="conta"
                          />
                          <Input
                            label="DV Conta"
                            value={pgt.dvContaFav}
                            onChange={setPgtField(pgt.id, "dvContaFav")}
                            placeholder="0"
                            mask="dv"
                          />
                          <Input
                            label="DV Ag/Cta"
                            value={pgt.dvAgContaFav}
                            onChange={setPgtField(pgt.id, "dvAgContaFav")}
                            placeholder="0"
                            mask="dv"
                            tooltip={tooltips.dvAgConta}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                          <Input
                            label="CNPJ / CPF Favorecido"
                            value={pgt.cpfCnpjFavorecido}
                            onChange={setPgtField(pgt.id, "cpfCnpjFavorecido")}
                            placeholder="000.000.000-00"
                            mask="cpfCnpj"
                          />
                          <Select
                            label="Tipo Inscricao Fav."
                            value={pgt.tipoInscricaoFav}
                            onChange={setPgtField(pgt.id, "tipoInscricaoFav")}
                            options={tipoInscricaoOptions}
                          />
                          <Select
                            label="Camara Centralizadora (P001)"
                            value={pgt.camara}
                            onChange={setPgtField(pgt.id, "camara")}
                            options={camaraOptions}
                            tooltip={tooltips.camara}
                          />
                        </div>

                        {/* Payment section */}
                        <div className="flex items-center gap-2 mt-2 mb-3 pt-3 border-t border-zinc-800/40">
                          <CreditCard size={12} className="text-emerald-500" />
                          <span className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">
                            Dados do Pagamento
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                          <Input
                            label="Valor (R$)"
                            value={pgt.valor}
                            onChange={setPgtField(pgt.id, "valor")}
                            placeholder="0.00"
                            type="number"
                          />
                          <Input
                            label="Data Pagamento"
                            type="date"
                            value={pgt.dataPagamento}
                            onChange={setPgtField(pgt.id, "dataPagamento")}
                          />
                          <Input
                            label="Valor Real (acresc/desc)"
                            value={pgt.valorRealPagamento}
                            onChange={setPgtField(pgt.id, "valorRealPagamento")}
                            placeholder="0.00"
                            type="number"
                            tooltip={tooltips.valorReal}
                          />
                          <Input
                            label="Data Real Pagamento"
                            type="date"
                            value={pgt.dataRealPagamento}
                            onChange={setPgtField(pgt.id, "dataRealPagamento")}
                          />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                          <Input
                            label="Seu Numero (Ref)"
                            value={pgt.seuNumero}
                            onChange={setPgtField(pgt.id, "seuNumero")}
                            placeholder="REF-0001"
                            maxLength={20}
                            tooltip={tooltips.seuNumero}
                          />
                          <Input
                            label="Nosso Numero (Rastreamento)"
                            value={pgt.nossoNumero}
                            onChange={setPgtField(pgt.id, "nossoNumero")}
                            placeholder="Ate 20 caracteres"
                            mask="nossoNumero"
                            tooltip={tooltips.nossoNumero}
                          />
                          <Select
                            label="Aviso ao Favorecido (P006)"
                            value={pgt.aviso}
                            onChange={setPgtField(pgt.id, "aviso")}
                            options={avisoOptions}
                          />
                          {pgt.camara === "009" && (
                            <Input
                              label="ISPB (obrigatorio PIX)"
                              value={pgt.ispb}
                              onChange={setPgtField(pgt.id, "ispb")}
                              placeholder="00000000"
                              mask="ispb"
                              tooltip={tooltips.ispb}
                            />
                          )}
                          {pgt.tipoMoeda && pgt.tipoMoeda !== "BRL" && (
                            <Input
                              label="Quantidade de Moeda"
                              value={pgt.quantidadeMoeda}
                              onChange={setPgtField(pgt.id, "quantidadeMoeda")}
                              placeholder="0"
                              type="number"
                            />
                          )}
                          {loteInfo.tipoServico === "30" && (
                            <Input
                              label="UG SIAPE (Folha de Pagamento)"
                              value={pgt.ugSiape}
                              onChange={setPgtField(pgt.id, "ugSiape")}
                              placeholder="000000"
                              mask="ugSiape"
                              tooltip={tooltips.ugSiape}
                            />
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <Select
                            label="Cod. Finalidade TED"
                            value={pgt.codFinalidadeTED}
                            onChange={setPgtField(pgt.id, "codFinalidadeTED")}
                            options={finalidadeTEDOptions}
                          />
                          <Select
                            label="Cod. Finalidade Complementar"
                            value={pgt.codFinalidadeComp}
                            onChange={setPgtField(pgt.id, "codFinalidadeComp")}
                            options={codFinalidadeCompOptions}
                            tooltip={tooltips.codFinalidadeComp}
                          />
                          <Select
                            label="Tipo de Movimento"
                            value={pgt.tipoMovimento}
                            onChange={setPgtField(pgt.id, "tipoMovimento")}
                            options={tipoMovimentoOptions}
                          />
                        </div>

                        {/* Segmento B - Endereco do Favorecido */}
                        {pgt.cpfCnpjFavorecido && (
                          <>
                            <div className="flex items-center gap-2 mt-4 mb-3 pt-3 border-t border-zinc-800/40">
                              <MapPin size={12} className="text-emerald-500" />
                              <span className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">
                                Endereco do Favorecido (Seg. B)
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                              <div className="sm:col-span-2">
                                <Input
                                  label="Logradouro"
                                  value={pgt.logradouroFav}
                                  onChange={setPgtField(pgt.id, "logradouroFav")}
                                  placeholder="RUA DAS FLORES"
                                  charLimit={30}
                                />
                              </div>
                              <Input
                                label="Numero"
                                value={pgt.numeroFav}
                                onChange={setPgtField(pgt.id, "numeroFav")}
                                placeholder="123"
                                maxLength={5}
                              />
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                              <Input
                                label="Complemento"
                                value={pgt.complementoFav}
                                onChange={setPgtField(pgt.id, "complementoFav")}
                                placeholder="SALA 10"
                                charLimit={15}
                              />
                              <Input
                                label="Bairro"
                                value={pgt.bairroFav}
                                onChange={setPgtField(pgt.id, "bairroFav")}
                                placeholder="CENTRO"
                                charLimit={15}
                              />
                              <Input
                                label="Cidade"
                                value={pgt.cidadeFav}
                                onChange={setPgtField(pgt.id, "cidadeFav")}
                                placeholder="SAO PAULO"
                                charLimit={20}
                              />
                              <Input
                                label="Estado"
                                value={pgt.estadoFav}
                                onChange={setPgtField(pgt.id, "estadoFav")}
                                placeholder="SP"
                                maxLength={2}
                              />
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                              <Input
                                label="CEP"
                                value={pgt.cepFav}
                                onChange={setPgtField(pgt.id, "cepFav")}
                                placeholder="00000-000"
                                mask="cep"
                              />
                              <Input
                                label="Data Vencimento"
                                type="date"
                                value={pgt.dataVencimento}
                                onChange={setPgtField(pgt.id, "dataVencimento")}
                                tooltip={tooltips.dataVencimento}
                              />
                              <Input
                                label="Valor Documento (Nominal)"
                                value={pgt.valorDocumento}
                                onChange={setPgtField(pgt.id, "valorDocumento")}
                                placeholder="0.00 (usa valor do Seg A)"
                                type="number"
                                tooltip={tooltips.valorDocumento}
                              />
                              <Input
                                label="Cod. Doc. Favorecido"
                                value={pgt.codDocFavorecido}
                                onChange={setPgtField(pgt.id, "codDocFavorecido")}
                                placeholder="NF 1234"
                                charLimit={15}
                              />
                            </div>

                            {/* Valores opcionais Seg B */}
                            <div className="flex items-center gap-2 mt-2 mb-3 pt-3 border-t border-zinc-800/40">
                              <FileText size={12} className="text-emerald-500" />
                              <span className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">
                                Valores Seg. B (opcionais)
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3">
                              <Input
                                label="Abatimento"
                                value={pgt.valorAbatimento}
                                onChange={setPgtField(pgt.id, "valorAbatimento")}
                                placeholder="0.00"
                                type="number"
                              />
                              <Input
                                label="Desconto"
                                value={pgt.valorDesconto}
                                onChange={setPgtField(pgt.id, "valorDesconto")}
                                placeholder="0.00"
                                type="number"
                              />
                              <Input
                                label="Mora"
                                value={pgt.valorMora}
                                onChange={setPgtField(pgt.id, "valorMora")}
                                placeholder="0.00"
                                type="number"
                              />
                              <Input
                                label="Multa"
                                value={pgt.valorMulta}
                                onChange={setPgtField(pgt.id, "valorMulta")}
                                placeholder="0.00"
                                type="number"
                              />
                              <Select
                                label="Aviso Fav. (Seg B)"
                                value={pgt.avisoFav}
                                onChange={setPgtField(pgt.id, "avisoFav")}
                                options={avisoOptions}
                                tooltip={tooltips.avisoFav}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <Button variant="primary" onClick={addPgt} icon={<Plus size={16} />}>
        Adicionar Pagamento
      </Button>
    </div>
  );
}
