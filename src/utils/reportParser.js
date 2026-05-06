const sourceTypeLabelMap = {
  inbody: 'InBody',
  sleep: '睡眠监测',
  stress: '压力检测',
  combined: '综合档案'
};

const basicInfoLabels = [
  '姓名',
  'ID',
  '性别',
  '年龄',
  '出生日期',
  '身高',
  '体重',
  'BMI',
  '编码',
  '手机号',
  '身份证号码',
  '住址',
  '测试日期',
  '报告时间',
  '主诉'
];

const reportToneCycle = ['blue', 'green', 'purple', 'orange', 'teal', 'cyan'];

const reportIconPathMap = {
  report: ['M12 3l6 3v5c0 4.5-2.7 8.2-6 10-3.3-1.8-6-5.5-6-10V6l6-3z', 'M12 7v8', 'M8.5 11.5H15.5'],
  score: ['M12 3l7 3v5c0 5-3.1 9.1-7 11-3.9-1.9-7-6-7-11V6l7-3z', 'M9 12l2 2 4-4'],
  sleep: ['M15 4a7 7 0 1 0 5 12.5A8.5 8.5 0 0 1 15 4z', 'M7 4l.8 1.6L9.5 6l-1.7.4L7 8 6.2 6.4 4.5 6l1.7-.4L7 4z'],
  summary: ['M6 5h12', 'M6 10h12', 'M6 15h8', '17 14v5', '14.5 16.5H19.5'],
  stress: ['M13 2L6 14h5l-1 8 7-12h-5l1-8z'],
  body: ['M9 4V2', '15 4V2', '7 8a5 5 0 0 1 10 0v2a5 5 0 0 1-10 0V8z', '5 22a7 7 0 0 1 14 0'],
  obesity: ['M12 3a7 7 0 1 1 0 14a7 7 0 0 1 0-14z', '12 7v5l3 2', '6 20h12'],
  appendix: ['M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z', '14 3v5h5', '9 13h6', '9 17h6'],
  'metric-score': ['M12 4l2.2 4.5 5 .7-3.6 3.5.8 5-4.4-2.3-4.4 2.3.8-5L4.8 9.2l5-.7L12 4z'],
  'metric-sleep': ['M15 4a7 7 0 1 0 5 12.5A8.5 8.5 0 0 1 15 4z'],
  'metric-stress': ['M13 3L7 13h4l-1 8 7-12h-4l1-6z'],
  'metric-body': ['M9 4V2', '15 4V2', '7 9a5 5 0 0 1 10 0', '8 13a4 4 0 0 0 8 0', '5 21a7 7 0 0 1 14 0'],
  'metric-obesity': ['M12 4a6 6 0 1 1 0 12a6 6 0 0 1 0-12z', '12 8v4l2.5 1.5'],
  'metric-default': ['M5 12h14', '12 5v14']
};

const getReportIconPaths = (key) => {
  return reportIconPathMap[key] || reportIconPathMap['metric-default'];
};

const getGroupIconKey = (groupKey) => {
  const iconMap = {
    sleep: 'sleep',
    summary: 'summary',
    stress: 'stress',
    body: 'body',
    obesity: 'obesity',
    appendix: 'appendix'
  };
  return iconMap[groupKey] || 'appendix';
};

const getMetricIconKey = (label) => {
  const text = String(label || '');
  if (text.includes('评分')) return 'metric-score';
  if (text.includes('睡眠')) return 'metric-sleep';
  if (text.includes('压力') || text.includes('神经')) return 'metric-stress';
  if (text.includes('BMI') || text.includes('体脂') || text.includes('体重') || text.includes('肌肉') || text.includes('水分')) return 'metric-body';
  if (text.includes('肥胖') || text.includes('腰臀') || text.includes('脂肪')) return 'metric-obesity';
  return 'metric-default';
};

const hasMeaningfulValue = (value) => {
  if (value === undefined || value === null) return false;
  const text = String(value).trim();
  return text !== '' && text !== '--' && text !== '未知' && text !== '未知客户' && text !== 'null' && text !== 'undefined';
};

const normalizeValue = (value) => {
  return hasMeaningfulValue(value) ? String(value).trim() : '';
};

const getArrayItemValue = (items, label) => {
  if (!Array.isArray(items)) return '';
  return items.find(item => item.label === label)?.value || '';
};

