// Measured RSS samples (seconds, MB) from data/research/modern-relay/rss-w-*.csv.
export type Sample = readonly [seconds: number, megabytes: number];

export const defaultCaches: readonly Sample[] = [
  [30, 1057], [40, 1074], [50, 1080], [60, 1092], [70, 1104], [80, 1115], [90, 1125], [100, 1129],
  [111, 1131], [121, 1144], [131, 1146], [141, 1176], [151, 1187], [161, 1189], [171, 1212],
  [181, 1214], [191, 1217], [201, 1257], [211, 1258], [221, 1136], [231, 1137],
];

export const cappedCaches: readonly Sample[] = [
  [30, 991], [40, 916], [50, 789], [60, 1014], [70, 920], [80, 920], [91, 802], [101, 827],
  [111, 931], [121, 931], [131, 934], [141, 865], [151, 911], [161, 913], [171, 937], [181, 898],
  [191, 723], [201, 913], [211, 1034], [221, 939], [231, 801],
];

export const scenarios = [
  {
    name: "Ten tables, 90% of reads on two, 20 rows/s appended",
    cap: "256 MiB + 64 MiB",
    rss: "1137 → 916 MB",
    requests: "-6%",
    verdict: "Helps",
  },
  {
    name: "Ten tables, 90% of reads on two, no writes",
    cap: "256 MiB + 64 MiB",
    rss: "1047 → 895 MB",
    requests: "-8%",
    verdict: "Helps",
  },
  {
    name: "Ten tables, reads spread evenly, no writes",
    cap: "256 MiB + 64 MiB",
    rss: "1075 → 1330 MB",
    requests: "-42%",
    verdict: "Hurts",
  },
  {
    name: "One table, one 900 MB vector partition, no writes",
    cap: "64 MiB + 16 MiB",
    rss: "1244 → 3224 MB",
    requests: "-56%",
    verdict: "Hurts",
  },
] as const;
