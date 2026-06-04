<template>
  <view class="report-wrapper" :class="{ 'mobile-wrapper': !isAdmin }">
    <view class="bg-canvas" v-if="isAdmin"></view>

    <div class="head" :class="{ 'mobile-head': !isAdmin }">
      <div class="head-left">
        <div class="back-btn" @click="goToDashboard" v-if="isAdmin">
          <img src="/static/images/icon6.png" style="filter: brightness(0) invert(1); width: 18px; transform: rotate(90deg);" />
        </div>
        <div class="back-btn" @click="goToMobileHome" v-else>
          <img src="/static/images/icon6.png" style="filter: brightness(0) invert(1); width: 18px; transform: rotate(90deg);" />
        </div>
        <h1><a href="javascript:void(0)">{{ isAdmin ? '内部管理系统 - 智能报告生成' : '我的健康报告' }}</a></h1>
      </div>
      <div class="nav-links" v-if="isAdmin">
        <div class="nav-btn" @click="goToDashboard">大屏看板</div>
        <div class="nav-btn" @click="goToUpload">数据采集</div>
        <div class="nav-btn active">智能报告</div>
      </div>
      <div class="user-info" @click="handleLogout" style="cursor: pointer;">
        <img src="/static/images/icon2.png" style="filter: brightness(0) invert(1); width: 24px;" />
        <span>退出登录</span>
      </div>
    </div>

    <div class="main-content" :class="{ 'user-view': !isAdmin }">
      <div class="left-panel boxall" v-if="isAdmin">
        <div class="panel-title" style="display: flex; justify-content: space-between; align-items: center;">
          <span>待生成报告档案列表</span>
          <div style="display: flex; gap: 8px;">
            <button class="add-btn" @click="showAdminModal = true">添加管理员</button>
          </div>
        </div>

        <div class="search-box">
          <input type="text" v-model="searchQuery" placeholder="搜索姓名或编号..." />
          <div class="filter-tabs">
            <span
              v-for="tab in tabs"
              :key="tab.value"
              :class="{ active: activeTab === tab.value }"
              @click="activeTab = tab.value"
            >
              {{ tab.label }}
            </span>
          </div>
        </div>

        <div class="patient-list">
          <div
            class="patient-card"
            v-for="(patient, index) in filteredPatients"
            :key="patient.id"
            :class="{ active: activePatient && activePatient.id === patient.id }"
            @click="selectPatient(patient)"
          >
            <div class="avatar">
              <img :src="'/static/images/icon' + (index % 5 + 2) + '.png'" alt="avatar" style="filter: brightness(0) invert(1);" />
            </div>
            <div class="info">
              <div class="name-row">
                <span class="name">{{ patient.name }}</span>
                <span class="badge" :class="patient.status">{{ patient.statusText }}</span>
              </div>
              <div class="desc-row">
                <span>{{ getPatientMeta(patient) }}</span>
              </div>
            </div>
            <div class="card-actions">
              <button class="delete-btn" @click.stop="deletePatient(patient)">删除</button>
            </div>
          </div>
        </div>
      </div>

      <div class="right-panel boxall">
        <div class="panel-title">
          <span>综合效果评估报告预览</span>
          <div class="action-btns" v-if="activePatient">
            <button class="export-btn" :disabled="exportLoading" @click="exportReport">{{ exportLoading ? '导出中...' : '一键导出 PDF' }}</button>
          </div>
        </div>

        <div class="empty-state" v-if="!activePatient">
          <div class="empty-content">
            <img src="/static/images/icon6.png" style="width: 80px; opacity: 0.1; filter: brightness(0) invert(1);" />
            <p>{{ isAdmin ? '请在左侧选择需要生成报告的客户档案' : '暂无健康报告数据' }}</p>
          </div>
        </div>

        <div class="report-content anim-slide-up" v-else :key="activePatient.id">
          <div ref="reportPaperRef" class="report-paper">
            <div class="paper-watermark">HEALTH REPORT</div>
            <div class="reference-header" v-if="reportViewModel">
              <div class="reference-title-box">
                <div class="reference-title-icon" aria-hidden="true">
                  <svg class="report-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path v-for="(path, index) in getReportIconPaths('report')" :key="`brand-${index}`" :d="path" />
                  </svg>
                </div>
                <div class="reference-title-text">
                  <h2>健康报告</h2>
                  <p>科学评估 · 健康管理 · 美好生活</p>
                </div>
              </div>
              <div class="reference-patient-panel">
                <div class="reference-patient-grid">
                  <div class="reference-patient-item" v-for="item in reportViewModel.patientFields" :key="item.label">
                    <span>{{ item.label }}</span>
                    <strong>{{ item.value }}</strong>
                  </div>
                </div>
                <div class="reference-badge-panel" v-if="!reportViewModel.isEyeOnly">
                  <div class="seal-icon-wrap">
                    <svg class="seal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path v-for="(path, index) in getReportIconPaths('score')" :key="`score-${index}`" :d="path" />
                    </svg>
                  </div>
                  <div v-if="activePatient.score !== null" class="reference-score" :style="{ color: getScoreColor(activePatient.score) }">{{ activePatient.score }}</div>
                  <div class="reference-score-label">{{ activePatient.score !== null ? '综合评分' : '真实档案' }}</div>
                  <div class="reference-score-note" v-if="activePatient.compositeAssessment?.note">{{ activePatient.compositeAssessment.note }}</div>
                  <div class="reference-score-sub" v-if="activePatient.inbodyScore !== null">参考 InBody: {{ activePatient.inbodyScore }}</div>
                </div>
              </div>
            </div>

            <div class="reference-report" v-if="reportViewModel && reportViewModel.hasContent">
              <div class="reference-row" v-if="reportViewModel.sleepPairs.length || reportViewModel.sleepInsights.length">
                <div class="reference-section reference-section-main" v-if="reportViewModel.sleepPairs.length">
                  <div class="reference-section-title tone-blue">1 睡眠分析</div>
                  <div class="reference-section-body">
                    <table class="reference-pairs-table">
                      <tbody>
                        <tr v-for="(row, index) in reportViewModel.sleepPairs" :key="`sleep-${index}`">
                          <th>{{ row.left.label }}</th>
                          <td>{{ row.left.value }}</td>
                          <th>{{ row.right ? row.right.label : '--' }}</th>
                          <td>{{ row.right ? row.right.value : '--' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div class="reference-section reference-section-side" v-if="reportViewModel.sleepInsights.length">
                  <div class="reference-section-title tone-yellow">1.2 睡眠分析解读</div>
                  <div class="reference-section-body">
                    <div class="insight-list">
                      <div class="insight-item" v-for="(item, index) in reportViewModel.sleepInsights" :key="`sleep-insight-${index}`">
                        <div class="insight-icon" :class="`tone-${item.tone}`" aria-hidden="true">
                          <svg class="report-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path v-for="(path, iconIndex) in getReportIconPaths(item.iconKey)" :key="`sleep-insight-icon-${index}-${iconIndex}`" :d="path" />
                          </svg>
                        </div>
                        <div class="insight-content">
                          <h5>{{ item.title }}</h5>
                          <p>{{ item.text }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="reference-row reference-row-single reference-row-stress-table" v-if="reportViewModel.stressTable.rows.length">
                <div class="reference-section reference-section-full">
                  <div class="reference-section-title tone-blue">2 自律神经检测结果</div>
                  <div class="reference-section-body">
                    <table class="reference-data-table">
                      <thead>
                        <tr>
                          <th v-for="column in reportViewModel.stressTable.columns" :key="`stress-col-${column.key}`">{{ column.label }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, rowIndex) in reportViewModel.stressTable.rows" :key="`stress-row-${rowIndex}`">
                          <td v-for="column in reportViewModel.stressTable.columns" :key="`stress-${rowIndex}-${column.key}`">{{ row[column.key] || '--' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div class="reference-row reference-row-single reference-row-page-break reference-row-stress-overview-page" data-print-page-break-before="true" v-if="reportViewModel.stressStats.length || reportViewModel.stressOverview.hasAge || reportViewModel.stressOverview.hasOverview">
                <div class="reference-section reference-section-full">
                  <div class="reference-section-title tone-green">自律神经年龄与总体评估</div>
                  <div class="reference-section-body">
                    <div class="stress-overview-box" v-if="reportViewModel.stressOverview.hasOverview">
                      <div class="stress-overview-charts">
                        <div class="autonomic-age-panel stress-chart-card" v-if="reportViewModel.stressOverview.hasAge || reportViewModel.stressOverview.hasBalance">
                          <div class="autonomic-age-chart">
                            <svg class="autonomic-pie-svg" viewBox="0 0 280 220" aria-hidden="true">
                              <defs>
                                <pattern :id="reportViewModel.stressOverview.symPatternId" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                                  <rect width="8" height="8" fill="#ff2f2f" />
                                  <line x1="0" y1="0" x2="0" y2="8" stroke="#ffd5d5" stroke-width="2" />
                                </pattern>
                                <pattern :id="reportViewModel.stressOverview.vagPatternId" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                                  <rect width="8" height="8" fill="#1f43ff" />
                                  <line x1="0" y1="0" x2="0" y2="8" stroke="#9fb3ff" stroke-width="2" />
                                </pattern>
                              </defs>
                              <g class="autonomic-pie-scale">
                                <g v-html="reportViewModel.stressOverview.ageTicksHtml"></g>
                                <circle cx="132" cy="98" r="70" :fill="`url(#${reportViewModel.stressOverview.vagPatternId})`" />
                                <path v-if="reportViewModel.stressOverview.sympatheticArcPath" :d="reportViewModel.stressOverview.sympatheticArcPath" :fill="`url(#${reportViewModel.stressOverview.symPatternId})`" />
                                <circle cx="132" cy="98" r="70" fill="none" stroke="#dbe6fb" stroke-width="1.5" />
                              </g>
                            </svg>
                            <div class="autonomic-legend">
                              <span class="autonomic-legend-item tone-red">
                                <i></i>
                                交感 {{ reportViewModel.stressOverview.sympatheticValue }}
                              </span>
                              <span class="autonomic-legend-item tone-blue">
                                <i></i>
                                副交感 {{ reportViewModel.stressOverview.parasympatheticValue }}
                              </span>
                            </div>
                          </div>
                          <div class="autonomic-age-summary">
                            <div class="autonomic-age-kicker">自律神经年龄</div>
                            <div class="autonomic-age-value">{{ reportViewModel.stressOverview.ageDisplay }}</div>
                            <div class="autonomic-age-caption">{{ reportViewModel.stressOverview.ageCaption }}</div>
                            <div class="autonomic-age-note" v-if="reportViewModel.stressOverview.ageNote">{{ reportViewModel.stressOverview.ageNote }}</div>
                          </div>
                        </div>

                        <div class="stress-type-wheel-card stress-chart-card" v-if="reportViewModel.stressOverview.typeWheel" v-html="reportViewModel.stressOverview.typeWheel.svgHtml">
                        </div>
                        <div class="stress-energy-chart-card stress-chart-card" v-if="reportViewModel.stressOverview.energyChart.metrics.length">
                          <div v-html="reportViewModel.stressOverview.energyChart.svgHtml" style="width: 100%; display: flex; justify-content: center;"></div>
                          <div class="stress-energy-footnote">50-100分 正常范围（偏圆形较佳）</div>
                        </div>
                      </div>

                      <div class="stress-overview-notes" v-if="reportViewModel.stressOverview.notes.length">
                        <div class="stress-overview-note" v-for="(item, index) in reportViewModel.stressOverview.notes" :key="`stress-note-${index}`">
                          <div class="stress-overview-note-label">{{ item.label }}</div>
                          <div class="stress-overview-note-value">{{ item.value }}</div>
                          <div class="stress-overview-note-text">{{ item.note }}</div>
                        </div>
                      </div>
                    </div>

                    <div class="reference-stat-grid" v-if="reportViewModel.stressStats.length">
                      <div class="reference-stat-card" v-for="(item, index) in reportViewModel.stressStats" :key="`stress-stat-${index}`">
                        <div class="reference-stat-top">
                          <div class="reference-stat-icon" aria-hidden="true">
                            <svg class="report-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                              <path v-for="(path, iconIndex) in getReportIconPaths(item.iconKey)" :key="`stress-stat-icon-${index}-${iconIndex}`" :d="path" />
                            </svg>
                          </div>
                          <span>{{ item.label }}</span>
                        </div>
                        <div class="reference-stat-value">{{ item.value }}</div>
                        <div class="reference-stat-note" v-if="item.note">{{ item.note }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="reference-row" v-if="reportViewModel.bodyPairs.length || reportViewModel.bodyBars.length || reportViewModel.obesityCards.length || reportViewModel.exerciseAdvicePreview.length">
                <div class="reference-section reference-section-main" v-if="reportViewModel.bodyPairs.length || reportViewModel.bodyBars.length">
                  <div class="reference-section-title tone-blue">3 人体成分分析</div>
                  <div class="reference-section-body">
                    <table class="reference-pairs-table" v-if="reportViewModel.bodyPairs.length">
                      <tbody>
                        <tr v-for="(row, index) in reportViewModel.bodyPairs" :key="`body-${index}`">
                          <th>{{ row.left.label }}</th>
                          <td>{{ row.left.value }}</td>
                          <th>{{ row.right ? row.right.label : '--' }}</th>
                          <td>{{ row.right ? row.right.value : '--' }}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div class="metric-bar-list" v-if="reportViewModel.bodyBars.length">
                      <div class="metric-bar-item" v-for="(item, index) in reportViewModel.bodyBars" :key="`body-bar-${index}`">
                        <div class="metric-bar-head">
                          <span>{{ item.label }}</span>
                          <strong>{{ item.value }}</strong>
                        </div>
                        <div class="metric-bar-track">
                          <span :style="{ width: `${item.percent}%` }"></span>
                        </div>
                        <div class="metric-bar-note">{{ item.note }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="reference-section reference-section-side" v-if="reportViewModel.obesityCards.length || reportViewModel.exerciseAdvicePreview.length">
                  <div class="reference-section-title tone-blue">4 肥胖分析</div>
                  <div class="reference-section-body">
                    <div class="obesity-list" v-if="reportViewModel.obesityCards.length">
                      <div class="obesity-item" v-for="(item, index) in reportViewModel.obesityCards" :key="`obesity-${index}`">
                        <div class="obesity-head">
                          <span>{{ item.label }}</span>
                          <strong>{{ item.value }}</strong>
                        </div>
                        <div class="metric-bar-track obesity-track">
                          <span :style="{ width: `${item.percent}%` }"></span>
                        </div>
                        <div class="obesity-note">{{ item.note }}</div>
                      </div>
                    </div>
                    <div class="exercise-advice-box" v-if="reportViewModel.exerciseAdvicePreview.length">
                      <div class="exercise-advice-title">AI运动建议</div>
                      <div class="exercise-advice-list">
                        <div class="exercise-advice-item" v-for="(item, index) in reportViewModel.exerciseAdvicePreview" :key="`exercise-advice-${index}`">
                          <div class="exercise-advice-icon" aria-hidden="true">
                            <svg class="report-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                              <path v-for="(path, iconIndex) in getReportIconPaths(item.iconKey)" :key="`exercise-icon-${index}-${iconIndex}`" :d="path" />
                            </svg>
                          </div>
                          <div class="exercise-advice-content">
                            <h5>{{ item.title }}</h5>
                            <p>{{ item.text }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="reference-row" v-if="reportViewModel.manualMetricsPairs.length || reportViewModel.crossAnalysis.length || reportViewModel.weeklyFitnessPlan.length">
                <div class="reference-section reference-section-main" v-if="reportViewModel.manualMetricsPairs.length || reportViewModel.crossAnalysis.length">
                  <div class="reference-section-title tone-red">生化指标</div>
                  <div class="reference-section-body">
                    <table class="reference-pairs-table" v-if="reportViewModel.manualMetricsPairs.length">
                      <tbody>
                        <tr v-for="(row, index) in reportViewModel.manualMetricsPairs" :key="`manual-${index}`">
                          <th>{{ row.left.label }}</th>
                          <td>{{ row.left.value }}</td>
                          <th>{{ row.right ? row.right.label : '--' }}</th>
                          <td>{{ row.right ? row.right.value : '--' }}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div class="insight-list" v-if="reportViewModel.crossAnalysis.length" style="margin-top: 18px;">
                      <div class="insight-item" v-for="(item, index) in reportViewModel.crossAnalysis" :key="`cross-analysis-${index}`">
                        <div class="insight-icon" :class="`tone-${item.tone}`" aria-hidden="true">
                          <svg class="report-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path v-for="(path, iconIndex) in getReportIconPaths(item.iconKey)" :key="`cross-analysis-icon-${index}-${iconIndex}`" :d="path" />
                          </svg>
                        </div>
                        <div class="insight-content">
                          <h5>{{ item.title }}</h5>
                          <p>{{ item.text }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="reference-section reference-section-side" v-if="reportViewModel.weeklyFitnessPlan.length">
                  <div class="reference-section-title tone-purple">一周健身计划表</div>
                  <div class="reference-section-body">
                    <div class="fitness-plan-list">
                      <div class="fitness-plan-item" v-for="(plan, index) in reportViewModel.weeklyFitnessPlan" :key="`fitness-plan-${index}`">
                        <div class="fitness-plan-day">{{ plan.day }}</div>
                        <div class="fitness-plan-content">
                          <div class="fitness-plan-header">
                            <span class="fitness-plan-type">{{ plan.type }}</span>
                            <span class="fitness-plan-goal">{{ plan.goal }}</span>
                          </div>
                          <div class="fitness-plan-desc">{{ plan.desc }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="reference-row" v-if="reportViewModel.eye.hasContent">
                <div class="reference-section reference-section-main" v-if="reportViewModel.eye.pageOverview || reportViewModel.eye.findings.rows.length">
                  <div class="reference-section-title tone-teal">{{ reportViewModel.isEyeOnly ? '1 眼象检测' : '5 眼象检测' }}</div>
                  <div class="reference-section-body">
                    <div class="eye-visual-grid" v-if="reportViewModel.eye.pageOverview">
                      <div class="eye-visual-card">
                        <div class="eye-visual-title">第一页关键信息</div>
                        <img class="eye-visual-image" :src="reportViewModel.eye.pageOverview" alt="第一页关键信息" />
                      </div>
                    </div>

                    <table class="reference-data-table" v-if="reportViewModel.eye.findings.rows.length">
                      <thead>
                        <tr>
                          <th v-for="column in reportViewModel.eye.findings.columns" :key="`eye-col-${column.key}`">{{ column.label }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, rowIndex) in reportViewModel.eye.findings.rows" :key="`eye-row-${rowIndex}`">
                          <td v-for="column in reportViewModel.eye.findings.columns" :key="`eye-${rowIndex}-${column.key}`">{{ row[column.key] || '--' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div class="reference-section reference-section-side" v-if="reportViewModel.eye.textSections.length">
                  <div class="reference-section-title tone-cyan">{{ reportViewModel.isEyeOnly ? '1.2 眼象解读' : '5.2 眼象解读' }}</div>
                  <div class="reference-section-body">
                    <div class="eye-text-section-list">
                      <div class="eye-text-section-card" v-for="(item, index) in reportViewModel.eye.textSections" :key="`eye-text-${index}`">
                        <h5>{{ item.title }}</h5>
                        <div class="eye-text-paragraphs">
                          <p
                            v-for="(paragraph, paragraphIndex) in item.paragraphs"
                            :key="`eye-text-${index}-${paragraphIndex}`"
                            :class="[
                              { 'eye-text-bullet': paragraph.isBullet },
                              paragraph.isBullet ? `eye-text-bullet-${paragraph.tone}` : ''
                            ]"
                          >
                            {{ paragraph.text }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="reference-row reference-row-bottom" v-if="reportViewModel.guidanceSummary || reportViewModel.healthAdvice.length || reportViewModel.dietSummary || reportViewModel.dietAdvice.length || reportViewModel.dietTags.length">
                <div class="reference-section reference-section-half" v-if="reportViewModel.guidanceSummary || reportViewModel.healthAdvice.length">
                  <div class="reference-section-title tone-green">健康建议</div>
                  <div class="reference-section-body">
                    <div class="guidance-status" v-if="reportViewModel.aiGuidanceLoading">AI 正在结合当前档案生成更完整的个性化建议...</div>
                    <div class="guidance-status guidance-status-warning" v-else-if="reportViewModel.aiGuidanceError">AI 建议生成失败，当前展示本地分析建议</div>
                    <div class="guidance-summary" v-if="reportViewModel.guidanceSummary">{{ reportViewModel.guidanceSummary }}</div>
                    <div class="recommend-list" v-if="reportViewModel.healthAdvice.length">
                      <div class="recommend-item" v-for="(item, index) in reportViewModel.healthAdvice" :key="`health-advice-${index}`">
                        <div class="recommend-icon tone-green" aria-hidden="true">
                          <svg class="report-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path v-for="(path, iconIndex) in getReportIconPaths(item.iconKey)" :key="`health-icon-${index}-${iconIndex}`" :d="path" />
                          </svg>
                        </div>
                        <div class="recommend-content">
                          <h5>{{ item.title }}</h5>
                          <p>{{ item.text }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="reference-section reference-section-half" v-if="reportViewModel.dietSummary || reportViewModel.dietAdvice.length || reportViewModel.dietTags.length">
                  <div class="reference-section-title tone-orange">饮食指南</div>
                  <div class="reference-section-body">
                    <div class="guidance-status" v-if="reportViewModel.aiGuidanceLoading">AI 正在生成更贴合当前档案的饮食策略...</div>
                    <div class="guidance-status guidance-status-warning" v-else-if="reportViewModel.aiGuidanceError">AI 饮食建议生成失败，当前展示本地分析建议</div>
                    <div class="guidance-summary guidance-summary-diet" v-if="reportViewModel.dietSummary">{{ reportViewModel.dietSummary }}</div>
                    <div class="recommend-list" v-if="reportViewModel.dietAdvice.length">
                      <div class="recommend-item" v-for="(item, index) in reportViewModel.dietAdvice" :key="`diet-advice-${index}`">
                        <div class="recommend-icon tone-orange" aria-hidden="true">
                          <svg class="report-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path v-for="(path, iconIndex) in getReportIconPaths(item.iconKey)" :key="`diet-icon-${index}-${iconIndex}`" :d="path" />
                          </svg>
                        </div>
                        <div class="recommend-content">
                          <h5>{{ item.title }}</h5>
                          <p>{{ item.text }}</p>
                        </div>
                      </div>
                    </div>
                    <div class="reference-tag-row" v-if="reportViewModel.dietTags.length">
                      <span class="reference-tag" v-for="tag in reportViewModel.dietTags" :key="tag">{{ tag }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="empty-report" v-else>
              当前档案暂无可展示的有效用户资料，请先在数据采集页完善真实数据后再生成最终报告。
            </div>

            <div class="paper-footer">
              <div class="paper-footer-note">
                报告内容严格基于用户档案中的已采集资料生成，未采集到的项目不补默认值。
              </div>
              <div class="paper-source-tags" v-if="activePatient.sourceLabels.length">
                <span class="paper-source-tag" v-for="source in activePatient.sourceLabels" :key="source">{{ source }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Management Modal -->
    <div class="custom-modal" v-if="showAdminModal">
      <div class="modal-mask" @click="showAdminModal = false"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>添加管理员</h3>
          <button class="close-btn" @click="showAdminModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="admin-list">
            <div class="admin-item" v-for="(admin, index) in adminList" :key="index">
              <span>{{ admin.username }}</span>
              <button v-if="admin.username !== 'admin'" class="delete-btn" @click="deleteAdmin(index)">移除</button>
            </div>
          </div>
          <div class="add-admin-form">
            <h4>新增管理员账号</h4>
            <input type="text" v-model="newAdminUsername" placeholder="账号" />
            <input type="password" v-model="newAdminPassword" placeholder="密码" />
            <button class="primary-btn" @click="addAdmin">添加</button>
          </div>
        </div>
      </div>
    </div>

  </view>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { generateHealthGuidance } from '@/utils/aiService';
import { deletePatientRecord, listPatients as fetchPatients, getPatientDetail } from '@/utils/patientApi';

const isAdmin = ref(false);

const goToDashboard = () => {
  uni.showToast({ title: '看板已在独立窗口运行', icon: 'none' });
};

const goToMobileHome = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 });
  } else {
    uni.switchTab({ url: '/pages/mobile/profile/index' });
  }
};

const goToUpload = () => {
  uni.navigateTo({ url: '/pages/upload/index' });
};

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.removeStorageSync('current_role');
        uni.removeStorageSync('current_user');
        uni.reLaunch({ url: '/pages/mobile/login/index' });
      }
    }
  });
};

const searchQuery = ref('');
const activeTab = ref('all');
const activePatient = ref(null);
const patients = ref([]);
const aiGuidanceMap = ref({});
const aiGuidanceLoading = ref(false);
const aiGuidanceError = ref('');
const exportLoading = ref(false);
const reportPaperRef = ref(null);

// Modal states
const showAdminModal = ref(false);
const adminList = ref([]);
const newAdminUsername = ref('');
const newAdminPassword = ref('');

// Initialize admin list
const initAdminList = () => {
  let list = uni.getStorageSync('admin_accounts');
  if (!list || !Array.isArray(list) || list.length === 0) {
    list = [{ username: 'admin', password: '123' }];
    uni.setStorageSync('admin_accounts', list);
  }
  adminList.value = list;
};
initAdminList();

const addAdmin = () => {
  if (!newAdminUsername.value || !newAdminPassword.value) {
    return uni.showToast({ title: '请输入账号和密码', icon: 'none' });
  }
  if (adminList.value.find(a => a.username === newAdminUsername.value)) {
    return uni.showToast({ title: '该管理员账号已存在', icon: 'none' });
  }
  adminList.value.push({ username: newAdminUsername.value, password: newAdminPassword.value });
  uni.setStorageSync('admin_accounts', adminList.value);
  newAdminUsername.value = '';
  newAdminPassword.value = '';
  uni.showToast({ title: '添加成功', icon: 'success' });
};

const deleteAdmin = (index) => {
  adminList.value.splice(index, 1);
  uni.setStorageSync('admin_accounts', adminList.value);
};

const tabs = [
  { label: '全部', value: 'all' },
  { label: '待生成', value: 'ready' },
  { label: '已完成', value: 'done' }
];

import { buildPatientRecord, hasMeaningfulValue, normalizeValue, getReportIconPaths, parseNumber, getPatientMeta, hasPatientReportContent, getMetricIconKey, weightedAverage, buildProfileSummary, getScoreColor } from '@/utils/reportParser';

const loadPatients = async () => {
  const currentActiveId = activePatient.value?.id;
  const records = await fetchPatients();
  patients.value = records;

  activePatient.value =
    patients.value.find(patient => patient.id === currentActiveId) ||
    patients.value[0] ||
    null;
};

onShow(() => {
  const role = uni.getStorageSync('current_role');
  isAdmin.value = role === 'admin';
  
  if (isAdmin.value) {
    loadPatients();
  } else {
    // If it's a normal user, fetch their own data directly and set it as activePatient
    const user = uni.getStorageSync('current_user');
    if (user && user.id) {
      getPatientDetail(user.id).then(res => {
        if (res) {
          activePatient.value = res;
        }
      });
    } else {
      // Fallback for mock user: load the first available patient to show a demo report
      fetchPatients().then(list => {
        if (list && list.length > 0) {
          const firstId = list[0].id;
          getPatientDetail(firstId).then(res => {
            if (res) {
              activePatient.value = res;
            }
          });
        } else {
          uni.showToast({ title: '未找到您的健康档案数据', icon: 'none' });
        }
      }).catch(() => {
        uni.showToast({ title: '未找到您的健康档案数据', icon: 'none' });
      });
    }
  }
});

const filteredPatients = computed(() => {
  const searchText = String(searchQuery.value || '').trim();
  return patients.value.filter(patient => {
    const matchSearch =
      !searchText ||
      patient.name.includes(searchText) ||
      patient.id.includes(searchText);
    const matchTab = activeTab.value === 'all' || patient.status === activeTab.value;
    return matchSearch && matchTab;
  });
});

const joinItemValue = (item) => {
  if (!item || !hasMeaningfulValue(item.value)) return '--';
  return `${item.value}${item.unit ? ` ${item.unit}` : ''}`;
};

const toPairRows = (items) => {
  const normalized = items.filter(item => hasMeaningfulValue(item?.value));
  const rows = [];
  for (let index = 0; index < normalized.length; index += 2) {
    rows.push({
      left: normalized[index],
      right: normalized[index + 1] || null
    });
  }
  return rows;
};

const getPatientSection = (patient, key) => {
  return patient?.sections?.find(section => section.key === key) || null;
};

const pickMeaningfulItems = (items = [], labelKey = 'label') => {
  return (Array.isArray(items) ? items : [])
    .filter(Boolean)
    .map(item => {
      const label = normalizeValue(item?.[labelKey]);
      const value = normalizeValue(item?.value);
      const unit = normalizeValue(item?.unit);
      const status = normalizeValue(item?.status || item?.result || item?.standard);
      return {
        label,
        value: value ? `${value}${unit ? ` ${unit}` : ''}`.trim() : '',
        status
      };
    })
    .filter(item => item.label && item.value);
};

const pickMeaningfulRows = (rows = []) => {
  return (Array.isArray(rows) ? rows : [])
    .filter(Boolean)
    .map(row => {
      const label = normalizeValue(row.metric || row.item || row.category);
      const value = normalizeValue(row.value);
      const unit = normalizeValue(row.unit);
      const status = normalizeValue(row.status || row.result || row.standard);
      return {
        label,
        value: value ? `${value}${unit ? ` ${unit}` : ''}`.trim() : '',
        status
      };
    })
    .filter(item => item.label && item.value);
};

const buildGuidancePayload = (patient) => {
  const sleepSummary = normalizeValue(getPatientSection(patient, 'sleep-summary')?.text);
  const stressTable = getPatientSection(patient, 'stress-table')?.rows || [];

  return {
    patient: {
      id: patient?.id || '',
      name: patient?.name || '',
      score: patient?.score || '',
      inbodyScore: patient?.inbodyScore || '',
      sourceLabels: patient?.sourceLabels || [],
      basicInfo: patient?.basicInfo || []
    },
    compositeAssessment: patient?.compositeAssessment || {},
    highlightMetrics: (patient?.highlightMetrics || []).filter(Boolean).map(item => ({
      label: item.label || '',
      value: item.value || '',
      unit: item.unit || '',
      status: item.status || '',
      isWarning: !!item.isWarning
    })),
    sleep: {
      profile: pickMeaningfulItems(getPatientSection(patient, 'sleep-profile')?.items),
      monitorInfo: pickMeaningfulItems(getPatientSection(patient, 'sleep-monitor-info')?.items),
      monitorParams: pickMeaningfulItems(getPatientSection(patient, 'sleep-monitor-params')?.items),
      metrics: pickMeaningfulRows(getPatientSection(patient, 'sleep-metrics')?.rows),
      summary: sleepSummary
    },
    stress: {
      profile: pickMeaningfulItems(getPatientSection(patient, 'stress-profile')?.items),
      metrics: pickMeaningfulItems(getPatientSection(patient, 'stress-metrics')?.items),
      table: pickMeaningfulRows(stressTable)
    },
    bodyComposition: {
      profile: pickMeaningfulItems(getPatientSection(patient, 'inbody-profile')?.items),
      metrics: pickMeaningfulItems(getPatientSection(patient, 'inbody-metrics')?.items),
      table: pickMeaningfulRows(getPatientSection(patient, 'inbody-table')?.rows),
      muscleFat: pickMeaningfulRows(getPatientSection(patient, 'muscle-fat')?.rows),
      obesity: pickMeaningfulRows(getPatientSection(patient, 'obesity-analysis')?.rows)
    },
    manualMetrics: pickMeaningfulItems(getPatientSection(patient, 'manual-metrics')?.items),
    biochemicalAssessment: patient?.biochemicalAssessment || {}
  };
};

const buildSleepPairs = (patient) => {
  const sectionKeys = ['sleep-profile', 'sleep-monitor-info', 'sleep-monitor-params'];
  const items = sectionKeys
    .flatMap(key => getPatientSection(patient, key)?.items || [])
    .filter(Boolean)
    .map(item => ({
      label: item.label,
      value: joinItemValue(item)
    }));

  const metricRows = (getPatientSection(patient, 'sleep-metrics')?.rows || [])
    .filter(Boolean)
    .map(row => ({
      label: row.metric || row.item || row.category,
      value: `${row.value || '--'}${row.unit ? ` ${row.unit}` : ''}`.trim()
    }));

  return toPairRows([...items, ...metricRows].filter(item => hasMeaningfulValue(item.label) && hasMeaningfulValue(item.value)).slice(0, 14));
};

const buildSleepInsights = (patient) => {
  const sleepSummary = getPatientSection(patient, 'sleep-summary')?.text || '';
  const summaryItems = String(sleepSummary)
    .split(/[。；\n]/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((text, index) => ({
      title: `睡眠解读 ${index + 1}`,
      text,
      iconKey: 'sleep',
      tone: ['green', 'blue', 'purple'][index % 3]
    }));

  const metricItems = (getPatientSection(patient, 'sleep-metrics')?.rows || [])
    .filter(row => row && hasMeaningfulValue(row.metric) && hasMeaningfulValue(row.value))
    .slice(0, Math.max(0, 5 - summaryItems.length))
    .map((row, index) => ({
      title: row.metric,
      text: `${row.metric}为 ${row.value}${row.unit ? ` ${row.unit}` : ''}`.trim(),
      iconKey: 'metric-sleep',
      tone: ['blue', 'orange', 'green', 'purple'][index % 4]
    }));

  return [...summaryItems, ...metricItems].slice(0, 5);
};

const buildStressStats = (patient) => {
  const metricItems = (getPatientSection(patient, 'stress-metrics')?.items || [])
    .filter(item => item && hasMeaningfulValue(item.label) && hasMeaningfulValue(item.value))
    .map(item => ({
      label: item.label,
      value: joinItemValue(item),
      note: item.status || '',
      iconKey: getMetricIconKey(item.label)
    }));

  if (metricItems.length) {
    return metricItems.slice(0, 4);
  }

  return (getPatientSection(patient, 'stress-table')?.rows || [])
    .filter(row => row && hasMeaningfulValue(row.item) && hasMeaningfulValue(row.value))
    .slice(0, 4)
    .map(row => ({
      label: row.item,
      value: row.value,
      note: row.result || row.standard || '',
      iconKey: getMetricIconKey(row.item)
    }));
};

const getStressSignals = (patient) => {
  const metricSignals = (getPatientSection(patient, 'stress-metrics')?.items || [])
    .filter(item => item && hasMeaningfulValue(item.label) && hasMeaningfulValue(item.value))
    .map(item => ({
      label: String(item.label || ''),
      value: joinItemValue(item),
      note: item.status || ''
    }));

  const tableSignals = (getPatientSection(patient, 'stress-table')?.rows || [])
    .filter(row => row && hasMeaningfulValue(row.item || row.metric) && hasMeaningfulValue(row.value))
    .map(row => ({
      label: String(row.item || row.metric || ''),
      value: `${row.value || '--'}${row.unit ? ` ${row.unit}` : ''}`.trim(),
      note: row.result || row.standard || ''
    }));

  return [...metricSignals, ...tableSignals];
};

const getPatientSourceTypes = (patient) => {
  const sourceTypes = Array.isArray(patient?.reportData?.sourceTypes)
    ? patient.reportData.sourceTypes
    : [];
  if (sourceTypes.length) return sourceTypes.filter(Boolean);
  return Array.isArray(patient?.sourceLabels) ? patient.sourceLabels.filter(Boolean) : [];
};

const isEyeOnlyPatient = (patient) => {
  const sourceTypes = getPatientSourceTypes(patient);
  return sourceTypes.length === 1 && (sourceTypes[0] === 'eye' || sourceTypes[0] === '眼象报告');
};

const hasStressSourceData = (patient) => getStressSignals(patient).length > 0;

const hasBodySourceData = (patient) => {
  const bodyRows = getPatientSection(patient, 'muscle-fat')?.rows || [];
  const obesityRows = getPatientSection(patient, 'obesity-analysis')?.rows || [];
  const inbodyItems = getPatientSection(patient, 'inbody-metrics')?.items || [];
  return !!(
    bodyRows.some(item => item && hasMeaningfulValue(item.metric) && hasMeaningfulValue(item.value)) ||
    obesityRows.some(item => item && hasMeaningfulValue(item.metric) && hasMeaningfulValue(item.value)) ||
    inbodyItems.some(item => item && hasMeaningfulValue(item.label) && hasMeaningfulValue(item.value))
  );
};

const hasBiochemicalSourceData = (patient) => {
  const manualItems = getPatientSection(patient, 'manual-metrics')?.items || [];
  return manualItems.some(item => item && hasMeaningfulValue(item.label) && hasMeaningfulValue(item.value));
};

const hasAdviceSourceData = (patient) => {
  const warningMetrics = Array.isArray(patient?.highlightMetrics) ? patient.highlightMetrics.filter(item => item?.isWarning) : [];
  const sleepSummary = normalizeValue(getPatientSection(patient, 'sleep-summary')?.text);
  return !!(
    sleepSummary ||
    warningMetrics.length ||
    hasBodySourceData(patient) ||
    hasBiochemicalSourceData(patient) ||
    hasStressSourceData(patient)
  );
};

const findStressSignal = (signals, keywords) => {
  const list = Array.isArray(keywords) ? keywords : [keywords];
  return signals.find(item => list.some(keyword => String(item.label || '').includes(keyword))) || null;
};

const formatAgeDisplay = (value) => {
  const normalized = normalizeValue(value);
  if (!normalized) return '--';
  if (/[岁上下以]/.test(normalized)) return normalized;
  const numeric = parseNumber(normalized);
  return numeric === null ? normalized : `${numeric}岁`;
};

const clampMetricScore = (value, fallback = 75) => {
  const numeric = value === null || value === undefined ? null : Number(value);
  if (numeric === null || Number.isNaN(numeric)) return fallback;
  return Math.max(50, Math.min(100, Math.round(numeric)));
};

const formatMetricPercent = (value) => {
  const numeric = parseNumber(value);
  return numeric === null ? '--' : `${clampMetricScore(numeric)}%`;
};

const polarToCartesian = (centerX, centerY, radius, angleDeg) => {
  const angleRad = (angleDeg - 90) * Math.PI / 180;
  return {
    x: centerX + radius * Math.cos(angleRad),
    y: centerY + radius * Math.sin(angleRad)
  };
};

const describePieSlice = (centerX, centerY, radius, startAngle, endAngle) => {
  const angleSpan = Math.max(0, Math.min(359.999, endAngle - startAngle));
  if (angleSpan <= 0.01) return '';
  if (angleSpan >= 359.9) {
    return [
      `M ${centerX} ${centerY}`,
      `m 0 ${-radius}`,
      `a ${radius} ${radius} 0 1 1 0 ${radius * 2}`,
      `a ${radius} ${radius} 0 1 1 0 ${-radius * 2}`,
      'Z'
    ].join(' ');
  }
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = angleSpan > 180 ? 1 : 0;
  return [
    `M ${centerX} ${centerY}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    'Z'
  ].join(' ');
};

const describeRingSlice = (centerX, centerY, innerRadius, outerRadius, startAngle, endAngle) => {
  let normalizedStart = startAngle;
  let normalizedEnd = endAngle;
  while (normalizedEnd <= normalizedStart) normalizedEnd += 360;
  const angleSpan = Math.max(0, Math.min(359.999, normalizedEnd - normalizedStart));
  if (angleSpan <= 0.01) return '';

  const outerStart = polarToCartesian(centerX, centerY, outerRadius, normalizedStart);
  const outerEnd = polarToCartesian(centerX, centerY, outerRadius, normalizedEnd);
  const innerEnd = polarToCartesian(centerX, centerY, innerRadius, normalizedEnd);
  const innerStart = polarToCartesian(centerX, centerY, innerRadius, normalizedStart);
  const largeArcFlag = angleSpan > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
    'Z'
  ].join(' ');
};

const rotateArrayToIndex = (items, targetIndex) => {
  if (!items.length) return [];
  const safeIndex = ((targetIndex % items.length) + items.length) % items.length;
  return items.slice(safeIndex).concat(items.slice(0, safeIndex));
};

const buildTypeWheel = (selectedLabel) => {
  const labels = [
    '兴致索然',
    '积劳成疾',
    '惴惴不安',
    '身心微恙',
    '力不从心',
    '有气无力',
    '郁郁寡欢',
    '积弱不振',
    '气若游丝',
    '欲振乏力',
    '心神不宁',
    '劳形苦心',
    '萎靡不振',
    '焦躁不安',
    '力拔山河',
    '身强体壮'
  ];
  const palette = ['#f4a87c', '#a8d1ba', '#c6badb', '#e2d3c9', '#c4d19a', '#e2c56a', '#c2c9df', '#b8d6eb', '#dbcdca', '#a9ce9d', '#d4bedb', '#bcc2d1', '#9bc6df', '#b4d758', '#f27854', '#f1604a'];
  const resolvedLabel = labels.includes(selectedLabel) ? selectedLabel : '兴致索然';
  const selectedIndex = labels.indexOf(resolvedLabel);
  const ordered = rotateArrayToIndex(labels.map((label, index) => ({
    label,
    fill: palette[index % palette.length]
  })), selectedIndex);
  const count = ordered.length;
  const sectorAngle = 360 / count;
  const centerX = 220;
  const centerY = 215;
  const innerRadius = 104;
  const baseOuterRadius = 182;
  const selectedOuterRadius = 234;

  return {
    selectedLabel: resolvedLabel,
    sectors: ordered.map((item, index) => {
      const startAngle = 90 - sectorAngle / 2 + index * sectorAngle;
      const endAngle = startAngle + sectorAngle;
      const midAngle = startAngle + sectorAngle / 2;
      const outerRadius = index === 0 ? selectedOuterRadius : baseOuterRadius;
      const textPoint = polarToCartesian(centerX, centerY, index === 0 ? 191 : 145, midAngle);

      return {
        label: item.label,
        fill: item.fill,
        strokeWidth: index === 0 ? 2.5 : 1.8,
        path: describeRingSlice(centerX, centerY, innerRadius, outerRadius, startAngle, endAngle),
        textX: textPoint.x,
        textY: textPoint.y,
        textRotate: (midAngle > 180 && midAngle < 360) ? midAngle + 90 : midAngle - 90
      };
    })
  };
};

const buildEnergyChart = (metrics) => {
  const centerX = 180;
  const centerY = 180;
  const innerRadius = 76;
  const trackOuterRadius = 165;
  const metricConfigs = [
    { key: 'emotion', label: '情绪指数', score: metrics.emotion, color: '#97d06f', startAngle: 315, endAngle: 405, labelX: 180, labelY: 32 },
    { key: 'antiStress', label: '抗压力指数', score: metrics.antiStress, color: '#63b6e4', startAngle: 45, endAngle: 135, labelX: 328, labelY: 180 },
    { key: 'vitality', label: '活力指数', score: metrics.vitality, color: '#efbe54', startAngle: 135, endAngle: 225, labelX: 180, labelY: 327 },
    { key: 'sleep', label: '睡眠指数', score: metrics.sleep, color: '#5b69da', startAngle: 225, endAngle: 315, labelX: 35, labelY: 180 }
  ];

  return {
    backgroundSectors: metricConfigs.map(item => ({
      key: item.key,
      fill: '#e0e0e0',
      path: describeRingSlice(centerX, centerY, innerRadius, trackOuterRadius, item.startAngle, item.endAngle)
    })),
    metrics: metricConfigs.map(item => {
      const outerRadius = 118 + ((clampMetricScore(item.score) - 50) / 50) * 44;
      return {
        ...item,
        score: clampMetricScore(item.score),
        path: describeRingSlice(centerX, centerY, innerRadius, outerRadius, item.startAngle + 2, item.endAngle - 2)
      };
    })
  };
};

const buildStressOverview = (patient) => {
  const signals = getStressSignals(patient);
  if (!signals.length) {
    return {
      hasAge: false,
      hasBalance: false,
      hasOverview: false,
      ageDisplay: '--',
      ageCaption: '',
      ageNote: '',
      balanceText: '',
      sympatheticValue: '--',
      parasympatheticValue: '--',
      sympatheticArcPath: '',
      ageTicksHtml: '',
      symPatternId: '',
      vagPatternId: '',
      overviewType: '',
      overviewWheelLabel: '',
      overviewDescription: '',
      energyScore: null,
      energyMetrics: [],
      typeWheel: { selectedLabel: '', sectors: [], svgHtml: '' },
      energyChart: { backgroundSectors: [], metrics: [], svgHtml: '' },
      notes: []
    };
  }
  const ageSignal = findStressSignal(signals, ['自律神经年龄', 'ANS Age']);
  const balanceSignal = findStressSignal(signals, ['偏向', 'Balance']);
  const ansSignal = findStressSignal(signals, ['总体功能', '(ANS)']);
  const symSignal = findStressSignal(signals, ['交感神经功能', '(SYM)']);
  const vagSignal = findStressSignal(signals, ['副交感神经功能', '(VAG)']);
  const sdnnSignal = findStressSignal(signals, ['SDNN', 'NN间距标准偏差']);
  const sleepSignal = findStressSignal(signals, ['睡眠指数']);
  const emotionSignal = findStressSignal(signals, ['情绪指数']);
  const vitalitySignal = findStressSignal(signals, ['活力指数']);
  const antiStressSignal = findStressSignal(signals, ['抗压力指数']);

  const actualAge = parseNumber(patient?.age);
  const autonomicAge = parseNumber(ageSignal?.value);
  const balanceValue = parseNumber(balanceSignal?.value);
  const ansValue = parseNumber(ansSignal?.value);
  const symValue = parseNumber(symSignal?.value);
  const vagValue = parseNumber(vagSignal?.value);
  const sdnnValue = parseNumber(sdnnSignal?.value);

  const sympathetic = symValue !== null ? Math.max(symValue, 0.1) : 50;
  const parasympathetic = vagValue !== null ? Math.max(vagValue, 0.1) : 50;
  const balanceTotal = sympathetic + parasympathetic;
  const sympatheticPercent = Math.round((sympathetic / balanceTotal) * 100);
  const chartIdSuffix = String(patient?.id || 'report').replace(/[^a-zA-Z0-9_-]/g, '');
  const symPatternId = `autonomic-sym-${chartIdSuffix}`;
  const vagPatternId = `autonomic-vag-${chartIdSuffix}`;
  const pieStartAngle = 230;
  const pieEndAngle = pieStartAngle + (sympatheticPercent / 100) * 360;
  const sympatheticArcPath = describePieSlice(132, 98, 70, pieStartAngle, pieEndAngle);
  const ageTicks = [20, 30, 40, 50, 60, 70, 80].map((label, index) => ({
    label: String(label),
    x: 16,
    y: 39 + index * 20
  }));

  const ageTicksHtml = ageTicks.map(tick => `<text class="autonomic-pie-tick" x="${tick.x}" y="${tick.y}"><tspan>${tick.label}</tspan></text>`).join('');

  const ageCaption = (() => {
    if (autonomicAge !== null && actualAge !== null) {
      if (autonomicAge <= actualAge - 5) return '自律神经年龄年轻化';
      if (autonomicAge >= actualAge + 5) return '自律神经年龄偏高';
      return '自律神经年龄接近同龄水平';
    }
    if (autonomicAge !== null) {
      if (autonomicAge <= 30) return '神经调节状态较年轻';
      if (autonomicAge <= 45) return '神经调节状态基本稳定';
      return '神经调节恢复需重点关注';
    }
    return '当前档案已纳入自律神经年龄分析';
  })();

  const ageNote = (() => {
    if (autonomicAge !== null && actualAge !== null) {
      const gap = autonomicAge - actualAge;
      if (gap <= -5) return `较实际年龄年轻 ${Math.abs(gap)} 岁，说明恢复能力和神经调节状态相对占优。`;
      if (gap >= 5) return `较实际年龄偏高 ${gap} 岁，通常提示压力负荷、睡眠恢复或生活节律需要同步调整。`;
      return '与实际年龄基本接近，后续重点看睡眠、压力与活动习惯能否继续维持。';
    }
    return balanceSignal?.note || ansSignal?.note || '';
  })();

  const sleepScore = clampMetricScore(
    parseNumber(sleepSignal?.value) ?? (sdnnValue !== null ? 58 + sdnnValue * 0.8 : null),
    70
  );
  const emotionScore = clampMetricScore(
    parseNumber(emotionSignal?.value) ?? (balanceValue !== null ? 96 - Math.abs(balanceValue - 1) * 18 : null),
    95
  );
  const vitalityScore = clampMetricScore(
    parseNumber(vitalitySignal?.value) ?? (ansValue !== null ? 66 + ansValue * 4 : null),
    90
  );
  const antiStressScore = clampMetricScore(
    parseNumber(antiStressSignal?.value) ?? (symValue !== null && vagValue !== null ? 82 - Math.abs(symValue - vagValue) * 4 : null),
    80
  );

  const energyMetrics = [
    { key: 'sleep', label: '睡眠指数', value: sleepScore, display: `${sleepScore}%` },
    { key: 'emotion', label: '情绪指数', value: emotionScore, display: `${emotionScore}%` },
    { key: 'vitality', label: '活力指数', value: vitalityScore, display: `${vitalityScore}%` },
    { key: 'antiStress', label: '抗压力指数', value: antiStressScore, display: `${antiStressScore}%` }
  ];

  const energyScore = clampMetricScore(weightedAverage(energyMetrics.map(item => ({ value: item.value, weight: 1 }))), 84);

  const overviewType = (() => {
    if (balanceValue !== null) {
      if (balanceValue >= 1.2) return '交感偏亢型';
      if (balanceValue <= 0.8) return '副交感偏高型';
    }
    if (sdnnValue !== null && sdnnValue < 30) return '恢复不足型';
    if (ansValue !== null && ansValue >= 8) return '调节稳健型';
    return '平衡调节型';
  })();

  const overviewWheelLabel = (() => {
    if (overviewType === '交感偏亢型') return '焦躁不安';
    if (overviewType === '副交感偏高型') return '郁郁寡欢';
    if (overviewType === '恢复不足型') return '萎靡不振';
    if (overviewType === '调节稳健型') return '力拔山河';
    if (energyScore <= 65) return '有气无力';
    if (energyScore >= 90) return '身强体壮';
    return '身心微恙';
  })();

  const overviewDescription = (() => {
    if (overviewType === '交感偏亢型') return '当前更容易受紧张、熬夜和持续工作负荷影响，身体处于相对兴奋状态，建议优先关注减压、睡眠和血压波动。';
    if (overviewType === '副交感偏高型') return '当前整体偏恢复导向，但也要警惕活动量不足或白天精力偏低，建议保持规律运动和稳定节律。';
    if (overviewType === '恢复不足型') return '当前恢复储备偏弱，常见于睡眠不足、连续疲劳或压力恢复不佳状态，运动和饮食都需要以稳态修复为先。';
    if (overviewType === '调节稳健型') return '当前自律神经整体调节基础较好，适合在保持恢复质量的前提下继续提升运动与代谢管理效果。';
    return '当前交感与副交感功能总体可读，建议结合睡眠、压力、血糖血压和日常活动习惯做持续管理。';
  })();

  const notes = [
    ageSignal ? { label: '自律神经年龄', value: formatAgeDisplay(ageSignal.value), note: ageCaption } : null,
    ansSignal ? { label: '总体功能', value: normalizeValue(ansSignal.value), note: ansSignal.note || '反映整体神经调节能力' } : null,
    sdnnSignal ? { label: 'SDNN', value: normalizeValue(sdnnSignal.value), note: sdnnSignal.note || '反映心率变异与恢复弹性' } : null,
    balanceSignal ? { label: '偏向值', value: normalizeValue(balanceSignal.value), note: balanceSignal.note || '用于判断交感与副交感偏向' } : null,
    { label: '情绪指数', value: formatMetricPercent(emotionSignal?.value), note: '用于观察情绪稳定性与心理弹性' },
    { label: '抗压力指数', value: formatMetricPercent(antiStressSignal?.value), note: '用于观察压力承受与恢复能力' }
  ].filter(Boolean).slice(0, 4);

  const typeWheel = buildTypeWheel(overviewWheelLabel);
  typeWheel.svgHtml = `
    <svg class="stress-type-wheel-svg" viewBox="0 0 580 430" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      ${typeWheel.sectors.map((sector, index) => `
        <g key="wheel-${sector.label}">
          <path d="${sector.path}" fill="${sector.fill}" stroke="#111111" stroke-width="${sector.strokeWidth}" />
          ${index !== 0 ? `
            <text
              class="stress-type-wheel-text"
              x="${sector.textX}"
              y="${sector.textY}"
              text-anchor="middle"
              dominant-baseline="middle"
              transform="rotate(${sector.textRotate}, ${sector.textX}, ${sector.textY})"
            >
              ${sector.label}
            </text>
          ` : ''}
        </g>
      `).join('')}
      <circle cx="220" cy="215" r="183" fill="none" stroke="#111111" stroke-width="4" />
      <path d="M324 187 L484 155 L484 275 L324 243 Z" fill="${typeWheel.sectors[0].fill}" stroke="#474747" stroke-width="5" stroke-linejoin="round" />
      <circle cx="220" cy="215" r="100" fill="#2d2d2f" stroke="#f8f8f8" stroke-width="8" />
      <polygon points="316,197 344,215 316,233" fill="#2d2d2f" />
      <polyline points="318,197 344,215 318,233" fill="none" stroke="#f8f8f8" stroke-width="8" stroke-linejoin="round" stroke-linecap="butt" />
      <circle cx="220" cy="215" r="88" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="2" />
      <text class="stress-type-wheel-center-text" x="220" y="190" text-anchor="middle" dominant-baseline="middle">评估</text>
      <text class="stress-type-wheel-center-text" x="220" y="240" text-anchor="middle" dominant-baseline="middle">类型</text>
      <text class="stress-type-wheel-selected-text" x="404" y="215" text-anchor="middle" dominant-baseline="middle">
        ${typeWheel.selectedLabel}
      </text>
    </svg>
  `;

  const energyChart = buildEnergyChart({
    sleep: sleepScore,
    emotion: emotionScore,
    vitality: vitalityScore,
    antiStress: antiStressScore
  });
  energyChart.svgHtml = `
    <svg class="stress-energy-chart-svg" viewBox="0 0 360 392" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      ${energyChart.backgroundSectors.map(sector => `
        <g key="energy-bg-${sector.key}">
          <path d="${sector.path}" fill="${sector.fill}" stroke="#f7f7f7" stroke-width="2" />
        </g>
      `).join('')}
      ${energyChart.metrics.map(sector => `
        <g key="energy-${sector.key}">
          <path d="${sector.path}" fill="${sector.color}" />
          <text
            class="stress-energy-chart-value"
            x="${sector.labelX}"
            y="${sector.labelY}"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            <tspan>${sector.score}</tspan>
            <tspan class="stress-energy-chart-percent" font-size="0.6em" dy="-0.2em">%</tspan>
          </text>
        </g>
      `).join('')}
      <circle cx="180" cy="180" r="74" fill="#2d2d2f" />
      <circle cx="180" cy="180" r="61" fill="none" stroke="#f8f8f8" stroke-width="4" />
      <text class="stress-energy-chart-side-text" x="180" y="85" text-anchor="middle" dominant-baseline="middle">情绪指数</text>
      <text class="stress-energy-chart-side-text" x="275" y="180" text-anchor="middle" dominant-baseline="middle" transform="rotate(90, 275, 180)">抗压力指数</text>
      <text class="stress-energy-chart-side-text" x="180" y="275" text-anchor="middle" dominant-baseline="middle">活力指数</text>
      <text class="stress-energy-chart-side-text" x="85" y="180" text-anchor="middle" dominant-baseline="middle" transform="rotate(-90, 85, 180)">睡眠指数</text>
      <text class="stress-energy-chart-center" x="180" y="164" text-anchor="middle">身心</text>
      <text class="stress-energy-chart-center" x="180" y="204" text-anchor="middle">能量</text>
    </svg>
  `;

  return {
    hasAge: !!ageSignal,
    hasBalance: !!balanceSignal || !!symSignal || !!vagSignal,
    hasOverview: !!(energyMetrics.length || notes.length || ageSignal || ansSignal || balanceSignal),
    ageDisplay: formatAgeDisplay(ageSignal?.value),
    ageCaption,
    ageNote,
    balanceText: balanceSignal?.value ? normalizeValue(balanceSignal.value) : (symValue !== null && vagValue !== null ? (symValue > vagValue ? '交感偏高' : vagValue > symValue ? '副交感偏高' : '基本平衡') : '待分析'),
    sympatheticValue: symSignal?.value ? normalizeValue(symSignal.value) : '--',
    parasympatheticValue: vagSignal?.value ? normalizeValue(vagSignal.value) : '--',
    sympatheticArcPath,
    ageTicksHtml,
    symPatternId,
    vagPatternId,
    overviewType,
    overviewWheelLabel,
    overviewDescription,
    energyScore,
    energyMetrics,
    typeWheel,
    energyChart,
    notes
  };
};

const buildStressMarkers = (stressStats) => {
  if (!stressStats.length) return [];
  const width = Number((100 / stressStats.length).toFixed(2));
  const tones = ['green', 'blue', 'orange', 'purple'];
  return stressStats.slice(0, 4).map((item, index) => ({
    label: item.label,
    width,
    tone: tones[index % tones.length]
  }));
};

const buildBodyPairs = (patient) => {
  const profileItems = (getPatientSection(patient, 'inbody-profile')?.items || [])
    .filter(Boolean)
    .map(item => ({
      label: item.label,
      value: joinItemValue(item)
    }));

  const tableItems = (getPatientSection(patient, 'inbody-table')?.rows || [])
    .filter(Boolean)
    .map(row => ({
      label: row.metric || row.category || '指标',
      value: `${row.value || '--'}${row.unit ? ` ${row.unit}` : ''}`.trim()
    }));

  return toPairRows([...profileItems, ...tableItems].filter(item => hasMeaningfulValue(item.label) && hasMeaningfulValue(item.value)).slice(0, 10));
};

const buildManualMetricsPairs = (patient) => {
  const profileItems = (getPatientSection(patient, 'manual-metrics')?.items || [])
    .filter(Boolean)
    .map(item => ({
      label: item.label,
      value: joinItemValue(item)
    }));

  return toPairRows(profileItems);
};

const formatEyeTextParagraphs = (content) => {
  const text = normalizeValue(content);
  if (!text) return [];

  const getBulletTone = (value) => {
    const normalized = String(value || '');
    if (/(注意|禁忌|避免|警惕|慎|风险)/.test(normalized)) return 'warning';
    if (/(饮食|食疗|膳食|营养|进食|食物)/.test(normalized)) return 'diet';
    if (/(运动|锻炼|训练|活动)/.test(normalized)) return 'exercise';
    if (/(作息|起居|睡眠|生活|情志|情绪)/.test(normalized)) return 'lifestyle';
    return 'default';
  };

  const listMarkerPattern = /(?:\d+[、.．)]|（\d+）|[一二三四五六七八九十]+[、.．])/;
  const normalizedText = text
    .replace(/\r/g, '')
    .replace(/■/g, '\n■')
    // 常见编号项单独成段，避免 OCR 后整段挤在一起
    .replace(new RegExp(`([。；;])\\s*(${listMarkerPattern.source})`, 'g'), '$1\n$2')
    // 只在真正的段首/行首编号处断开，避免把 0.8-1.5 寸这类续写内容误拆成标题
    .replace(new RegExp(`(^|\\n)\\s*(${listMarkerPattern.source})\\s*`, 'g'), '$1$2 ')
    // 小标题或提示词后换段，便于阅读
    .replace(/(注意事项[:：]?|健康建议[:：]?|饮食建议[:：]?|生活起居[:：]?|情志调适[:：]?|运动建议[:：]?|调理建议[:：]?)/g, '\n$1\n');

  return normalizedText
    .split(/\n+/)
    .map(item => item.trim())
    .filter(Boolean)
    .map(item => ({
      text: item,
      isBullet: item.startsWith('■'),
      tone: item.startsWith('■') ? getBulletTone(item) : 'default'
    }));
};

const buildEyeReport = (patient) => {
  const eyeSummary = normalizeValue(getPatientSection(patient, 'eye-summary')?.text);
  const eyeAdvice = normalizeValue(getPatientSection(patient, 'eye-advice')?.text);
  const shouldHideEyeSection = (section) => {
    const title = normalizeValue(section?.title);
    const content = normalizeValue(section?.content);
    const combined = `${title} ${content}`;

    return (
      /眼象分区图示|眼象采集结果/.test(combined) ||
      /图示为双眼眼象分区|包含左眼、右眼的眼象实拍采集图像/.test(combined)
    );
  };

  const detailSections = Array.isArray(patient?.reportData?.eyeDetailSections)
    ? patient.reportData.eyeDetailSections
        .map(section => ({
          title: normalizeValue(section?.title),
          content: normalizeValue(section?.content)
        }))
        .filter(section => section.title && section.content)
        .filter(section => !shouldHideEyeSection(section))
    : [];
  const findings = getPatientSection(patient, 'eye-findings') || {
    columns: [
      { key: 'item', label: '项目' },
      { key: 'left', label: '左眼' },
      { key: 'right', label: '右眼' }
    ],
    rows: []
  };

  return {
    hasContent: !!(
      normalizeValue(patient?.reportData?.eyeImages?.pageOverview) ||
      findings.rows.length ||
      eyeSummary ||
      eyeAdvice ||
      detailSections.length
    ),
    pageOverview: normalizeValue(patient?.reportData?.eyeImages?.pageOverview),
    findings,
    detailSections,
    textSections: [
      eyeSummary ? { title: '综合分析结论', content: eyeSummary } : null,
      eyeAdvice ? { title: '眼象健康建议', content: eyeAdvice } : null,
      ...detailSections
    ].filter(Boolean).map(section => ({
      ...section,
      paragraphs: formatEyeTextParagraphs(section.content)
    }))
  };
};

const calcBarPercent = (value) => {
  const number = parseNumber(value);
  if (number === null) return 50;
  if (number <= 0) return 12;
  if (number >= 100) return 100;
  return Math.max(12, Math.min(100, number));
};

const buildBodyBars = (patient) => {
  const rows = getPatientSection(patient, 'muscle-fat')?.rows || [];
  const cards = rows.length
    ? rows
    : (getPatientSection(patient, 'inbody-metrics')?.items || []).filter(Boolean).map(item => ({
        metric: item.label,
        value: item.value,
        unit: item.unit,
        status: item.status
      }));

  return cards
    .filter(item => item && hasMeaningfulValue(item.metric) && hasMeaningfulValue(item.value))
    .slice(0, 3)
    .map(item => ({
      label: item.metric,
      value: `${item.value}${item.unit ? ` ${item.unit}` : ''}`.trim(),
      percent: calcBarPercent(item.value),
      note: item.status || '已采集真实指标'
    }));
};

const buildObesityCards = (patient) => {
  return (getPatientSection(patient, 'obesity-analysis')?.rows || [])
    .filter(item => item && hasMeaningfulValue(item.metric) && hasMeaningfulValue(item.value))
    .slice(0, 4)
    .map(item => ({
      label: item.metric,
      value: `${item.value}${item.unit ? ` ${item.unit}` : ''}`.trim(),
      percent: calcBarPercent(item.value),
      note: item.status || '来自真实档案'
    }));
};

const buildExerciseAdvice = (patient) => {
  const bmiMetric =
    (getPatientSection(patient, 'obesity-analysis')?.rows || []).find(item => item && String(item.metric || '').includes('BMI')) ||
    patient?.highlightMetrics?.find(item => item && String(item.label || '').includes('BMI')) ||
    null;
  const bodyFatMetric =
    (getPatientSection(patient, 'obesity-analysis')?.rows || []).find(item => item && String(item.metric || '').includes('体脂')) ||
    patient?.highlightMetrics?.find(item => item && String(item.label || '').includes('体脂')) ||
    null;
  const weightMetric =
    (getPatientSection(patient, 'inbody-metrics')?.items || []).find(item => item && String(item.label || '').includes('体重')) ||
    patient?.highlightMetrics?.find(item => item && String(item.label || '').includes('体重')) ||
    null;

  const bmi = parseNumber(bmiMetric?.value);
  const bodyFat = parseNumber(bodyFatMetric?.value);
  const weight = parseNumber(weightMetric?.value);
  const score = patient?.score;
  const biochemicalAssessment = patient?.biochemicalAssessment || getBiochemicalAssessment(patient);
  const bloodGlucoseStatus = biochemicalAssessment.statuses?.find(item => item.label === '血糖');
  const bloodPressureStatus = biochemicalAssessment.statuses?.find(item => item.label === '血压');
  const uricAcidStatus = biochemicalAssessment.statuses?.find(item => item.label === '尿酸');
  if (
    bmi === null &&
    bodyFat === null &&
    weight === null &&
    !bloodGlucoseStatus &&
    !bloodPressureStatus &&
    !uricAcidStatus
  ) {
    return [];
  }
  const suggestions = [];

  if (bmi !== null || bodyFat !== null) {
    if ((bmi !== null && bmi >= 28) || (bodyFat !== null && bodyFat >= 30)) {
      suggestions.push({
        title: '以减脂有氧为主',
        text: `当前${bmi !== null ? `BMI为 ${bmi}` : '体脂偏高'}，建议每周进行 5 次中低强度有氧运动，每次 40-60 分钟，可选择快走、椭圆机、骑行或游泳，并配合每周 2 次下肢与核心力量训练，避免只做单一有氧导致肌肉量继续下降。`,
        iconKey: 'body'
      });
    } else if ((bmi !== null && bmi >= 24) || (bodyFat !== null && bodyFat >= 25)) {
      suggestions.push({
        title: '有氧结合力量训练',
        text: `当前${bmi !== null ? `BMI为 ${bmi}` : '体脂略高'}，建议每周 3-4 次有氧运动，每次 30-45 分钟，并增加 2 次基础力量训练以提升代谢；若同时睡眠不足或压力偏高，运动后应保留 1 天恢复窗口。`,
        iconKey: 'body'
      });
    } else {
      suggestions.push({
        title: '保持规律运动',
        text: '当前体重控制整体尚可，建议每周保持 3 次以上中等强度运动，每次 30 分钟以上，重点维持心肺和肌肉状态，同时通过步行、拉伸和轻阻训练稳定代谢和恢复能力。',
        iconKey: 'body'
      });
    }
  }

  if (score !== null && score < 75) {
    suggestions.push({
      title: '先稳住节奏再提强度',
      text: `当前综合评分为 ${score} 分，建议优先采用可持续的训练节奏，如快走、低冲击骑行、拉伸和基础力量训练，避免一开始就高强度冲刺。`,
      iconKey: 'stress'
    });
  } else {
    suggestions.push({
      title: '增加代谢型训练',
      text: '可在每周规律运动基础上，加入 1-2 次间歇性训练或循环抗阻训练，帮助提升基础代谢和体脂管理效率。',
      iconKey: 'stress'
    });
  }

  if (weight !== null) {
    suggestions.push({
      title: '关注周运动量',
      text: `当前体重约 ${weight} kg，建议将每周累计运动时间控制在 150-300 分钟之间，并保持日常步行活跃度，减少久坐时间；若久坐办公，每 1 小时起身活动 3-5 分钟有助于改善血糖与血脂代谢。`,
      iconKey: 'obesity'
    });
  }

  if (bloodGlucoseStatus && /(偏高|临界)/.test(bloodGlucoseStatus.status)) {
    suggestions.push({
      title: '控糖运动要点',
      text: `结合${bloodGlucoseStatus.label}${bloodGlucoseStatus.value}的情况，建议优先采用餐后 30-60 分钟快走、骑行或椭圆机等中等强度运动，每次 20-40 分钟；空腹高强度训练容易增加应激波动，不建议作为当前主方案。`,
      iconKey: 'summary'
    });
  }

  if (bloodPressureStatus && /(偏高|临界)/.test(bloodPressureStatus.status)) {
    suggestions.push({
      title: '血压偏高时的训练边界',
      text: `当前${bloodPressureStatus.label}${bloodPressureStatus.value}提示训练强度需循序渐进，建议以中等强度有氧和呼吸放松为主，力量训练时避免憋气和突然冲刺，运动前后都应监测心率与主观疲劳感。`,
      iconKey: 'stress'
    });
  }

  if (uricAcidStatus && /偏高/.test(uricAcidStatus.status)) {
    suggestions.push({
      title: '高尿酸阶段避免过冲训练',
      text: `当前${uricAcidStatus.label}${uricAcidStatus.value}提示恢复与补水管理很关键，建议避免连续高强度爆发训练和长时间空腹运动，训练日分次补水并优先选择稳定可持续的快走、游泳或骑行。`,
      iconKey: 'body'
    });
  }

  const deduped = [];
  const seen = new Set();
  suggestions.forEach(item => {
    const key = `${item.title}-${item.text}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  });

  return deduped.slice(0, 5);
};

const normalizeAiAdviceItems = (items, fallbackIconKey) => {
  return (Array.isArray(items) ? items : [])
    .filter(Boolean)
    .map(item => ({
      title: normalizeValue(item?.title) || '个性化建议',
      text: normalizeValue(item?.text),
      iconKey: item?.iconKey || fallbackIconKey
    }))
    .filter(item => item.text)
    .slice(0, 6);
};

const buildDietSummary = (dietAdvice, dietTags) => {
  const adviceList = Array.isArray(dietAdvice) ? dietAdvice : [];
  const tags = (Array.isArray(dietTags) ? dietTags : []).filter(Boolean).slice(0, 4);
  if (!adviceList.length && !tags.length) return '';

  const titles = adviceList
    .map(item => normalizeValue(item?.title))
    .filter(Boolean)
    .slice(0, 2);

  if (tags.length && titles.length) {
    return `AI 饮食策略重点围绕 ${tags.join('、')} 展开，当前优先建议从“${titles.join('”与“')}”开始落实。`;
  }

  if (tags.length) {
    return `AI 饮食策略重点围绕 ${tags.join('、')} 展开，建议优先从三餐结构、食材选择和进食节律入手持续调整。`;
  }

  return `AI 饮食策略当前优先建议从“${titles.join('”与“')}”开始落实，并结合实际作息和指标变化持续观察。`;
};

const normalizeAdviceFingerprint = (text) => {
  return String(text || '')
    .replace(/[，。；：、,.!！?？\s]/g, '')
    .trim();
};

const removeOverlappingAdviceItems = (primaryItems, secondaryItems) => {
  const primary = Array.isArray(primaryItems) ? primaryItems : [];
  const secondary = Array.isArray(secondaryItems) ? secondaryItems : [];
  const seenTitles = new Set(primary.map(item => normalizeValue(item?.title)).filter(Boolean));
  const seenTexts = primary.map(item => normalizeAdviceFingerprint(item?.text)).filter(Boolean);

  return secondary.filter(item => {
    const title = normalizeValue(item?.title);
    const fingerprint = normalizeAdviceFingerprint(item?.text);
    if (!fingerprint) return false;
    if (title && seenTitles.has(title)) return false;
    if (seenTexts.some(text => text === fingerprint || text.includes(fingerprint) || fingerprint.includes(text))) return false;
    return true;
  });
};

const normalizeAiCrossAnalysis = (items) => {
  const tones = ['red', 'orange', 'purple', 'blue', 'green'];
  return (Array.isArray(items) ? items : [])
    .filter(Boolean)
    .map((item, index) => ({
      title: normalizeValue(item?.title) || `联动解读 ${index + 1}`,
      text: normalizeValue(item?.text),
      iconKey: item?.iconKey || 'summary',
      tone: item?.tone || tones[index % tones.length]
    }))
    .filter(item => item.text)
    .slice(0, 5);
};

const buildCrossAnalysis = (patient) => {
  const biochemicalAssessment = patient?.biochemicalAssessment || getBiochemicalAssessment(patient);
  const insights = Array.isArray(biochemicalAssessment?.insights) ? [...biochemicalAssessment.insights] : [];
  const sleepSummary = getPatientSection(patient, 'sleep-summary')?.text || '';
  const stressStats = buildStressStats(patient);
  if (!insights.length && !hasMeaningfulValue(sleepSummary) && !stressStats.length && !(patient?.score !== null && patient?.highlightMetrics?.length)) {
    return [];
  }

  if (hasMeaningfulValue(sleepSummary) && stressStats.length) {
    insights.push({
      title: '睡眠与压力共同影响恢复',
      text: `当前睡眠总结提示${String(sleepSummary).split(/[。；\n]/).map(item => item.trim()).filter(Boolean)[0]}，同时${stressStats[0].label}等压力相关指标也已纳入评估。若夜间睡眠片段化或恢复不足，第二天更容易出现交感兴奋、食欲波动和运动耐受下降。`,
      iconKey: 'sleep',
      tone: 'blue'
    });
  }

  if (patient?.score !== null && patient?.highlightMetrics?.length) {
    const keyMetric = patient.highlightMetrics.find(item => item.isWarning) || patient.highlightMetrics[0];
    if (keyMetric) {
      insights.push({
        title: '综合评分来源不是单一指标',
        text: `当前综合评分 ${patient.score} 分并不是由单一项目决定，而是结合${keyMetric.label}${keyMetric.value}${keyMetric.unit ? ` ${keyMetric.unit}` : ''}、睡眠表现、压力状态、体成分以及生化指标共同得出，因此干预方案也必须同步覆盖饮食、运动、作息与恢复。`,
        iconKey: 'summary',
        tone: 'green'
      });
    }
  }

  const unique = [];
  const seen = new Set();
  insights.forEach(item => {
    const key = `${item.title}-${item.text}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  });

  return unique.slice(0, 4);
};

const pushUniqueAdviceItem = (list, item, maxLength = 6) => {
  if (!item?.title || !item?.text || list.length >= maxLength) return;
  const key = `${item.title}-${item.text}`;
  if (!list.some(current => `${current.title}-${current.text}` === key)) {
    list.push(item);
  }
};

const buildAdviceItems = (patient, type) => {
  const healthAdvice = [];
  const dietAdvice = [];
  const warningMetrics = (patient?.highlightMetrics || []).filter(item => item.isWarning);
  const sleepSummary = getPatientSection(patient, 'sleep-summary')?.text || '';
  const obesityRows = getPatientSection(patient, 'obesity-analysis')?.rows || [];
  const bmiRow = obesityRows.find(item => String(item?.item || item?.metric || '').includes('BMI'));
  const bodyFatRow = obesityRows.find(item => {
    const label = String(item?.item || item?.metric || '');
    return label.includes('体脂') || label.includes('脂肪');
  });
  const weightMetric = (patient?.highlightMetrics || []).find(item => String(item?.label || '').includes('体重'));
  const score = patient?.score ?? null;
  const biochemicalAssessment = patient?.biochemicalAssessment || getBiochemicalAssessment(patient);
  const bloodGlucoseStatus = biochemicalAssessment.statuses?.find(item => item.label === '血糖');
  const bloodPressureStatus = biochemicalAssessment.statuses?.find(item => item.label === '血压');
  const bloodLipidsStatus = biochemicalAssessment.statuses?.find(item => item.label === '血脂');
  const uricAcidStatus = biochemicalAssessment.statuses?.find(item => item.label === '尿酸');
  if (!hasAdviceSourceData(patient)) {
    return [];
  }

  if (hasMeaningfulValue(sleepSummary)) {
    pushUniqueAdviceItem(healthAdvice, {
      title: '规律作息',
      text: `结合睡眠监测结果，当前报告提示${String(sleepSummary).split(/[。；\n]/).map(item => item.trim()).filter(Boolean)[0]}。建议将入睡、起床、光照暴露和晚间电子设备控制同步纳入管理，否则血糖、血压和恢复能力往往会一起受影响。`,
      iconKey: 'sleep'
    });
    pushUniqueAdviceItem(dietAdvice, {
      title: '晚间饮食控制',
      text: '结合睡眠监测结果，建议晚间减少浓茶、咖啡及高糖夜宵摄入，晚餐尽量提前到睡前 3 小时完成；如果本身存在血糖或血脂异常，夜间加餐会进一步放大代谢负担。',
      iconKey: 'sleep'
    });
  }

  if (bloodGlucoseStatus && /(偏高|临界)/.test(bloodGlucoseStatus.status)) {
    pushUniqueAdviceItem(healthAdvice, {
      title: '优先稳住血糖波动',
      text: `当前${bloodGlucoseStatus.label}${bloodGlucoseStatus.value}${bloodGlucoseStatus.status}，建议连续 2-4 周记录空腹或餐后血糖、三餐时间和运动时间，并将睡眠不足、情绪紧张和久坐时段一起记录，便于判断波动触发因素。`,
      iconKey: 'summary'
    });
    pushUniqueAdviceItem(dietAdvice, {
      title: '控糖同时保留蛋白与纤维',
      text: `针对${bloodGlucoseStatus.label}${bloodGlucoseStatus.value}，主食不宜一次性过量，优先粗杂粮、豆类和高纤维蔬菜，搭配足量蛋白质以降低餐后波动；若同时体脂偏高，更要减少精制糖和含糖饮料。`,
      iconKey: 'diet'
    });
  }

  if (bloodPressureStatus && /(偏高|临界)/.test(bloodPressureStatus.status)) {
    pushUniqueAdviceItem(healthAdvice, {
      title: '血压管理要和压力恢复同步',
      text: `当前${bloodPressureStatus.label}${bloodPressureStatus.value}${bloodPressureStatus.status}，建议把晨起血压、睡眠时长、情绪压力和每日步数放在同一张记录表里观察；很多血压波动并非单独出现，而是与睡眠不足和交感神经兴奋共同加重。`,
      iconKey: 'stress'
    });
    pushUniqueAdviceItem(dietAdvice, {
      title: '限盐并控制加工食品',
      text: `针对${bloodPressureStatus.label}${bloodPressureStatus.value}，建议每日盐摄入控制在 5g 以内，减少腌制品、卤味、外卖汤汁和高钠零食；如果还伴随血脂或体脂偏高，需同步减少油炸和高热量外食。`,
      iconKey: 'diet'
    });
  }

  if (bloodLipidsStatus && /(偏高|临界)/.test(bloodLipidsStatus.status)) {
    pushUniqueAdviceItem(healthAdvice, {
      title: '血脂改善依赖体脂与活动量',
      text: `当前${bloodLipidsStatus.label}${bloodLipidsStatus.value}${bloodLipidsStatus.status}，单靠短期忌口通常不够，建议同时结合腰围、体重、体脂、步数和每周运动总量来追踪；只有形成持续热量缺口并保住肌肉量，血脂改善才更稳定。`,
      iconKey: 'body'
    });
    pushUniqueAdviceItem(dietAdvice, {
      title: '减少饱和脂肪与精制零食',
      text: `结合${bloodLipidsStatus.label}${bloodLipidsStatus.value}，优先减少肥肉、奶茶、糕点、油炸小吃和反式脂肪来源，改用深海鱼、豆制品、坚果和橄榄油等更有利于脂代谢的食物结构。`,
      iconKey: 'obesity'
    });
  }

  if (uricAcidStatus && /偏高/.test(uricAcidStatus.status)) {
    pushUniqueAdviceItem(healthAdvice, {
      title: '尿酸管理要结合补水与恢复',
      text: `当前${uricAcidStatus.label}${uricAcidStatus.value}${uricAcidStatus.status}，建议把每日饮水量、出汗情况、睡眠时长与运动强度一起管理；熬夜、脱水和高强度训练叠加时，尿酸波动通常会更明显。`,
      iconKey: 'summary'
    });
    pushUniqueAdviceItem(dietAdvice, {
      title: '控制高嘌呤与酒精摄入',
      text: `针对${uricAcidStatus.label}${uricAcidStatus.value}，建议减少浓肉汤、动物内脏、啤酒、海鲜火锅和高果糖饮料，优先选择清淡烹调、足量饮水和稳定进食节奏，避免暴饮暴食后尿酸突然上升。`,
      iconKey: 'diet'
    });
  }

  warningMetrics.forEach(metric => {
    const valueText = `${metric.value}${metric.unit ? ` ${metric.unit}` : ''}`.trim();
    if ((metric.label.includes('压力') || metric.label.includes('神经')) && healthAdvice.length < 6) {
      pushUniqueAdviceItem(healthAdvice, {
        title: '减压恢复',
        text: `${metric.label}当前为 ${valueText}，说明当前恢复和神经调节可能承压，建议将呼吸训练、晚间放松、午后咖啡因控制和固定休息时间一起执行，否则睡眠、血压和主观疲劳往往会一起恶化。`,
        iconKey: 'stress'
      });
    }

    if ((metric.label.includes('BMI') || metric.label.includes('体脂') || metric.label.includes('脂肪') || metric.label.includes('体重')) && dietAdvice.length < 6) {
      pushUniqueAdviceItem(dietAdvice, {
        title: '饮食管理',
        text: `${metric.label}当前为 ${valueText}，建议减少油炸、精制糖和高热量零食摄入，并把主食份量、蛋白质占比和晚餐时间一起管理；如果同时合并血脂或血糖偏高，更不能只做“少吃”而忽略结构调整。`,
        iconKey: 'obesity'
      });
    }

    if ((metric.label.includes('肌肉') || metric.label.includes('水分')) && healthAdvice.length < 6) {
      pushUniqueAdviceItem(healthAdvice, {
        title: '体成分维护',
        text: `${metric.label}当前为 ${valueText}，建议保持规律训练并关注蛋白质和饮水摄入；如果正在减重或控糖，尤其要避免体重下降过快却伴随肌肉量和恢复能力一起下降。`,
        iconKey: 'body'
      });
    }
  });

  if (healthAdvice.length < 6) {
    pushUniqueAdviceItem(healthAdvice, {
      title: '固定作息节律',
      text: '建议尽量保持固定上床和起床时间，睡前 1 小时减少手机和高刺激内容，帮助睡眠质量逐步稳定；稳定的昼夜节律不仅影响精力状态，也会影响血糖、食欲和血压控制。',
      iconKey: 'sleep'
    });
  }

  if (healthAdvice.length < 6 && score !== null) {
    pushUniqueAdviceItem(healthAdvice, {
      title: '循序改善状态',
      text: `当前综合评分为 ${score} 分，建议先稳住作息、步行和拉伸等基础习惯，再逐步增加训练和生活管理强度；评分提升通常来自睡眠、压力、体成分与生化指标的同步改善，而不是单点突击。`,
      iconKey: 'summary'
    });
  }

  if (healthAdvice.length < 6) {
    pushUniqueAdviceItem(healthAdvice, {
      title: '增加日间活动',
      text: '建议每工作 1 小时起身活动 3-5 分钟，并将步行、拉伸和轻量力量训练安排进日常节奏；这种看似基础的活动量管理，对餐后血糖、体脂和血压波动都有实际帮助。',
      iconKey: 'body'
    });
  }

  if (healthAdvice.length < 6) {
    pushUniqueAdviceItem(healthAdvice, {
      title: '重视恢复管理',
      text: '每周安排 1-2 天低强度恢复，配合补水、舒缓拉伸和呼吸放松，减少持续疲劳对状态的影响；如果存在尿酸偏高、压力偏高或睡眠效率下降，这一步尤其重要。',
      iconKey: 'stress'
    });
  }

  if (dietAdvice.length < 6 && bmiRow?.value) {
    pushUniqueAdviceItem(dietAdvice, {
      title: '关注 BMI 管理',
      text: `当前 BMI 为 ${bmiRow.value}，建议主食定量、晚餐不过饱，并优先采用蒸煮炖等低油烹调方式；若同时伴随血脂或血糖异常，更要避免“白天忍、晚上补”的进食模式。`,
      iconKey: 'obesity'
    });
  }

  if (dietAdvice.length < 6 && bodyFatRow?.value) {
    pushUniqueAdviceItem(dietAdvice, {
      title: '优化体脂饮食结构',
      text: `当前${bodyFatRow.item || bodyFatRow.metric}为 ${bodyFatRow.value}${bodyFatRow.unit ? ` ${bodyFatRow.unit}` : ''}，建议减少含糖饮料和高油零食，提高蔬菜与蛋白质占比；体脂控制得越稳定，血脂、血压和运动耐受度改善通常越明显。`,
      iconKey: 'obesity'
    });
  }

  if (dietAdvice.length < 6 && weightMetric?.value) {
    pushUniqueAdviceItem(dietAdvice, {
      title: '规律三餐摄入',
      text: `结合当前体重 ${weightMetric.value}${weightMetric.unit ? ` ${weightMetric.unit}` : ''}，建议保持规律三餐，避免长时间空腹后暴食或夜间加餐；进食节律越混乱，越容易同时影响血糖波动、体脂累积和夜间睡眠质量。`,
      iconKey: 'diet'
    });
  }

  if (dietAdvice.length < 6) {
    pushUniqueAdviceItem(dietAdvice, {
      title: '优先高蛋白早餐',
      text: '早餐可优先选择鸡蛋、牛奶、无糖酸奶、豆制品等优质蛋白，帮助提升饱腹感并减少全天额外进食；如果需要控糖或控脂，早餐更不能只吃精制碳水。',
      iconKey: 'diet'
    });
  }

  if (dietAdvice.length < 6) {
    pushUniqueAdviceItem(dietAdvice, {
      title: '补充蔬果与饮水',
      text: '建议每日保证足量饮水，并在两餐中加入深色蔬菜、水果和粗杂粮，帮助控制总热量并改善代谢状态；若尿酸偏高，应把补水和低嘌呤饮食同时执行，而不是只靠单一控制。',
      iconKey: 'diet'
    });
  }

  const deduped = (items) => {
    const seen = new Set();
    return items.filter(item => {
      const key = `${item.title}-${item.text}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 6);
  };

  return type === 'diet' ? deduped(dietAdvice) : deduped(healthAdvice);
};

const buildDietTags = (dietAdvice) => {
  const tags = [];
  dietAdvice.forEach(item => {
    if (item.text.includes('高热量') || item.text.includes('精制糖')) tags.push('控糖控油');
    if (item.text.includes('蛋白质')) tags.push('优质蛋白');
    if (item.text.includes('夜宵')) tags.push('晚餐清淡');
    if (item.text.includes('嘌呤') || item.text.includes('尿酸')) tags.push('低嘌呤');
    if (item.text.includes('限盐') || item.text.includes('高钠') || item.text.includes('血压')) tags.push('限盐管理');
    if (item.text.includes('粗杂粮') || item.text.includes('纤维')) tags.push('高纤维');
  });
  return [...new Set(tags)].slice(0, 6);
};

const ensurePatientGuidance = async (patient) => {
  if (!patient?.id) return;
  if (isEyeOnlyPatient(patient)) return;
  if (aiGuidanceMap.value[patient.id]) return;

  aiGuidanceLoading.value = true;
  aiGuidanceError.value = '';

  try {
    const result = await generateHealthGuidance(buildGuidancePayload(patient));
    aiGuidanceMap.value = {
      ...aiGuidanceMap.value,
      [patient.id]: {
        summary: normalizeValue(result?.summary),
        crossAnalysis: normalizeAiCrossAnalysis(result?.crossAnalysis),
        healthAdvice: normalizeAiAdviceItems(result?.healthAdvice, 'summary'),
        dietAdvice: normalizeAiAdviceItems(result?.dietAdvice, 'obesity'),
        exerciseAdvice: normalizeAiAdviceItems(result?.exerciseAdvice, 'body'),
        dietTags: (Array.isArray(result?.dietTags) ? result.dietTags : []).map(tag => normalizeValue(tag)).filter(Boolean).slice(0, 6)
      }
    };
  } catch (error) {
    console.error('生成个性化建议失败:', error);
    aiGuidanceError.value = error?.message || 'AI 建议生成失败';
  } finally {
    aiGuidanceLoading.value = false;
  }
};

const buildWeeklyFitnessPlan = (patient) => {
  const bmiMetric =
    (getPatientSection(patient, 'obesity-analysis')?.rows || []).find(item => item && String(item.metric || '').includes('BMI')) ||
    patient?.highlightMetrics?.find(item => item && String(item.label || '').includes('BMI')) ||
    null;
  if (!bmiMetric) {
    return [];
  }
  const bmi = parseNumber(bmiMetric?.value) || 22;
  
  let mainGoal = '保持健康';
  if (bmi >= 28) mainGoal = '减脂燃脂';
  else if (bmi >= 24) mainGoal = '控制体重';
  else if (bmi < 18.5) mainGoal = '增肌强身';

  return [
    { day: '周一', type: '有氧训练', desc: '快步走或慢跑 30-40 分钟，保持心率在燃脂区间', goal: mainGoal },
    { day: '周二', type: '力量强化', desc: '自重训练（深蹲、俯卧撑、平板支撑） 30 分钟', goal: '肌肉唤醒' },
    { day: '周三', type: '主动恢复', desc: '全身拉伸或基础瑜伽 20 分钟，放松关节与肌肉', goal: '缓解疲劳' },
    { day: '周四', type: '有氧训练', desc: '骑自行车、游泳或健身操 40 分钟，提升心肺', goal: mainGoal },
    { day: '周五', type: '核心训练', desc: '腹部核心肌群与下肢力量组合训练 30 分钟', goal: '增强稳定' },
    { day: '周六', type: '户外活动', desc: '进行喜欢的户外运动（如羽毛球、爬山） 1小时', goal: '综合运动' },
    { day: '周日', type: '完全休息', desc: '保证充足睡眠，让身心充分恢复，准备下周', goal: '休养生息' }
  ];
};

const reportViewModel = computed(() => {
  const patient = activePatient.value;
  if (!patient) return null;
  const isEyeOnly = isEyeOnlyPatient(patient);

  const stressTable = isEyeOnly ? { columns: [], rows: [] } : (getPatientSection(patient, 'stress-table') || { columns: [], rows: [] });
  const stressStats = isEyeOnly ? [] : buildStressStats(patient);
  const stressOverview = isEyeOnly ? buildStressOverview(null) : buildStressOverview(patient);
  const fallbackDietAdvice = isEyeOnly ? [] : buildAdviceItems(patient, 'diet');
  const aiGuidance = isEyeOnly ? null : (aiGuidanceMap.value[patient.id] || null);
  const crossAnalysis = isEyeOnly ? [] : (aiGuidance?.crossAnalysis?.length ? aiGuidance.crossAnalysis : buildCrossAnalysis(patient));
  const rawHealthAdvice = isEyeOnly ? [] : (aiGuidance?.healthAdvice?.length ? aiGuidance.healthAdvice : buildAdviceItems(patient, 'health'));
  const rawDietAdvice = isEyeOnly ? [] : (aiGuidance?.dietAdvice?.length ? aiGuidance.dietAdvice : fallbackDietAdvice);
  const healthAdvice = rawHealthAdvice.slice(0, 6);
  let dietAdvice = removeOverlappingAdviceItems(healthAdvice, rawDietAdvice).slice(0, 6);
  if (!isEyeOnly && !dietAdvice.length) {
    dietAdvice = fallbackDietAdvice.slice(0, 6);
  }
  if (!isEyeOnly && !dietAdvice.length) {
    dietAdvice = rawDietAdvice.slice(0, 6);
  }
  const exerciseAdvice = isEyeOnly ? [] : (aiGuidance?.exerciseAdvice?.length ? aiGuidance.exerciseAdvice : buildExerciseAdvice(patient));
  const dietTags = isEyeOnly ? [] : (aiGuidance?.dietTags?.length ? aiGuidance.dietTags : buildDietTags(dietAdvice));
  const dietSummary = isEyeOnly ? '' : buildDietSummary(dietAdvice, dietTags);
  const exerciseAdvicePreview = exerciseAdvice.slice(0, 4);

  return {
    isEyeOnly,
    hasContent: hasPatientReportContent(patient),
    patientFields: buildProfileSummary(patient, patient.basicInfo).slice(0, 6),
    sleepPairs: isEyeOnly ? [] : buildSleepPairs(patient),
    sleepInsights: isEyeOnly ? [] : buildSleepInsights(patient),
    stressTable,
    stressStats,
    stressOverview,
    stressMarkers: buildStressMarkers(stressStats),
    bodyPairs: isEyeOnly ? [] : buildBodyPairs(patient),
    bodyBars: isEyeOnly ? [] : buildBodyBars(patient),
    obesityCards: isEyeOnly ? [] : buildObesityCards(patient),
    manualMetricsPairs: isEyeOnly ? [] : buildManualMetricsPairs(patient),
    eye: buildEyeReport(patient),
    crossAnalysis,
    weeklyFitnessPlan: isEyeOnly ? [] : buildWeeklyFitnessPlan(patient),
    exerciseAdvice,
    exerciseAdvicePreview,
    healthAdvice,
    dietAdvice,
    dietTags,
    dietSummary,
    guidanceSummary: isEyeOnly ? '' : (aiGuidance?.summary || ''),
    aiGuidanceLoading: aiGuidanceLoading.value,
    aiGuidanceError: aiGuidanceError.value
  };
});

watch(
  () => activePatient.value?.id,
  () => {
    if (activePatient.value) {
      ensurePatientGuidance(activePatient.value);
    }
  },
  { immediate: true }
);

const selectPatient = (patient) => {
  activePatient.value = patient;
};

const deletePatient = (patient) => {
  uni.showModal({
    title: '删除确认',
    content: `确认删除 ${patient.name} 的档案吗？`,
    success: async (res) => {
      if (!res.confirm) return;

      try {
        await deletePatientRecord(patient.id);

        if (activePatient.value?.id === patient.id) {
          activePatient.value = null;
        }

        await loadPatients();
        uni.showToast({
          title: '已删除',
          icon: 'success'
        });
      } catch (error) {
        uni.showToast({
          title: error?.message || '删除失败',
          icon: 'none'
        });
      }
    }
  });
};

const buildReportFileName = () => {
  const patientName = activePatient.value?.name || '健康报告';
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const timePart = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `${patientName}-健康报告-${datePart}-${timePart}.pdf`;
};

const buildReportGeneratedAt = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

const getReportPaperElement = () => {
  const target = reportPaperRef.value;
  if (!target) return null;
  return target.$el || target;
};

// #ifdef H5
const exportReportForH5 = async () => {
  await nextTick();
  const element = getReportPaperElement();
  if (!(element instanceof HTMLElement)) {
    throw new Error('报告节点未找到');
  }
  const printWindow = window.open('', '_blank', 'width=1200,height=900');
  if (!printWindow) {
    throw new Error('打印窗口打开失败');
  }

  const styleText = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((node) => node.outerHTML)
    .join('\n');
  const reportHtml = element.outerHTML;
  const generatedAt = buildReportGeneratedAt();
  const pdfDisclaimer = '声明：本报告仅供参考，不能作为疾病诊断的依据，如有不适，请及时就医。';

  printWindow.document.open();
  printWindow.document.write(`
    <!doctype html>
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${buildReportFileName()}</title>
        ${styleText}
        <style>
          @page { size: 297mm 167.0625mm; margin: 0; }
          html, body { background: #dfe8f4 !important; }
          body {
            margin: 0;
            padding: 0;
            font-family: "Helvetica Neue", Helvetica, Arial, "sans-serif";
          }
          .print-shell {
            padding: 0;
            background: #dfe8f4;
          }
          .print-source {
            position: fixed;
            left: -99999px;
            top: 0;
            width: 297mm;
            visibility: hidden;
            pointer-events: none;
          }
          .print-pages {
            width: 297mm;
            margin: 0 auto;
          }
          .print-page {
            --page-scale: 1;
            width: 297mm;
            height: 167.0625mm;
            margin: 0 auto;
            box-sizing: border-box;
            page-break-after: always;
            break-after: page;
            overflow: hidden;
            background: #eef4fb;
          }
          .print-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }
          .print-page-frame {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            padding: 10px 12px;
            overflow: hidden;
          }
          .print-page-scale {
            width: calc(100% / var(--page-scale));
            transform: scale(var(--page-scale));
            transform-origin: top left;
          }
          .print-page-surface {
            min-height: calc(167.0625mm - 28px);
            box-sizing: border-box;
            padding: 10px;
            border-radius: 18px;
            background: linear-gradient(180deg, #fefefe 0%, #f7fbff 100%);
            box-shadow: inset 0 0 0 1px #dce7f6;
            display: flex;
            flex-direction: column;
          }
          .print-page-item + .print-page-item {
            margin-top: 8px;
          }
          .print-page-content {
            flex: 1 1 auto;
            min-height: 0;
            display: flex;
            flex-direction: column;
          }
          .print-page-content > .print-page-item:only-child {
            margin: auto 0;
          }
          .print-document-footer {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #dbe5f2;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            color: #7a8ea9;
            font-size: 10px;
            line-height: 1.4;
          }
          .print-document-footer-left {
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 0;
            flex: 1 1 auto;
          }
          .print-document-footer-icon {
            width: 18px;
            height: 18px;
            flex: 0 0 auto;
            color: #8ea3bf;
          }
          .print-document-footer-text {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .print-document-footer-date {
            flex: 0 0 auto;
            white-space: nowrap;
            color: #6b7f9a;
            font-weight: 600;
          }
          .print-page .reference-header,
          .print-page .reference-row,
          .print-page .reference-row-bottom {
            margin-bottom: 0;
          }
          .print-page .reference-report {
            gap: 8px;
          }
          .print-page .reference-header {
            gap: 8px;
            padding: 10px 12px;
          }
          .print-page .reference-title-text h2 {
            font-size: 28px;
          }
          .print-page .reference-title-text p {
            font-size: 12px;
          }
          .print-page .reference-patient-panel {
            grid-template-columns: minmax(0, 1fr) 170px;
            gap: 10px;
          }
          .print-page .reference-patient-grid {
            padding: 10px 12px;
          }
          .print-page .reference-patient-item {
            grid-template-columns: 64px minmax(0, 1fr);
            gap: 8px;
            padding: 3px 0;
            font-size: 12px;
          }
          .print-page .reference-badge-panel {
            padding: 10px 8px;
            border-radius: 16px;
          }
          .print-page .reference-score {
            margin-top: 8px;
            font-size: 26px;
          }
          .print-page .reference-score-label,
          .print-page .reference-score-note,
          .print-page .reference-score-sub {
            font-size: 11px;
          }
          .print-page .reference-row {
            grid-template-columns: minmax(0, 1.14fr) minmax(226px, 0.92fr);
            gap: 8px;
          }
          .print-page .reference-row.reference-row-single {
            grid-template-columns: minmax(0, 1fr);
          }
          .print-page .reference-row-bottom {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }
          .print-page .reference-section-body {
            padding: 8px 8px 9px;
          }
          .print-page .reference-section-title {
            min-height: 28px;
            padding: 0 12px;
            font-size: 14px;
          }
          .print-page .reference-pairs-table th,
          .print-page .reference-pairs-table td,
          .print-page .reference-data-table th,
          .print-page .reference-data-table td {
            padding: 6px 7px;
            font-size: 11px;
            line-height: 1.35;
          }
          .print-page .insight-item,
          .print-page .recommend-item,
          .print-page .exercise-advice-item,
          .print-page .fitness-plan-item,
          .print-page .metric-bar-item,
          .print-page .obesity-item,
          .print-page .reference-stat-card {
            padding: 8px 9px;
          }
          .print-page .insight-list,
          .print-page .recommend-list,
          .print-page .obesity-list,
          .print-page .metric-bar-list,
          .print-page .exercise-advice-list,
          .print-page .fitness-plan-list,
          .print-page .reference-stat-grid {
            gap: 7px;
          }
          .print-page .fitness-plan-type,
          .print-page .insight-content h5,
          .print-page .recommend-content h5,
          .print-page .exercise-advice-content h5 {
            font-size: 12px;
            margin-bottom: 3px;
          }
          .print-page .insight-content p,
          .print-page .recommend-content p,
          .print-page .exercise-advice-content p,
          .print-page .fitness-plan-desc,
          .print-page .fitness-plan-goal,
          .print-page .metric-bar-note,
          .print-page .obesity-note,
          .print-page .reference-stat-note,
          .print-page .paper-footer-note,
          .print-page .reference-score-note,
          .print-page .reference-score-sub {
            font-size: 10px;
            line-height: 1.5;
          }
          .print-page .fitness-plan-day {
            flex: 0 0 32px;
            width: 32px;
            height: 32px;
            font-size: 11px;
          }
          .print-page .guidance-summary,
          .print-page .guidance-status,
          .print-page .exercise-advice-box,
          .print-page .reference-balance-box,
          .print-page .stress-overview-box,
          .print-page .autonomic-age-panel {
            margin-bottom: 7px;
            padding: 7px 8px;
          }
          .print-page .autonomic-age-panel,
          .print-page .stress-overview-charts {
            grid-template-columns: minmax(0, 1.15fr) minmax(0, 1.45fr) minmax(0, 1.3fr);
            gap: 10px;
            align-items: stretch;
          }
          .print-page .autonomic-pie-svg {
            width: 100%;
            max-width: 320px;
            height: auto;
            aspect-ratio: 280/220;
            transform-origin: center center;
          }
          .print-page .stress-type-wheel-svg {
            width: 100%;
            height: auto;
            max-height: 280px;
            transform-origin: center center;
          }
          .print-page .stress-energy-chart-svg {
            width: 100%;
            height: auto;
            max-height: 280px;
            transform-origin: center center;
          }
          .print-page .autonomic-age-value {
            font-size: 28px;
          }
          .print-page .autonomic-age-caption {
            font-size: 18px;
          }
          .print-page .stress-overview-notes {
            gap: 6px;
          }
          .print-page .stress-overview-note,
          .print-page .stress-chart-card {
            padding: 7px 8px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            height: 100%;
          }
          .print-page .stress-energy-footnote {
            font-size: 10px;
          }
          .stress-type-wheel-text { fill: #1e1f21; font-size: 15px; font-weight: 500; letter-spacing: 1px; }
          .stress-type-wheel-center-text { fill: #f7f7f7; font-size: 34px; font-weight: 700; letter-spacing: 2px; }
          .stress-type-wheel-selected-text { fill: #1f1f20; font-size: 30px; font-weight: 500; letter-spacing: 2px; }
          .stress-energy-chart-side-text { fill: #f7f7f7; font-size: 14px; letter-spacing: 0.5px; }
          .stress-energy-chart-center { fill: #f7f7f7; font-size: 32px; font-weight: 700; letter-spacing: 2px; }
          .stress-energy-chart-value { fill: #111111; font-size: 28px; font-weight: 700; }
          .stress-energy-chart-percent { font-size: 16px; font-weight: 500; }
          .print-page .reference-row-stress-overview-page .reference-stat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .print-page .reference-tag {
            min-height: 24px;
            padding: 0 10px;
            font-size: 10px;
          }
          .print-page .paper-source-tag {
            padding: 4px 8px;
            font-size: 10px;
          }
          .print-page .reference-stat-value {
            font-size: 24px;
          }
          .print-page .metric-bar-track,
          .print-page .reference-balance-track {
            margin-top: 5px;
          }
          .print-page .paper-footer {
            margin-top: 0;
            padding: 10px 12px;
          }
          .print-page .paper-source-tags,
          .print-page .reference-tag-row {
            gap: 6px;
            margin-top: 8px;
          }
          .print-page .paper-watermark,
          .print-page .empty-report {
            display: none !important;
          }
          .report-paper {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: none !important;
            padding: 0 !important;
            background: transparent !important;
          }
        </style>
      </head>
      <body>
        <div class="print-shell">
          <div id="print-source" class="print-source">${reportHtml}</div>
          <div id="print-pages" class="print-pages"></div>
        </div>
        <script>
          (function() {
            const sourceRoot = document.querySelector('#print-source .report-paper');
            const pagesHost = document.getElementById('print-pages');

            if (!sourceRoot || !pagesHost) {
              window.__printReady = true;
              return;
            }

            const header = sourceRoot.querySelector('.reference-header');
            const report = sourceRoot.querySelector('.reference-report');
            const footer = sourceRoot.querySelector('.paper-footer');
            const rowNodes = report
              ? Array.from(report.children).filter((node) => node.classList && (node.classList.contains('reference-row') || node.classList.contains('reference-row-bottom')))
              : [];
            const items = [header, ...rowNodes, footer].filter(Boolean).map((node) => node.cloneNode(true));
            const MIN_PAGE_SCALE = 0.84;

            const createPage = () => {
              const page = document.createElement('section');
              page.className = 'print-page';

              const frame = document.createElement('div');
              frame.className = 'print-page-frame';

              const scale = document.createElement('div');
              scale.className = 'print-page-scale';

              const surface = document.createElement('div');
              surface.className = 'print-page-surface';

              const content = document.createElement('div');
              content.className = 'print-page-content';

              surface.appendChild(content);
              scale.appendChild(surface);
              frame.appendChild(scale);
              page.appendChild(frame);
              pagesHost.appendChild(page);

              return { page, frame, scale, surface, content };
            };

            const finalizePage = (pageObj) => {
              const frameHeight = pageObj.frame.clientHeight;
              const contentHeight = pageObj.scale.scrollHeight;
              const scaleValue = contentHeight > 0 ? Math.min(1, frameHeight / contentHeight) : 1;
              pageObj.page.style.setProperty('--page-scale', scaleValue.toFixed(4));
            };

            const wouldFitWithScale = (pageObj) => {
              return pageObj.scale.scrollHeight <= (pageObj.frame.clientHeight / MIN_PAGE_SCALE) + 2;
            };

            let currentPage = createPage();

            items.forEach((item) => {
              if (item.dataset && item.dataset.printPageBreakBefore === 'true' && currentPage.content.children.length) {
                finalizePage(currentPage);
                currentPage = createPage();
              }

              const holder = document.createElement('div');
              holder.className = 'print-page-item';
              holder.appendChild(item);
              currentPage.content.appendChild(holder);

              const exceedsPage = currentPage.scale.scrollHeight > currentPage.frame.clientHeight + 2;
              if (exceedsPage && currentPage.content.children.length > 1) {
                if (wouldFitWithScale(currentPage)) {
                  return;
                }
                currentPage.content.removeChild(holder);
                finalizePage(currentPage);
                currentPage = createPage();
                currentPage.content.appendChild(holder);
              }
            });

            Array.from(pagesHost.children).forEach((page) => {
              const frame = page.querySelector('.print-page-frame');
              const scale = page.querySelector('.print-page-scale');
              finalizePage({ page, frame, scale });
            });

            const pages = Array.from(pagesHost.children);
            const lastPage = pages[pages.length - 1];
            if (lastPage) {
              lastPage.classList.add('has-document-footer');
              const content = lastPage.querySelector('.print-page-content');
              const footerBar = document.createElement('div');
              footerBar.className = 'print-document-footer';
              footerBar.innerHTML = \`
                <div class="print-document-footer-left">
                  <svg class="print-document-footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M12 3l7 3v6c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V6l7-3z"></path>
                    <path d="M9.5 12.5l1.8 1.8 3.7-4"></path>
                  </svg>
                  <span class="print-document-footer-text">${pdfDisclaimer}</span>
                </div>
                <div class="print-document-footer-date">报告生成日期：${generatedAt}</div>
              \`;
              content?.insertAdjacentElement('afterend', footerBar);

              const frame = lastPage.querySelector('.print-page-frame');
              const scale = lastPage.querySelector('.print-page-scale');
              finalizePage({ page: lastPage, frame, scale });
            }

            document.getElementById('print-source')?.remove();
            window.__printReady = true;
          })();
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();

  await new Promise((resolve) => {
    const complete = () => {
      printWindow.focus();
      printWindow.print();
      resolve();
    };

    if (printWindow.document.readyState === 'complete') {
      complete();
      return;
    }

    printWindow.onload = complete;
    setTimeout(complete, 800);
  });
};
// #endif

const exportReport = async () => {
  if (!activePatient.value || exportLoading.value) return;

  exportLoading.value = true;
  uni.showLoading({ title: '正在生成 PDF...' });

  try {
    // #ifdef H5
    await exportReportForH5();
    uni.showToast({
      title: '请在打印窗口选择另存为 PDF',
      icon: 'none'
    });
    return;
    // #endif

    // #ifndef H5
    uni.showToast({
      title: '当前端暂不支持直接下载 PDF',
      icon: 'none'
    });
    // #endif
  } catch (error) {
    console.error('导出 PDF 失败', error);
    uni.showToast({
      title: 'PDF 导出失败，请重试',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
    exportLoading.value = false;
  }
};
</script>

<style scoped>
.report-wrapper {
  position: relative;
  min-height: 100vh;
  z-index: 1;
  overflow: hidden;
  font-family: "Helvetica Neue", Helvetica, Arial, "sans-serif";
}

.bg-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  pointer-events: none;
  background: url(/static/images/bg.jpg) no-repeat center center;
  background-size: cover;
}

.head {
  height: 100px;
  background: url(/static/images/head_bg.png) no-repeat center center;
  background-size: 100% 100%;
  position: relative;
  z-index: 100;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 5px 20px rgba(20, 182, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
}

.head-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  cursor: pointer;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
}

.back-btn:hover {
  background: rgba(20, 182, 255, 0.2);
  border-color: #14b6ff;
}

.head h1 {
  color: #fff;
  text-align: center;
  font-size: 28px;
  letter-spacing: 2px;
  font-weight: bold;
  margin: 0;
}

.head h1 a {
  color: #fff;
  text-shadow: 0 0 15px rgba(20, 182, 255, 0.8), 0 0 30px rgba(20, 182, 255, 0.4), 0 4px 10px rgba(0, 0, 0, 0.8);
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.user-info img {
  border-radius: 50%;
  border: 1px solid #14b6ff;
  padding: 2px;
}

.nav-btn {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
  background: rgba(0, 0, 0, 0.3);
}

.nav-btn:hover {
  color: #fff;
  border-color: #14b6ff;
  box-shadow: 0 0 10px rgba(20, 182, 255, 0.4);
}

.nav-btn.active {
  color: #fff;
  background: rgba(20, 182, 255, 0.2);
  border-color: #14b6ff;
  box-shadow: 0 0 15px rgba(20, 182, 255, 0.6);
  font-weight: bold;
}

.main-content {
  display: flex;
  padding: 20px;
  gap: 20px;
  height: calc(100vh - 100px);
  min-height: 0;
  align-items: stretch;
  box-sizing: border-box;
}

.left-panel {
  flex: 3;
  display: flex;
  flex-direction: column;
  min-width: 320px;
  min-height: 0;
}

.right-panel {
  flex: 7;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.boxall {
  background: rgba(6, 48, 109, 0.3);
  border: 1px solid rgba(20, 182, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(20, 182, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 25px;
}

.panel-title {
  font-size: 22px;
  color: #fff;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title span::before {
  content: "";
  display: inline-block;
  width: 4px;
  height: 22px;
  background: #14b6ff;
  border-radius: 4px;
  margin-right: 10px;
  box-shadow: 0 0 8px #14b6ff;
  vertical-align: middle;
}

.search-box {
  margin-bottom: 20px;
}

.search-box input {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 12px;
  color: #fff;
  font-size: 14px;
  margin-bottom: 12px;
  box-sizing: border-box;
}

.filter-tabs {
  display: flex;
  gap: 10px;
}

.filter-tabs span {
  flex: 1;
  text-align: center;
  font-size: 12px;
  padding: 6px 0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s;
}

.filter-tabs span.active {
  background: rgba(20, 182, 255, 0.2);
  border-color: #14b6ff;
  color: #fff;
}

.patient-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 5px;
}

.patient-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
}

.patient-card:hover,
.patient-card.active {
  background: rgba(20, 182, 255, 0.15);
  border-color: #14b6ff;
  box-shadow: 0 0 15px rgba(20, 182, 255, 0.3);
}

.avatar {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.avatar img {
  width: 24px;
  opacity: 0.8;
}

.info {
  flex: 1;
}

.name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.name {
  color: #fff;
  font-size: 16px;
  font-weight: bold;
}

.desc-row {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.delete-btn {
  margin-left: 12px;
  border: 1px solid rgba(237, 64, 93, 0.7);
  background: rgba(237, 64, 93, 0.12);
  color: #ff8da1;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.delete-btn:hover {
  background: rgba(237, 64, 93, 0.2);
  color: #fff;
  box-shadow: 0 0 10px rgba(237, 64, 93, 0.25);
}

.badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
}

.badge.ready {
  background: rgba(247, 140, 68, 0.2);
  color: #f78c44;
  border: 1px solid #f78c44;
}

.badge.processing {
  background: rgba(73, 188, 247, 0.2);
  color: #49bcf7;
  border: 1px solid #49bcf7;
}

.badge.done {
  background: rgba(3, 180, 142, 0.2);
  color: #03b48e;
  border: 1px solid #03b48e;
}

.export-btn {
  background: linear-gradient(90deg, #f78c44, #fef000);
  color: #333;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(247, 140, 68, 0.5);
  transition: all 0.3s;
}

.export-btn:disabled {
  cursor: not-allowed;
  opacity: 0.75;
  filter: saturate(0.85);
}

.export-btn:hover {
  filter: brightness(1.1);
  box-shadow: 0 0 15px rgba(247, 140, 68, 0.8);
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 18px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.empty-content {
  text-align: center;
}

.empty-content p {
  margin-top: 20px;
}

.report-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 15px;
}

.report-paper {
  position: relative;
  background: linear-gradient(180deg, #fefefe 0%, #f7fbff 100%);
  border-radius: 26px;
  padding: 28px;
  border: 1px solid rgba(126, 174, 255, 0.22);
  box-shadow: 0 18px 50px rgba(10, 35, 78, 0.25);
  overflow: visible;
  min-height: max-content;
}

.paper-watermark {
  position: absolute;
  top: 20px;
  right: 26px;
  font-size: 42px;
  font-weight: 800;
  color: rgba(31, 120, 255, 0.06);
  letter-spacing: 2px;
  pointer-events: none;
}

.paper-header {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.9fr);
  gap: 18px;
  padding: 22px;
  border-radius: 22px;
  background: linear-gradient(135deg, #eef6ff 0%, #fdfefe 100%);
  border: 1px solid #dcecff;
  margin-bottom: 18px;
}

.paper-brand-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
}

.paper-brand-icon {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  background: linear-gradient(135deg, #1f78ff 0%, #34b7ff 100%);
  color: #fff;
  font-size: 30px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 24px rgba(31, 120, 255, 0.3);
}

.report-inline-icon {
  width: 24px;
  height: 24px;
  display: block;
}

.paper-title-panel h2 {
  margin: 0;
  font-size: 38px;
  color: #1554c6;
  line-height: 1.1;
}

.paper-title-panel p {
  margin: 6px 0 0;
  color: #5a76a6;
  font-size: 14px;
  letter-spacing: 0.4px;
}

.paper-patient-line {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.paper-patient-line span {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(31, 120, 255, 0.08);
  color: #31537d;
  font-size: 13px;
  border: 1px solid rgba(31, 120, 255, 0.14);
}

.paper-patient-name {
  background: linear-gradient(135deg, #1f78ff, #41b6ff) !important;
  color: #fff !important;
  font-weight: 700;
}

.paper-summary-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 150px;
  gap: 14px;
}

.profile-card,
.seal-card {
  background: #fff;
  border-radius: 18px;
  border: 1px solid #dbe8fb;
  box-shadow: 0 10px 24px rgba(22, 74, 151, 0.08);
}

.profile-card {
  padding: 14px 16px;
}

.profile-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 7px 0;
  border-bottom: 1px dashed #e6eefb;
  font-size: 13px;
}

.profile-row:last-child {
  border-bottom: none;
}

.profile-label {
  color: #6880a7;
}

.profile-value {
  color: #21385e;
  font-weight: 600;
  text-align: right;
  word-break: break-word;
}

.seal-card {
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.seal-icon-wrap {
  width: 74px;
  height: 74px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(31, 120, 255, 0.12), rgba(39, 174, 96, 0.15));
  display: flex;
  align-items: center;
  justify-content: center;
}

.seal-icon {
  width: 42px;
  height: 42px;
  opacity: 0.88;
  color: #2163c2;
}

.seal-score {
  margin-top: 10px;
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
}

.seal-label {
  margin-top: 8px;
  color: #6180a9;
  font-size: 12px;
}

.metric-chip-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.metric-chip {
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid #dbe9fd;
  background: #fff;
  box-shadow: 0 8px 20px rgba(25, 76, 153, 0.08);
}

.metric-chip-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.metric-chip-icon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2767c0;
  background: rgba(31, 120, 255, 0.08);
  border: 1px solid rgba(31, 120, 255, 0.12);
  flex: 0 0 auto;
}

.metric-chip-label {
  color: #6d85ad;
  font-size: 12px;
  margin-bottom: 0;
}

.metric-chip-value {
  color: #1b4f9b;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
}

.metric-chip-value small,
.summary-stat-value small,
.mini-kv-value small,
.mini-metric-value small {
  font-size: 12px;
  opacity: 0.7;
}

.metric-chip.warning .metric-chip-value,
.summary-stat-card.warning .summary-stat-value,
.mini-metric-value.warning {
  color: #e95454;
}

.metric-chip-note {
  margin-top: 6px;
  color: #88a0c0;
  font-size: 12px;
}

.paper-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.9fr);
  gap: 16px;
  align-items: start;
}

.paper-card {
  background: #fff;
  border-radius: 22px;
  border: 1px solid #dbe8fb;
  padding: 18px;
  box-shadow: 0 10px 24px rgba(20, 67, 139, 0.08);
  height: auto;
}

.paper-card.wide {
  grid-column: 1 / 2;
}

.paper-card.compact,
.paper-card.normal {
  grid-column: 2 / 3;
}

.paper-card.normal:nth-of-type(3),
.paper-card.wide:nth-of-type(4),
.paper-card.normal:nth-of-type(5),
.paper-card.wide:nth-of-type(n + 6) {
  grid-column: auto;
}

.paper-card.wide:nth-of-type(n + 3) {
  grid-column: 1 / span 2;
}

.paper-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.paper-card-index {
  min-width: 38px;
  height: 38px;
  border-radius: 12px;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.paper-card-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2b66be;
  border: 1px solid rgba(31, 120, 255, 0.1);
  flex: 0 0 auto;
}

.paper-card-title-wrap h4 {
  margin: 0;
  font-size: 22px;
  color: #224770;
}

.paper-card-title-wrap p {
  margin: 4px 0 0;
  color: #7d93b4;
  font-size: 12px;
}

.summary-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.summary-stat-card {
  padding: 14px;
  border-radius: 16px;
  background: linear-gradient(180deg, #f7fbff 0%, #ffffff 100%);
  border: 1px solid #e0ecfd;
}

.summary-stat-label {
  display: block;
  color: #758db0;
  font-size: 12px;
}

.summary-stat-value {
  display: block;
  margin-top: 8px;
  color: #1958a6;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
}

.summary-stat-note {
  display: block;
  margin-top: 6px;
  color: #8fa3c0;
  font-size: 12px;
}

.summary-info-list {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed #dbe6f6;
  display: grid;
  gap: 10px;
}

.summary-info-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #60789f;
  font-size: 13px;
}

.summary-info-item strong {
  color: #20395f;
  font-size: 13px;
  text-align: right;
}

.section-stack {
  display: grid;
  gap: 14px;
}

.mini-section {
  border-radius: 18px;
  background: #f9fbff;
  border: 1px solid #e2edfb;
  padding: 14px;
}

.mini-section-title {
  margin-bottom: 12px;
  color: #2c5c96;
  font-size: 16px;
  font-weight: 700;
}

.mini-kv-grid,
.mini-metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.mini-kv-card,
.mini-metric-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e3ebf8;
  padding: 12px;
}

.mini-kv-label {
  display: block;
  color: #7b91b3;
  font-size: 12px;
}

.mini-kv-value {
  display: block;
  margin-top: 7px;
  color: #244970;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  word-break: break-word;
}

.mini-metric-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: #5d77a0;
  font-size: 12px;
}

.mini-metric-status {
  color: #f08a2a;
}

.mini-metric-value {
  margin-top: 8px;
  color: #1752a0;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.2;
}

.mini-table-wrapper {
  overflow-x: auto;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #e3ebf8;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 620px;
}

.data-table th,
.data-table td {
  padding: 11px 12px;
  border-bottom: 1px solid #eaf0f8;
  text-align: left;
  font-size: 12px;
  color: #2f4c74;
}

.data-table th {
  color: #2460af;
  background: #eef5ff;
  font-weight: 700;
}

.mini-text-block {
  padding: 14px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #e3ebf8;
  color: #3b5375;
  line-height: 1.85;
  white-space: pre-wrap;
  word-break: break-word;
}

.paper-footer {
  margin-top: 18px;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid #dce8f7;
  background: linear-gradient(180deg, #f9fcff 0%, #ffffff 100%);
}

.paper-footer-note {
  color: #56739e;
  font-size: 13px;
  line-height: 1.7;
}

.paper-source-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.paper-source-tag {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(31, 120, 255, 0.08);
  border: 1px solid rgba(31, 120, 255, 0.14);
  color: #2f63ab;
  font-size: 12px;
}

.reference-header {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(320px, 1.25fr);
  gap: 16px;
  padding: 20px 22px;
  margin-bottom: 16px;
  border-radius: 22px;
  border: 1px solid #dbe7fb;
  background:
    radial-gradient(circle at top right, rgba(74, 169, 255, 0.14), transparent 28%),
    radial-gradient(circle at left top, rgba(111, 205, 255, 0.18), transparent 22%),
    linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

.reference-title-box {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.reference-title-icon {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4d98ff 0%, #1f6df2 100%);
  box-shadow: 0 10px 20px rgba(31, 109, 242, 0.22);
}

.reference-title-text h2 {
  margin: 0;
  color: #1555c7;
  font-size: 42px;
  line-height: 1.1;
  font-weight: 800;
}

.reference-title-text p {
  margin: 6px 0 0;
  color: #5c76a4;
  font-size: 14px;
}

.reference-patient-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 225px;
  gap: 14px;
  align-items: stretch;
}

.reference-patient-grid {
  padding: 12px 14px;
  border-radius: 18px;
  border: 1px solid #dce9fb;
  background: rgba(255, 255, 255, 0.88);
}

.reference-patient-item {
  display: grid;
  grid-template-columns: 80px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  padding: 5px 0;
  color: #5e76a0;
  font-size: 13px;
}

.reference-patient-item strong {
  color: #24456f;
  font-weight: 700;
  word-break: break-word;
}

.reference-badge-panel {
  border-radius: 20px;
  border: 1px solid #dce9fb;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 14px 12px;
}

.reference-score {
  margin-top: 10px;
  font-size: 30px;
  font-weight: 800;
  line-height: 1;
}

.reference-score-label {
  margin-top: 8px;
  font-size: 12px;
  color: #6984b0;
}

.reference-score-note {
  margin-top: 8px;
  font-size: 11px;
  line-height: 1.5;
  color: #6d84aa;
}

.reference-score-sub {
  margin-top: 6px;
  font-size: 11px;
  color: #97a9c4;
}

.reference-report {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.reference-row {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 1fr);
  gap: 14px;
  align-items: stretch;
}

.reference-row-single {
  grid-template-columns: minmax(0, 1fr);
}

.reference-row-page-break {
  margin-top: 2px;
}

.reference-row-bottom {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.reference-section-full {
  min-width: 0;
}

.reference-section {
  border-radius: 18px;
  border: 1px solid #d9e6fb;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(28, 77, 151, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.reference-section-body {
  padding: 12px 12px 14px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.reference-section-title {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 16px;
  border-radius: 0 0 14px 0;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.4px;
}

.reference-section-title.tone-blue {
  background: linear-gradient(135deg, #2979ff, #4fb2ff);
}

.reference-section-title.tone-yellow {
  background: linear-gradient(135deg, #f5a524, #ffc247);
}

.reference-section-title.tone-green {
  background: linear-gradient(135deg, #2bbd7e, #60d27d);
}

.reference-section-title.tone-orange {
  background: linear-gradient(135deg, #f28d35, #ffb347);
}

.reference-pairs-table,
.reference-data-table {
  width: 100%;
  height: 100%;
  flex: 1;
  border-collapse: collapse;
}

.reference-pairs-table th,
.reference-pairs-table td,
.reference-data-table th,
.reference-data-table td {
  border: 1px solid #dbe5f5;
  padding: 9px 10px;
  font-size: 12px;
  line-height: 1.45;
}

.reference-pairs-table th,
.reference-data-table th {
  background: #f3f7ff;
  color: #2d67bb;
  font-weight: 700;
}

.reference-pairs-table td,
.reference-data-table td {
  color: #35506f;
  background: #fff;
}

.insight-list,
.recommend-list,
.obesity-list,
.metric-bar-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.exercise-advice-box {
  margin-top: 12px;
  padding: 10px;
  border-radius: 14px;
  border: 1px solid #e3eaf8;
  background: linear-gradient(180deg, #fbfdff 0%, #f6faff 100%);
}

.eye-visual-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.eye-visual-card {
  border-radius: 14px;
  border: 1px solid #e3ebfb;
  background: linear-gradient(180deg, #fbfdff 0%, #f5f9ff 100%);
  padding: 10px;
}

.eye-visual-title {
  font-size: 13px;
  font-weight: 700;
  color: #2d67bb;
  margin-bottom: 8px;
}

.eye-visual-image {
  display: block;
  width: 100%;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #ebf1fa;
}

.eye-text-section-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.eye-text-section-card {
  border-radius: 12px;
  border: 1px solid #ebf1fa;
  background: #f9fbff;
  padding: 14px 16px;
}

.eye-text-section-card h5 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  color: #2b3956;
}

.eye-text-section-card p {
  margin: 0;
  word-break: break-word;
  line-height: 1.75;
  color: #50627d;
  font-size: 13px;
}

.eye-text-paragraphs {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.eye-text-bullet {
  margin-top: 4px;
  padding: 10px 12px;
  border-top: 1px dashed #d9e5f5;
  border-left: 4px solid #3b82f6;
  border-radius: 8px;
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.04) 100%);
  color: #1f4f8f;
  font-weight: 600;
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.08);
}

.eye-text-bullet-warning {
  border-left-color: #f59e0b;
  background: linear-gradient(90deg, rgba(245, 158, 11, 0.16) 0%, rgba(245, 158, 11, 0.05) 100%);
  color: #9a5800;
  box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.1);
}

.eye-text-bullet-diet {
  border-left-color: #10b981;
  background: linear-gradient(90deg, rgba(16, 185, 129, 0.16) 0%, rgba(16, 185, 129, 0.05) 100%);
  color: #0f766e;
  box-shadow: inset 0 0 0 1px rgba(16, 185, 129, 0.1);
}

.eye-text-bullet-exercise {
  border-left-color: #3b82f6;
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.16) 0%, rgba(59, 130, 246, 0.05) 100%);
  color: #1d4ed8;
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.1);
}

.eye-text-bullet-lifestyle {
  border-left-color: #8b5cf6;
  background: linear-gradient(90deg, rgba(139, 92, 246, 0.16) 0%, rgba(139, 92, 246, 0.05) 100%);
  color: #6d28d9;
  box-shadow: inset 0 0 0 1px rgba(139, 92, 246, 0.1);
}

.exercise-advice-title {
  color: #2567c2;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
}

.fitness-plan-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
}

.fitness-plan-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid #ebf1fa;
  background: #f9fbff;
  transition: all 0.2s ease;
  flex: 1;
}

.fitness-plan-day {
  flex: 0 0 42px;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: linear-gradient(135deg, #a66cf5 0%, #804dd8 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(128, 77, 216, 0.15);
}

.fitness-plan-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.fitness-plan-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.fitness-plan-type {
  font-size: 14px;
  font-weight: 700;
  color: #2b3956;
}

.fitness-plan-goal {
  font-size: 11px;
  color: #7b40d6;
  background: #f1eaff;
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 600;
}

.fitness-plan-desc {
  font-size: 12px;
  color: #617896;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.exercise-advice-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.exercise-advice-item {
  display: flex;
  gap: 7px;
  align-items: flex-start;
  padding: 7px 8px;
  border-radius: 10px;
  border: 1px solid #e1eaf9;
  background: #ffffff;
}

.exercise-advice-icon {
  width: 26px;
  height: 26px;
  flex: 0 0 auto;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #4aa8ff, #2b77ff);
}

.exercise-advice-content {
  min-width: 0;
}

.exercise-advice-content h5 {
  margin: 0 0 3px;
  font-size: 12px;
  line-height: 1.35;
  color: #285eaf;
}

.exercise-advice-content p {
  margin: 0;
  font-size: 10px;
  line-height: 1.45;
  color: #58729b;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.insight-item,
.recommend-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 10px 12px;
  border-radius: 14px;
  background: #f8fbff;
  border: 1px solid #e2eaf8;
}

.insight-icon,
.recommend-icon,
.reference-stat-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  color: #fff;
}

.insight-icon.tone-green,
.recommend-icon.tone-green {
  background: linear-gradient(135deg, #42c985, #63d56e);
}

.insight-icon.tone-blue {
  background: linear-gradient(135deg, #2d82ff, #56b9ff);
}

.insight-icon.tone-purple {
  background: linear-gradient(135deg, #8270ff, #b08cff);
}

.insight-icon.tone-orange,
.recommend-icon.tone-orange {
  background: linear-gradient(135deg, #f39d38, #ffba5c);
}

.insight-content,
.recommend-content {
  min-width: 0;
}

.insight-content h5,
.recommend-content h5 {
  margin: 0 0 6px;
  font-size: 14px;
  color: #2860b4;
}

.insight-content p,
.recommend-content p {
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  color: #526c95;
  word-break: break-word;
}

.guidance-status,
.guidance-summary {
  margin-bottom: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 12px;
  line-height: 1.7;
}

.guidance-status {
  color: #4b6e9f;
  background: #f5f9ff;
  border: 1px solid #dce9fb;
}

.guidance-status-warning {
  color: #9a6a24;
  background: #fff8ec;
  border-color: #ffe1b3;
}

.guidance-summary {
  color: #365887;
  background: linear-gradient(180deg, #f7fbff, #eef6ff);
  border: 1px solid #d9e8fb;
}

.guidance-summary-diet {
  background: linear-gradient(180deg, #fffaf4, #fff4e7);
  border-color: #ffe1bf;
}

.reference-stat-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.reference-stat-card {
  padding: 12px;
  border-radius: 14px;
  border: 1px solid #e0e8f7;
  background: #fafdff;
}

.reference-stat-top {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #58739c;
  font-size: 12px;
}

.reference-stat-icon {
  background: linear-gradient(135deg, #2d82ff, #4bb7ff);
}

.reference-stat-value {
  margin-top: 8px;
  color: #2f8e40;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.1;
}

.reference-stat-note {
  margin-top: 4px;
  color: #7d91b2;
  font-size: 12px;
}

.autonomic-age-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.autonomic-age-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.autonomic-pie-svg {
  width: 270px;
  height: 212px;
  overflow: visible;
}

:deep(.autonomic-pie-tick) {
  fill: #485f80;
  font-size: 13px;
  font-weight: 500;
}

.autonomic-balance-donut,
.stress-energy-donut {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.autonomic-balance-donut {
  width: 166px;
  height: 166px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.9), 0 10px 24px rgba(59, 109, 180, 0.12);
}

.autonomic-balance-inner,
.stress-energy-inner {
  width: calc(100% - 26px);
  height: calc(100% - 26px);
  border-radius: 50%;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-shadow: inset 0 0 0 1px #e4ecf8;
}

.autonomic-balance-inner-label,
.stress-energy-label,
.stress-type-label,
.autonomic-age-kicker {
  font-size: 12px;
  color: #7891b1;
  letter-spacing: 0.5px;
}

.autonomic-balance-inner-value {
  margin-top: 6px;
  font-size: 22px;
  color: #235cae;
  font-weight: 800;
}

.autonomic-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.autonomic-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #5f789a;
}

.autonomic-legend-item i {
  display: block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.autonomic-legend-item.tone-red i {
  background: #ff5d5d;
}

.autonomic-legend-item.tone-blue i {
  background: #2e63ff;
}

.autonomic-age-summary {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.autonomic-age-value {
  margin-top: 6px;
  font-size: 42px;
  line-height: 1;
  font-weight: 800;
  color: #1c1f2a;
  letter-spacing: 1px;
}

.autonomic-age-caption {
  margin-top: 10px;
  font-size: 18px;
  line-height: 1.4;
  color: #235fb5;
  font-weight: 700;
}

.autonomic-age-note {
  margin-top: 10px;
  font-size: 12px;
  line-height: 1.8;
  color: #5d7698;
}

.stress-overview-box {
  margin-top: 14px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid #dfe8f6;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.stress-overview-title {
  font-size: 16px;
  font-weight: 800;
  color: #205daf;
}

.stress-overview-charts {
  margin-top: 12px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 1.3fr) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.stress-chart-card {
  padding: 10px 12px 12px;
  border-radius: 18px;
  border: 1px solid #dde8f7;
  background: linear-gradient(180deg, #fbfdff 0%, #f5f9ff 100%);
}

.stress-type-wheel-card {
  overflow: hidden;
}

:deep(.stress-type-wheel-svg) {
  display: block;
  width: 100%;
  height: auto;
}

:deep(.stress-type-wheel-text) {
  fill: #1e1f21;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 1px;
}

:deep(.stress-type-wheel-center-text) {
  fill: #f7f7f7;
  font-size: 34px;
  font-weight: 700;
  letter-spacing: 2px;
}

:deep(.stress-type-wheel-selected-text) {
  fill: #1f1f20;
  font-size: 30px;
  font-weight: 500;
  letter-spacing: 2px;
}

.stress-energy-chart-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

:deep(.stress-energy-chart-svg) {
  display: block;
  width: min(100%, 430px);
  height: auto;
  overflow: visible;
}

:deep(.stress-energy-chart-side-text) {
  fill: #f7f7f7;
  font-size: 14px;
  letter-spacing: 0.5px;
}

:deep(.stress-energy-chart-center) {
  fill: #f7f7f7;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 2px;
}

:deep(.stress-energy-chart-value) {
  fill: #111111;
  font-size: 28px;
  font-weight: 700;
}

:deep(.stress-energy-chart-percent) {
  font-size: 16px;
  font-weight: 500;
}

.stress-energy-footnote {
  margin-top: 4px;
  font-size: 13px;
  color: #333333;
  text-align: center;
}

.stress-overview-notes {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.stress-overview-note {
  padding: 10px 11px;
  border-radius: 14px;
  border: 1px solid #e2e9f7;
  background: #fff;
}

.stress-overview-note-label {
  font-size: 11px;
  color: #7c90aa;
}

.stress-overview-note-value {
  margin-top: 5px;
  font-size: 18px;
  line-height: 1.2;
  font-weight: 800;
  color: #235daf;
}

.stress-overview-note-text {
  margin-top: 5px;
  font-size: 11px;
  line-height: 1.7;
  color: #617896;
}

.reference-row-stress-overview-page .reference-stat-grid {
  margin-top: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.reference-balance-box {
  margin-top: 12px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid #e0e8f7;
  background: #fbfdff;
}

.reference-balance-title {
  color: #2b64b6;
  font-size: 13px;
  font-weight: 700;
}

.reference-balance-track {
  display: flex;
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  margin-top: 10px;
  background: #eaf2fe;
}

.reference-balance-track span {
  display: block;
  height: 100%;
}

.reference-balance-track .tone-green {
  background: #61c96b;
}

.reference-balance-track .tone-blue {
  background: #559dff;
}

.reference-balance-track .tone-orange {
  background: #ffb14b;
}

.reference-balance-track .tone-purple {
  background: #a17df7;
}

.reference-balance-labels {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
  color: #7488a7;
  font-size: 11px;
}

.metric-bar-item,
.obesity-item {
  padding: 9px 10px;
  border-radius: 12px;
  border: 1px solid #e1e9f8;
  background: #fbfdff;
}

.metric-bar-head,
.obesity-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: #456183;
  font-size: 13px;
}

.metric-bar-head strong,
.obesity-head strong {
  color: #1d66c8;
}

.metric-bar-track {
  margin-top: 6px;
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: linear-gradient(90deg, #edf3ff 0%, #dfe9fd 100%);
}

.metric-bar-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #74a8ff 0%, #2b76ff 100%);
}

.obesity-track span {
  background: linear-gradient(90deg, #ffc978 0%, #f28d35 100%);
}

.metric-bar-note,
.obesity-note {
  margin-top: 4px;
  font-size: 11px;
  color: #7890b1;
}

.reference-empty-block {
  padding: 18px 12px;
  text-align: center;
  font-size: 12px;
  color: #7f93b1;
  border: 1px dashed #d8e4f7;
  border-radius: 12px;
  background: #fbfdff;
}

.reference-tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.reference-tag {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid #ffe0c0;
  background: #fff7ef;
  color: #d9842d;
  font-size: 12px;
  font-weight: 600;
}

.tone-blue .paper-card-index,
.metric-chip.tone-blue {
  background: linear-gradient(135deg, rgba(31, 120, 255, 0.12), rgba(52, 183, 255, 0.08));
}

.tone-green .paper-card-index,
.metric-chip.tone-green {
  background: linear-gradient(135deg, rgba(39, 174, 96, 0.12), rgba(99, 214, 143, 0.08));
}

.tone-purple .paper-card-index,
.metric-chip.tone-purple {
  background: linear-gradient(135deg, rgba(122, 93, 255, 0.12), rgba(173, 132, 255, 0.08));
}

.tone-orange .paper-card-index,
.metric-chip.tone-orange {
  background: linear-gradient(135deg, rgba(245, 166, 35, 0.14), rgba(255, 202, 102, 0.08));
}

.tone-teal .paper-card-index,
.metric-chip.tone-teal {
  background: linear-gradient(135deg, rgba(18, 181, 183, 0.14), rgba(125, 228, 230, 0.08));
}

.tone-cyan .paper-card-index,
.metric-chip.tone-cyan {
  background: linear-gradient(135deg, rgba(71, 197, 255, 0.14), rgba(180, 236, 255, 0.08));
}

.tone-blue .paper-card-index {
  background: linear-gradient(135deg, #1f78ff, #41b6ff);
}

.tone-green .paper-card-index {
  background: linear-gradient(135deg, #28b463, #57d68d);
}

.tone-purple .paper-card-index {
  background: linear-gradient(135deg, #7b5dff, #a78bfa);
}

.tone-orange .paper-card-index {
  background: linear-gradient(135deg, #f5a623, #ffc45b);
}

.tone-teal .paper-card-index {
  background: linear-gradient(135deg, #12b5b7, #58d4d6);
}

.tone-cyan .paper-card-index {
  background: linear-gradient(135deg, #35b7ff, #75d7ff);
}

.empty-report {
  padding: 28px 20px;
  text-align: center;
  color: #6f88ad;
  border: 1px dashed #d7e4f7;
  border-radius: 18px;
  background: #f8fbff;
}

.anim-slide-up {
  animation: slideUp 0.6s ease-out both;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(20, 182, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(20, 182, 255, 0.6);
}

@media screen and (max-width: 1024px) {
  .main-content {
    flex-direction: column;
    height: auto;
    overflow-y: auto;
  }

  .head {
    flex-direction: column;
    height: auto;
    padding: 20px 0;
  }

  .nav-links {
    margin-top: 10px;
    justify-content: center;
  }

  .left-panel {
    min-height: 400px;
    flex: none;
  }

  .right-panel {
    min-height: 800px;
    flex: none;
  }

  .report-paper {
    padding: 18px;
  }

  .paper-watermark {
    display: none;
  }

  .reference-header,
  .reference-row,
  .reference-row-bottom,
  .paper-header,
  .paper-summary-panel,
  .paper-grid {
    grid-template-columns: 1fr;
  }

  .reference-patient-panel {
    grid-template-columns: 1fr;
  }

  .reference-title-text h2 {
    font-size: 30px;
  }

  .reference-patient-item {
    grid-template-columns: 64px minmax(0, 1fr);
  }

  .reference-section-body {
    overflow-x: auto;
  }

  .paper-card,
  .paper-card.wide,
  .paper-card.compact,
  .paper-card.normal,
  .paper-card.wide:nth-of-type(n + 3),
  .paper-card.normal:nth-of-type(3),
  .paper-card.wide:nth-of-type(4),
  .paper-card.normal:nth-of-type(5),
  .paper-card.wide:nth-of-type(n + 6) {
    grid-column: auto;
  }

  .paper-title-panel h2 {
    font-size: 30px;
  }

  .reference-stat-value {
    font-size: 24px;
  }

  .autonomic-age-panel,
  .stress-overview-charts,
  .stress-overview-notes {
    grid-template-columns: 1fr;
  }

  .autonomic-age-chart,
  .autonomic-age-summary {
    align-items: center;
    text-align: center;
  }

  .autonomic-age-value {
    font-size: 34px;
  }

  .autonomic-pie-svg {
    width: 220px;
    height: 172px;
  }

  .stress-type-wheel-selected-text {
    font-size: 30px;
  }

  .stress-energy-chart-svg {
    width: min(100%, 320px);
  }

  .metric-chip-row,
  .summary-card-grid,
  .mini-kv-grid,
  .mini-metric-grid {
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  }
}

/* Modals and Buttons CSS */
.add-btn {
  background: linear-gradient(135deg, rgba(20, 182, 255, 0.8) 0%, rgba(20, 182, 255, 0.5) 100%);
  border: 1px solid rgba(20, 182, 255, 0.4);
  color: #fff;
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.add-btn:hover {
  background: rgba(20, 182, 255, 0.8);
  box-shadow: 0 0 10px rgba(20, 182, 255, 0.5);
}

.card-actions {
  display: flex;
  gap: 6px;
}
.edit-btn {
  background: rgba(43, 213, 107, 0.2);
  border: 1px solid rgba(43, 213, 107, 0.4);
  color: #2bd56b;
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}
.edit-btn:hover {
  background: rgba(43, 213, 107, 0.4);
}

.custom-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}
.modal-content {
  position: relative;
  background: #15223c;
  border: 1px solid rgba(20, 182, 255, 0.3);
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #fff;
}
.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
  padding: 0;
}
.close-btn:hover {
  color: #fff;
}
.modal-body {
  padding: 20px;
  color: #fff;
  max-height: 60vh;
  overflow-y: auto;
}
.primary-btn {
  background: #14b6ff;
  border: none;
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}
.primary-btn:hover {
  background: #0ea1e6;
}
.admin-list {
  margin-bottom: 20px;
}
.admin-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.add-admin-form h4 {
  margin: 0 0 12px 0;
  font-size: 15px;
}
.add-admin-form input {
  width: 100%;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 0 12px;
  border-radius: 4px;
  margin-bottom: 12px;
  box-sizing: border-box;
  font-size: 14px;
  line-height: 40px;
}
.add-admin-form .primary-btn {
  width: 100%;
  height: 40px;
  font-size: 15px;
  margin-top: 4px;
}

/* Mobile User View Overrides */
.main-content.user-view {
  padding: 10px;
  height: calc(100vh - 60px);
  background: transparent;
  flex-direction: column;
}
.main-content.user-view .right-panel.boxall {
  border: none;
  box-shadow: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.95);
  padding: 15px;
  flex: 1;
}
.main-content.user-view .panel-title {
  display: none;
}
.main-content.user-view .report-content {
  height: 100%;
  padding-right: 0;
}
.main-content.user-view .report-paper {
  box-shadow: none;
  padding: 15px;
  background: transparent;
}
.main-content.user-view .reference-header .reference-title-text h2 {
  font-size: 22px;
}
.main-content.user-view .reference-patient-panel {
  flex-direction: column;
  align-items: flex-start;
}
.main-content.user-view .reference-badge-panel {
  margin-top: 15px;
  align-self: flex-start;
}

/* Mobile specific layout enhancements */
.report-wrapper.mobile-wrapper {
  background: #eff6ff;
  min-height: 100vh;
}
.head.mobile-head {
  height: 60px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 0 15px;
}
.head.mobile-head .back-btn {
  background: #f4f6f9;
  border: 1px solid #e0e8f7;
  width: 32px;
  height: 32px;
}
.head.mobile-head .back-btn img {
  filter: none !important;
  opacity: 0.6;
}
.head.mobile-head h1 a {
  color: #1a233a;
  text-shadow: none;
  font-size: 18px;
}
.head.mobile-head .user-info {
  color: #64748b;
}
.head.mobile-head .user-info img {
  filter: none !important;
  border-color: #e0e8f7;
  opacity: 0.7;
}
</style>
