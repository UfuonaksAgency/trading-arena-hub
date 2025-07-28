-- Add sample free resources with correct type values
INSERT INTO free_resources (
  title,
  type,
  description,
  features,
  download_url,
  icon_name,
  size_info,
  page_info,
  display_order
) VALUES 
(
  'Complete Trading Strategy Guide',
  'PDF',
  'A comprehensive 50-page guide covering essential trading strategies, risk management, and market analysis techniques.',
  ARRAY['50+ pages of content', 'Step-by-step strategies', 'Risk management templates', 'Real trading examples'],
  'https://example.com/trading-strategy-guide.pdf',
  'BookOpen',
  '2.5 MB',
  '50 pages',
  1
),
(
  'Market Analysis Checklist',
  'PDF',
  'Daily market analysis checklist to help you stay organized and make informed trading decisions every day.',
  ARRAY['Daily routine template', 'Key metrics to track', 'Decision-making framework', 'Printable format'],
  'https://example.com/market-analysis-checklist.pdf',
  'CheckSquare',
  '500 KB',
  '5 pages',
  2
),
(
  'Risk Calculator Tool',
  'TOOL',
  'Professional risk management calculator to determine position sizes, stop losses, and profit targets for your trades.',
  ARRAY['Automated calculations', 'Multiple trading pairs', 'Risk-reward analysis', 'Portfolio tracking'],
  'https://example.com/risk-calculator.xlsx',
  'Calculator',
  '1.2 MB',
  '10 sheets',
  3
),
(
  'Trading Psychology Workbook',
  'PDF',
  'Interactive workbook to help you develop the right mindset and emotional discipline for successful trading.',
  ARRAY['Psychology exercises', 'Self-assessment tools', 'Habit tracking sheets', 'Mindset development'],
  'https://example.com/trading-psychology-workbook.pdf',
  'Brain',
  '3.1 MB',
  '40 pages',
  4
);