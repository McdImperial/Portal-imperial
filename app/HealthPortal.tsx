"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import BillingControl from "./BillingControl";

type Profile = "Tiago Soutelo" | "Marlene Soutelo";
type Area = "Financeiro" | "Saúde" | "Controlo de Faturação";
type RecordKind = "weight" | "blood_pressure" | "activity" | "medical";
type HealthRecord = {
  id: number;
  profile: Profile;
  kind: RecordKind;
  recordedAt: string;
  value1: number | null;
  value2: number | null;
  unit: string | null;
  title: string | null;
  notes: string | null;
  duration: number | null;
};
type MetricGroup = "body" | "pressure" | "activity";
type HealthMetric = {
  id: number;
  profile: Profile;
  groupName: MetricGroup;
  metricKey: string;
  metricLabel: string;
  recordedAt: string;
  value: number;
  unit: string | null;
  sourceUrl: string | null;
  note: string | null;
};

type FinanceCategory = "Eletricidade" | "Água" | "Mobilidade elétrica" | "Internet & TV";
type FinanceInvoice = { category: FinanceCategory; date: string; total: number | null; provider: string; url: string; period: string; fileName?: string };
type FinanceSection = "Gastos gerais" | "Bancos";
type BankName = "Millennium BCP" | "Novo Banco" | "BPI";
type ClinicalMetric = { label: string; current: number; previous: number; unit: string; };
type ClinicalGroup = { title: string; metrics: ClinicalMetric[]; };
type ClinicalComparisonSet = { currentDate: string; previousDate: string; groups: ClinicalGroup[] };

const profiles: { name: Profile; initials: string; tint: string }[] = [
  { name: "Tiago Soutelo", initials: "TS", tint: "blue" },
  { name: "Marlene Soutelo", initials: "MS", tint: "plum" },
];

const fallback: HealthRecord[] = [
  { id: 1, profile: "Tiago Soutelo", kind: "weight", recordedAt: "2026-08-03", value1: 78.4, value2: null, unit: "kg", title: null, notes: null, duration: null },
  { id: 2, profile: "Tiago Soutelo", kind: "weight", recordedAt: "2026-07-27", value1: 79.1, value2: null, unit: "kg", title: null, notes: null, duration: null },
  { id: 3, profile: "Tiago Soutelo", kind: "blood_pressure", recordedAt: "2026-08-03", value1: 122, value2: 78, unit: "mmHg", title: null, notes: "Medição ao acordar", duration: null },
  { id: 4, profile: "Tiago Soutelo", kind: "blood_pressure", recordedAt: "2026-07-30", value1: 126, value2: 81, unit: "mmHg", title: null, notes: null, duration: null },
  { id: 5, profile: "Tiago Soutelo", kind: "activity", recordedAt: "2026-08-02", value1: 6.2, value2: 8250, unit: "km", title: "Caminhada", notes: "Parque e zona ribeirinha", duration: 54 },
  { id: 6, profile: "Tiago Soutelo", kind: "activity", recordedAt: "2026-07-31", value1: 3.8, value2: 5100, unit: "km", title: "Caminhada", notes: null, duration: 37 },
  { id: 7, profile: "Tiago Soutelo", kind: "medical", recordedAt: "2026-07-21", value1: null, value2: null, unit: null, title: "Consulta de rotina", notes: "Rever análises na próxima consulta.", duration: null },
  { id: 8, profile: "Marlene Soutelo", kind: "weight", recordedAt: "2026-08-01", value1: 64.7, value2: null, unit: "kg", title: null, notes: null, duration: null },
  { id: 9, profile: "Marlene Soutelo", kind: "weight", recordedAt: "2026-07-24", value1: 65.2, value2: null, unit: "kg", title: null, notes: null, duration: null },
  { id: 10, profile: "Marlene Soutelo", kind: "blood_pressure", recordedAt: "2026-08-02", value1: 116, value2: 74, unit: "mmHg", title: null, notes: "Antes do pequeno-almoço", duration: null },
  { id: 11, profile: "Marlene Soutelo", kind: "activity", recordedAt: "2026-08-03", value1: 4.1, value2: 6200, unit: "km", title: "Caminhada", notes: null, duration: 42 },
  { id: 12, profile: "Marlene Soutelo", kind: "medical", recordedAt: "2026-07-18", value1: null, value2: null, unit: null, title: "Análises clínicas", notes: "Resultados arquivados.", duration: null },
];

const navItems = ["Visão geral", "Registos", "Atividade", "Evolução", "Exames", "Health Manager"] as const;

const financeInvoices: FinanceInvoice[] = [
  { category: "Eletricidade", date: "2026-05-06", total: 89.18, provider: "EDP", period: "4 abr — 3 mai 2026", url: "https://drive.google.com/file/d/1d6fpF66En1F_Jpy7x3X66VbQ6rzdmqn6/view?usp=drivesdk" },
  { category: "Água", date: "2026-05-08", total: 56.28, provider: "Águas de Gaia", period: "9 abr — 8 mai 2026", url: "https://drive.google.com/file/d/1yzdruDN_ady6ACSz_TXaxPWrHIkEySUZ/view?usp=drivesdk" },
  { category: "Mobilidade elétrica", date: "2026-06-02", total: 118.15, provider: "EDP", period: "Fatura de mobilidade elétrica", url: "https://drive.google.com/file/d/1OL8IZSqhu467T_QGO3-Ouqi3C1e5GVGL/view?usp=drivesdk" },
  { category: "Internet & TV", date: "2026-07-18", total: 73.33, provider: "Vodafone", period: "16 jun — 15 jul 2026", url: "https://drive.google.com/file/d/1y0NT5TvkIE2Q0erzj5YxsrHdBwQrBabb/view?usp=drivesdk" },
  { category: "Eletricidade", date: "2026-06-06", total: 87.67, provider: "EDP", period: "Fatura de eletricidade", fileName:"100009585459.pdf", url:"https://drive.google.com/file/d/1QBRw9jAvqtLJ0PpE9QJyDk6MJGpA9K0f/view?usp=drivesdk" },
  { category: "Eletricidade", date: "2026-07-06", total: 81.95, provider: "EDP", period: "Fatura de eletricidade", fileName:"134007441063.pdf", url:"https://drive.google.com/file/d/1TuXi-IxPUQgv0JYW7EvPWhh8eLGSQ84q/view?usp=drivesdk" },
  { category: "Eletricidade", date: "2026-01-06", total: 96.50, provider: "EDP", period: "Fatura de eletricidade", fileName:"180006512004.pdf", url:"https://drive.google.com/file/d/1zcbB3ZM2D-7oKarUSIg67rxgGs9tgNbH/view?usp=drivesdk" },
  { category: "Eletricidade", date: "2026-02-12", total: 109.47, provider: "EDP", period: "Fatura de eletricidade", fileName:"204005871789.pdf", url:"https://drive.google.com/file/d/1V9VWx0LGRMjtOX9gd3Kqlh8itwlyc0zw/view?usp=drivesdk" },
  { category: "Eletricidade", date: "2026-03-09", total: 81.60, provider: "EDP", period: "Fatura de eletricidade", fileName:"234002742671.pdf", url:"https://drive.google.com/file/d/1C2ix34H_qpgN9nUpgJBgQkljkAbxuYlM/view?usp=drivesdk" },
  { category: "Eletricidade", date: "2026-04-06", total: 80.89, provider: "EDP", period: "Fatura de eletricidade", fileName:"132007371333.pdf", url:"https://drive.google.com/file/d/1HqrRqWB03h5j4aKHiv2534kFdvpOZy1c/view?usp=drivesdk" },
  { category: "Eletricidade", date: "2026-08-06", total: 74.63, provider: "EDP", period: "Fatura de eletricidade", fileName:"236002791958.pdf", url:"https://drive.google.com/file/d/1kFUHzFnQ_d-uxgENAsuYtvzaHjarXWZE/view?usp=drivesdk" },
  { category: "Água", date:"2026-01-08",total:58.69,provider:"Águas de Gaia",period:"Fatura mensal",fileName:"036.DP.26010362001512499.PDF",url:"https://drive.google.com/file/d/1FeQyKj4yqMDUWWmSZpER_pGyonQBcVPy/view?usp=drivesdk" },
  { category: "Água", date:"2026-02-08",total:54.84,provider:"Águas de Gaia",period:"Fatura mensal",fileName:"036.DP.26020362002034999.PDF",url:"https://drive.google.com/file/d/18xcmdcZ2ZHQCUOMXqrIowv1Mc5mFgFFY/view?usp=drivesdk" },
  { category: "Água", date:"2026-03-08",total:53.01,provider:"Águas de Gaia",period:"Fatura mensal",fileName:"036.DP.26030362001955899.PDF",url:"https://drive.google.com/file/d/1mTvH-GMW23Mk4Ug-SKW0WHaSX4uAjByX/view?usp=drivesdk" },
  { category: "Água", date:"2026-04-08",total:62.92,provider:"Águas de Gaia",period:"Fatura mensal",fileName:"036.DP.26040362001399099.PDF",url:"https://drive.google.com/file/d/1afmd3SEmjEkfWwMPEGR3Xf7fIjC2-iE8/view?usp=drivesdk" },
  { category: "Água", date:"2026-06-08",total:62.92,provider:"Águas de Gaia",period:"Fatura mensal",fileName:"036.DP.26060362002103799.PDF",url:"https://drive.google.com/file/d/1ZKOyNo3mg8WgjQ3MEdI_X--T7bxWbBbB/view?usp=drivesdk" },
  { category: "Água", date:"2026-07-08",total:59.60,provider:"Águas de Gaia",period:"Fatura mensal",fileName:"036.DP.26070362001545099.PDF",url:"https://drive.google.com/file/d/1CgmgUg2l9Vfhuv3-9AXMUFM8D3xTN1B-/view?usp=drivesdk" },
  { category:"Mobilidade elétrica",date:"2026-01-02",total:55.01,provider:"EDP",period:"Fatura de mobilidade elétrica",fileName:"807000078834.pdf",url:"https://drive.google.com/file/d/14h4qg5m93rjpEuMWaZu-77929eYjzyjX/view?usp=drivesdk" },
  { category:"Mobilidade elétrica",date:"2026-02-02",total:65.27,provider:"EDP",period:"Fatura de mobilidade elétrica",fileName:"807390081312.pdf",url:"https://drive.google.com/file/d/16NVo0b50dQf7YlyKfHOoU9T2mDVibVM5/view?usp=drivesdk" },
  { category:"Mobilidade elétrica",date:"2026-03-02",total:20.65,provider:"EDP",period:"Fatura de mobilidade elétrica",fileName:"807790082874.pdf",url:"https://drive.google.com/file/d/1P_U3w_tfG9ryIH1FSegmjQpJPEuKjROo/view?usp=drivesdk" },
  { category:"Mobilidade elétrica",date:"2026-04-02",total:68.19,provider:"EDP",period:"Fatura de mobilidade elétrica",fileName:"807000085196.pdf",url:"https://drive.google.com/file/d/1PRudt7Y9bWJdsiLHIluSndIEixxqV8rf/view?usp=drivesdk" },
  { category:"Mobilidade elétrica",date:"2026-05-04",total:27.40,provider:"EDP",period:"Fatura de mobilidade elétrica",fileName:"807190087215.pdf",url:"https://drive.google.com/file/d/1IFINmIMjj3ROzTa4Hv73-HKBPFbDd3Og/view?usp=drivesdk" },
  { category:"Mobilidade elétrica",date:"2026-07-03",total:56.83,provider:"EDP",period:"Fatura de mobilidade elétrica",fileName:"807190091862.pdf",url:"https://drive.google.com/file/d/1ghihVjWE17Q9cjZZwUl42r3fOC0oXPwP/view?usp=drivesdk" },
  { category:"Mobilidade elétrica",date:"2026-08-03",total:47.79,provider:"EDP",period:"Fatura de mobilidade elétrica",fileName:"807990094742.pdf",url:"https://drive.google.com/file/d/1l5r9Up5FY1M5ogrXtaKLCojrfMgOYMgS/view?usp=drivesdk" },
  ...[["2026-01",58.62],["2026-02",59.27],["2026-03",61.79],["2026-04",63.34],["2026-05",63.34],["2026-06",63.34]].map(([month,total]) => ({ category:"Internet & TV" as FinanceCategory, date:`${month}-18`,total:total as number,provider:"Vodafone",period:"Fatura mensal",fileName:`fatura_${String(month).replace("-","")}16.pdf`,url:({"2026-01":"https://drive.google.com/file/d/12QEpssdjJ9C8TJNVt7ARznrEseWl3DV1/view?usp=drivesdk","2026-02":"https://drive.google.com/file/d/1oQa8PUD6PiWk0-pJtYqUBap6iow0FWMq/view?usp=drivesdk","2026-03":"https://drive.google.com/file/d/1MoImECUGdaZZaZTAtwTaDhEICPrPBI5L/view?usp=drivesdk","2026-04":"https://drive.google.com/file/d/1eVM5fWe5Vrda7ycffODs1uCuvozY6Fvw/view?usp=drivesdk","2026-05":"https://drive.google.com/file/d/16jgwuEXmiOjwlGQbfPepFIctydxB96m-/view?usp=drivesdk","2026-06":"https://drive.google.com/file/d/1VkLb7SBNu-mdjHZuDbBP-hzg27OnVgpA/view?usp=drivesdk"} as Record<string,string>)[String(month)] })),
];