const getReportValue = (reportData, labels, sources = ['profile', 'sleepProfile', 'inbodyProfile', 'sleepMonitorInfo', 'sleepMonitorParams']) => {
  const labelList = Array.isArray(labels) ? labels : [labels];
  for (const source of sources) {
    const items = reportData?.[source];
    for (const label of labelList) {
      const value = getArrayItemValue(items, label);
      if (hasMeaningfulValue(value)) {
        return String(value).trim();
      }
    }
  }
  return '';
};

const buildUniqueItems = (groups, allowedLabels = null) => {
  const mapped = new Map();

  groups.forEach(group => {
    if (!Array.isArray(group)) return;
    group.forEach(item => {
      const label = String(item?.label || '').trim();
      const value = normalizeValue(item?.value);
      if (!label || !value) return;
      if (allowedLabels && !allowedLabels.includes(label)) return;
      if (!mapped.has(label)) {
        mapped.set(label, {
          label,
          value,
          unit: normalizeValue(item?.unit),
          status: normalizeValue(item?.status),
          isWarning: !!item?.isWarning
        });
      }
    });
  });

  return Array.from(mapped.values());
};

const buildTableSection = (key, title, rows, columns) => {
  if (!Array.isArray(rows) || !rows.length) return null;

  const normalizedRows = rows
    .map(row => {
      const nextRow = {};
      columns.forEach(column => {
        nextRow[column.key] = normalizeValue(row?.[column.key]);
      });
      return nextRow;
    })
    .filter(row => columns.some(column => hasMeaningfulValue(row[column.key])));

  if (!normalizedRows.length) return null;

  return {
    key,
    title,
    type: 'table',
    columns,
    rows: normalizedRows
  };
};

const buildDynamicTableSection = (key, table, fallbackTitle) => {
  const headers = Array.isArray(table?.headers)
    ? table.headers.map(header => normalizeValue(header)).filter(Boolean)
    : [];

  const rows = Array.isArray(table?.rows)
    ? table.rows
        .map(row => (Array.isArray(row) ? row.map(cell => normalizeValue(cell)) : []))
        .filter(row => row.some(hasMeaningfulValue))
    : [];

  if (!headers.length && !rows.length) return null;

  const normalizedHeaders = headers.length
    ? headers
    : (rows[0] || []).map((_, index) => `列${index + 1}`);

  return {
    key,
    title: normalizeValue(table?.title) || fallbackTitle,
    type: 'matrix',
    headers: normalizedHeaders,
    rows: rows.map(row => normalizedHeaders.map((_, index) => row[index] || ''))
  };
};

const buildTextSection = (key, title, text) => {
  const normalizedText = normalizeValue(text);
  if (!normalizedText) return null;
  return {
    key,
    title,
    type: 'text',
    text: normalizedText
  };
};

const buildCardItems = (items) => {
  return buildUniqueItems([items]);
};

const buildBasicInfo = (reportData) => {
  return buildUniqueItems(
    [reportData?.profile, reportData?.sleepProfile, reportData?.inbodyProfile],
    basicInfoLabels
  );
};

const buildHighlightMetrics = (reportData) => {
  const mapped = new Map();

  const pushMetric = (label, value, unit = '', source = '', status = '', isWarning = false) => {
    const normalizedLabel = normalizeValue(label);
    const normalizedValue = normalizeValue(value);
    if (!normalizedLabel || !normalizedValue || mapped.has(normalizedLabel)) return;

    mapped.set(normalizedLabel, {
      label: normalizedLabel,
      value: normalizedValue,
      unit: normalizeValue(unit),
      source,
      status: normalizeValue(status),
      isWarning: !!isWarning
    });
  };

  (reportData?.inbody || []).forEach(item => {
    pushMetric(item.label, item.value, item.unit, 'InBody', item.status, item.isWarning);
  });

  (reportData?.stress || []).forEach(item => {
    pushMetric(item.label, item.value, item.unit, '压力检测', item.status, item.isWarning);
  });

  (reportData?.sleepMetricsTable || []).forEach(item => {
    pushMetric(item.metric, item.value, item.unit, '睡眠监测');
  });

  if (reportData?.manualMetrics) {
    if (reportData.manualMetrics.bloodGlucose) pushMetric('血糖', reportData.manualMetrics.bloodGlucose, 'mmol/L', '生化指标');
    if (reportData.manualMetrics.bloodPressure) pushMetric('血压', reportData.manualMetrics.bloodPressure, 'mmHg', '生化指标');
    if (reportData.manualMetrics.bloodLipids) pushMetric('血脂', reportData.manualMetrics.bloodLipids, 'mmol/L', '生化指标');
    if (reportData.manualMetrics.uricAcid) pushMetric('尿酸', reportData.manualMetrics.uricAcid, 'μmol/L', '生化指标');
  }

  return Array.from(mapped.values()).slice(0, 12);
};

