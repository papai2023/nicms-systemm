const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json({ limit: '5mb' }))
const users = [
  { id: 1, username: 'admin', role: 'core_team', name: 'Dr. Admin', county: 'All' },
  { id: 2, username: 'jane.supervisor', role: 'supervisor', name: 'Sup. Jane', accessibleCounties: ['Nairobi'] },
  { id: 3, username: 'john.assessor', role: 'assessment_officer', name: 'Off. John', county: 'Nairobi' },
  { id: 4, username: 'mary.intervenor', role: 'intervention_officer', name: 'Therapist Mary', county: 'Nairobi' },
  { id: 5, username: 'grace.welfare', role: 'welfare_officer', name: 'Grace (Welfare)', county: 'Nairobi' },
  { id: 6, username: 'fred.followup', role: 'followup_officer', name: 'Fred (Follow-up)', county: 'Nairobi' },
  { id: 7, username: 'assessor_ref', role: 'supervisor', name: 'Yvonne Shira', accessibleCounties: ['Taita Taveta','Kajiado','Nairobi'], extendedReferralView: true },
  { id: 8, username: 'followup_ref', role: 'supervisor', name: 'Dominic Koech', accessibleCounties: ['Machakos','Makueni','Nairobi'], extendedReferralView: true },
  { id: 9, username: 'lilian', role: 'supervisor', name: 'Lilian Iseren', accessibleCounties: ['Bungoma','Trans Nzoia'] },
  { id: 10, username: 'wilson', role: 'supervisor', name: 'Wilson Nalwa', accessibleCounties: ['Busia','Kakamega'] },
  { id: 11, username: 'hudson', role: 'supervisor', name: 'Hudson Obembi', accessibleCounties: ['Kisii','Migori'] },
  { id: 12, username: 'mariam', role: 'supervisor', name: 'Mariam Maulid', accessibleCounties: ['Kwale','Kilifi'] },
  { id: 13, username: 'winnie', role: 'supervisor', name: 'Winnie Adeke', accessibleCounties: ['Nandi','Kericho'] },
  { id: 14, username: 'steve', role: 'supervisor', name: 'Steve Njoroge', accessibleCounties: ['Kitui','Muranga'] },
  { id: 15, username: 'vincent', role: 'supervisor', name: 'Vincent Maniagi', accessibleCounties: ['Nakuru','Bomet'] },
  { id: 16, username: 'overall_supervisor', role: 'supervisor', name: 'Overall Supervisor', accessibleCounties: ['Bungoma','Trans Nzoia','Busia','Kakamega','Kisii','Migori','Kwale','Kilifi','Nandi','Kericho','Kitui','Muranga','Nakuru','Bomet','Kiambu','Nairobi'] },
  { id: 17, username: 'caleb', role: 'core_team', name: 'Dr Caleb Barasa', county: 'All', perms: { adminUsers: false, trainingUpload: false, full: false } },
  { id: 18, username: 'steve.wafula', role: 'core_team', name: 'Steve Wafula', county: 'All', perms: { adminUsers: true, trainingUpload: true, full: false } },
  { id: 19, username: 'susannah', role: 'core_team', name: 'Prof. Susannah Leppanen', county: 'All', perms: { adminUsers: false, trainingUpload: false, full: false } },
  { id: 20, username: 'pascalia', role: 'core_team', name: 'Pascalia Papai', county: 'All', perms: { adminUsers: true, trainingUpload: true, full: true, canRefer: false }, extendedReferralView: true },
  { id: 21, username: 'maxwel', role: 'core_team', name: 'Maxwel Papai', county: 'All', perms: { adminUsers: true, trainingUpload: true, full: true, canRefer: false }, extendedReferralView: true },
  { id: 22, username: 'simon', role: 'core_team', name: 'Simon Kamar', county: 'All', perms: { adminUsers: true, trainingUpload: true, full: true, canRefer: false }, extendedReferralView: true },
  { id: 23, username: 'rosemary', role: 'supervisor', name: 'Rosemary Omunyu', county: 'All' },
  { id: 24, username: 'musa.lepose', role: 'core_team', name: 'Musa Lepose', county: 'All', perms: { adminUsers: false, trainingUpload: false, full: false, canRefer: true } },
  { id: 25, username: 'elizabeth', role: 'supervisor', name: 'Elizabeth Amoit', county: 'All' },
  { id: 26, username: 'silus', role: 'supervisor', name: 'Silus Osheyo', county: 'All' },
  { id: 27, username: 'eliud', role: 'supervisor', name: 'Eliud Ojala', county: 'All' },
  { id: 28, username: 'scovia', role: 'supervisor', name: 'Scovia Ngecho', county: 'All' },
  { id: 29, username: 'charleane', role: 'supervisor', name: 'Charleane Isabella', county: 'All' },
  { id: 30, username: 'levi', role: 'supervisor', name: 'Levi Pala', county: 'All' }
]
let cases = []
let logs = []
let trainingMaterials = [
  {
    id: 'TM-ONBOARD-001',
    title: 'Child Safeguarding Basics',
    desc: 'Mandatory induction module',
    topic: 'Compliance',
    duration: '2 Hours',
    type: 'Mandatory',
    requirePdf: false,
    by: 'steve.wafula',
    date: new Date().toISOString(),
    pdfName: null,
    pdfSize: 0
  }
]
let trainingSubmissions = []
let trainingCompletions = []
app.get('/api/health', (req, res) => res.json({ ok: true }))
app.get('/api/users', (req, res) => res.json(users))
app.post('/api/users/bulk', (req, res) => {
  const arr = Array.isArray(req.body) ? req.body : []
  arr.forEach(u => {
    const i = users.findIndex(x => x.username === u.username)
    if (i >= 0) users[i] = u
    else users.push(u)
  })
  res.json({ ok: true, count: users.length })
})
app.put('/api/users/:username', (req, res) => {
  const uname = req.params.username
  const i = users.findIndex(x => x.username === uname)
  if (i < 0) return res.status(404).json({ ok: false })
  users[i] = { ...users[i], ...req.body }
  res.json({ ok: true })
})
app.get('/api/cases', (req, res) => res.json(cases))
app.post('/api/cases', (req, res) => {
  const c = req.body
  const i = cases.findIndex(x => x.id === c.id)
  if (i >= 0) cases[i] = c
  else cases.push(c)
  res.json({ ok: true })
})
app.put('/api/cases/:id', (req, res) => {
  const id = req.params.id
  const i = cases.findIndex(x => x.id === id)
  if (i < 0) return res.status(404).json({ ok: false })
  cases[i] = { ...cases[i], ...req.body }
  res.json({ ok: true })
})
app.get('/api/logs', (req, res) => res.json(logs))
app.post('/api/logs', (req, res) => {
  const l = req.body
  logs.unshift(l)
  res.json({ ok: true })
})
app.get('/api/training/materials', (req, res) => res.json(trainingMaterials))
app.post('/api/training/materials', (req, res) => {
  const m = req.body
  if (!m || !m.id) return res.status(400).json({ ok: false })
  const i = trainingMaterials.findIndex(x => x.id === m.id)
  if (i >= 0) trainingMaterials[i] = m
  else trainingMaterials.unshift(m)
  res.json({ ok: true })
})
app.get('/api/training/submissions', (req, res) => res.json(trainingSubmissions))
app.post('/api/training/submissions', (req, res) => {
  const s = req.body
  if (!s || !s.id) return res.status(400).json({ ok: false })
  trainingSubmissions.unshift(s)
  res.json({ ok: true })
})
app.get('/api/training/completions', (req, res) => res.json(trainingCompletions))
app.post('/api/training/completions', (req, res) => {
  const body = req.body
  if (Array.isArray(body)) {
    body.forEach(c => trainingCompletions.push(c))
    return res.json({ ok: true })
  }
  if (!body || !body.id) return res.status(400).json({ ok: false })
  trainingCompletions.push(body)
  res.json({ ok: true })
})
app.post('/api/sync', (req, res) => {
  const body = req.body || {}
  if (Array.isArray(body.users)) {
    body.users.forEach(u => {
      const i = users.findIndex(x => x.username === u.username)
      if (i >= 0) users[i] = u
      else users.push(u)
    })
  }
  if (Array.isArray(body.cases)) {
    body.cases.forEach(c => {
      const i = cases.findIndex(x => x.id === c.id)
      if (i >= 0) cases[i] = c
      else cases.push(c)
    })
  }
  if (Array.isArray(body.logs)) {
    body.logs.forEach(l => logs.unshift(l))
  }
  res.json({ ok: true })
})
app.listen(3000, () => {})
