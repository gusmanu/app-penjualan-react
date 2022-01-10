import numeral from "numeral";

numeral.register("locale", "id", {
  delimiters: {
    thousands: ".",
    decimals: ",",
  },
  abbreviations: {
    thousand: "rb",
    million: "jt",
    billion: "M",
    trillion: "T",
  },
  currency: {
    symbol: "Rp",
  },
});

numeral.locale("id");

export const currency = (num) => {
  return numeral(num).format("$0,0");
};
