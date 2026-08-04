export type ImportedMetric = {
  profile: "Tiago Soutelo" | "Marlene Soutelo";
  groupName: "body" | "pressure" | "activity";
  metricKey: string;
  metricLabel: string;
  recordedAt: string;
  value: number;
  unit: string | null;
  sourceKey: string;
  sourceUrl: string;
  note: string | null;
};

const tiagoSource = "https://drive.google.com/file/d/1HZQDbjWoJjqBTR-oyghnHJxFu0QYxUuT/view?usp=drivesdk";
const marleneSource = "https://drive.google.com/file/d/1h8i4gCiOrafV5TA4I60yKdb3rk_DkNmI/view?usp=drivesdk";

type BodyRow = [string, number, number, number?, number?, number?, number?];
type PressureRow = [string, number, number, number, number, string?];
type ActivityRow = [string, number, number, number, number?];

const tiagoBody: BodyRow[] = [
  ["2026-04-03T08:54",98.8,30.5,28.5,51.52,35.6,3.67],["2026-04-06",101.2,31.2,29.6,50.79,35.1,3.7],
  ["2026-04-13",99.6,30.7,28.8,51.31,35.5,3.68],["2026-04-16",100.6,31,29.2,51.09,35.3,3.69],
  ["2026-04-22",97.6,30.1,27.8,52.05,36,3.66],["2026-04-30",95.5,29.5,26.9,52.77,36.4,3.62],
  ["2026-05-06",93.2,28.8,25.7,53.54,37.1,3.6],["2026-05-12",93.5,28.9,25.9,53.48,37.1,3.6],
  ["2026-05-18",92.9,28.7,25.6,53.61,37.2,3.59],["2026-05-22",92.3,28.5,25.3,53.85,37.4,3.58],
  ["2026-05-25",91.5,28.2,24.9,54.1,37.6,3.57],["2026-05-30",90.5,27.9,24.6,54.48,37.7,3.54],
  ["2026-06-02",89.9,27.7,24.2,54.62,37.9,3.54],["2026-06-05",89.5,27.6,24.1,54.75,38,3.53],
  ["2026-06-07",89.2,27.5,23.9,54.82,38,3.53],["2026-06-09",89.2,27.5,23.9,54.93,38.1,3.53],
  ["2026-06-14",89.1,27.5,23.9,54.99,38.1,3.52],["2026-06-16",88.8,27.4,23.6,55.07,38.2,3.53],
  ["2026-06-19",88.3,27.3,23.5,55.27,38.3,3.51],["2026-06-20",88.1,27.2,23.3,55.39,38.4,3.51],
  ["2026-06-23",87,26.9,22.9,55.63,38.6,3.49],["2026-06-29",87.7,27.1,23.1,55.42,38.5,3.51],
  ["2026-06-30",87.5,27,23.1,55.43,38.5,3.5],["2026-07-01",87.4,27,23,55.49,38.6,3.5],
  ["2026-07-02",87.1,26.9,22.9,55.68,38.6,3.49],["2026-07-03",86.4,26.7,22.5,55.9,38.8,3.48],
  ["2026-07-14",87.5,27,23.1,55.43,38.5,3.5],["2026-07-15",86,26.5,22.4,56.05,38.9,3.47],
  ["2026-07-22T08:31",87.1,26.9,22.9,55.57,38.5,3.49],["2026-07-22T21:04",85.8,26.5,22.2,56.18,39,3.47],
  ["2026-07-27T08:22",85.9,26.5,22.4,56,38.8,3.47],["2026-07-27T19:37",84.8,26.2,21.8,56.49,39.2,3.45],
  ["2026-07-31",84.7,26.1,21.8,56.43,39.2,3.44],["2026-08-01",83.9,25.9,21.4,56.73,39.4,3.43],
  ["2026-08-03",83.7,25.8,21.2,56.87,39.5,3.43],
];

