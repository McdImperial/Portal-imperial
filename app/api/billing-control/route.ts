import { NextRequest, NextResponse } from "next/server";

type BillingProduct = {
  code: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  invoice: string;
  invoiceDate: string;
  supplier: string;
};

type StoreProduct = {
  code: string;
  description: string;
  quantity: number;
  unit: string;
  price: number;
  recordedDate: string;
};

// Dados de exemplo extraídos das faturas do Google Drive
const sampleBillingData: BillingProduct[] = [
  {
    code: "07390-043",
    description: "CEBOLAS GRELHADAS",
    quantity: 2,
    unit: "BX1",
    unitPrice: 19.35,
    totalPrice: 38.7,
    invoice: "ZF2 BW1X/7131341744",
    invoiceDate: "2026-08-17",
    supplier: "HAVI Logistics",
  },
  {
    code: "00005-084",
    description: "CARNE REG",
    quantity: 16,
    unit: "BX1",
    unitPrice: 120.082,
    totalPrice: 1921.31,
    invoice: "ZF2 BW1X/7131341744",
    invoiceDate: "2026-08-17",
    supplier: "HAVI Logistics",
  },
  {
    code: "00006-493",
    description: "CARNE ROYAL",
    quantity: 24,
    unit: "BX1",
    unitPrice: 120.822,
    totalPrice: 2899.73,
    invoice: "ZF2 BW1X/7131341744",
    invoiceDate: "2026-08-17",
    supplier: "HAVI Logistics",
  },
  {
    code: "04430-193",
    description: "CHK DELIGHT",
    quantity: 6,
    unit: "BX1",
    unitPrice: 72.329,
    totalPrice: 433.97,
    invoice: "ZF2 BW1X/7131341744",
    invoiceDate: "2026-08-17",
    supplier: "HAVI Logistics",
  },
  {
    code: "08272-835",
    description: "PAO PHILLY",
    quantity: 10,
    unit: "103",
    unitPrice: 9.829,
    totalPrice: 98.29,
    invoice: "ZF2 BW1X/7131341744",
    invoiceDate: "2026-08-17",
    supplier: "HAVI Logistics",
  },
  {
    code: "00002-814",
    description: "PAO ROYAL BEST BURGUER",
    quantity: 20,
    unit: "103",
    unitPrice: 8.038,
    totalPrice: 160.76,
    invoice: "ZF2 BW1X/7131341744",
    invoiceDate: "2026-08-17",
    supplier: "HAVI Logistics",
  },
  {
    code: "06070-092",
    description: "PAO BATATA",
    quantity: 17,
    unit: "103",
    unitPrice: 9.813,
    totalPrice: 166.82,
    invoice: "ZF2 BW1X/7131341744",
    invoiceDate: "2026-08-17",
    supplier: "HAVI Logistics",
  },
  {
    code: "08272-835",
    description: "PAO PHILLY",
    quantity: 15,
    unit: "103",
    unitPrice: 9.629,
    totalPrice: 144.44,
    invoice: "ZG2 BW8X/7138470161",
    invoiceDate: "2026-08-04",
    supplier: "HAVI Logistics",
  },
  {
    code: "00002-814",
    description: "PAO ROYAL BEST BURGUER",
    quantity: 29,
    unit: "103",
    unitPrice: 7.798,
    totalPrice: 226.14,
    invoice: "ZG2 BW8X/7138470161",
    invoiceDate: "2026-08-04",
    supplier: "HAVI Logistics",
  },
];

// Dados de exemplo do My Store (geralmente vindos de uma base de dados real)
const sampleStoreData: StoreProduct[] = [
  {
    code: "07390-043",
    description: "CEBOLAS GRELHADAS",
    quantity: 2,
    unit: "BX1",
    price: 19.35,
    recordedDate: "2026-08-17",
  },
  {
    code: "00005-084",
    description: "CARNE REG",
    quantity: 15, // Diferença de quantidade
    unit: "BX1",
    price: 120.082,
    recordedDate: "2026-08-17",
  },
  {
    code: "00006-493",
    description: "CARNE ROYAL",
    quantity: 24,
    unit: "BX1",
    price: 122.0, // Preço diferente
    recordedDate: "2026-08-17",
  },
  {
    code: "04430-193",
    description: "CHK DELIGHT",
    quantity: 6,
    unit: "BX1",
    price: 72.329,
    recordedDate: "2026-08-17",
  },
  {
    code: "08272-835",
    description: "PAO PHILLY",
    quantity: 10,
    unit: "103",
    price: 9.829,
    recordedDate: "2026-08-17",
  },
  {
    code: "00002-814",
    description: "PAO ROYAL BEST BURGUER",
    quantity: 20,
    unit: "103",
    price: 8.038,
    recordedDate: "2026-08-17",
  },
  {
    code: "06070-092",
    description: "PAO BATATA",
    quantity: 17,
    unit: "103",
    price: 9.813,
    recordedDate: "2026-08-17",
  },
  // Faltam produtos da fatura ZG2 BW8X/7138470161
];

export async function GET(request: NextRequest) {
  try {
    // Em produção, isto buscaria dados reais do Google Drive e da BD do My Store
    // Por enquanto, retorna dados de exemplo
    return NextResponse.json({
      billing: sampleBillingData,
      store: sampleStoreData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao processar faturação:", error);
    return NextResponse.json({ error: "Erro ao processar faturação" }, { status: 500 });
  }
}