const buildSections = (reportData) => {
  const sections = [];

  const pushSection = (section) => {
    if (section) sections.push(section);
  };

  const inbodyProfileItems = buildUniqueItems([reportData?.inbodyProfile]);
  const stressProfileItems = buildUniqueItems([reportData?.profile]);
  const sleepProfileItems = buildUniqueItems([reportData?.sleepProfile]);
  const sleepMonitorInfoItems = buildUniqueItems([reportData?.sleepMonitorInfo]);
  const sleepMonitorParamItems = buildUniqueItems([reportData?.sleepMonitorParams]);

  pushSection(inbodyProfileItems.length ? { key: 'inbody-profile', title: 'InBody基础资料', type: 'kv', items: inbodyProfileItems } : null);
  pushSection(buildCardItems(reportData?.inbody).length ? { key: 'inbody-metrics', title: 'InBody核心指标', type: 'cards', items: buildCardItems(reportData?.inbody) } : null);
  pushSection(buildTableSection('inbody-table', '人体成分分析', reportData?.inbodyTable, [
    { key: 'category', label: '分类' },
    { key: 'metric', label: '项目' },
    { key: 'value', label: '数值' },
    { key: 'unit', label: '单位' },
    { key: 'range', label: '标准范围' }
  ]));
  pushSection(buildTableSection('muscle-fat', '肌肉脂肪分析', reportData?.muscleFatAnalysis, [
    { key: 'metric', label: '项目' },
    { key: 'value', label: '数值' },
    { key: 'unit', label: '单位' },
    { key: 'status', label: '状态' }
  ]));
  pushSection(buildTableSection('obesity-analysis', '肥胖分析', reportData?.obesityAnalysis, [
    { key: 'metric', label: '项目' },
    { key: 'value', label: '数值' },
    { key: 'unit', label: '单位' },
    { key: 'status', label: '状态' }
  ]));

  pushSection(stressProfileItems.length ? { key: 'stress-profile', title: '压力报告基础资料', type: 'kv', items: stressProfileItems } : null);
  pushSection(buildCardItems(reportData?.stress).length ? { key: 'stress-metrics', title: '压力核心指标', type: 'cards', items: buildCardItems(reportData?.stress) } : null);
  pushSection(buildTableSection('stress-table', '压力检测明细', reportData?.stressTable, [
    { key: 'item', label: '项目' },
    { key: 'value', label: '数值' },
    { key: 'result', label: '结果' },
    { key: 'standard', label: '标准' }
  ]));

  pushSection(sleepProfileItems.length ? { key: 'sleep-profile', title: '睡眠基础资料', type: 'kv', items: sleepProfileItems } : null);
  pushSection(sleepMonitorInfoItems.length ? { key: 'sleep-monitor-info', title: '监测信息', type: 'kv', items: sleepMonitorInfoItems } : null);
  pushSection(sleepMonitorParamItems.length ? { key: 'sleep-monitor-params', title: '监测参数', type: 'kv', items: sleepMonitorParamItems } : null);
  pushSection(buildTableSection('sleep-metrics', '睡眠指标明细', reportData?.sleepMetricsTable, [
    { key: 'metric', label: '指标' },
    { key: 'value', label: '数值' },
    { key: 'unit', label: '单位' }
  ]));
  pushSection(buildDynamicTableSection('sleep-statistics', reportData?.sleepStatistics, '睡眠数据统计'));
  pushSection(buildDynamicTableSection('daily-statistics', reportData?.dailyStatistics, '每日统计'));
  pushSection(buildTextSection('sleep-summary', '睡眠总结', reportData?.sleepSummaryText));

  if (reportData?.manualMetrics) {
    const manualItems = [];
    if (reportData.manualMetrics.bloodGlucose) manualItems.push({ label: '血糖', value: reportData.manualMetrics.bloodGlucose, unit: 'mmol/L' });
    if (reportData.manualMetrics.bloodPressure) manualItems.push({ label: '血压', value: reportData.manualMetrics.bloodPressure, unit: 'mmHg' });
    if (reportData.manualMetrics.bloodLipids) manualItems.push({ label: '血脂', value: reportData.manualMetrics.bloodLipids, unit: 'mmol/L' });
    if (reportData.manualMetrics.uricAcid) manualItems.push({ label: '尿酸', value: reportData.manualMetrics.uricAcid, unit: 'μmol/L' });
    
    if (manualItems.length > 0) {
      pushSection({
        key: 'manual-metrics',
        title: '手动生化指标',
        type: 'profile',
        items: manualItems
      });
    }
  }

  return sections;
};