const marleneBody: BodyRow[] = [
  ["2026-02-18",87.5,35.9],["2026-02-25",87,35.7],["2026-03-04",86.2,35.4],["2026-03-18",85.9,35.2],
  ["2026-03-24",85,34.92],["2026-03-30",84.2,34.5],["2026-04-07",83.6,34.4,45.1,37.7,26.3,2.9],
  ["2026-04-14",82.7,33.9],["2026-04-21",82,33.6],["2026-04-28",81.6,33.5,43.8,38.5,26.6,2.9],
  ["2026-05-04",80.5,33.1,42.9,39.1,28,2.9],["2026-05-12",79.8,32.7],["2026-05-19",78.9,32.4,41.8,39.8,28.5,2.9],
  ["2026-05-27",77.9,32,41.2,40.3,28.8,2.9],["2026-06-02",76.8,31.6,40.7,40.6,27.9,2.9],
  ["2026-06-17",76,31.2,39.9,41.2,29.4,2.9],["2026-06-30",74.5,30.6,38.9,41.9,29.7,2.9],
  ["2026-07-16",72.6,29.8,37.9,42.6,29.6,2.9],["2026-07-23",71.6,29.4,37.2,43,30,2.8],
  ["2026-07-29",71.2,29.3,36.9,43.3,30.2,2.8],
];

const tiagoPressure: PressureRow[] = [
  ["2026-05-18",115,84,83,94.33],["2026-05-24",121,80,70,93.67],["2026-05-27",103,70,86,81,"Medição após ginásio"],
  ["2026-06-01",110,73,67,85.33],["2026-06-15",115,77,69,89.67],["2026-06-22",114,76,62,88.67],
  ["2026-06-29",110,75,63,86.67],["2026-07-14",109,69,67,82.33],["2026-07-20",118,77,65,90.67],
];

const marlenePressure: PressureRow[] = [
  ["2026-06-15",97,72,78,80.3],["2026-06-22",91,69,76,76.3],["2026-06-25",112,81,78,91.3],
  ["2026-06-29",102,74,80,83.3],["2026-07-13",93,67,79,75.7],["2026-07-20",91,75,82,80.3],
  ["2026-07-27",88,67,76,74],
];

const tiagoActivity: ActivityRow[] = [
  ["2026-05-24",7901,5.5,347],["2026-05-25",10914,7.6,480],["2026-05-26",8216,5.8,361],["2026-05-27",10224,7.7,354,102.24],["2026-05-28",3423,2.4,150],["2026-05-29",14743,10.3,648],["2026-05-30",11667,8.2,513,129.63],["2026-05-31",9993,7,439],
  ["2026-06-01",11185,7.8,492],["2026-06-02",5331,3.7,234],["2026-06-03",13648,9.6,600],["2026-06-04",13568,9.5,597],["2026-06-05",10263,7.2,451],["2026-06-06",11353,7.9,499],["2026-06-07",14998,10.5,660],["2026-06-08",22472,15.7,988],["2026-06-09",2915,2,128],["2026-06-10",7633,5.3,335],["2026-06-11",12093,8.5,532],["2026-06-12",8670,6.1,381],["2026-06-13",20862,14.6,918],["2026-06-14",8906,6.2,391],["2026-06-15",14873,10.4,654],["2026-06-16",11386,8,501],["2026-06-17",14181,9.9,624],["2026-06-18",11832,8.3,520],["2026-06-19",18502,13,814],["2026-06-20",4217,3,185],["2026-06-21",14722,10.3,647],["2026-06-22",21163,14.8,931],["2026-06-23",5500,3.8,242],["2026-06-24",21464,15,944],["2026-06-25",4869,3.4,214],["2026-06-26",5126,3.6,225],["2026-06-27",14672,10.3,645],["2026-06-28",17450,12.2,767],["2026-06-29",10769,7.5,473],["2026-06-30",4885,3.4,214],
  ["2026-07-01",13605,9.5,598],["2026-07-02",2854,2,125],["2026-07-03",8681,6.1,382],["2026-07-04",9473,6.6,416],["2026-07-05",20051,14,882],["2026-07-06",10928,7.6,480],["2026-07-07",10704,7.5,471],["2026-07-08",8989,6.3,395],["2026-07-09",18228,12.8,802],["2026-07-10",13163,9.2,579],["2026-07-11",12643,8.9,556],["2026-07-12",3646,2.6,160],["2026-07-13",19390,13.6,853],["2026-07-14",19588,13.7,862],["2026-07-15",35565,24.9,1565],["2026-07-16",10201,7.1,448],["2026-07-17",3563,2.5,156],["2026-07-18",3596,2.5,158],["2026-07-19",17189,12,756],["2026-07-20",17499,12.2,770],["2026-07-21",14818,10.4,652],["2026-07-22",20932,14.7,921],["2026-07-23",3948,2.8,173],["2026-07-24",4865,3.4,214],["2026-07-25",13761,9.6,605],["2026-07-27",20613,14.4,907],["2026-07-28",9397,6.6,413],["2026-07-29",4312,3,189],["2026-07-30",13620,9.5,599],["2026-07-31",17273,12.1,760],
  ["2026-08-01",15149,10.6,666],["2026-08-02",994,.7,43],["2026-08-03",13323,9.3,586],
];