const latestClinicalComparisons: Record<Profile, ClinicalComparisonSet> = {
  "Tiago Soutelo": {
    currentDate: "2026-05-27", previousDate: "2025-12-17", groups: [
      { title: "Hemograma", metrics: [
        { label:"Eritrócitos",current:5.19,previous:5.27,unit:"x10¹²/L" },{ label:"Hemoglobina",current:14.6,previous:15.2,unit:"g/dL" },{ label:"Hematócrito",current:44.6,previous:45.5,unit:"%" },{ label:"VCM",current:85.9,previous:86.3,unit:"fL" },{ label:"HCM",current:28.1,previous:28.8,unit:"pg" },{ label:"CHCM",current:32.7,previous:33.4,unit:"g/dL" },{ label:"RDW",current:12.6,previous:13.3,unit:"%" },{ label:"Leucócitos",current:5.14,previous:5.46,unit:"x10⁹/L" },{ label:"Neutrófilos",current:2.69,previous:3.10,unit:"x10⁹/L" },{ label:"Linfócitos",current:1.85,previous:1.76,unit:"x10⁹/L" },{ label:"Monócitos",current:.35,previous:.37,unit:"x10⁹/L" },{ label:"Eosinófilos",current:.22,previous:.19,unit:"x10⁹/L" },{ label:"Basófilos",current:.03,previous:.04,unit:"x10⁹/L" },{ label:"Plaquetas",current:316,previous:292,unit:"x10⁹/L" },{ label:"MPV",current:10.8,previous:10.2,unit:"fL" },{ label:"PDW",current:13.5,previous:11.8,unit:"10(GSD)" },{ label:"PCT",current:.34,previous:.30,unit:"%" },
      ] },
      { title: "Glicemia, função renal e lípidos", metrics: [
        { label:"Glicose",current:91,previous:100,unit:"mg/dL" },{ label:"HbA1c (NGSP)",current:5.2,previous:5.3,unit:"%" },{ label:"Glicemia média estimada",current:103,previous:105,unit:"mg/dL" },{ label:"Creatinina",current:.80,previous:.83,unit:"mg/dL" },{ label:"TFGe",current:117,previous:112,unit:"mL/min/1,73m²" },{ label:"Ácido úrico",current:5.7,previous:5.9,unit:"mg/dL" },{ label:"Colesterol total",current:161,previous:195,unit:"mg/dL" },{ label:"Colesterol HDL",current:33,previous:29,unit:"mg/dL" },{ label:"Triglicerídeos",current:93,previous:275,unit:"mg/dL" },
      ] },
      { title: "Marcadores", metrics: [{ label:"PSA total",current:.809,previous:.839,unit:"ng/mL" }] },
    ],
  },
  "Marlene Soutelo": {
    currentDate: "2026-05-27", previousDate: "2026-02-19", groups: [
      { title: "Hemograma", metrics: [
        { label:"Eritrócitos",current:4.78,previous:4.95,unit:"x10¹²/L" },{ label:"Hemoglobina",current:15.1,previous:15.9,unit:"g/dL" },{ label:"Hematócrito",current:44.3,previous:45.8,unit:"%" },{ label:"VCM",current:92.7,previous:92.5,unit:"fL" },{ label:"HCM",current:31.6,previous:32.1,unit:"pg" },{ label:"CHCM",current:34.1,previous:34.7,unit:"g/dL" },{ label:"RDW",current:12.5,previous:12.3,unit:"%" },{ label:"Leucócitos",current:6.92,previous:8.55,unit:"x10⁹/L" },{ label:"Neutrófilos",current:4.69,previous:6.03,unit:"x10⁹/L" },{ label:"Linfócitos",current:1.33,previous:1.43,unit:"x10⁹/L" },{ label:"Monócitos",current:.70,previous:.90,unit:"x10⁹/L" },{ label:"Eosinófilos",current:.16,previous:.14,unit:"x10⁹/L" },{ label:"Basófilos",current:.04,previous:.05,unit:"x10⁹/L" },{ label:"Plaquetas",current:249,previous:306,unit:"x10⁹/L" },{ label:"MPV",current:11.4,previous:10.4,unit:"fL" },{ label:"PDW",current:13.5,previous:11.8,unit:"10(GSD)" },{ label:"PCT",current:.28,previous:.32,unit:"%" },
      ] },
      { title: "Bioquímica", metrics: [
        { label:"Creatinina",current:.79,previous:.76,unit:"mg/dL" },{ label:"TFGe",current:88,previous:92,unit:"mL/min/1,73m²" },{ label:"AST/GOT",current:23,previous:17,unit:"U/L" },{ label:"ALT/GPT",current:24,previous:24,unit:"U/L" },{ label:"Ferro",current:121,previous:208,unit:"µg/dL" },{ label:"Ferritina",current:87,previous:129,unit:"ng/mL" },{ label:"Colesterol total",current:120,previous:216,unit:"mg/dL" },{ label:"Colesterol LDL",current:64,previous:151,unit:"mg/dL" },
      ] },
    ],
  },
};

const clinicalComparisons: Record<Profile, ClinicalComparisonSet[]> = {
  "Tiago Soutelo": [
    { currentDate: "2025-12-17", previousDate: "2025-04-16", groups: [
      { title: "Hemograma", metrics: [
        { label:"Eritrócitos",current:5.27,previous:5.51,unit:"x10¹²/L" }, { label:"Hemoglobina",current:15.2,previous:16,unit:"g/dL" }, { label:"Hematócrito",current:45.5,previous:47,unit:"%" }, { label:"VCM",current:86.3,previous:85.3,unit:"fL" }, { label:"Leucócitos",current:5.46,previous:4.17,unit:"x10⁹/L" }, { label:"Plaquetas",current:292,previous:281,unit:"x10⁹/L" },
      ] },
      { title: "Glicemia, função renal e lípidos", metrics: [
        { label:"Glicose",current:100,previous:124,unit:"mg/dL" }, { label:"Creatinina",current:.83,previous:.89,unit:"mg/dL" }, { label:"TFGe",current:112,previous:103,unit:"mL/min/1,73m²" }, { label:"Ácido úrico",current:5.9,previous:6.2,unit:"mg/dL" }, { label:"Colesterol total",current:195,previous:180,unit:"mg/dL" }, { label:"Colesterol HDL",current:29,previous:25,unit:"mg/dL" }, { label:"Triglicerídeos",current:275,previous:480,unit:"mg/dL" },
      ] },
    ] },
    latestClinicalComparisons["Tiago Soutelo"],
  ],
  "Marlene Soutelo": [
    { currentDate: "2026-02-19", previousDate: "2021-07-16", groups: [
      { title: "Hemograma", metrics: [
        { label:"Eritrócitos",current:4.95,previous:4.53,unit:"x10¹²/L" }, { label:"Hemoglobina",current:15.9,previous:14.9,unit:"g/dL" }, { label:"Hematócrito",current:45.8,previous:42.4,unit:"%" }, { label:"VCM",current:92.5,previous:93.6,unit:"fL" }, { label:"Leucócitos",current:8.55,previous:8.51,unit:"x10⁹/L" }, { label:"Plaquetas",current:306,previous:234,unit:"x10⁹/L" },
      ] },
      { title: "Bioquímica", metrics: [
        { label:"Glicose",current:100,previous:85,unit:"mg/dL" }, { label:"Creatinina",current:.76,previous:.80,unit:"mg/dL" }, { label:"AST/GOT",current:17,previous:15,unit:"U/L" }, { label:"ALT/GPT",current:24,previous:20,unit:"U/L" }, { label:"Ácido úrico",current:8.5,previous:5.8,unit:"mg/dL" }, { label:"Colesterol total",current:216,previous:188,unit:"mg/dL" }, { label:"Colesterol HDL",current:49,previous:50,unit:"mg/dL" }, { label:"Triglicerídeos",current:80,previous:78,unit:"mg/dL" },
      ] },
    ] },
    latestClinicalComparisons["Marlene Soutelo"],
  ],
};

