import React from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  Plane, 
  Hotel, 
  Sun, 
  CheckCircle2, 
  Compass, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

/**
 * Parses inline markdown: **bold**, *italic*, `code` into React elements
 */
function parseInlineMarkdown(text) {
  if (!text) return '';

  // Regex to split on bold, code, and links
  const parts = [];
  let remaining = text;
  let keyIdx = 0;

  // Process bold: **text**
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const matchedStr = match[0];
    if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {
      const content = matchedStr.slice(2, -2);
      // Highlight currencies inside bold text
      parts.push(
        <strong key={keyIdx++} className="font-bold text-slate-900 bg-amber-50/60 px-1 py-0.5 rounded">
          {content}
        </strong>
      );
    } else if (matchedStr.startsWith('*') && matchedStr.endsWith('*')) {
      parts.push(
        <em key={keyIdx++} className="italic text-slate-700">
          {matchedStr.slice(1, -1)}
        </em>
      );
    } else if (matchedStr.startsWith('`') && matchedStr.endsWith('`')) {
      parts.push(
        <code key={keyIdx++} className="px-1.5 py-0.5 bg-slate-100 rounded text-brand-700 font-mono text-xs">
          {matchedStr.slice(1, -1)}
        </code>
      );
    }
    lastIndex = match.index + matchedStr.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

/**
 * Detects if a line represents a time slot (Morning, Afternoon, Evening, Night)
 */
function getTimeSlotBadge(line) {
  const lower = line.toLowerCase();
  if (lower.includes('morning')) {
    return { label: 'Morning', color: 'bg-amber-100 text-amber-800 border-amber-200' };
  }
  if (lower.includes('afternoon')) {
    return { label: 'Afternoon', color: 'bg-sky-100 text-sky-800 border-sky-200' };
  }
  if (lower.includes('evening')) {
    return { label: 'Evening', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
  }
  if (lower.includes('night')) {
    return { label: 'Night', color: 'bg-purple-100 text-purple-800 border-purple-200' };
  }
  return null;
}

export default function FormattedItinerary({ rawText }) {
  if (!rawText) return null;

  // Split text into lines
  const lines = rawText.split('\n');

  const elements = [];
  let currentDayCard = null;
  let currentList = [];
  let elementKey = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={elementKey++} className="space-y-2 my-2.5 pl-2">
          {currentList.map((item, idx) => (
            <li key={idx} className="flex items-start space-x-2 text-xs md:text-sm text-slate-700 leading-relaxed">
              <span className="h-2 w-2 rounded-full bg-brand-500 mt-2 flex-shrink-0"></span>
              <span className="flex-1">{item}</span>
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const flushDayCard = () => {
    if (currentDayCard) {
      elements.push(
        <div 
          key={elementKey++} 
          className="my-4 rounded-xl border border-slate-200/90 bg-white shadow-sm overflow-hidden transition hover:shadow-md hover:border-brand-300"
        >
          {/* Day Header */}
          <div className="bg-gradient-to-r from-slate-50 to-brand-50/40 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-sm">
                <Calendar className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-sm md:text-base text-slate-900">
                {currentDayCard.title}
              </h3>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 font-sans">
              Scheduled
            </span>
          </div>

          {/* Day Activities */}
          <div className="p-4 space-y-3">
            {currentDayCard.items.map((item, idx) => {
              const timeSlot = getTimeSlotBadge(item);
              return (
                <div key={idx} className="flex items-start space-x-3 text-xs md:text-sm text-slate-700 leading-relaxed border-l-2 border-brand-200 pl-3 py-0.5">
                  <div className="flex-1">
                    {timeSlot && (
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border mr-2 mb-1 uppercase tracking-wider ${timeSlot.color}`}>
                        {timeSlot.label}
                      </span>
                    )}
                    <span>{parseInlineMarkdown(item.replace(/^(morning|afternoon|evening|night)\s*:\s*/i, ''))}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
      currentDayCard = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      flushList();
      continue;
    }

    // Detect Day Card Headers (e.g., "## Day 1: Arrival", "### Day 2 - Exploring")
    const dayMatch = line.match(/^#{1,3}\s*(Day\s*\d+[^#\n]*)/i) || line.match(/^(Day\s*\d+[:\-][^\n]*)/i);
    if (dayMatch) {
      flushList();
      flushDayCard();
      const title = dayMatch[1].replace(/\*\*/g, '').trim();
      currentDayCard = { title, items: [] };
      continue;
    }

    // If inside a Day Card and this line looks like an activity or bullet
    if (currentDayCard) {
      // Check if another high level header closes the day card
      if (line.startsWith('# ') || line.startsWith('## ') || line.startsWith('### Budget') || line.startsWith('### Flight')) {
        flushDayCard();
        // Continue to regular processing below
      } else {
        const cleanedItem = line.replace(/^[\*\-\•]\s*/, '').trim();
        currentDayCard.items.push(cleanedItem);
        continue;
      }
    }

    // Main Headers (e.g. # Itinerary Title)
    if (line.startsWith('# ')) {
      flushList();
      flushDayCard();
      const headingText = line.replace(/^#\s*/, '').replace(/\*\*/g, '');
      elements.push(
        <div key={elementKey++} className="border-b border-slate-200 pb-3 mb-4 mt-2">
          <div className="flex items-center space-x-2 text-brand-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="h-4 w-4" />
            <span>Curated Travel Master Plan</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            {headingText}
          </h1>
        </div>
      );
      continue;
    }

    // Subheadings (## or ###)
    if (line.startsWith('## ') || line.startsWith('### ')) {
      flushList();
      flushDayCard();
      const subHeadingText = line.replace(/^#{2,3}\s*/, '').replace(/\*\*/g, '');
      
      let icon = Compass;
      let badgeColor = 'bg-brand-50 text-brand-700 border-brand-200';
      if (/flight|aviation/i.test(subHeadingText)) {
        icon = Plane;
        badgeColor = 'bg-sky-50 text-sky-700 border-sky-200';
      } else if (/hotel|stay|accommodation/i.test(subHeadingText)) {
        icon = Hotel;
        badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      } else if (/weather|climate/i.test(subHeadingText)) {
        icon = Sun;
        badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
      } else if (/budget|cost|price/i.test(subHeadingText)) {
        icon = DollarSign;
        badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      }

      const IconComponent = icon;

      elements.push(
        <div key={elementKey++} className="flex items-center space-x-2.5 mt-5 mb-2.5">
          <div className={`p-1.5 rounded-lg border ${badgeColor}`}>
            <IconComponent className="h-4 w-4" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            {subHeadingText}
          </h2>
        </div>
      );
      continue;
    }

    // Bullet points (* or -)
    if (line.startsWith('* ') || line.startsWith('- ') || line.startsWith('• ')) {
      const bulletText = line.replace(/^[\*\-\•]\s*/, '');
      currentList.push(parseInlineMarkdown(bulletText));
      continue;
    }

    // Table rows (contain |)
    if (line.includes('|')) {
      flushList();
      flushDayCard();
      // Skip separator rows |---|---|
      if (line.includes('---')) continue;
      
      const cells = line.split('|').map(c => c.trim()).filter(c => c.length > 0);
      elements.push(
        <div key={elementKey++} className="grid grid-cols-2 md:grid-cols-4 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 my-1 text-xs">
          {cells.map((cell, cIdx) => (
            <div key={cIdx} className="font-medium text-slate-800">
              {parseInlineMarkdown(cell)}
            </div>
          ))}
        </div>
      );
      continue;
    }

    // Regular paragraphs (clean plain text)
    flushList();
    flushDayCard();
    elements.push(
      <p key={elementKey++} className="text-xs md:text-sm text-slate-700 leading-relaxed my-2 font-sans">
        {parseInlineMarkdown(line)}
      </p>
    );
  }

  // Final flushes
  flushList();
  flushDayCard();

  return (
    <div className="space-y-1">
      {elements}
    </div>
  );
}
