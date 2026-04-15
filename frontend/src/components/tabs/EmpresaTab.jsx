import { Building2, MapPin } from "lucide-react";
import { Card, Input, Select } from "../ui/index.js";
import { bankOptions, getBankName } from "../../utils/banks.js";
import { tipoInscricaoOptions, tooltips } from "../../utils/constants.js";

/**
 * @param {{ empresa: object, setEmpField: (k: string) => (v: string) => void }} props
 */
export default function EmpresaTab({ empresa, setEmpField }) {
  const handleBankChange = (code) => {
    setEmpField("codigoBanco")(code);
    const name = getBankName(code);
    if (name) setEmpField("nomeBanco")(name.slice(0, 30));
  };

  return (
    <div className="space-y-6">
      <Card title="Dados da Empresa (Pagadora)" icon={<Building2 size={16} />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <Select
            label="Banco"
            value={empresa.codigoBanco}
            onChange={handleBankChange}
            options={bankOptions}
            required
          />
          <Select
            label="Tipo de Inscricao"
            value={empresa.tipoInscricao}
            onChange={setEmpField("tipoInscricao")}
            options={tipoInscricaoOptions}
          />
          <Input
            label="CNPJ / CPF"
            value={empresa.cnpj}
            onChange={setEmpField("cnpj")}
            placeholder="00.000.000/0001-00"
            mask="cpfCnpj"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Input
            label="Nome da Empresa"
            value={empresa.nome}
            onChange={setEmpField("nome")}
            placeholder="RAZAO SOCIAL LTDA"
            charLimit={30}
            required
          />
          <Input
            label="Nome do Banco"
            value={empresa.nomeBanco}
            onChange={setEmpField("nomeBanco")}
            placeholder="BANCO DO BRASIL"
            charLimit={30}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Input
            label="Convenio"
            value={empresa.convenio}
            onChange={setEmpField("convenio")}
            placeholder="Codigo convenio"
            maxLength={20}
            tooltip={tooltips.convenio}
          />
          <Input
            label="Agencia"
            value={empresa.agencia}
            onChange={setEmpField("agencia")}
            placeholder="00001"
            mask="agencia"
            required
          />
          <Input
            label="DV Agencia"
            value={empresa.dvAgencia}
            onChange={setEmpField("dvAgencia")}
            placeholder="0"
            mask="dv"
          />
          <Input
            label="NSA (Seq. Arquivo)"
            value={empresa.nsa}
            onChange={setEmpField("nsa")}
            placeholder="000001"
            mask="nsa"
            tooltip={tooltips.nsa}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <Input
            label="Conta Corrente"
            value={empresa.conta}
            onChange={setEmpField("conta")}
            placeholder="000000000001"
            mask="conta"
            required
          />
          <Input
            label="DV Conta"
            value={empresa.dvConta}
            onChange={setEmpField("dvConta")}
            placeholder="0"
            mask="dv"
          />
          <Input
            label="DV Ag/Conta"
            value={empresa.dvAgConta}
            onChange={setEmpField("dvAgConta")}
            placeholder="(branco p/ Bradesco)"
            mask="dv"
            tooltip={tooltips.dvAgConta}
          />
          <Input
            label="Versao Layout Arquivo"
            value={empresa.versaoLayoutArquivo}
            onChange={setEmpField("versaoLayoutArquivo")}
            placeholder="089"
            maxLength={3}
            tooltip={tooltips.versaoLayoutArquivo}
          />
          <Input
            label="Data de Geracao"
            type="date"
            value={empresa.dataGeracao}
            onChange={setEmpField("dataGeracao")}
          />
        </div>
      </Card>

      <Card title="Endereco da Empresa" icon={<MapPin size={16} />}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="sm:col-span-2">
            <Input
              label="Logradouro"
              value={empresa.logradouro}
              onChange={setEmpField("logradouro")}
              placeholder="RUA DAS FLORES"
              charLimit={30}
            />
          </div>
          <Input
            label="Numero"
            value={empresa.numero}
            onChange={setEmpField("numero")}
            placeholder="123"
            maxLength={5}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Input
            label="Complemento"
            value={empresa.complemento}
            onChange={setEmpField("complemento")}
            placeholder="SALA 1"
            charLimit={15}
          />
          <Input
            label="Cidade"
            value={empresa.cidade}
            onChange={setEmpField("cidade")}
            placeholder="SAO PAULO"
            charLimit={20}
          />
          <Input
            label="CEP"
            value={empresa.cep}
            onChange={setEmpField("cep")}
            placeholder="01310-100"
            mask="cep"
          />
          <Input
            label="Estado (UF)"
            value={empresa.estado}
            onChange={setEmpField("estado")}
            placeholder="SP"
            maxLength={2}
          />
        </div>
      </Card>
    </div>
  );
}