type ReferenceRange = { label: string; min?: number; max?: number };
const clinicalReferences: Record<Profile, Record<string, ReferenceRange>> = {
  "Tiago Soutelo": {
    "Eritrócitos": { label: "4,30 — 6,40", min: 4.3, max: 6.4 }, "Hemoglobina": { label: "13,0 — 16,5", min: 13, max: 16.5 }, "Hematócrito": { label: "39,8 — 52,0", min: 39.8, max: 52 }, "VCM": { label: "80 — 97", min: 80, max: 97 }, "HCM": { label: "26 — 34", min: 26, max: 34 }, "CHCM": { label: "32 — 36", min: 32, max: 36 }, "RDW": { label: "11,6 — 14,0", min: 11.6, max: 14 }, "Leucócitos": { label: "4,00 — 10,00", min: 4, max: 10 }, "Plaquetas": { label: "140 — 440", min: 140, max: 440 }, "Glicose": { label: "70 — 105", min: 70, max: 105 }, "Creatinina": { label: "0,74 — 1,35", min: .74, max: 1.35 }, "TFGe": { label: "≥ 60", min: 60 }, "Ácido úrico": { label: "3,7 — 7,7", min: 3.7, max: 7.7 }, "Colesterol total": { label: "< 190", max: 190 }, "Colesterol HDL": { label: "> 40", min: 40 }, "Triglicerídeos": { label: "< 150", max: 150 }, "PSA total": { label: "< 4,0", max: 4 },
  },
  "Marlene Soutelo": {
    "Eritrócitos": { label: "3,90 — 5,20", min: 3.9, max: 5.2 }, "Hemoglobina": { label: "12,0 — 16,0", min: 12, max: 16 }, "Hematócrito": { label: "34,7 — 46,0", min: 34.7, max: 46 }, "VCM": { label: "80 — 97", min: 80, max: 97 }, "HCM": { label: "26 — 34", min: 26, max: 34 }, "CHCM": { label: "32 — 36", min: 32, max: 36 }, "RDW": { label: "11,6 — 14,0", min: 11.6, max: 14 }, "Leucócitos": { label: "4,00 — 10,00", min: 4, max: 10 }, "Plaquetas": { label: "140 — 440", min: 140, max: 440 }, "Glicose": { label: "70 — 105", min: 70, max: 105 }, "Creatinina": { label: "0,59 — 1,04", min: .59, max: 1.04 }, "TFGe": { label: "≥ 60", min: 60 }, "AST/GOT": { label: "5 — 34", min: 5, max: 34 }, "ALT/GPT": { label: "< 56", max: 56 }, "Ferro": { label: "50 — 170", min: 50, max: 170 }, "Ferritina": { label: "11 — 307", min: 11, max: 307 }, "Ácido úrico": { label: "2,6 — 6,0", min: 2.6, max: 6 }, "Colesterol total": { label: "< 190", max: 190 }, "Colesterol HDL": { label: "> 40", min: 40 }, "Colesterol LDL": { label: "< 100", max: 100 }, "Triglicerídeos": { label: "< 150", max: 150 },
  },
};

function displayDate(value: string) {
  return new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "short" }).format(new Date(`${value}T12:00:00`));
}

