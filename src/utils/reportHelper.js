export const getReportMetric = (reportData, labels, groups = ['inbody', 'obesityAnalysis', 'stress', 'sleepMetricsTable', 'stressTable', 'inbodyProfile', 'sleepProfile', 'profile', 'manualMetrics']) => {
  if (!reportData) return null;
  const targetLabels = Array.isArray(labels) ? labels : [labels];
  
  // Handle manualMetrics specifically if needed, since it's an object
  if (groups.includes('manualMetrics') && reportData.manualMetrics) {
     const mm = reportData.manualMetrics;
     for (const label of targetLabels) {
        if (label === '血糖' && mm.bloodGlucose) return mm.bloodGlucose;
        if (label === '血压' && mm.bloodPressure) return mm.bloodPressure;
        if (label === '血脂' && mm.bloodLipids) return mm.bloodLipids;
        if (label === '尿酸' && mm.uricAcid) return mm.uricAcid;
     }
  }

  for (const group of groups) {
    const rows = Array.isArray(reportData[group]) ? reportData[group] : [];
    const found = rows.find(row => targetLabels.includes(row.metric) || targetLabels.includes(row.label));
    if (found && found.value !== undefined && found.value !== null && found.value !== '') {
      return String(found.value).trim();
    }
  }
  return null;
};