const createSectionMap = (sections) => {
  return sections.reduce((acc, section) => {
    acc[section.key] = section;
    return acc;
  }, {});
};

const pickSections = (sectionMap, keys) => {
  return keys.map(key => sectionMap[key]).filter(Boolean);
};

const parseScore = (value) => {
  const match = String(value || '').match(/\d+/);
  return match ? Number(match[0]) : null;
};

const formatAge = (age) => {
  const normalizedAge = normalizeValue(age);
  if (!normalizedAge) return '';
  return /岁$/.test(normalizedAge) ? normalizedAge : `${normalizedAge}岁`;
};

const getValueByLabels = (items, labels) => {
  const labelList = Array.isArray(labels) ? labels : [labels];
  for (const label of labelList) {
    const matched = items.find(item => item.label === label && hasMeaningfulValue(item.value));
    if (matched) return matched.value;
  }
  return '';
};

const getManualMetricItem = (patient, label) => {
  return (getPatientSection(patient, 'manual-metrics')?.items || []).find(item => item?.label === label) || null;
};

const parseBloodPressureValue = (value) => {
  const matched = String(value || '').match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
  if (!matched) return null;
  return {
    systolic: Number(matched[1]),
    diastolic: Number(matched[2])
  };
};

const getBiochemicalAssessment = (patient) => {
  const bloodGlucoseItem = getManualMetricItem(patient, '血糖');
  const bloodPressureItem = getManualMetricItem(patient, '血压');
  const bloodLipidsItem = getManualMetricItem(patient, '血脂');
  const uricAcidItem = getManualMetricItem(patient, '尿酸');
  const bmiMetric =
    (getPatientSection(patient, 'obesity-analysis')?.rows || []).find(item => String(item?.metric || '').includes('BMI')) ||
    (patient?.highlightMetrics || []).find(item => String(item?.label || '').includes('BMI')) ||
    null;
  const bodyFatMetric =
    (getPatientSection(patient, 'obesity-analysis')?.rows || []).find(item => String(item?.metric || '').includes('体脂')) ||
    (patient?.highlightMetrics || []).find(item => String(item?.label || '').includes('体脂')) ||
    null;
  const sleepEfficiencyMetric =
    (getPatientSection(patient, 'sleep-metrics')?.rows || []).find(item => String(item?.metric || '').includes('睡眠效率')) ||
    null;
  const stressMetric =
    (getPatientSection(patient, 'stress-metrics')?.items || []).find(item => {
      const text = String(item?.label || '');
      return text.includes('压力') || text.includes('交感') || text.includes('神经');
    }) || null;

  const bloodGlucose = parseNumber(bloodGlucoseItem?.value);
  const bloodLipids = parseNumber(bloodLipidsItem?.value);
  const uricAcid = parseNumber(uricAcidItem?.value);
  const bloodPressure = parseBloodPressureValue(bloodPressureItem?.value);
  const bmi = parseNumber(bmiMetric?.value);
  const bodyFat = parseNumber(bodyFatMetric?.value);
  const sleepEfficiency = parseNumber(sleepEfficiencyMetric?.value);

  const statuses = [];
  const scoreItems = [];

  if (bloodGlucose !== null) {
    const status = bloodGlucose >= 7 ? '偏高' : bloodGlucose >= 6.1 ? '临界偏高' : bloodGlucose < 3.9 ? '偏低' : '正常';
    statuses.push({
      label: '血糖',
      value: `${bloodGlucose}${bloodGlucoseItem?.unit ? ` ${bloodGlucoseItem.unit}` : ' mmol/L'}`,
      status
    });
    scoreItems.push({
      value: bloodGlucose >= 7 ? 58 : bloodGlucose >= 6.1 ? 72 : bloodGlucose < 3.9 ? 68 : 90,
      weight: 0.3
    });
  }

  if (bloodPressure) {
    const status =
      bloodPressure.systolic >= 140 || bloodPressure.diastolic >= 90
        ? '偏高'
        : bloodPressure.systolic >= 130 || bloodPressure.diastolic >= 85
          ? '临界偏高'
          : bloodPressure.systolic < 90 || bloodPressure.diastolic < 60
            ? '偏低'
            : '正常';
    statuses.push({
      label: '血压',
      value: `${bloodPressure.systolic}/${bloodPressure.diastolic} mmHg`,
      status
    });
    scoreItems.push({
      value:
        bloodPressure.systolic >= 140 || bloodPressure.diastolic >= 90
          ? 58
          : bloodPressure.systolic >= 130 || bloodPressure.diastolic >= 85
            ? 72
            : bloodPressure.systolic < 90 || bloodPressure.diastolic < 60
              ? 70
              : 90,
      weight: 0.25
    });
  }

  if (bloodLipids !== null) {
    const status = bloodLipids >= 6.2 ? '偏高' : bloodLipids >= 5.2 ? '临界偏高' : '正常';
    statuses.push({
      label: '血脂',
      value: `${bloodLipids}${bloodLipidsItem?.unit ? ` ${bloodLipidsItem.unit}` : ' mmol/L'}`,
      status
    });
    scoreItems.push({
      value: bloodLipids >= 6.2 ? 58 : bloodLipids >= 5.2 ? 72 : 88,
      weight: 0.2
    });
  }

  if (uricAcid !== null) {
    const status = uricAcid >= 540 ? '明显偏高' : uricAcid >= 420 ? '偏高' : '正常';
    statuses.push({
      label: '尿酸',
      value: `${uricAcid}${uricAcidItem?.unit ? ` ${uricAcidItem.unit}` : ' μmol/L'}`,
      status
    });
    scoreItems.push({
      value: uricAcid >= 540 ? 55 : uricAcid >= 420 ? 68 : 88,
      weight: 0.15
    });
  }

  const insights = [];

  if ((bloodGlucose !== null && bloodGlucose >= 6.1) || (bloodPressure && (bloodPressure.systolic >= 130 || bloodPressure.diastolic >= 85))) {
    insights.push({
      title: '糖压联动风险',
      text: `当前${bloodGlucose !== null ? `血糖 ${bloodGlucose} mmol/L` : '血糖指标'}${bloodPressure ? `、血压 ${bloodPressure.systolic}/${bloodPressure.diastolic} mmHg` : ''}已提示代谢与血管负担增加，若同时存在睡眠不足、体脂偏高或精神压力偏高，往往更容易出现晨起血压波动、餐后血糖控制变差和恢复效率下降。`,
      iconKey: 'summary',
      tone: 'orange'
    });
  }

  if ((bloodLipids !== null && bloodLipids >= 5.2) || (bodyFat !== null && bodyFat >= 25) || (bmi !== null && bmi >= 24)) {
    insights.push({
      title: '体脂与血脂同向影响',
      text: `当前${bloodLipids !== null ? `血脂 ${bloodLipids} mmol/L` : '血脂指标'}${bodyFat !== null ? `、体脂 ${bodyFat}%` : ''}${bmi !== null ? `、BMI ${bmi}` : ''}提示脂代谢与体重管理需要同步干预，若只控制体重而不调整饮食结构，血脂改善通常有限，运动方案也应兼顾有氧消耗与抗阻保肌。`,
      iconKey: 'body',
      tone: 'red'
    });
  }

  if ((uricAcid !== null && uricAcid >= 420) || (sleepEfficiency !== null && sleepEfficiency < 85) || stressMetric) {
    const stressLabel = stressMetric?.label ? `${stressMetric.label}` : '压力恢复指标';
    insights.push({
      title: '恢复能力与尿酸管理',
      text: `当前${uricAcid !== null ? `尿酸 ${uricAcid} μmol/L` : '尿酸指标'}${sleepEfficiency !== null ? `、睡眠效率 ${sleepEfficiency}%` : ''}${stressMetric ? `、${stressLabel}` : ''}提示恢复能力可能不足。熬夜、脱水、压力偏高和高嘌呤饮食会共同推高尿酸波动，因此报告中的饮食、补水和运动强度安排需要一起调整。`,
      iconKey: 'stress',
      tone: 'purple'
    });
  }

  if (!insights.length && statuses.length) {
    insights.push({
      title: '代谢状态总体可控',
      text: `当前已录入的${statuses.map(item => `${item.label}${item.status === '正常' ? '基本稳定' : item.status}`).join('、')}，结合已采集的睡眠、压力和体成分数据，建议继续通过规律作息、饮食结构优化和稳定运动量维持整体代谢平衡。`,
      iconKey: 'summary',
      tone: 'green'
    });
  }

  return {
    statuses,
    insights: insights.slice(0, 3),
    score: clampScore(weightedAverage(scoreItems))
  };
};

