-- Add sample blog posts for testing
INSERT INTO blog_posts (
  title, 
  slug, 
  excerpt, 
  content, 
  author_id, 
  tags, 
  reading_time, 
  is_published, 
  is_featured, 
  published_at,
  seo_title,
  seo_description
) VALUES 
(
  'Advanced Trading Strategies for Crypto Markets',
  'advanced-trading-strategies-crypto',
  'Discover proven strategies that can help you navigate the volatile cryptocurrency markets with confidence and precision.',
  '<h2>Introduction to Advanced Trading</h2><p>In the fast-paced world of cryptocurrency trading, having a solid strategy is crucial for success. This comprehensive guide will walk you through advanced techniques that professional traders use to maximize their profits while minimizing risks.</p><h3>Key Strategies Covered</h3><ul><li>Scalping techniques for quick profits</li><li>Swing trading for medium-term gains</li><li>Risk management principles</li><li>Technical analysis tools</li></ul><h2>Understanding Market Psychology</h2><p>One of the most important aspects of trading is understanding market psychology. Fear and greed drive most market movements, and successful traders learn to capitalize on these emotions.</p><blockquote>The market is a device for transferring money from the impatient to the patient. - Warren Buffett</blockquote><p>By understanding these principles and applying them consistently, you can significantly improve your trading performance and achieve better results in the cryptocurrency markets.</p>',
  '00000000-0000-0000-0000-000000000000',
  ARRAY['trading', 'cryptocurrency', 'strategies', 'technical-analysis'],
  8,
  true,
  true,
  now(),
  'Advanced Crypto Trading Strategies | Professional Trading Guide',
  'Learn advanced cryptocurrency trading strategies used by professionals. Comprehensive guide covering scalping, swing trading, and risk management.'
),
(
  'Risk Management Fundamentals Every Trader Should Know',
  'risk-management-fundamentals-trading',
  'Learn the essential risk management principles that separate successful traders from those who lose money in the markets.',
  '<h2>The Foundation of Successful Trading</h2><p>Risk management is arguably the most important skill any trader can develop. Without proper risk management, even the best trading strategy will eventually lead to significant losses.</p><h3>Core Risk Management Principles</h3><ol><li><strong>Position Sizing</strong> - Never risk more than 1-2% of your account on a single trade</li><li><strong>Stop Losses</strong> - Always set stop losses before entering a trade</li><li><strong>Risk-Reward Ratio</strong> - Aim for at least 1:2 risk-reward ratios</li><li><strong>Diversification</strong> - Don''t put all your eggs in one basket</li></ol><h2>Common Risk Management Mistakes</h2><p>Many traders make the same mistakes when it comes to risk management:</p><ul><li>Risking too much on individual trades</li><li>Moving stop losses against them</li><li>Revenge trading after losses</li><li>Not having a trading plan</li></ul><p>By avoiding these common pitfalls and following proven risk management principles, you can protect your capital and increase your chances of long-term success in trading.</p>',
  '00000000-0000-0000-0000-000000000000',
  ARRAY['risk-management', 'trading', 'education', 'fundamentals'],
  6,
  true,
  true,
  now() - interval '1 day',
  'Risk Management Fundamentals for Traders | Trading Education',
  'Essential risk management principles every trader should know. Learn position sizing, stop losses, and risk-reward ratios for trading success.'
),
(
  'Technical Analysis: Reading Charts Like a Pro',
  'technical-analysis-reading-charts-pro',
  'Master the art of technical analysis and learn how to read price charts to make informed trading decisions.',
  '<h2>Introduction to Technical Analysis</h2><p>Technical analysis is the study of price movements and trading volume to forecast future price direction. It''s based on the premise that all relevant information is already reflected in the price.</p><h3>Essential Chart Patterns</h3><p>Understanding chart patterns is crucial for any trader. Here are some of the most reliable patterns:</p><h4>Reversal Patterns</h4><ul><li>Head and Shoulders</li><li>Double Top/Bottom</li><li>Inverse Head and Shoulders</li></ul><h4>Continuation Patterns</h4><ul><li>Triangles (Ascending, Descending, Symmetrical)</li><li>Flags and Pennants</li><li>Rectangles</li></ul><h2>Key Technical Indicators</h2><p>Technical indicators help traders identify trends, momentum, and potential reversal points:</p><ol><li><strong>Moving Averages</strong> - Smooth out price data to identify trends</li><li><strong>RSI (Relative Strength Index)</strong> - Measures overbought/oversold conditions</li><li><strong>MACD</strong> - Shows the relationship between two moving averages</li><li><strong>Bollinger Bands</strong> - Measure volatility and potential price reversals</li></ol><p>Remember, technical analysis is not about predicting the future with certainty, but about identifying high-probability trading opportunities based on historical price patterns and market behavior.</p>',
  '00000000-0000-0000-0000-000000000000',
  ARRAY['technical-analysis', 'charts', 'indicators', 'trading', 'education'],
  10,
  true,
  false,
  now() - interval '2 days',
  'Technical Analysis Guide: Reading Charts Like a Pro | Trading Education',
  'Complete guide to technical analysis and chart reading. Learn chart patterns, technical indicators, and how to make informed trading decisions.'
);

-- Add sample free resources
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
  'PDF Guide',
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
  'Checklist',
  'Daily market analysis checklist to help you stay organized and make informed trading decisions every day.',
  ARRAY['Daily routine template', 'Key metrics to track', 'Decision-making framework', 'Printable format'],
  'https://example.com/market-analysis-checklist.pdf',
  'CheckSquare',
  '500 KB',
  '5 pages',
  2
),
(
  'Risk Calculator Spreadsheet',
  'Excel Template',
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
  'Workbook',
  'Interactive workbook to help you develop the right mindset and emotional discipline for successful trading.',
  ARRAY['Psychology exercises', 'Self-assessment tools', 'Habit tracking sheets', 'Mindset development'],
  'https://example.com/trading-psychology-workbook.pdf',
  'Brain',
  '3.1 MB',
  '40 pages',
  4
);