function displayChartMonth(value: string) {
  const date = new Date(`${value}T12:00:00`);
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${months[date.getMonth()]}.${String(date.getFullYear()).slice(-2)}`;
}

function lastOf(items: HealthRecord[], kind: RecordKind) {
  return items.filter((item) => item.kind === kind).sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0];
}

export default function HealthPortal() {
  const [area, setArea] = useState<Area>("Saúde");
  const [financeSection, setFinanceSection] = useState<FinanceSection>("Gastos gerais");
  const [financeCategory, setFinanceCategory] = useState<FinanceCategory>("Eletricidade");
  const [selectedBank, setSelectedBank] = useState<BankName>("Millennium BCP");
  const [profile, setProfile] = useState<Profile>("Tiago Soutelo");
  const [activeNav, setActiveNav] = useState<(typeof navItems)[number]>("Visão geral");
  const [records, setRecords] = useState<HealthRecord[]>(fallback);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<RecordKind | null>(null);
  const [saved, setSaved] = useState(false);

  const loadRecords = useCallback(async () => {
    try {
      const response = await fetch("/api/records", { cache: "no-store" });
      if (response.ok) {
        const data = (await response.json()) as { records: HealthRecord[] };
        setRecords(data.records);
      }
      const metricsResponse = await fetch("/api/metrics", { cache: "no-store" });
      if (metricsResponse.ok) {
        const data = (await metricsResponse.json()) as { metrics: HealthMetric[] };
        setMetrics(data.metrics);
      }
    } catch {
      // The in-product preview uses realistic examples until cloud storage is available.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadRecords(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadRecords]);

  const personRecords = useMemo(
    () => records.filter((item) => item.profile === profile).sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)),
    [profile, records],
  );
  const weight = lastOf(personRecords, "weight");
  const previousWeight = personRecords.filter((r) => r.kind === "weight")[1];
  const bp = lastOf(personRecords, "blood_pressure");
  const activities = personRecords.filter((r) => r.kind === "activity");
  const activityMinutes = activities.reduce((sum, item) => sum + (item.duration ?? 0), 0);
  const activityDistance = activities.reduce((sum, item) => sum + (item.value1 ?? 0), 0);
  const steps = activities.reduce((sum, item) => sum + (item.value2 ?? 0), 0);
  const medical = personRecords.filter((r) => r.kind === "medical");
  const personMetrics = useMemo(
    () => metrics.filter((item) => item.profile === profile),
    [metrics, profile],
  );

  async function submitRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      profile,
      kind: modal,
      recordedAt: data.get("recordedAt"),
      value1: data.get("value1") || null,
      value2: data.get("value2") || null,
      unit: modal === "weight" ? "kg" : modal === "blood_pressure" ? "mmHg" : modal === "activity" ? "km" : null,
      title: data.get("title") || null,
      notes: data.get("notes") || null,
      duration: data.get("duration") || null,
    };
    try {
      const response = await fetch("/api/records", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      if (response.ok) await loadRecords();
      else throw new Error();
    } catch {
      const optimistic: HealthRecord = {
        id: Date.now(), profile, kind: modal!, recordedAt: String(payload.recordedAt),
        value1: payload.value1 ? Number(payload.value1) : null, value2: payload.value2 ? Number(payload.value2) : null,
        unit: payload.unit, title: payload.title ? String(payload.title) : null, notes: payload.notes ? String(payload.notes) : null,
        duration: payload.duration ? Number(payload.duration) : null,
      };
      setRecords((current) => [optimistic, ...current]);
    }
    setModal(null);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2800);
  }

  const chartWeights = personRecords.filter((r) => r.kind === "weight").slice(0, 8).reverse();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">◇</span><span>Portal Soutelo</span></div>
        <p className="side-label">Áreas</p>
        <div className="area-list">
          <button className={`area-button ${area === "Financeiro" ? "selected" : ""}`} onClick={() => setArea("Financeiro")}>
            <span className="area-icon finance">€</span><span><strong>Financeiro</strong><small>Documentos e despesas</small></span>
          </button>
          <button className={`area-button ${area === "Controlo de Faturação" ? "selected" : ""}`} onClick={() => setArea("Controlo de Faturação")}>
            <span className="area-icon billing">📋</span><span><strong>Controlo de Faturação</strong><small>Validação de fornecedores</small></span>
          </button>
          <button className={`area-button ${area === "Saúde" ? "selected" : ""}`} onClick={() => setArea("Saúde")}>
            <span className="area-icon health">♡</span><span><strong>Saúde</strong><small>Registos e evolução</small></span>
          </button>
        </div>
        {area === "Saúde" && <div className="health-navigation">
          <p className="side-label profile-label">Perfis</p>
          <div className="profile-list">
            {profiles.map((item) => (
              <button key={item.name} className={`profile-button ${profile === item.name ? "selected" : ""}`} onClick={() => setProfile(item.name)}>
                <span className={`avatar ${item.tint}`}>{item.initials}</span><span>{item.name}</span>
              </button>
            ))}
          </div>
          <nav aria-label="Navegação da área de saúde">
            {navItems.map((item) => <button key={item} className={activeNav === item ? "active" : ""} onClick={() => setActiveNav(item)}><span className="nav-dot" />{item}</button>)}
          </nav>
        </div>}
        {area === "Financeiro" && <div className="finance-navigation">
          <p className="side-label profile-label">Financeiro</p>
          <nav aria-label="Navegação da área financeira">
            <button className={financeSection === "Gastos gerais" ? "active" : ""} onClick={() => setFinanceSection("Gastos gerais")}><span className="nav-dot" />Gastos gerais</button>
            {financeSection === "Gastos gerais" && <div className="finance-subnav">{expenseCategories.map((item) => <button key={item.name} className={financeCategory === item.name ? "active" : ""} onClick={() => { setFinanceSection("Gastos gerais"); setFinanceCategory(item.name); }}><span>{item.icon}</span>{item.name}</button>)}</div>}
            <button className={financeSection === "Bancos" ? "active" : ""} onClick={() => setFinanceSection("Bancos")}><span className="nav-dot" />Bancos</button>
            {financeSection === "Bancos" && <div className="finance-subnav">{bankFolders.map((bank) => <button key={bank.name} className={selectedBank === bank.name ? "active" : ""} onClick={() => { setFinanceSection("Bancos"); setSelectedBank(bank.name); }}><span>{bank.icon}</span>{bank.name}</button>)}</div>}
          </nav>
        </div>}
        <div className="privacy-note"><span>Espaço privado</span><small>Apenas as pessoas autorizadas podem aceder a este portal.</small></div>
      </aside>

      <main>
        {area === "Financeiro" ? <FinanceDashboard section={financeSection} category={financeCategory} selectedBank={selectedBank} onCategoryChange={setFinanceCategory} /> : area === "Controlo de Faturação" ? <BillingControl /> : <>
        <header className="topbar">
          <div>
            <p className="eyebrow">{activeNav}</p>
            <h1>Boa noite, {profile.split(" ")[0]}</h1>
            <p>Acompanhe o seu bem-estar, com tudo no mesmo lugar.</p>
          </div>
          <div className="header-actions">
            <button className="date-chip">Todo o histórico <span>⌄</span></button>
            <button className="primary" onClick={() => setModal("weight")}><span>＋</span> Novo registo</button>
          </div>
        </header>

        {activeNav === "Visão geral" && <>
          <section className="metrics-grid" aria-label="Resumo de saúde">
            <MetricCard tone="sage" label="Peso atual" value={weight ? `${weight.value1} kg` : "—"} detail={previousWeight && weight ? `${(Number(weight.value1) - Number(previousWeight.value1)).toFixed(1)} kg desde ${displayDate(previousWeight.recordedAt)}` : "Adicione uma medição"} icon="↘" />
            <MetricCard tone="rose" label="Tensão arterial" value={bp ? `${bp.value1} / ${bp.value2}` : "—"} detail={bp ? `Última medição · ${displayDate(bp.recordedAt)}` : "Adicione uma medição"} icon="♡" unit="mmHg" />
            <MetricCard tone="sky" label="Atividade" value={activityMinutes ? `${activityMinutes} min` : `${activityDistance.toFixed(1)} km`} detail={`${activities.length} dias ou sessões registados`} icon="⌁" />
            <MetricCard tone="gold" label="Passos" value={new Intl.NumberFormat("pt-PT").format(steps)} detail="No histórico importado" icon="↑" />
          </section>

          <section className="content-grid">
            <article className="panel chart-panel">
              <div className="panel-heading"><div><p className="eyebrow">Tendência</p><h2>Evolução do peso</h2></div><button onClick={() => setActiveNav("Evolução")}>Ver detalhe</button></div>
              <WeightChart records={chartWeights} />
            </article>
            <article className="panel bp-panel">
              <div className="panel-heading"><div><p className="eyebrow">Medições</p><h2>Tensão arterial</h2></div><button onClick={() => setModal("blood_pressure")}>＋ Registar</button></div>
              <div className="bp-list">
                {personRecords.filter((r) => r.kind === "blood_pressure").slice(0, 3).map((item, index) => (
                  <div className="bp-row" key={item.id}><span className={`status-dot ${index === 0 ? "good" : ""}`} /><div><strong>{item.value1} / {item.value2}</strong><small>mmHg</small></div><span>{displayDate(item.recordedAt)}</span></div>
                ))}
              </div>
              <div className="soft-message">Resumo descritivo dos registos. A interpretação clínica deve ser feita por um profissional de saúde.</div>
            </article>
          </section>

          <section className="bottom-grid">
            <article className="panel recent-panel">
              <div className="panel-heading"><div><p className="eyebrow">Histórico</p><h2>Registos recentes</h2></div><button onClick={() => setActiveNav("Registos")}>Ver todos</button></div>
              {personRecords.slice(0, 4).map((item) => <RecordRow key={item.id} item={item} />)}
            </article>
            <article className="panel quick-panel">
              <p className="eyebrow">Acesso rápido</p><h2>O que quer registar?</h2>
              <div className="quick-grid">
                <button onClick={() => setModal("weight")}><span>⚖</span>Peso</button>
                <button onClick={() => setModal("blood_pressure")}><span>♡</span>Tensão</button>
                <button onClick={() => setModal("activity")}><span>⌁</span>Atividade</button>
                <button onClick={() => setModal("medical")}><span>＋</span>Saúde</button>
              </div>
            </article>
          </section>
        </>}

        {activeNav === "Registos" && <RecordsView records={personRecords} onAdd={() => setModal("medical")} />}
        {activeNav === "Atividade" && <ActivityView records={activities} onAdd={() => setModal("activity")} />}
        {activeNav === "Evolução" && <TrendsView records={personRecords} chartWeights={chartWeights} />}
        {activeNav === "Exames" && <ExamsView records={medical} profile={profile} />}
        {activeNav === "Health Manager" && <HealthManagerView metrics={personMetrics} profile={profile} />}
        </>}

        <footer><span>Portal Soutelo · Espaço familiar privado</span><span>{area === "Saúde" ? "Os registos organizam informação e não substituem aconselhamento médico." : "Área financeira reservada para desenvolvimento futuro."}</span></footer>
      </main>

      {loading && <div className="loading-pill">A atualizar os seus dados…</div>}
      {saved && <div className="toast">Registo guardado com sucesso</div>}
      {modal && <RecordModal kind={modal} profile={profile} onClose={() => setModal(null)} onSubmit={submitRecord} />}
    </div>
  );
}

function FinanceDashboard({ section, category, selectedBank, onCategoryChange }: { section: FinanceSection; category: FinanceCategory; selectedBank: BankName; onCategoryChange: (category: FinanceCategory) => void }) {
  return <section className="finance-page">
    <header className="topbar finance-header"><div><p className="eyebrow">Financeiro</p><h1>Finanças da família</h1><p>Despesas recorrentes e documentos bancários organizados a partir da pasta financeira partilhada.</p></div><a className="source-button" href="https://drive.google.com/drive/folders/1Bhtz_GJ5_bQfyqd0wGyqHkHwCV6Sk44x" target="_blank" rel="noreferrer">Abrir pasta financeira <span>↗</span></a></header>
    {section === "Gastos gerais" ? <><FinanceSummary /><div className="finance-edit-actions"><button onClick={() => document.querySelector<HTMLSelectElement>(".table-select")?.focus()}>Editar registos</button><span>Use os campos Estado e Banco em cada linha para guardar a alteração.</span></div><EditableMonthlyExpenseRegister /><FinanceBalances /><GeneralExpenses category={category} onCategoryChange={onCategoryChange} /></> : <BanksView selectedBank={selectedBank} />}
  </section>;
}

function FinanceSummary() { const income = 2998.20, insured = 294.63, expenses = 1347.33, supported = expenses - insured, available = income - supported; return <section className="finance-summary"><div className="finance-summary-title"><span>▣</span><div><p className="eyebrow">Resumo financeiro</p><h2>Setembro 2026</h2></div></div><div className="finance-summary-grid"><article className="income"><span>1</span><div><small>Rendimentos</small><strong>{euro(income)}</strong><em>Tiago + Marlene</em></div></article><article className="support"><span>2</span><div><small>Despesas suportadas</small><strong>{euro(supported)}</strong><em>Tiago + Marlene</em></div></article><article className="insured"><span>3</span><div><small>Despesas asseguradas</small><strong>{euro(insured)}</strong><em>EDP + Cofidis Carro</em></div></article><article className="available"><span>◒</span><div><small>Saldo disponível</small><strong>{euro(available)}</strong><em>Após despesas suportadas</em></div></article></div></section>; }
function FinanceBalances() { return <section className="finance-balances"><article><small>Saldos atuais em conta</small><strong>3.360,85 €</strong><span>Millennium BCP · 1.594,08 €<br/>BPI · 1.766,85 €</span></article><b>→</b><article><small>Despesas pendentes</small><strong>-1.347,33 €</strong><span>Valor por pagar este mês</span></article><b>→</b><article><small>Remanescente após pagamentos</small><strong>2.013,52 €</strong><span>Disponível após despesas pendentes</span></article></section>; }

type MonthlyExpense = { id: number; month: string; name: string; amount: number; paymentType: string; entity?: string | null; reference?: string | null; dueDate?: string | null; status: "Pendente" | "Pago"; bank: "Millennium" | "BPI" };
const monthlySeed: MonthlyExpense[] = [
  ["Vodafone",73.33,"3/9"],["Água",41.04,"7/9"],["EDP",74.63,""],["Epral / Eprogil",19.20,""],["Bankinter",150,""],["Auto Banco",190,""],["Habitação / Crédito",155.13,""],["Seguro",20,""],["Cofidis – Crédito",105,""],["Cofidis – Carro",220,""],["Crédito Millennium",109,""],["Cartão BPI",109,""],["Millennium",81,""]
].map(([name, amount, dueDate], index) => ({ id: -(index + 1), month:"2026-09", name: String(name), amount:Number(amount), paymentType:"Transferência bancária", dueDate: dueDate ? `2026-09-${String(dueDate).split("/")[0].padStart(2,"0")}` : null, status:"Pendente" as const, bank: index === 11 ? "BPI" as const : "Millennium" as const }));

function EditableMonthlyExpenseRegister() {
  const [expenses, setExpenses] = useState<MonthlyExpense[]>(monthlySeed); const [notice, setNotice] = useState("");
  useEffect(() => { void (async () => { try { const response = await fetch("/api/finance-expenses", { cache:"no-store" }); if (response.ok) { const data = await response.json() as { expenses: MonthlyExpense[] }; if (data.expenses.length) setExpenses([...data.expenses, ...monthlySeed]); } } catch {} })(); }, []);
  const total = expenses.reduce((sum, item) => sum + item.amount, 0), pending = expenses.filter((item) => item.status === "Pendente"), paid = expenses.filter((item) => item.status === "Pago");
  const update = async (item: MonthlyExpense, field: "status" | "bank", value: string) => { const next = { ...item, [field]: value } as MonthlyExpense; setExpenses((current) => current.map((entry) => entry.id === item.id ? next : entry)); if (item.id < 0) return; const response = await fetch("/api/finance-expenses", { method:"PATCH", headers:{"content-type":"application/json"}, body:JSON.stringify({ id:item.id, status:next.status, bank:next.bank }) }); if (!response.ok) { setExpenses((current) => current.map((entry) => entry.id === item.id ? item : entry)); setNotice("Não foi possível atualizar o registo"); } };
  const remove = async (item: MonthlyExpense) => { if (!window.confirm(`Eliminar “${item.name}”?`)) return; const before = expenses; setExpenses((current) => current.filter((entry) => entry.id !== item.id)); if (item.id < 0) return; const response = await fetch("/api/finance-expenses", { method:"DELETE", headers:{"content-type":"application/json"}, body:JSON.stringify({ id:item.id }) }); if (!response.ok) { setExpenses(before); setNotice("Não foi possível eliminar o registo"); } };
  return <section className="monthly-expenses"><div className="monthly-heading"><div><p className="eyebrow">Registo mensal</p><h2>Despesas da família</h2><p>Atualize o estado e o banco diretamente em cada linha.</p></div><button className="primary" onClick={() => { document.querySelector<HTMLButtonElement>(".monthly-expenses + .monthly-expenses button.primary")?.click(); }}>＋ Inserir despesa</button></div><div className="finance-register-cards"><article><span>Total rúbricas</span><strong>{expenses.length}</strong><small>{euro(total)}</small></article><article className="pending"><span>Total pendentes</span><strong>{pending.length}</strong><small>{euro(pending.reduce((sum, item) => sum + item.amount, 0))}</small></article><article className="paid"><span>Total pago</span><strong>{paid.length}</strong><small>{euro(paid.reduce((sum, item) => sum + item.amount, 0))}</small></article></div><div className="monthly-table-wrap"><table><thead><tr><th>Mês</th><th>Nome</th><th>Valor</th><th>Tipo de pagamento</th><th>Entidade / referência</th><th>Data limite</th><th>Estado</th><th>Banco</th><th>Ações</th></tr></thead><tbody>{expenses.map((item) => <tr key={item.id}><td>{new Intl.DateTimeFormat("pt-PT", { month:"short", year:"numeric" }).format(new Date(`${item.month}-01T12:00:00`))}</td><td><strong>{item.name}</strong></td><td>{euro(item.amount)}</td><td>{item.paymentType}</td><td>{item.paymentType === "Entidade e referência" ? `${item.entity} · ${item.reference}` : "—"}</td><td>{item.dueDate ? displayMetricDate(item.dueDate) : "—"}</td><td><select className="table-select" aria-label={`Estado de ${item.name}`} value={item.status} onChange={(event) => void update(item, "status", event.target.value)}><option>Pendente</option><option>Pago</option></select></td><td><select className="table-select" aria-label={`Banco de ${item.name}`} value={item.bank} onChange={(event) => void update(item, "bank", event.target.value)}><option>Millennium</option><option>BPI</option></select></td><td><button className="table-delete" onClick={() => void remove(item)}>Eliminar</button></td></tr>)}</tbody></table></div>{notice && <div className="toast">{notice}</div>}</section>;
}

function MonthlyExpenseRegister() {
  const [expenses, setExpenses] = useState<MonthlyExpense[]>(monthlySeed);
  const [open, setOpen] = useState(false);
  const [paymentType, setPaymentType] = useState("Transferência bancária");
  const [notice, setNotice] = useState("");
  useEffect(() => { void (async () => { try { const response = await fetch("/api/finance-expenses", { cache:"no-store" }); if (response.ok) { const data = await response.json() as { expenses: MonthlyExpense[] }; if (data.expenses.length) setExpenses([...data.expenses, ...monthlySeed]); } } catch {} })(); }, []);
  async function save(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); const draft = { month:String(form.get("month")), name:String(form.get("name")), amount:Number(form.get("amount")), paymentType:String(form.get("paymentType")), entity:String(form.get("entity") || "") || null, reference:String(form.get("reference") || "") || null, dueDate:String(form.get("dueDate") || "") || null, status:String(form.get("status")) as "Pendente" | "Pago", bank:String(form.get("bank")) as "Millennium" | "BPI" }; try { const response = await fetch("/api/finance-expenses", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify(draft) }); if (!response.ok) throw new Error(); const data = await response.json() as { id:number }; setExpenses((current) => [{ ...draft, id:data.id }, ...current]); setOpen(false); setNotice("Despesa guardada com sucesso"); window.setTimeout(() => setNotice(""), 2800); } catch { setNotice("Não foi possível guardar a despesa"); } }
  return <section className="monthly-expenses"><div className="monthly-heading"><div><p className="eyebrow">Registo mensal</p><h2>Despesas da família</h2><p>Organize os pagamentos por mês, método, estado e banco.</p></div><button className="primary" onClick={() => setOpen(true)}>＋ Inserir despesa</button></div><div className="monthly-table-wrap"><table><thead><tr><th>Mês</th><th>Nome</th><th>Valor</th><th>Tipo de pagamento</th><th>Entidade / referência</th><th>Data limite</th><th>Estado</th><th>Banco</th></tr></thead><tbody>{expenses.map((item) => <tr key={item.id}><td>{new Intl.DateTimeFormat("pt-PT", { month:"short", year:"numeric" }).format(new Date(`${item.month}-01T12:00:00`))}</td><td><strong>{item.name}</strong></td><td>{euro(item.amount)}</td><td>{item.paymentType}</td><td>{item.paymentType === "Entidade e referência" ? `${item.entity} · ${item.reference}` : "—"}</td><td>{item.dueDate ? displayMetricDate(item.dueDate) : "—"}</td><td><span className={`payment-status ${item.status.toLowerCase()}`}>{item.status}</span></td><td>{item.bank}</td></tr>)}</tbody></table></div>{open && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}><div className="modal expense-modal" role="dialog" aria-modal="true" aria-labelledby="expense-modal-title"><div className="modal-head"><div><p className="eyebrow">Financeiro</p><h2 id="expense-modal-title">Inserir despesa</h2></div><button aria-label="Fechar" onClick={() => setOpen(false)}>×</button></div><form onSubmit={save}><div className="field-pair"><label>Mês<input name="month" type="month" defaultValue="2026-09" required autoFocus /></label><label>Valor (€)<input name="amount" type="number" step="0.01" min="0.01" required /></label></div><label>Nome<input name="name" placeholder="Ex.: Vodafone" required /></label><label>Tipo de pagamento<select name="paymentType" value={paymentType} onChange={(event) => setPaymentType(event.target.value)}><option>Transferência bancária</option><option>Entidade e referência</option><option>MBWay</option></select></label>{paymentType === "Entidade e referência" && <div className="field-pair"><label>Entidade<input name="entity" required /></label><label>Referência<input name="reference" required /></label></div>}<div className="field-pair"><label>Data limite de pagamento<input name="dueDate" type="date" /></label><label>Estado<select name="status" defaultValue="Pendente"><option>Pendente</option><option>Pago</option></select></label></div><label>Banco<select name="bank" defaultValue="Millennium"><option>Millennium</option><option>BPI</option></select></label><div className="modal-actions"><button type="button" onClick={() => setOpen(false)}>Cancelar</button><button className="primary" type="submit">Guardar despesa</button></div></form></div></div>}{notice && <div className="toast">{notice}</div>}</section>;
}

const expenseCategories: { name: FinanceCategory; icon: string; folder: string }[] = [
  { name: "Eletricidade", icon: "↯", folder: "https://drive.google.com/drive/folders/156F3kV34912P0AyfzWXUepzx-GaChpD9" },
  { name: "Água", icon: "≈", folder: "https://drive.google.com/drive/folders/1LyqNPMfZJiWmtujb5eMDZPqy-bpW4S-L" },
  { name: "Mobilidade elétrica", icon: "⌁", folder: "https://drive.google.com/drive/folders/1WXNum9MgeFu26swN1XcbGmFJHISgv8JK" },
  { name: "Internet & TV", icon: "◉", folder: "https://drive.google.com/drive/folders/1WOLTyRy-q2nH2GRpLJfiQA76nEnVVRqx" },
];

const bankFolders: { name: BankName; icon: string; folder: string; documents: string }[] = [
  { name: "Millennium BCP", icon: "M", folder: "https://drive.google.com/drive/folders/16c24b2PraLZCBLiePfqYHbMPM2zGRzj9", documents: "16 documentos no histórico" },
  { name: "Novo Banco", icon: "N", folder: "https://drive.google.com/drive/folders/1wyB6OsW24H7DW0fB9jwqqwHuqAOA3R4R", documents: "Sem documentos na pasta" },
  { name: "BPI", icon: "B", folder: "https://drive.google.com/drive/folders/1goFYvBtMiJ2u6VFuAFJoqMByCTBBwUR0", documents: "Sem documentos na pasta" },
];

function euro(value: number) { return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value); }

function GeneralExpenses({ category, onCategoryChange }: { category: FinanceCategory; onCategoryChange: (category: FinanceCategory) => void }) {
  const [month, setMonth] = useState("all");
  const current = expenseCategories.find((item) => item.name === category)!;
  const invoices = financeInvoices.filter((item) => item.category === category && (month === "all" || item.date.slice(0, 7) === month));
  const availableMonths = [...new Set(financeInvoices.filter((item) => item.category === category).map((item) => item.date.slice(0, 7)))].sort().reverse();
  const pricedInvoices = invoices.filter((item) => item.total !== null);
  const total = pricedInvoices.reduce((sum, item) => sum + item.total!, 0);
  const maximum = Math.max(...pricedInvoices.map((item) => item.total!), 1);
  const latest = [...invoices].sort((a,b) => b.date.localeCompare(a.date))[0];
  return <><section className="expense-category-tabs" aria-label="Rubricas de gastos gerais">{expenseCategories.map((item) => <button key={item.name} className={category === item.name ? "active" : ""} onClick={() => { onCategoryChange(item.name); setMonth("all"); }}><span>{item.icon}</span>{item.name}</button>)}</section><section className="expense-header"><div><p className="eyebrow">Gastos gerais · {current.name}</p><h2>{current.icon} {current.name}</h2><p>Histórico de todos os documentos na pasta partilhada, com o montante total de cada fatura.</p></div><label>Filtro mensal<select value={month} onChange={(event) => setMonth(event.target.value)}><option value="all">Todos os meses</option>{availableMonths.map((value) => <option key={value} value={value}>{new Intl.DateTimeFormat("pt-PT", { month: "long", year: "numeric" }).format(new Date(`${value}-01T12:00:00`))}</option>)}</select></label></section><section className="expense-summary"><article><span>Total das faturas</span><strong>{pricedInvoices.length ? euro(total) : "—"}</strong><small>{pricedInvoices.length} faturas no período selecionado</small></article><article><span>Documento mais recente</span><strong>{latest?.total !== null && latest ? euro(latest.total) : "Ver fatura"}</strong><small>{latest ? displayMetricDate(latest.date) : "Sem documento no filtro"}</small></article><article><span>Consulta de documentos</span><a href={current.folder} target="_blank" rel="noreferrer">Abrir pasta ↗</a><small>{invoices.length} documentos no histórico</small></article></section><section className="expense-grid"><article className="panel expense-chart"><div className="panel-heading"><div><p className="eyebrow">Evolução mensal</p><h2>Total por fatura</h2></div><span className="subtle-tag">{invoices.length} documentos</span></div>{invoices.length ? <div className="expense-bars">{[...invoices].sort((a,b)=>a.date.localeCompare(b.date)).map((item) => <div key={item.url} className={`expense-bar-wrap ${item.total === null ? "unpriced" : ""}`}><strong>{item.total !== null ? euro(item.total) : "Ver"}</strong><i style={{ height: `${item.total === null ? 18 : 28 + item.total / maximum * 122}px` }} /><small>{displayChartMonth(item.date)}</small></div>)}</div> : <div className="hm-empty">Não existem documentos para este mês.</div>}</article><article className="panel expense-invoices"><div className="panel-heading"><div><p className="eyebrow">Documentos</p><h2>Histórico completo</h2></div><span className="subtle-tag">{invoices.length}</span></div>{[...invoices].sort((a,b)=>b.date.localeCompare(a.date)).map((item) => <a key={item.url} href={item.url} target="_blank" rel="noreferrer" className="expense-invoice"><span>{current.icon}</span><div><strong>{item.fileName || item.provider}</strong><small>{item.period} · {displayMetricDate(item.date)}</small></div><b>{item.total !== null ? euro(item.total) : "Abrir"} <em>↗</em></b></a>)}{!invoices.length && <div className="hm-empty">Sem faturas no filtro selecionado.</div>}</article></section></>;
}

const bcpStatements = [
  "2025-12","2026-01","2026-02","2026-03","2026-04","2026-05","2026-06","2026-07",
].map((month) => ({ month, kind:"Extrato combinado", url: ({"2025-12":"https://drive.google.com/file/d/1ypK-IJKOSstGGuD1WZB-XZKPQIRjVbkC/view?usp=drivesdk","2026-01":"https://drive.google.com/file/d/1OznBHr_VrwsUGFUyXvEU3FERknNA0ED2/view?usp=drivesdk","2026-02":"https://drive.google.com/file/d/1aasfeh0d4lj4CxsvHn-fHcgOMnwsm32b/view?usp=drivesdk","2026-03":"https://drive.google.com/file/d/1yisaw1jCeDpeCn24hl9oJVdQCFnDpIMk/view?usp=drivesdk","2026-04":"https://drive.google.com/file/d/1bP5oAr5-BwXR6pg6kCUg0wwSlzyvNuWj/view?usp=drivesdk","2026-05":"https://drive.google.com/file/d/1KOr3T_iOq7M-Q5veULPwk9Am9NpNPgjC/view?usp=drivesdk","2026-06":"https://drive.google.com/file/d/1dLIJLIsbBSiiIqSu29eR_jvCj5s_a7TK/view?usp=drivesdk","2026-07":"https://drive.google.com/file/d/19DDj3ZPuRCvbamOd0USYu5xnKktkb1DK/view?usp=drivesdk"} as Record<string,string>)[month] }));

function BanksView({ selectedBank }: { selectedBank: BankName }) {
  const bank = bankFolders.find((item) => item.name === selectedBank)!;
  const isMillennium = selectedBank === "Millennium BCP";
  return <><section className="finance-metrics" aria-label="Resumo bancário">{isMillennium ? <><article className="finance-metric balance"><span>Saldo à ordem</span><strong>5 578,03 €</strong><small>Millennium BCP · extrato de julho de 2026</small></article><article className="finance-metric lending"><span>Empréstimos</span><strong>4 847,01 €</strong><small>Saldo devedor indicado no extrato</small></article><article className="finance-metric card"><span>Cartão de crédito</span><strong>2 692,54 €</strong><small>Saldo em dívida no último extrato</small></article><article className="finance-metric docs"><span>Histórico importado</span><strong>16</strong><small>8 extratos de conta e 8 de cartão</small></article></> : <article className="finance-metric docs"><span>{bank.name}</span><strong>—</strong><small>{bank.documents}</small></article>}</section><section className="finance-layout"><article className="panel finance-accounts"><div className="panel-heading"><div><p className="eyebrow">Banco selecionado</p><h2>{bank.name}</h2></div><a className="source-button" href={bank.folder} target="_blank" rel="noreferrer">Abrir pasta <span>↗</span></a></div><div className="bank-list"><a href={bank.folder} target="_blank" rel="noreferrer"><span className={`bank-mark ${selectedBank === "Millennium BCP" ? "bcp" : selectedBank === "Novo Banco" ? "nb" : "bpi"}`}>{bank.icon}</span><span><strong>{bank.name}</strong><small>{bank.documents}</small></span><b>↗</b></a></div></article><article className="panel finance-commitments"><div className="panel-heading"><div><p className="eyebrow">Histórico</p><h2>{isMillennium ? "Extratos de conta" : "Documentos disponíveis"}</h2></div></div>{isMillennium ? <div className="bank-list">{bcpStatements.slice().reverse().map((item) => <a key={item.month} href={item.url} target="_blank" rel="noreferrer"><span className="bank-mark bcp">M</span><span><strong>{item.kind}</strong><small>{new Intl.DateTimeFormat("pt-PT", { month:"long", year:"numeric" }).format(new Date(`${item.month}-01T12:00:00`))}</small></span><b>↗</b></a>)}</div> : <div className="bank-empty"><span className={`bank-mark ${selectedBank === "Novo Banco" ? "nb" : "bpi"}`}>{bank.icon}</span><span><strong>Sem documentos importados</strong><small>Quando adicionar documentos à pasta, poderão ser integrados neste separador.</small></span></div>}</article></section></>;
}

function MetricCard({ tone, label, value, detail, icon, unit }: { tone: string; label: string; value: string; detail: string; icon: string; unit?: string }) {
  return <article className={`metric-card ${tone}`}><div className="metric-top"><span>{label}</span><span className="metric-icon">{icon}</span></div><div className="metric-value">{value} {unit && <small>{unit}</small>}</div><p>{detail}</p></article>;
}

function WeightChart({ records }: { records: HealthRecord[] }) {
  if (!records.length) return <div className="empty">Ainda não existem medições de peso.</div>;
  const values = records.map((r) => Number(r.value1));
  const min = Math.min(...values) - 0.6; const max = Math.max(...values) + 0.6;
  return <div className="chart"><div className="chart-area">{records.map((item) => { const height = 24 + ((Number(item.value1) - min) / Math.max(max - min, 1)) * 90; return <div className="bar-wrap" key={item.id}><div className="bar" style={{ height }}><span>{item.value1}</span></div><small>{displayChartMonth(item.recordedAt)}</small></div>; })}</div><div className="chart-summary"><strong>{values[values.length - 1]} kg</strong><span>{values.length > 1 ? `${(values[values.length - 1] - values[0]).toFixed(1)} kg no período` : "Primeira medição"}</span></div></div>;
}

function RecordRow({ item }: { item: HealthRecord }) {
  const labels: Record<RecordKind, { icon: string; name: string }> = { weight: { icon: "⚖", name: "Peso" }, blood_pressure: { icon: "♡", name: "Tensão arterial" }, activity: { icon: "⌁", name: item.title || "Atividade" }, medical: { icon: "+", name: item.title || "Registo de saúde" } };
  const driveUrl = item.notes?.match(/https:\/\/drive\.google\.com\/\S+/)?.[0] ?? null;
  const note = driveUrl ? item.notes?.replace(driveUrl, "").trim() : item.notes;
  const detail = item.kind === "weight" ? `${item.value1} kg` : item.kind === "blood_pressure" ? `${item.value1} / ${item.value2} mmHg` : item.kind === "activity" ? (item.duration ? `${item.duration} min · ${item.value1 ?? 0} km` : `${item.value1 ?? 0} km · ${new Intl.NumberFormat("pt-PT").format(item.value2 ?? 0)} passos`) : note;
  return <div className="record-row"><span className={`record-icon ${item.kind}`}>{labels[item.kind].icon}</span><div><strong>{labels[item.kind].name}</strong><small>{detail}{driveUrl && <>{detail ? " · " : ""}<a href={driveUrl} target="_blank" rel="noreferrer">Abrir no Drive</a></>}</small></div><time>{displayDate(item.recordedAt)}</time></div>;
}

function RecordsView({ records, onAdd }: { records: HealthRecord[]; onAdd: () => void }) {
  const [filter, setFilter] = useState<"all" | RecordKind>("all");
  const filtered = filter === "all" ? records : records.filter((r) => r.kind === filter);
  return <section className="page-panel"><div className="section-title"><div><p className="eyebrow">Histórico completo</p><h2>Todos os registos</h2><p>Consulte a informação organizada por data e categoria.</p></div><button className="primary" onClick={onAdd}>＋ Registo de saúde</button></div><div className="filters">{[["all","Todos"],["medical","Saúde"],["weight","Peso"],["blood_pressure","Tensão"],["activity","Atividade"]].map(([value,label]) => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value as typeof filter)}>{label}</button>)}</div><div className="records-table">{filtered.map((item) => <RecordRow key={item.id} item={item} />)}</div></section>;
}

function ActivityView({ records, onAdd }: { records: HealthRecord[]; onAdd: () => void }) {
  const totalDistance = records.reduce((s, r) => s + (r.value1 ?? 0), 0);
  const totalMinutes = records.reduce((s,r)=>s+(r.duration??0),0);
  return <section className="page-panel"><div className="section-title"><div><p className="eyebrow">Movimento</p><h2>Atividade física</h2><p>Acompanhe dias ativos, distância, passos e sessões adicionadas.</p></div><button className="primary" onClick={onAdd}>＋ Nova atividade</button></div><div className="activity-summary"><MetricCard tone="sky" label={totalMinutes ? "Tempo total" : "Dias registados"} value={totalMinutes ? `${totalMinutes} min` : `${records.length}`} detail={totalMinutes ? `${records.length} sessões` : "Com dados de atividade"} icon="⌁"/><MetricCard tone="sage" label="Distância" value={`${totalDistance.toFixed(1)} km`} detail="No histórico importado" icon="↗"/><MetricCard tone="gold" label="Passos" value={new Intl.NumberFormat("pt-PT").format(records.reduce((s,r)=>s+(r.value2??0),0))} detail="Total registado" icon="↑"/></div><div className="records-table">{records.map((item) => <RecordRow key={item.id} item={item} />)}</div></section>;
}

function ExamsView({ records, profile }: { records: HealthRecord[]; profile: Profile }) {
  const documents = records.filter((item) => item.notes?.includes("drive.google.com"));
  const analyses = documents.filter((item) => item.title?.toLocaleLowerCase("pt-PT").includes("análises"));
  const exams = documents.filter((item) => !item.title?.toLocaleLowerCase("pt-PT").includes("análises"));
  return <section className="page-panel exams-page">
    <div className="section-title"><div><p className="eyebrow">Documentos clínicos</p><h2>Exames de {profile.split(" ")[0]}</h2><p>Exames, relatórios e análises guardados na pasta pessoal do Google Drive.</p></div><span className="document-count">{documents.length} documentos</span></div>
    <div className="exam-summary"><div><span className="summary-icon">▤</span><p><strong>{exams.length}</strong><small>Exames e relatórios</small></p></div><div><span className="summary-icon lab">◇</span><p><strong>{analyses.length}</strong><small>Análises clínicas</small></p></div></div>
    {exams.length > 0 && <DocumentGroup title="Exames e relatórios" records={exams} />}
    {analyses.length > 0 && <DocumentGroup title="Análises clínicas" records={analyses} />}
    <ClinicalComparison profile={profile} />
    {!documents.length && <div className="empty">Ainda não existem exames associados a este perfil.</div>}
  </section>;
}

function ClinicalComparison({ profile }: { profile: Profile }) {
  const comparisons = clinicalComparisons[profile];
  const [month, setMonth] = useState("all");
  const [year, setYear] = useState("all");
  const [selectedDate, setSelectedDate] = useState(comparisons[comparisons.length - 1].currentDate);
  const years = [...new Set(comparisons.map((item) => item.currentDate.slice(0, 4)))].sort().reverse();
  const visible = comparisons.filter((item) => (month === "all" || item.currentDate.slice(5, 7) === month) && (year === "all" || item.currentDate.slice(0, 4) === year));
  const comparison = visible.find((item) => item.currentDate === selectedDate) ?? visible[visible.length - 1] ?? comparisons[comparisons.length - 1];
  return <section className="clinical-comparison"><div className="clinical-heading"><div><p className="eyebrow">Comparação de análises</p><h3>Resultados, referências e evolução</h3><p>Resultado de {displayMetricDate(comparison.currentDate)} comparado com {displayMetricDate(comparison.previousDate)}.</p></div><span>{comparison.groups.reduce((sum, group) => sum + group.metrics.length, 0)} parâmetros</span></div><div className="comparison-filters"><label>Mês<select value={month} onChange={(event) => setMonth(event.target.value)}><option value="all">Todos os meses</option>{[...new Set(comparisons.map((item) => item.currentDate.slice(5, 7)))].sort().map((value) => <option key={value} value={value}>{new Intl.DateTimeFormat("pt-PT", { month: "long" }).format(new Date(`2026-${value}-01T12:00:00`))}</option>)}</select></label><label>Ano<select value={year} onChange={(event) => setYear(event.target.value)}><option value="all">Todos os anos</option>{years.map((value) => <option key={value} value={value}>{value}</option>)}</select></label><label>Análise<select value={comparison.currentDate} onChange={(event) => setSelectedDate(event.target.value)}>{visible.map((item) => <option key={item.currentDate} value={item.currentDate}>{displayMetricDate(item.currentDate)}</option>)}</select></label></div>{comparison.groups.map((group) => <div className="clinical-group" key={group.title}><h4>{group.title}</h4><div className="clinical-table-wrap"><table><thead><tr><th>Parâmetro</th><th>Resultado<br/>{displayMetricDate(comparison.currentDate)}</th><th>Referência</th><th>Face à referência</th><th>Anterior<br/>{displayMetricDate(comparison.previousDate)}</th><th>Variação</th></tr></thead><tbody>{group.metrics.map((item) => <ClinicalRow key={item.label} item={item} profile={profile} />)}</tbody></table></div></div>)}<p className="clinical-disclaimer">Os valores de referência são os indicados nos relatórios. A comparação com a referência é apenas descritiva (dentro, abaixo ou acima do intervalo); a variação percentual é calculada face ao resultado anterior e não substitui interpretação clínica.</p></section>;
}

function ClinicalRow({ item, profile }: { item: ClinicalMetric; profile: Profile }) {
  const delta = item.current - item.previous;
  const percent = (delta / item.previous) * 100;
  const digits = Math.max(Number.isInteger(item.current) ? 0 : 2, Number.isInteger(item.previous) ? 0 : 2);
  const format = (value: number) => new Intl.NumberFormat("pt-PT", { maximumFractionDigits: digits }).format(value);
  const reference = clinicalReferences[profile][item.label];
  const referenceStatus = !reference ? "Sem referência" : reference.min !== undefined && item.current < reference.min ? "Abaixo" : reference.max !== undefined && item.current > reference.max ? "Acima" : "Dentro";
  return <tr><td><strong>{item.label}</strong><small>{item.unit}</small></td><td>{format(item.current)} <small>{item.unit}</small></td><td>{reference?.label ?? "—"} <small>{item.unit}</small></td><td><span className={`reference-status ${referenceStatus.toLocaleLowerCase("pt-PT")}`}>{referenceStatus}</span></td><td>{format(item.previous)} <small>{item.unit}</small></td><td><span className={`clinical-delta ${delta === 0 ? "flat" : delta > 0 ? "up" : "down"}`}>{delta > 0 ? "↑" : delta < 0 ? "↓" : "—"} {Math.abs(percent).toFixed(1)}%</span></td></tr>;
}

function DocumentGroup({ title, records }: { title: string; records: HealthRecord[] }) {
  return <section className="document-group"><div className="document-group-title"><h3>{title}</h3><span>{records.length}</span></div><div className="document-grid">{records.map((item) => <DocumentCard key={item.id} item={item} />)}</div></section>;
}

function DocumentCard({ item }: { item: HealthRecord }) {
  const driveUrl = item.notes?.match(/https:\/\/drive\.google\.com\/\S+/)?.[0] ?? null;
  const note = driveUrl ? item.notes?.replace(driveUrl, "").trim() : item.notes;
  const needsConfirmation = item.title?.includes("data a confirmar");
  return <article className="document-card"><div className="document-card-top"><span className="document-icon">PDF</span>{needsConfirmation && <span className="confirm-tag">A confirmar</span>}</div><h4>{item.title}</h4><time>{new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${item.recordedAt}T12:00:00`))}</time>{note && <p>{note}</p>}{driveUrl && <a href={driveUrl} target="_blank" rel="noreferrer">Abrir no Google Drive <span>↗</span></a>}</article>;
}