const buildProfileSummary = (patient, basicInfo) => {
  return [
    { label: '姓名', value: patient.name },
    { label: '性别', value: patient.gender },
    { label: '出生日期', value: getValueByLabels(basicInfo, '出生日期') },
    { label: '年龄', value: formatAge(patient.age) },
    { label: '身份证号', value: getValueByLabels(basicInfo, ['身份证号码', '编码', 'ID']) },
    { label: '检测日期', value: patient.date }
  ].filter(item => hasMeaningfulValue(item.value));
};

const weightedAverage = (items) => {
  const validItems = items.filter(item => item && typeof item.value === 'number' && !Number.isNaN(item.value) && item.weight > 0);
  if (!validItems.length) return null;

  const totalWeight = validItems.reduce((sum, item) => sum + item.weight, 0);
  if (!totalWeight) return null;

  return validItems.reduce((sum, item) => sum + item.value * item.weight, 0) / totalWeight;
};

const clampScore = (score) => {
  if (score === null || score === undefined || Number.isNaN(score)) return null;
  return Math.max(45, Math.min(98, Math.round(score)));
};

const getSectionByKey = (sections, key) => {
  return sections.find(section => section.key === key) || null;
};

const scoreFromAssessmentText = (text) => {
  const normalizedText = String(text || '').trim();
  if (!normalizedText) return null;

  if (/(重度|严重|高风险|异常|失衡|紊乱|危险)/.test(normalizedText)) return 55;
  if (/(偏高|偏低|风险|不足|肥胖|超重|过高|过低|需关注|异常倾向)/.test(normalizedText)) return 68;
  if (/(轻度|略高|略低|临界)/.test(normalizedText)) return 76;
  if (/(优秀|很好|理想)/.test(normalizedText)) return 92;
  if (/(正常|标准|良好|平衡|达标|健康|正常体重)/.test(normalizedText)) return 86;

  return null;
};

