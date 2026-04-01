/**
 * Risk Dashboard — fan/mavzu bo'yicha yashil/sariq/qizil ranglar bilan tahlil.
 * O'quvchi va ota-ona uchun ishlatiladi.
 */

function RiskBar({ label, score, risk }) {
  const colors = {
    green: { bg: 'bg-success-500', light: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-400' },
    yellow: { bg: 'bg-accent-500', light: 'bg-accent-50', text: 'text-accent-700', dot: 'bg-accent-400' },
    red: { bg: 'bg-danger-500', light: 'bg-danger-50', text: 'text-danger-700', dot: 'bg-danger-400' },
  }
  const c = colors[risk] || colors.yellow
  const riskLabels = {
    green: "Yaxshi",
    yellow: "O'rtacha",
    red: "Mashq kerak",
  }

  return (
    <div className={`${c.light} rounded-xl p-3`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${c.text}`}>{riskLabels[risk]}</span>
          <span className="text-sm font-bold text-gray-800">{score}%</span>
        </div>
      </div>
      <div className="w-full bg-white/60 rounded-full h-2">
        <div className={`${c.bg} rounded-full h-2 transition-all duration-500`}
          style={{ width: `${Math.min(score, 100)}%` }} />
      </div>
    </div>
  )
}

export default function RiskDashboard({ analysis, title, showRecommendation = true }) {
  if (!analysis || analysis.total_submissions === 0) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
        <p className="text-sm text-gray-400">Hali tahlil uchun yetarli ma'lumot yo'q</p>
        <p className="text-xs text-gray-300 mt-1">Vazifa tekshiring — tahlil avtomatik ko'rinadi</p>
      </div>
    )
  }

  const overallColors = {
    green: 'from-success-500 to-success-600',
    yellow: 'from-accent-500 to-accent-600',
    red: 'from-danger-500 to-danger-600',
  }

  return (
    <div className="space-y-3">
      {/* Umumiy holat */}
      <div className={`bg-gradient-to-r ${overallColors[analysis.risk_level] || overallColors.yellow} rounded-xl p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/70">{title || "Umumiy holat"}</p>
            <p className="text-2xl font-bold">{analysis.overall_score}%</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{analysis.risk_label}</p>
            <p className="text-xs text-white/70">{analysis.total_submissions} tekshiruv</p>
          </div>
        </div>
      </div>

      {/* Fan va mavzu bo'yicha */}
      {Object.entries(analysis.subjects || {}).map(([subject, data]) => (
        <div key={subject} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 capitalize">{subject}</h3>
          <div className="space-y-2">
            {/* Zaif mavzular */}
            {data.weak_topics?.length > 0 && data.weak_topics.map((topic, i) => {
              const topicData = data.topics?.[topic]
              return (
                <RiskBar
                  key={i}
                  label={topic}
                  score={topicData?.score || 40}
                  risk={topicData?.risk || "red"}
                />
              )
            })}

            {/* Kuchli mavzular */}
            {data.strong_topics?.length > 0 && data.strong_topics.slice(0, 3).map((topic, i) => {
              const topicData = data.topics?.[topic]
              return (
                <RiskBar
                  key={`s-${i}`}
                  label={topic}
                  score={topicData?.score || 85}
                  risk={topicData?.risk || "green"}
                />
              )
            })}

            {/* Hech narsa yo'q */}
            {(!data.weak_topics?.length && !data.strong_topics?.length) && (
              <RiskBar label={subject} score={data.avg_score} risk={data.risk} />
            )}
          </div>
        </div>
      ))}

      {/* Tavsiya */}
      {showRecommendation && analysis.recommendation && (
        <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
          <p className="text-xs text-primary-800">
            📌 <strong>Tavsiya:</strong> {analysis.recommendation}
          </p>
        </div>
      )}
    </div>
  )
}