const metricGroupDetails: Record<MetricGroup, { title: string; description: string }> = {
  body: { title: "Composição corporal", description: "Peso, IMC e medições de composição disponíveis no relatório." },
  pressure: { title: "Tensão e pulsação", description: "Medições de tensão arterial, pulsação e pressão arterial média." },
  activity: { title: "Atividade", description: "Passos, distância, energia e área-alvo quando registada." },
};

function HealthManagerView({ metrics, profile }: { metrics: HealthMetric[]; profile: Profile }) {
  const sourceUrl = metrics.find((item) => item.sourceUrl)?.sourceUrl;
  const dates = metrics.map((item) => item.recordedAt.slice(0, 10)).sort();
  const distinctMetrics = new Set(metrics.map((item) => item.metricKey)).size;
  const metricOptions = [...new Map(metrics.map((item) => [item.metricKey, item])).values()];
  const [selectedMetric, setSelectedMetric] = useState("weight");
  const activeMetric = metricOptions.find((item) => item.metricKey === selectedMetric) ?? metricOptions[0];
  const selectedRecords = activeMetric ? metrics.filter((item) => item.metricKey === activeMetric.metricKey) : [];
  return <section className="page-panel health-manager-page">
    <div className="section-title"><div><p className="eyebrow">Relatório HealthManager Pro</p><h2>Evolução de {profile.split(" ")[0]}</h2><p>Todas as métricas disponíveis no ficheiro partilhado, organizadas por tema e por data.</p></div>{sourceUrl && <a className="source-button" href={sourceUrl} target="_blank" rel="noreferrer">Abrir relatório <span>↗</span></a>}</div>
    <div className="hm-overview">
      <div><strong>{distinctMetrics || "—"}</strong><span>Métricas acompanhadas</span></div>
      <div><strong>{metrics.length || "—"}</strong><span>Valores registados</span></div>
      <div><strong>{dates.length ? `${displayMetricDate(dates[0])} — ${displayMetricDate(dates[dates.length - 1])}` : "—"}</strong><span>Período disponível</span></div>
    </div>
    <section className="hm-controls"><div><p className="eyebrow">Explorar métricas</p><h3>Escolha a métrica para atualizar o gráfico e a tabela</h3><p>O filtro mantém a mesma métrica no gráfico de evolução e na tabela detalhada, para que cada leitura possa ser comparada com a anterior.</p></div><label>Métrica<select value={activeMetric?.metricKey ?? ""} onChange={(event) => setSelectedMetric(event.target.value)}>{metricOptions.map((item) => <option key={item.metricKey} value={item.metricKey}>{item.metricLabel} · {item.unit || "Índice"}</option>)}</select></label></section>
    <LatestMetricCards metrics={metrics.filter((item) => item.groupName === "body")} />
    <BodyCompositionAnalysis metrics={metrics.filter((item) => item.groupName === "body")} />
    <section className="hm-section"><div className="hm-section-heading"><div><h3>Gráfico da métrica selecionada</h3><p>Os valores aparecem sobre cada barra e seguem a escala própria desta métrica.</p></div><span>{activeMetric ? metricGroupDetails[activeMetric.groupName].title : "—"}</span></div>{selectedRecords.length ? <div className="hm-chart-grid"><MetricTrendCard records={selectedRecords} /></div> : <div className="hm-empty">Selecione uma métrica com dados disponíveis.</div>}</section>
    <MetricEvolutionTable records={selectedRecords} />
    <div className="hm-note"><strong>Como ler esta informação</strong><span>Os cartões mostram a última leitura registada de cada métrica de composição corporal. A tabela apresenta cada leitura da métrica escolhida, com a diferença e a percentagem calculadas face à leitura imediatamente anterior. Os valores e unidades são reproduzidos do relatório; lacunas não são estimadas.</span></div>
  </section>;
}

