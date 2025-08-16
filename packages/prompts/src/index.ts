// Mock AI responses for development
export const MOCK_RESPONSES = {
  clauseExtraction: [
    {
      type: 'Governing Law',
      text: 'This Agreement shall be governed by the laws of California...',
      startChar: 100,
      endChar: 250,
      pageIndex: 5,
      confidence: 0.92
    },
    {
      type: 'Limitation of Liability',
      text: 'In no event shall either party be liable for any indirect damages...',
      startChar: 500,
      endChar: 800,
      pageIndex: 3,
      confidence: 0.88
    },
    {
      type: 'Auto-Renewal',
      text: 'This Agreement automatically renews for successive one-year terms...',
      startChar: 200,
      endChar: 400,
      pageIndex: 2,
      confidence: 0.95
    }
  ],
  
  riskAssessment: {
    'Governing Law': {
      risk: 'LOW',
      rationale: 'Standard governing law clause for California jurisdiction.',
      kbRuleIds: ['CA-GOV-001']
    },
    'Limitation of Liability': {
      risk: 'HIGH',
      rationale: 'Broad limitation may exclude important remedies.',
      kbRuleIds: ['CA-LIMIT-003']
    },
    'Auto-Renewal': {
      risk: 'MEDIUM',
      rationale: 'Auto-renewal requires advance notice to cancel.',
      kbRuleIds: ['CA-RENEW-002']
    }
  },

  suggestions: {
    'Limitation of Liability': {
      summary: 'Liability limitations are very broad',
      whyItMatters: 'Could prevent recovery for significant losses.',
      ask: 'Request carve-outs for gross negligence and willful misconduct.',
      rewriteOption: 'Except for gross negligence or willful misconduct, in no event...',
      fallbackOption: 'Negotiate a liability cap at contract value.'
    },
    'Auto-Renewal': {
      summary: 'Auto-renewal requires 60-day notice',
      whyItMatters: 'You may be locked in if you miss the notice window.',
      ask: 'Reduce notice period to 30 days or remove auto-renewal.',
      rewriteOption: 'Either party may terminate with 30 days written notice...',
      fallbackOption: 'Add calendar reminder 90 days before renewal date.'
    }
  }
};

export const PROMPT_TEMPLATES = {
  clauseExtraction: `
You are a legal document analyzer. Extract clauses from the provided contract text.

Return a JSON array of clauses with this structure:
{
  "type": "clause type from taxonomy",
  "text": "exact text span",
  "startChar": number,
  "endChar": number,
  "pageIndex": number,
  "confidence": number between 0-1
}

Clause taxonomy: Governing Law, Venue/Jurisdiction, Term, Termination, Auto-Renewal, Scope/Deliverables, Payment/Fees, Interest/Late Fees, Confidentiality, IP Ownership, Work-Made-For-Hire, Non-Compete, Non-Solicit, Assignment, Warranties, Indemnification, Limitation of Liability, Insurance, Force Majeure, Dispute Resolution/Arbitration, Notices, Privacy/Data Protection, Audit/Inspection, Publicity, Change Orders.

Contract text:
{contractText}
`,

  riskScoring: `
You are a compliance risk engine. Analyze the provided clause and assign a risk level.

Clause: {clauseText}
Type: {clauseType}
Jurisdiction: {jurisdiction}

Return JSON:
{
  "risk": "LOW|MEDIUM|HIGH|CRITICAL",
  "rationale": "plain English explanation",
  "kbRuleIds": ["rule IDs that triggered this risk"]
}
`,

  suggestions: `
Generate 2-3 negotiation tactics for this risky clause.

Clause: {clauseText}
Risk: {riskLevel}
Type: {clauseType}

Return JSON:
{
  "summary": "brief issue description",
  "whyItMatters": "business impact explanation",
  "ask": "what to request in negotiation",
  "rewriteOption": "suggested clause rewrite",
  "fallbackOption": "compromise position"
}
`
};