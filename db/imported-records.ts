export type ImportedRecord = {
  profile: "Tiago Soutelo" | "Marlene Soutelo";
  kind: "weight" | "blood_pressure" | "activity" | "medical";
  recordedAt: string;
  value1: number | null;
  value2: number | null;
  unit: string | null;
  title: string | null;
  notes: string | null;
  duration: number | null;
  sourceKey: string;
};

const TIAGO_HEALTH_MANAGER = "drive:1HZQDbjWoJjqBTR-oyghnHJxFu0QYxUuT";
const MARLENE_HEALTH_MANAGER = "drive:1h8i4gCiOrafV5TA4I60yKdb3rk_DkNmI";

function weights(profile: ImportedRecord["profile"], source: string, rows: [string, number][]): ImportedRecord[] {
  return rows.map(([recordedAt, value1], index) => ({ profile, kind: "weight", recordedAt, value1, value2: null, unit: "kg", title: null, notes: "Importado do relatório Health Manager no Google Drive.", duration: null, sourceKey: `${source}:weight:${recordedAt}:${index}` }));
}

function pressures(profile: ImportedRecord["profile"], source: string, rows: [string, number, number, number?][]): ImportedRecord[] {
  return rows.map(([recordedAt, value1, value2, pulse], index) => ({ profile, kind: "blood_pressure", recordedAt, value1, value2, unit: "mmHg", title: null, notes: pulse ? `Pulsação: ${pulse} bpm. Importado do Health Manager.` : "Importado do relatório Health Manager no Google Drive.", duration: null, sourceKey: `${source}:bp:${recordedAt}:${index}` }));
}

function activities(rows: [string, number, number, string?][]): ImportedRecord[] {
  return rows.map(([recordedAt, steps, distance, comment], index) => ({ profile: "Tiago Soutelo", kind: "activity", recordedAt, value1: distance, value2: steps, unit: "km", title: "Atividade diária", notes: comment ? `${comment}. Importado do Health Manager.` : "Importado do relatório Health Manager no Google Drive.", duration: null, sourceKey: `${TIAGO_HEALTH_MANAGER}:activity:${recordedAt}:${index}` }));
}

function document(profile: ImportedRecord["profile"], recordedAt: string, title: string, url: string, id: string, note?: string): ImportedRecord {
  return { profile, kind: "medical", recordedAt, value1: null, value2: null, unit: null, title, notes: `${note ? `${note} ` : ""}${url}`, duration: null, sourceKey: `drive:${id}` };
}