function metricIcon(key: string, label: string) {
  const text = `${key} ${label}`.toLocaleLowerCase("pt-PT");
  if (text.includes("peso")) return "⚖";
  if (text.includes("imc") || text.includes("bmi")) return "◫";
  if (text.includes("gord") || text.includes("fat")) return "◔";
  if (text.includes("água") || text.includes("agua") || text.includes("water")) return "≈";
  if (text.includes("músc") || text.includes("musc") || text.includes("muscle")) return "↗";
  if (text.includes("óss") || text.includes("oss") || text.includes("bone")) return "◇";
  return "●";
}

function LatestMetricCards({ metrics }: { metrics: HealthMetric[] }) {
  const keys = [...new Set(metrics.map((item) => item.metricKey))];
  if (!keys.length) return null;
  return <section className="latest-metrics"><div className="latest-metrics-heading"><p className="eyebrow">Últimos resultados</p><p>Leitura mais recente de cada métrica de peso e composição corporal.</p></div><div className="latest-metric-grid">{keys.map((key) => { const records = metrics.filter((item) => item.metricKey === key).sort((a,b) => b.recordedAt.localeCompare(a.recordedAt)); const latest = records[0]; return <article className="latest-metric-card" key={key}><span className="latest-metric-icon">{metricIcon(key, latest.metricLabel)}</span><div><small>{latest.metricLabel}</small><strong>{metricValue(latest.value, latest.unit)}</strong><time>{displayMetricDate(latest.recordedAt)}</time></div></article>; })}</div></section>;
}