const evaluateSleepMetricScore = (label, value) => {
  const numericValue = parseNumber(value);
  const text = String(label || '');
  if (numericValue === null) return null;

  if (text.includes('睡眠效率') || text.includes('SE')) {
    if (numericValue >= 85) return 90;
    if (numericValue >= 75) return 80;
    return 66;
  }

  if ((text.includes('总睡眠时间') || text.includes('睡眠时间')) && !text.includes('清醒')) {
    if (numericValue >= 420 && numericValue <= 540) return 90;
    if ((numericValue >= 360 && numericValue < 420) || (numericValue > 540 && numericValue <= 600)) return 80;
    return 68;
  }

  if (text.includes('清醒时间') || text.includes('WASO')) {
    if (numericValue <= 30) return 88;
    if (numericValue <= 60) return 78;
    return 65;
  }

  if (text.includes('入睡') || text.includes('潜伏')) {
    if (numericValue <= 30) return 88;
    if (numericValue <= 60) return 76;
    return 64;
  }

  if (text.includes('觉醒') || text.includes('醒来次数')) {
    if (numericValue <= 2) return 88;
    if (numericValue <= 4) return 76;
    return 62;
  }

  return null;
};

const buildCompositeAssessment = ({ patient, sections, highlightMetrics, inbodyScore }) => {
  const sectionSignals = [];

  sections.forEach(section => {
    if (section.type === 'cards') {
      (section.items || []).forEach(item => {
        sectionSignals.push({
          label: item.label,
          value: item.value,
          text: item.status || item.value,
          isWarning: !!item.isWarning
        });
      });
    }

    if (section.type === 'table') {
      (section.rows || []).forEach(row => {
        sectionSignals.push({
          label: row.metric || row.item || row.category || '',
          value: row.value,
          text: row.status || row.result || row.standard || '',
          isWarning: false
        });
      });
    }
  });

  const keywordScores = sectionSignals
    .map(signal => scoreFromAssessmentText(signal.text))
    .filter(score => typeof score === 'number');

  const sleepSignals = [
    ...(getSectionByKey(sections, 'sleep-metrics')?.rows || []).map(row => ({ label: row.metric, value: row.value })),
    ...(getSectionByKey(sections, 'sleep-monitor-info')?.items || []).map(item => ({ label: item.label, value: item.value })),
    ...(getSectionByKey(sections, 'sleep-monitor-params')?.items || []).map(item => ({ label: item.label, value: item.value }))
  ];

  const sleepScores = sleepSignals
    .map(item => evaluateSleepMetricScore(item.label, item.value))
    .filter(score => typeof score === 'number');

  const bmiMetric = highlightMetrics.find(item => item.label.includes('BMI'));
  const bodyFatMetric = highlightMetrics.find(item => item.label.includes('体脂'));
  const warningCount = highlightMetrics.filter(item => item.isWarning).length;

  const bmiScore = (() => {
    const bmi = parseNumber(bmiMetric?.value);
    if (bmi === null) return null;
    if (bmi >= 18.5 && bmi <= 23.9) return 90;
    if (bmi >= 24 && bmi <= 27.9) return 76;
    return 62;
  })();

  const bodyFatScore = (() => {
    const bodyFat = parseNumber(bodyFatMetric?.value);
    if (bodyFat === null) return null;
    if (bodyFat <= 20) return 88;
    if (bodyFat <= 28) return 76;
    return 64;
  })();

  const warningScore = Math.max(52, 90 - warningCount * 6);
  const biochemicalAssessment = getBiochemicalAssessment(patient);
  const keywordScore = keywordScores.length
    ? keywordScores.reduce((sum, score) => sum + score, 0) / keywordScores.length
    : null;
  const sleepScore = sleepScores.length
    ? sleepScores.reduce((sum, score) => sum + score, 0) / sleepScores.length
    : null;

  const derivedScore = weightedAverage([
    { value: keywordScore, weight: 0.35 },
    { value: sleepScore, weight: 0.25 },
    { value: bmiScore, weight: 0.15 },
    { value: bodyFatScore, weight: 0.10 },
    { value: warningScore, weight: 0.10 },
    { value: biochemicalAssessment.score, weight: 0.15 }
  ]);

  const finalScore = clampScore(weightedAverage([
    { value: derivedScore, weight: inbodyScore !== null ? 0.65 : 1 },
    { value: inbodyScore, weight: inbodyScore !== null ? 0.35 : 0 }
  ]));

  const dataPoints =
    sectionSignals.filter(signal => hasMeaningfulValue(signal.label) && hasMeaningfulValue(signal.value)).length +
    sleepSignals.filter(signal => hasMeaningfulValue(signal.label) && hasMeaningfulValue(signal.value)).length;

  return {
    score: finalScore,
    note: dataPoints
      ? `基于 ${dataPoints} 项真实检测数据综合评估，已纳入睡眠、压力、体成分及生化指标联动分析`
      : '基于当前已采集真实数据综合评估'
  };
};