const metric = (profile: ImportedMetric["profile"], groupName: ImportedMetric["groupName"], metricKey: string, metricLabel: string, recordedAt: string, value: number, unit: string | null, sourceUrl: string, note: string | null = null): ImportedMetric => ({
  profile, groupName, metricKey, metricLabel, recordedAt, value, unit, sourceUrl, note,
  sourceKey: `health-manager:${profile}:${metricKey}:${recordedAt}`,
});

function bodyMetrics(profile: ImportedMetric["profile"], rows: BodyRow[], sourceUrl: string) {
  return rows.flatMap(([date, weight, bmi, fat, water, muscles, bones]) => [
    metric(profile,"body","weight","Peso",date,weight,"kg",sourceUrl),
    metric(profile,"body","bmi","IMC",date,bmi,null,sourceUrl),
    ...(fat === undefined ? [] : [metric(profile,"body","fat_mass","Massa gorda",date,fat,"%",sourceUrl)]),
    ...(water === undefined ? [] : [metric(profile,"body","water","Água",date,water,"%",sourceUrl)]),
    ...(muscles === undefined ? [] : [metric(profile,"body","muscles","Músculos",date,muscles,"%",sourceUrl)]),
    ...(bones === undefined ? [] : [metric(profile,"body","bones","Ossos",date,bones,"kg",sourceUrl)]),
  ]);
}

function pressureMetrics(profile: ImportedMetric["profile"], rows: PressureRow[], sourceUrl: string) {
  return rows.flatMap(([date, systolic, diastolic, pulse, map, note]) => [
    metric(profile,"pressure","systolic","Sistólica",date,systolic,"mmHg",sourceUrl,note ?? null),
    metric(profile,"pressure","diastolic","Diastólica",date,diastolic,"mmHg",sourceUrl,note ?? null),
    metric(profile,"pressure","pulse","Pulsação",date,pulse,"bpm",sourceUrl,note ?? null),
    metric(profile,"pressure","map","Pressão arterial média",date,map,"mmHg",sourceUrl,note ?? null),
  ]);
}

const activityMetrics = tiagoActivity.flatMap(([date, steps, distance, kcal, target]) => [
  metric("Tiago Soutelo","activity","steps","Passos",date,steps,"passos",tiagoSource),
  metric("Tiago Soutelo","activity","distance","Distância",date,distance,"km",tiagoSource),
  metric("Tiago Soutelo","activity","energy","Energia",date,kcal,"kcal",tiagoSource),
  ...(target === undefined ? [] : [metric("Tiago Soutelo","activity","target_area","Área-alvo",date,target,"%",tiagoSource,"Apenas duas leituras disponíveis no relatório")]),
]);

export const importedMetrics: ImportedMetric[] = [
  ...bodyMetrics("Tiago Soutelo", tiagoBody, tiagoSource),
  ...pressureMetrics("Tiago Soutelo", tiagoPressure, tiagoSource),
  ...activityMetrics,
  ...bodyMetrics("Marlene Soutelo", marleneBody, marleneSource),
  ...pressureMetrics("Marlene Soutelo", marlenePressure, marleneSource),
];