function BodyCompositionAnalysis({ metrics }: { metrics: HealthMetric[] }) {
  const keys = [...new Set(metrics.map((item) => item.metricKey))];
  if (!keys.length) return null;
  return <section className="body-analysis"><div className="body-analysis-heading"><div><p className="eyebrow">Análise de composição corporal</p><h3>Peso e métricas associadas</h3><p>Comparação entre a primeira e a última leitura disponível para cada métrica; a variação usa a primeira leitura como base.</p></div><span>{keys.length} métricas</span></div><div className="body-analysis-table-wrap"><table><thead><tr><th>Métrica</th><th>Primeira leitura</th><th>Última leitura</th><th>Variação</th><th>Intervalo observado</th></tr></thead><tbody>{keys.map((key) => <BodyAnalysisRow key={key} records={metrics.filter((item) => item.metricKey === key)} />)}</tbody></table></div><p className="body-analysis-note">Esta síntese mostra a evolução de cada métrica desde a primeira leitura disponível. As medições sem composição corporal no relatório não são estimadas.</p></section>;
}

function BodyAnalysisRow({ records }: { records: HealthMetric[] }) {
  const ordered = [...records].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
  const first = ordered[0]; const latest = ordered[ordered.length - 1];
  const values = ordered.map((item) => item.value); const min = Math.min(...values); const max = Math.max(...values);
  const delta = latest.value - first.value; const percent = first.value ? (delta / first.value) * 100 : 0;
  const digits = [first.value, latest.value, min, max].some((value) => !Number.isInteger(value)) ? 2 : 0;
  const format = (value: number) => new Intl.NumberFormat("pt-PT", { maximumFractionDigits: digits }).format(value);
  return <tr><td><strong>{latest.metricLabel}</strong><small>{latest.unit || "Índice"} · {ordered.length} leituras</small></td><td>{format(first.value)} <small>{first.unit}</small></td><td>{format(latest.value)} <small>{latest.unit}</small></td><td><span className={`body-delta ${delta === 0 ? "flat" : delta > 0 ? "up" : "down"}`}>{delta > 0 ? "↑" : delta < 0 ? "↓" : "—"} {Math.abs(delta).toFixed(digits)}{latest.unit ? ` ${latest.unit}` : ""}<em>{delta === 0 ? "Sem alteração" : `${percent > 0 ? "+" : ""}${percent.toFixed(1)}%`}</em></span></td><td>{format(min)} — {format(max)} <small>{latest.unit}</small></td></tr>;
}