const buildMetricSummary = (score, highlightMetrics, inbodyScore = null) => {
  const cards = [];

  if (score !== null) {
    cards.push({
      label: '综合评分',
      value: String(score),
      unit: '分',
      note: 'AI综合评估',
      tone: 'green',
      isWarning: false
    });
  }

  if (inbodyScore !== null) {
    cards.push({
      label: 'InBody评分',
      value: String(inbodyScore),
      unit: '分',
      note: '原始体成分评分',
      tone: 'blue',
      isWarning: false
    });
  }

  highlightMetrics.slice(0, inbodyScore !== null ? 4 : 5).forEach((metric, index) => {
    cards.push({
      label: metric.label,
      value: metric.value,
      unit: metric.unit,
      note: metric.status || metric.source || '',
      tone: reportToneCycle[index % reportToneCycle.length],
      isWarning: metric.isWarning
    });
  });

  return cards.slice(0, 6);
};

const buildReportGroups = (sections, metricSummary, profileSummary) => {
  const sectionMap = createSectionMap(sections);
  const usedKeys = new Set();
  const groups = [];

  const pushSectionGroup = (config) => {
    const groupSections = pickSections(sectionMap, config.keys);
    if (!groupSections.length) return;
    config.keys.forEach(key => {
      if (sectionMap[key]) usedKeys.add(key);
    });
    groups.push({
      key: config.key,
      index: config.index,
      title: config.title,
      subtitle: config.subtitle,
      tone: config.tone,
      layout: config.layout,
      kind: 'sections',
      sections: groupSections
    });
  };

  pushSectionGroup({
    key: 'sleep',
    index: '1',
    title: '睡眠分析',
    subtitle: '睡眠结构与监测结果',
    tone: 'blue',
    layout: 'wide',
    keys: ['sleep-profile', 'sleep-monitor-info', 'sleep-monitor-params', 'sleep-metrics', 'sleep-statistics', 'daily-statistics', 'sleep-summary']
  });

  if (metricSummary.length || profileSummary.length) {
    groups.push({
      key: 'summary',
      index: '1.2',
      title: '检测摘要',
      subtitle: '关键指标与用户资料',
      tone: 'cyan',
      layout: 'compact',
      kind: 'metrics',
      cards: metricSummary,
      info: profileSummary.slice(0, 4)
    });
  }

  pushSectionGroup({
    key: 'manual',
    index: '1.5',
    title: '生化指标',
    subtitle: '核心指标数据',
    tone: 'red',
    layout: 'compact',
    keys: ['manual-metrics']
  });

  pushSectionGroup({
    key: 'stress',
    index: '2',
    title: '自律神经检测结果',
    subtitle: '压力与神经调节指标',
    tone: 'purple',
    layout: 'normal',
    keys: ['stress-profile', 'stress-metrics', 'stress-table']
  });

  pushSectionGroup({
    key: 'body',
    index: '3',
    title: '人体成分分析',
    subtitle: '体成分与肌肉脂肪结果',
    tone: 'green',
    layout: 'wide',
    keys: ['inbody-profile', 'inbody-metrics', 'inbody-table', 'muscle-fat']
  });

  pushSectionGroup({
    key: 'obesity',
    index: '4',
    title: '肥胖分析',
    subtitle: '肥胖相关真实指标',
    tone: 'orange',
    layout: 'normal',
    keys: ['obesity-analysis']
  });

  const remainingSections = sections.filter(section => !usedKeys.has(section.key));
  if (remainingSections.length) {
    groups.push({
      key: 'appendix',
      index: String(groups.length + 1),
      title: '补充资料',
      subtitle: '其他已采集数据',
      tone: 'teal',
      layout: 'wide',
      kind: 'sections',
      sections: remainingSections
    });
  }

  return groups;
};

