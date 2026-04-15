export const masks = {
  cpfCnpj: (v) => {
    const d = v.replace(/\D/g, "").slice(0, 14);
    if (d.length <= 11) return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    return d.replace(/(\d{2})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1/$2").replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  },
  cep: (v) => {
    const d = v.replace(/\D/g, "").slice(0, 8);
    return d.replace(/(\d{5})(\d)/, "$1-$2");
  },
  agencia: (v) => v.replace(/\D/g, "").slice(0, 5),
  conta: (v) => v.replace(/\D/g, "").slice(0, 12),
  dv: (v) => v.replace(/\D/g, "").slice(0, 1),
  banco: (v) => v.replace(/\D/g, "").slice(0, 3),
  nsa: (v) => v.replace(/\D/g, "").slice(0, 6),
  ispb: (v) => v.replace(/\D/g, "").slice(0, 8),
  ugSiape: (v) => v.replace(/\D/g, "").slice(0, 6),
  nossoNumero: (v) => v.slice(0, 20),
  valor: (v) => {
    const d = v.replace(/[^\d]/g, "");
    if (!d) return "";
    const num = (parseInt(d, 10) / 100).toFixed(2);
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  },
};