export const importedRecords: ImportedRecord[] = [
  ...weights("Tiago Soutelo", TIAGO_HEALTH_MANAGER, [
    ["2026-04-03",98.8],["2026-04-06",101.2],["2026-04-13",99.6],["2026-04-16",100.6],["2026-04-22",97.6],["2026-04-30",95.5],
    ["2026-05-06",93.2],["2026-05-12",93.5],["2026-05-18",92.9],["2026-05-22",92.3],["2026-05-25",91.5],["2026-05-30",90.5],
    ["2026-06-02",89.9],["2026-06-05",89.5],["2026-06-07",89.2],["2026-06-09",89.2],["2026-06-14",89.1],["2026-06-16",88.8],["2026-06-19",88.3],["2026-06-20",88.1],["2026-06-23",87],["2026-06-29",87.7],["2026-06-30",87.5],
    ["2026-07-01",87.4],["2026-07-02",87.1],["2026-07-03",86.4],["2026-07-14",87.5],["2026-07-15",86],["2026-07-22",87.1],["2026-07-22",85.8],["2026-07-27",85.9],["2026-07-27",84.8],["2026-07-31",84.7],["2026-08-01",83.9],["2026-08-03",83.7],
  ]),
  ...pressures("Tiago Soutelo", TIAGO_HEALTH_MANAGER, [
    ["2026-05-18",115,84,83],["2026-05-24",121,80,70],["2026-05-27",103,70,86],["2026-06-01",110,73,67],["2026-06-15",115,77,69],["2026-06-22",114,76,62],["2026-06-29",110,75,63],["2026-07-14",109,69,67],["2026-07-20",118,77,65],
  ]),
  ...activities([
    ["2026-05-24",7901,5.5],["2026-05-25",10914,7.6],["2026-05-26",8216,5.8],["2026-05-27",10224,7.7],["2026-05-28",3423,2.4],["2026-05-29",14743,10.3],["2026-05-30",11667,8.2],["2026-05-31",9993,7],
    ["2026-06-01",11185,7.8,"Treino CFS"],["2026-06-02",5331,3.7],["2026-06-03",13648,9.6,"Treino de ginásio"],["2026-06-04",13568,9.5,"Corrida de 5 km e caminhada"],["2026-06-05",10263,7.2],["2026-06-06",11353,7.9],["2026-06-07",14998,10.5],["2026-06-08",22472,15.7],["2026-06-09",2915,2],["2026-06-10",7633,5.3],["2026-06-11",12093,8.5],["2026-06-12",8670,6.1],["2026-06-13",20862,14.6],["2026-06-14",8906,6.2],["2026-06-15",14873,10.4,"Treino CFS"],["2026-06-16",11386,8],["2026-06-17",14181,9.9],["2026-06-18",11832,8.3],["2026-06-19",18502,13],["2026-06-20",4217,3],["2026-06-21",14722,10.3],["2026-06-22",21163,14.8],["2026-06-23",5500,3.8],["2026-06-24",21464,15],["2026-06-25",4869,3.4],["2026-06-26",5126,3.6],["2026-06-27",14672,10.3],["2026-06-28",17450,12.2],["2026-06-29",10769,7.5],["2026-06-30",4885,3.4],
    ["2026-07-01",13605,9.5],["2026-07-02",2854,2],["2026-07-03",8681,6.1],["2026-07-04",9473,6.6],["2026-07-05",20051,14],["2026-07-06",10928,7.6],["2026-07-07",10704,7.5],["2026-07-08",8989,6.3],["2026-07-09",18228,12.8],["2026-07-10",13163,9.2],["2026-07-11",12643,8.9],["2026-07-12",3646,2.6],["2026-07-13",19390,13.6],["2026-07-14",19588,13.7],["2026-07-15",35565,24.9],["2026-07-16",10201,7.1],["2026-07-17",3563,2.5],["2026-07-18",3596,2.5],["2026-07-19",17189,12],["2026-07-20",17499,12.2],["2026-07-21",14818,10.4],["2026-07-22",20932,14.7],["2026-07-23",3948,2.8],["2026-07-24",4865,3.4],["2026-07-25",13761,9.6],["2026-07-27",20613,14.4],["2026-07-28",9397,6.6],["2026-07-29",4312,3],["2026-07-30",13620,9.5],["2026-07-31",17273,12.1],
    ["2026-08-01",15149,10.6],["2026-08-02",994,0.7],["2026-08-03",13323,9.3],
  ]),
  ...weights("Marlene Soutelo", MARLENE_HEALTH_MANAGER, [
    ["2026-02-18",87.5],["2026-02-25",87],["2026-03-04",86.2],["2026-03-18",85.9],["2026-03-24",85],["2026-03-30",84.2],["2026-04-07",83.6],["2026-04-14",82.7],["2026-04-21",82],["2026-04-28",81.6],["2026-05-04",80.5],["2026-05-12",79.8],["2026-05-19",78.9],["2026-05-27",77.9],["2026-06-02",76.8],["2026-06-17",76],["2026-06-30",74.5],["2026-07-16",72.6],["2026-07-23",71.6],["2026-07-29",71.2],
  ]),
  ...pressures("Marlene Soutelo", MARLENE_HEALTH_MANAGER, [
    ["2026-06-15",97,72,78],["2026-06-22",91,69,76],["2026-06-25",112,81,78],["2026-06-29",102,74,80],["2026-07-13",93,67,79],["2026-07-20",91,75,82],["2026-07-27",88,67,76],
  ]),
  document("Tiago Soutelo","2025-03-28","Ressonância magnética da coluna cervical","https://drive.google.com/file/d/1FDW-9aucKBY97oZ4xpa4BYBCZjMl7nMo/view","1FDW-9aucKBY97oZ4xpa4BYBCZjMl7nMo"),
  document("Tiago Soutelo","2025-12-18","Eletrocardiograma","https://drive.google.com/file/d/1TUFaE19Rw89T0TB6mQlh_-fo5JbeeAw3/view","1TUFaE19Rw89T0TB6mQlh_-fo5JbeeAw3"),
  document("Tiago Soutelo","2026-08-03","Exame digitalizado — data a confirmar","https://drive.google.com/file/d/1Jtd2JQ1SxaUIu_WttUBrOlL11v1xlHzy/view","1Jtd2JQ1SxaUIu_WttUBrOlL11v1xlHzy","A data e o tipo de exame não foram reconhecidos automaticamente."),
  document("Tiago Soutelo","2026-08-03","Estudo de imagiologia — visualizador","https://drive.google.com/file/d/1OhBgjcpmZLHg7B3iYjYHBIDBRBAe7aV7/view","1OhBgjcpmZLHg7B3iYjYHBIDBRBAe7aV7"),
  document("Tiago Soutelo","2025-04-16","Análises clínicas","https://drive.google.com/file/d/1YOyOhq63FDHzXayftpijYMec5rbBasZw/view","1YOyOhq63FDHzXayftpijYMec5rbBasZw"),
  document("Tiago Soutelo","2025-12-17","Análises clínicas","https://drive.google.com/file/d/1kHHz2gN9oysI7X22Fu93BFyvz9dRbR72/view","1kHHz2gN9oysI7X22Fu93BFyvz9dRbR72"),
  document("Tiago Soutelo","2026-05-27","Análises clínicas","https://drive.google.com/file/d/1aDM2BFxLKzvzYMCbPhl1EkI61wSz5HxX/view","1aDM2BFxLKzvzYMCbPhl1EkI61wSz5HxX"),
  document("Marlene Soutelo","2021-07-13","Radiografia do tórax","https://drive.google.com/file/d/1RkcL3AAMuYmLxJksH2sJRWPHuzVWRk4O/view","1RkcL3AAMuYmLxJksH2sJRWPHuzVWRk4O"),
  document("Marlene Soutelo","2026-02-14","Ecografias da tiróide e abdominal","https://drive.google.com/file/d/1Lp84PEFszDcoStT3ds5A3NFATYFI010o/view","1Lp84PEFszDcoStT3ds5A3NFATYFI010o"),
  document("Marlene Soutelo","2026-02-19","Eletrocardiograma","https://drive.google.com/file/d/15GTg9KCncEjN_XWTvBbhrEClw98T6iKF/view","15GTg9KCncEjN_XWTvBbhrEClw98T6iKF"),
  document("Marlene Soutelo","2026-02-20","MAPA — registo de 24 horas","https://drive.google.com/file/d/1tlhEc01frLcSV8KMGKZopyO_EG6bMri4/view","1tlhEc01frLcSV8KMGKZopyO_EG6bMri4"),
  document("Marlene Soutelo","2026-02-20","MAPA — relatório médico","https://drive.google.com/file/d/1Ml1Z5kB-WozlHRU1RN3ux48aPK1Mspnl/view","1Ml1Z5kB-WozlHRU1RN3ux48aPK1Mspnl"),
  document("Marlene Soutelo","2026-08-03","Exame digitalizado — data a confirmar","https://drive.google.com/file/d/14YIc02-Hvp9gSTm6Bb_-BH9Boombbc5A/view","14YIc02-Hvp9gSTm6Bb_-BH9Boombbc5A","A data e o tipo de exame não foram reconhecidos automaticamente."),
  document("Marlene Soutelo","2026-02-19","Análises clínicas","https://drive.google.com/file/d/1PiVMUeiDPxHrRRTGtl5JR1uZRLTY1v9u/view","1PiVMUeiDPxHrRRTGtl5JR1uZRLTY1v9u"),
  document("Marlene Soutelo","2026-05-27","Análises clínicas","https://drive.google.com/file/d/10FP5-2lU1jWz1KTgJ5G_9rAYMQORpkPg/view","10FP5-2lU1jWz1KTgJ5G_9rAYMQORpkPg"),
];