const getPatientMeta = (patient) => {
  const parts = [];
  if (hasMeaningfulValue(patient.age)) parts.push(formatAge(patient.age));
  if (hasMeaningfulValue(patient.gender)) parts.push(patient.gender);
  parts.push(`编号: ${patient.id}`);
  return parts.join(' | ');
};

const hasPatientReportContent = (patient) => {
  return !!(
    patient &&
    (
      patient.reportGroups.length ||
      patient.profileSummary.length ||
      patient.metricSummary.length
    )
  );
};

const getScoreColor = (score) => {
  if (score >= 90) return '#03b48e';
  if (score >= 80) return '#14b6ff';
  if (score >= 60) return '#fef000';
  return '#ed405d';
};

const buildPatientRecord = (rawRecord) => {
  const record = {
    ...rawRecord,
    id: rawRecord.id,
    reportData: rawRecord.latestReport?.reportData || rawRecord.reportData || {}
  };
  const reportData = record.reportData || {};
  const name = getReportValue(reportData, ['姓名', 'ID'], ['profile', 'sleepProfile', 'inbodyProfile']) || normalizeValue(record.name) || '未命名档案';
  const gender = getReportValue(reportData, '性别') || normalizeValue(record.gender);
  const age = getReportValue(reportData, '年龄') || normalizeValue(record.age);
  const date = getReportValue(reportData, ['测试日期', '报告时间', '开始时间', '结束时间']) || normalizeValue(record.date);
  const inbodyScore = parseScore(getReportValue(reportData, 'InBody评分', ['inbodyProfile']));
  const sourceTypes = Array.isArray(reportData.sourceTypes)
    ? reportData.sourceTypes
    : [reportData.type].filter(Boolean);

  const basicInfo = buildBasicInfo(reportData);
  const highlightMetrics = buildHighlightMetrics(reportData);
  const sections = buildSections(reportData);
  const profileSummary = buildProfileSummary({ name, gender, age, date }, basicInfo);
  const draftPatient = { ...record, name, gender, age, date, highlightMetrics, sections };
  const compositeAssessment = buildCompositeAssessment({ patient: draftPatient, sections, highlightMetrics, inbodyScore });
  const score = compositeAssessment.score;
  const metricSummary = buildMetricSummary(score, highlightMetrics, inbodyScore);
  const biochemicalAssessment = getBiochemicalAssessment(draftPatient);

  return {
    ...record,
    name,
    gender,
    age,
    date,
    score,
    sourceLabels: [...new Set(sourceTypes.map(type => sourceTypeLabelMap[type] || type))],
    basicInfo,
    highlightMetrics,
    sections,
    profileSummary,

    compositeAssessment,
    biochemicalAssessment,
    inbodyScore,
    metricSummary,
    reportGroups: buildReportGroups(sections, metricSummary, profileSummary)
  };
};

export { buildPatientRecord, hasMeaningfulValue, normalizeValue, getReportIconPaths };