function MetricEvolutionTable({ records }: { records: HealthMetric[] }) {
  const chronological = [...records].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
  if (!chronological.length) return null;
  const latest = chronological[chronological.length - 1];
  return <section className="metric-evolution"><div className="body-analysis-heading"><div><p className="eyebrow">Tabela de evolução</p><h3>{latest.metricLabel}</h3><p>Valores ordenados do mais recente para o mais antigo; cada variação compara com o registo imediatamente anterior.</p></div><span>{chronological.length} leituras</span></div><div className="body-analysis-table-wrap"><table><thead><tr><th>Data</th><th>Valor</th><th>Leitura anterior</th><th>Variação</th><th>Evolução</th></tr></thead><tbody>{chronological.map((item, index) => { const previous = chronological[index - 1]; const delta = previous ? item.value - previous.value : null; const percent = delta !== null && previous.value ? delta / previous.value * 100 : null; return <tr key={item.id}><td>{displayMetricDate(item.recordedAt)}</td><td><strong>{metricValue(item.value, item.unit)}</strong></td><td>{previous ? metricValue(previous.value, previous.unit) : "—"}</td><td>{delta === null ? "—" : `${delta > 0 ? "+" : ""}${metricValue(delta, item.unit)}`}</td><td><span className={`body-delta ${delta === null || delta === 0 ? "flat" : delta > 0 ? "up" : "down"}`}>{percent === null ? "Primeira leitura" : `${delta! > 0 ? "↑" : delta! < 0 ? "↓" : "—"} ${Math.abs(percent).toFixed(1)}%`}</span></td></tr>; }).reverse()}</tbody></table></div></section>;
}

function displayMetricDate(value: string) {
  return new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "short", year: "2-digit" }).format(new Date(`${value.slice(0, 10)}T12:00:00`));
}

function metricValue(value: number, unit: string | null) {
  const maximumDigits = Number.isInteger(value) ? 0 : 2;
  return `${new Intl.NumberFormat("pt-PT", { maximumFractionDigits: maximumDigits }).format(value)}${unit ? ` ${unit}` : ""}`;
}

function MetricTrendCard({ records }: { records: HealthMetric[] }) {
  const ordered = [...records].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt)).slice(-20);
  const values = ordered.map((item) => item.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, Math.abs(max) * .02, 1);
  const latest = ordered[ordered.length - 1];
  const change = latest.value - ordered[0].value;
  const changeUnit = latest.unit ? ` ${latest.unit}` : "";
  return <article className="hm-chart-card">
    <div className="hm-card-heading"><div><h4>{latest.metricLabel}</h4><span>{latest.unit || "Índice"}</span></div><div className="hm-latest"><strong>{metricValue(latest.value, latest.unit)}</strong><small>{change === 0 ? "Sem alteração" : `${change > 0 ? "+" : ""}${new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 2 }).format(change)}${changeUnit} no período`}</small></div></div>
    <div className="hm-bars" aria-label={`Evolução de ${latest.metricLabel}`}>
      {ordered.map((item) => {
        const height = 18 + ((item.value - min) / range) * 64;
        return <span className="hm-bar-slot" key={`${item.recordedAt}-${item.id}`} title={`${displayMetricDate(item.recordedAt)} · ${metricValue(item.value, item.unit)}`}><b style={{ bottom: `calc(${height}% + 2px)` }}>{new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 1 }).format(item.value)}</b><i style={{ height: `${height}%` }} /></span>;
      })}
    </div>
    <div className="hm-axis"><span>{displayChartMonth(ordered[0].recordedAt)}</span><span>{ordered.length} leituras</span><span>{displayChartMonth(latest.recordedAt)}</span></div>
    {ordered.length < 3 && <p className="limited-data">Apenas {ordered.length} leituras disponíveis; tendência ainda limitada.</p>}
  </article>;
}

function TrendsView({ records, chartWeights }: { records: HealthRecord[]; chartWeights: HealthRecord[] }) {
  const bpRecords = records.filter((r) => r.kind === "blood_pressure").slice(0, 6);
  return <section className="page-panel"><div className="section-title"><div><p className="eyebrow">Análise pessoal</p><h2>Evolução e tendências</h2><p>Uma leitura simples dos seus registos ao longo do tempo.</p></div></div><div className="trend-grid"><article className="panel"><div className="panel-heading"><h2>Peso</h2><span className="subtle-tag">kg</span></div><WeightChart records={chartWeights}/></article><article className="panel"><div className="panel-heading"><h2>Tensão arterial</h2><span className="subtle-tag">mmHg</span></div><div className="bp-columns">{bpRecords.reverse().map((r)=><div key={r.id}><div className="bp-column sys" style={{height: Math.max(48,(r.value1??0)/1.6)}}/><div className="bp-column dia" style={{height: Math.max(36,(r.value2??0)/1.6)}}/><small>{displayChartMonth(r.recordedAt)}</small></div>)}</div><div className="legend"><span><i className="sys"/>Sistólica</span><span><i className="dia"/>Diastólica</span></div></article></div><div className="insight-box"><strong>Uma boa rotina de medição torna as tendências mais úteis.</strong><span>Registe em condições semelhantes e leve o histórico a um profissional de saúde quando precisar de apoio na interpretação.</span></div></section>;
}

function RecordModal({ kind, profile, onClose, onSubmit }: { kind: RecordKind; profile: Profile; onClose: () => void; onSubmit: (e: FormEvent<HTMLFormElement>) => void }) {
  const title = { weight: "Registar peso", blood_pressure: "Registar tensão arterial", activity: "Registar atividade", medical: "Registo de saúde" }[kind];
  return <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-head"><div><p className="eyebrow">{profile}</p><h2 id="modal-title">{title}</h2></div><button aria-label="Fechar" onClick={onClose}>×</button></div><form onSubmit={onSubmit}><label>Data<input name="recordedAt" type="date" defaultValue={new Date().toISOString().slice(0,10)} required/></label>{kind === "weight" && <label>Peso (kg)<input name="value1" type="number" step="0.1" min="20" max="300" placeholder="78,4" required autoFocus/></label>}{kind === "blood_pressure" && <div className="field-pair"><label>Sistólica<input name="value1" type="number" min="60" max="260" placeholder="120" required autoFocus/></label><label>Diastólica<input name="value2" type="number" min="35" max="180" placeholder="80" required/></label></div>}{kind === "activity" && <><label>Tipo de atividade<input name="title" placeholder="Ex.: caminhada" required autoFocus/></label><div className="field-pair"><label>Duração (min)<input name="duration" type="number" min="1" placeholder="45" required/></label><label>Distância (km)<input name="value1" type="number" step="0.1" min="0" placeholder="4,5"/></label></div><label>Passos (opcional)<input name="value2" type="number" min="0" placeholder="6500"/></label></>}{kind === "medical" && <label>Título<input name="title" placeholder="Ex.: consulta de rotina" required autoFocus/></label>}<label>Notas (opcional)<textarea name="notes" rows={3} placeholder="Acrescente contexto que queira guardar…"/></label><div className="modal-actions"><button type="button" onClick={onClose}>Cancelar</button><button className="primary" type="submit">Guardar registo</button></div></form></div></div>;
}
